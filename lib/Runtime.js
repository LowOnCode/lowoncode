const ws = require('ws')
const fetch = require('node-fetch')
const stats = require('./stats')
const { logH, log, warn, info } = require('./logger')
const EventEmitter2 = require('eventemitter2').EventEmitter2
const clc = require('cli-color')
const debug = require('debug')

const {
  printComponents,
  save,
  load,
  loadComponentsFromDirectory,
  getComponentByName,
  prettyNode,
  getConnectedNodesOnPort,
  niceDesignName
} = require('./utils')

const Node = require('./Node')

/**
 * Core Runtime
 *
 * @returns instance
 */
module.exports = class Runtime {
  // Use for custom http
  callback (req, res) {
    console.log(req.url)
    // Proxy to Koa
    const resp = this.app.callback()(req, res)
    console.log(resp)
    // return
  }

  constructor (variables, settings = {}) {
    // Destructure
    const {
      // http,
      app, // TO DEPRECATE ?
      server, // NodeJS Server object
      parent = {},
      prefix = '/',
      strict = false // Throw errors on warn
    } = settings

    // Debug
    if (strict) {
      console.log('Strict modus is enabled')
    }

    // ==================
    // Http
    // ==================
    // Use a router for each design
    const createRouter = require('koa-router')
    // const { prefix } = this
    const router = createRouter({
      prefix // or '/api'
    })
    // Attach
    this.router = router

    // Attach router to Koa
    // Use a custom Koa
    // const Koa = require('koa')
    // const app = new Koa()
    if (!app) {
      throw new Error('app is required')
    }
    this.app = app
    app.use(router.routes())
    app.use(router.allowedMethods())
    // app.use((ctx) => {
    //   ctx.body = 'Cool'
    //   // ctx.body = ctx.router.stack
    // })
    // ==================

    // Private
    const bus = new EventEmitter2({
      wildcard: true
    })

    // Save args
    this.prefix = prefix
    this.strict = strict
    this.settings = settings
    this.server = server
    this.app = app // TO DEPRECATE ?

    if (parent) {
      // TODO link or clone ?
      // Link current components with parent Runtime
      // this.allComponents = parent.components
    }

    // State
    Object.assign(this, {
      bus,
      globalBus: bus, // Alias
      hotswapcounter: 0,
      variables, // Runtime global state
      nodes: [],
      nodesOriginal: [],
      allComponents: [],
      verbose: false,
      design: {},

      // ===========
      // Methods
      // ===========
      tools: {
        app, // TO DEPRECATE ?
        router,
        // http, // { server, app, router }
        // server: http.server, // Alias
        server,
        ws,
        fetch,
        stats
      },
      save,
      load
    })
  }

  // Initialization runtime
  run (design = { title: 'untitled', author: 'noname', configuration: {} }) {
    // Debug allComponents, note components need to be loaded before running this function
    // console.log(this.allComponents)

    // Hotswap counter
    this.hotswapcounter += 1

    // Design is running ? => then cleanup
    if (this.design) {
      const resp = this.nodes
        .map(node => node.beforeDestroy())
        .filter(elem => elem)

      if (resp.length) { log(`Called ${resp.length} beforeDestroy functions`) }
    }

    // Save for later use => reboot ?
    this.design = design

    // Emit runtime event
    this.bus.emit('created', design)

    logH(`Loading design: ${niceDesignName(design)}`)
    info(`strict modus = ${this.strict}`)

    // IMPROVE perhaps http server is not needed for every design ?
    // this.tools.http = httpCreate(design.configuration)
    // this.tools.http = httpCreate({})
    // Expose router for components to use
    // TODO not clear code
    // Use a router for each design
    // const createRouter = require('koa-router')
    // const { prefix } = this
    // const router = createRouter({
    //   prefix // or '/api'
    // })

    // this.tools.router = router
    // this.tools.app = app // Used by api, TO DEPRECATE ?

    // Merge component component with node settings
    const { nodes = [] } = design
    const nodeInstances = nodes
      .filter(elem => elem)
      .filter(elem => !elem.disabled)
      .map(node => {
        const instance = this.createNode(node)
        // console.log('Debug', instance._component)
        info(`${prettyNode(instance)} created`)
        return instance
      })

    // Save nodes reference
    this.nodes = nodeInstances
    this.design.nodes = nodeInstances

    // Call node created fn
    nodeInstances
      .forEach(node => {
        // console.info(`${prettyNode(node)} installing...`)
        node.created()
      })

    // Call node mounted fn
    nodeInstances
      .forEach(node => {
        node.mounted()
      })

    log(clc.green(`design is live`))
    log('')

    return this
    // return this.hotswapcounter
  }

  stop (code) {
    // if (typeof (process.send) === FUNCTION) { process.send('stop') }
    // self.cache.stop()
    // self.server.close()
    process.exit(code || 0)
  }

  // Create a sub runtime with the same settings and access to variables
  createSubRuntime () {
    const subRuntime = new Runtime(this.variables, {
      ...this.options,
      parent: this
    })
    // Link components
    subRuntime.allComponents = this.allComponents

    return subRuntime
  }

  savePretty (...args) { return save(...args, true) }

  // =====================
  // From designService
  // =====================
  findNodeByKey (value, key = 'id') {
    return this.nodes.find(elem => elem[key] === value)
  }

  findNodeById (id) {
    return this.findNodeByKey(id, 'id')
  }

  // =====================
  // Sending mechanism
  // =====================
  setStatusOfNode (node, newStatus = {}) {
    const oldStatus = node.status

    // Mutate
    // node.status = newStatus

    // Send bus event, to be used for monitoring
    this.bus.emit('status', {
      nodeId: node.id,
      oldStatus,
      newStatus
    })
  }

  setStateOfNode (node, newState = {}) {
    const oldState = node.state

    // Mutate - done in Node
    // node.state = newStatus

    // Send bus event, to be used for monitoring
    this.bus.emit('state', {
      nodeId: node.id,
      oldState,
      newState
    })
  }

  sendToNodes (fromNode, [toNodes, toPortId = 0], ...args) {
    toNodes.forEach(toNode => {
      // console.log(toNode)
      // TEMPFIX pick first port ?
      const fromPortId = 0
      // const toPortId = 0
      this.rawSend([fromNode, fromPortId], [toNode, toPortId], args)
    })
  }

  // TODO use promise race
  // For now send to first connection and wait
  async rawSend (
    [fromNode, fromPortId = 0],
    [toNode, toPortId = 0],
    messages) {
    log(`==> `, prettyNode(toNode))

    // Protect against loops - node cannot send to itself
    if (fromNode.id === toNode.id) {
      // console.warn('Node cannot send to itself')
      // return false
      throw new Error('Node cannot send to itself')
    }

    // Send bus event, to be used for monitoring
    this.bus.emit('send', {
      from: {
        nodeId: fromNode.id,
        portId: fromPortId
      },
      to: {
        nodeId: toNode.id,
        portId: toPortId
      },
      messages // <= Can cause circular structure JSON error
    })

    // Event to the component
    // Node event => use "data:*"
    // toNode.getBus().emit('data', message, ctx)

    // Port specific event
    // console.log(toNode.getBus().listeners(`data:${toPortId}`))
    const fn = toNode.getBus().listeners(`data:${toPortId}`)[0]
    const resp = await fn(...messages)
    return resp
    // const resp = toNode.getBus().emit(`data:${toPortId}`, message, ctx)
    // console.log(resp)
  }

  // TODO remove ctx and use ...message
  send (fromNode, fromPortId, ...message) {
    const { nodes } = this

    // Custom log channel
    const log = debug('event')

    log(`send from: #${fromNode.id} > port:${fromPortId} [${fromNode.component}]`)

    // Get connected nodes on node+port
    const connections = getConnectedNodesOnPort(nodes)(fromNode, fromPortId)
      .filter(elem => elem) // Remove empty connections ?

    if (!connections) {
      // TO THE VOID
      log('message to void')
      this.bus.emit('void', {
        from: {
          nodeId: fromNode.id,
          portId: fromPortId
        },
        message
      })

      return
    } else {
      log(`Sending to ${connections.length} connected nodes`)
    }

    // Send to all connections
    connections.forEach(([toNode, toPortId]) => {
      log(`==> `, prettyNode(toNode))

      // Send global bus event, to be used for monitoring
      this.bus.emit('send', {
        from: {
          nodeId: fromNode.id,
          portId: fromPortId
        },
        to: {
          nodeId: toNode.id,
          portId: toPortId
        },
        message
      })

      // Get Nodes bus system
      const bus = toNode.getBus()
      // console.log(toNode, bus)
      // console.log(toNode.getComponent())
      if (!bus.listenerTree) {
        log('No listeners')
      }

      // Node event
      bus.emit('data', ...message)

      // Port specific event
      bus.emit(`data:${toPortId}`, ...message)
    })
  }

  // Core sending mechanism no: 2
  async sendAndWait (fromNode, fromPortId, ...messages) {
    const { nodes } = this

    // Custom log channel
    const log = debug('event')

    log(`send from: #${fromNode.id} > port:${fromPortId} [${fromNode.component}]`)

    // Get connected nodes on node+port
    const connections = getConnectedNodesOnPort(nodes)(fromNode, fromPortId)
      .filter(elem => elem) // Remove empty connections ?

    if (!connections) {
      // TO THE VOID
      log('message to void')
      this.bus.emit('void', {
        from: {
          nodeId: fromNode.id,
          portId: fromPortId
        },
        message: messages[0],
        messages
      })
      return
    } else {
      log(`Sending to ${connections.length} connected nodes`)
    }

    // TODO use promise race
    // For now send to first connection and wait
    const to = connections[0]
    return this.rawSend([fromNode, fromPortId], to, messages)
  }

  // ==============
  // Design & Nodes
  // ==============
  getAllNodes () {
    return this.design.nodes
  }

  getAllNodesByComponent (component) {
    return this.design.nodes.filter(elem => elem.component === component)
  }

  getDesign () {
    return this.design
  }

  getAllComponentsFlat () {
    // TODO recursive ?
    const { allComponents = [] } = this
    const KEY = 'components'

    const hasChildren = allComponents.filter(elem => elem[KEY] && elem[KEY].length)
    const hasNoChildren = allComponents.filter(elem => !elem[KEY])

    const flatComponents = hasChildren.reduce(
      (arr, elem) => arr.concat(elem[KEY]), []
    )
    return [
      ...hasNoChildren,
      ...flatComponents
    ]
  }

  createNode (node) {
    const name = node.component
    // const { allComponents } = this
    const runtime = this
    const componentsFlat = this.getAllComponentsFlat()

    // info(componersntsFlat)

    const component = getComponentByName(componentsFlat, name)
    if (!component) {
      warn(`Component "${clc.red(name)}" not found.`)

      // console.log(this)
      if (this.strict) {
        printComponents(this.getAllComponentsFlat())
        throw new Error(`Component couldn't be found: ${name}`)
      }
    } else {
      // info(`Component found: ${component.id}`)
    }

    const instance = new Node({ node, component, runtime })

    // console.log(instance)

    return instance
  }

  // ==============
  // Components
  // ==============
  getComponents () { return this.allComponents }

  async loadComponents (path) {
    // this.allComponents = [] // Clear
    // this.allComponents =
    const resp = await this.addComponentsFromDirectory(path)
    log(`Added ${resp.length} components.`)
    // console.log(this.allComponents)
    return resp
  }

  async addComponentsFromDirectory (path) {
    const newComponents = await loadComponentsFromDirectory(path)
    info(newComponents)
    // Add all individually to allComponents array
    const resp = newComponents.map(newComponent => {
      return this.addComponent(newComponent)
    })

    info(`Adding ${newComponents.length} new components from: ${path}`)
    return resp
  }

  // Add component to libary
  addComponent (component) {
    info(`Adding component ${clc.green(component.name)}`)
    // Check uniqueness
    const type = component.id
    const exists = getComponentByName(this.allComponents, type)
    if (exists) {
      warn(`Component ${clc.green(type)} already exists. Latest will be used!`)
      warn(`\tUsed:    `, exists._source)
      warn(`\tDropped: `, component._source)
    }

    this.allComponents.push(component)
    return component
  }

  removeComponentByName (name) {
    // TODO
  }

  // ==============
  // Process
  // ==============
  async loadAndRun (file) {
    const design = await load(file)
    return this.run(design)
  }

  async reboot () {
    await this.run(this.design)
  }
}
