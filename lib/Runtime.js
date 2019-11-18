const httpCreate = require('./http')
const ws = require('ws')
const fetch = require('node-fetch')
const stats = require('./stats')
const axios = require('axios')
const { logH, log, warn, info } = require('./logger')
const EventEmitter2 = require('eventemitter2').EventEmitter2
const clc = require('cli-color')
const debug = require('debug')

// Create a single http server ( to support hosting environments with expose only process.env.PORT )
const http = httpCreate({})

const {
  save,
  load,
  loadComponents,
  getComponentByType,
  prettyNode,
  getConnectedNodesOnPort
} = require('./utils')

const niceDesignName = design => `"${clc.yellow(design.title)}" version: ${design.version || '?'} by ${design.author || 'unknown author'}`

const Node = require('./Node')

/**
 * Core Runtime
 *
 * @returns instance
 */
module.exports = class Runtime {
  constructor (variables, {
    strict = false // Throw errors on warn
  } = {}) {
    // Private
    const bus = new EventEmitter2({
      wildcard: true
    })

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
        http, // { server, app, router }
        ws,
        fetch,
        stats
      },
      save,
      load
    })
  }

  savePretty (...args) { return save(...args, true) }

  async loadById (id, secret) {
    const url = `http://localhost:1337/designs/${id}/${secret}`

    // Load design file
    info(`Fetching design from : ${url}`)
    const design = await axios.get(url).then(resp => resp.data)
    info(`...done. Design contains ${design.nodes.length} nodes`)
    return design
  }

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
  // Core sending mechanism
  // =====================
  setStatusOfNode (node, newStatus) {
    // Mutate
    const oldStatus = node.state
    node.status = newStatus

    // Send bus event, to be used for monitoring
    this.bus.emit('status', {
      nodeId: node.id,
      oldStatus,
      newStatus
    })
  }

  setStateOfNode (node, newState) {
    // Mutate
    const oldState = node.state
    node.state = newState

    this.bus.emit('state', {
      nodeId: node.id,
      oldState,
      newState
    })
  }

  send (node, fromPortId, message, ctx = {}) {
    const { nodes } = this

    // Custom log channel
    const log = debug('event')

    log(`send from: #${node.id} > port:${fromPortId} [${node.component}]`)

    // Get connected nodes on node+port
    const connections = getConnectedNodesOnPort(nodes)(node, fromPortId)
      .filter(elem => elem) // Remove empty connections ?

    if (!connections) {
      // TO THE VOID
      log('message to void')
      return
    } else {
      log(`Sending to ${connections.length} connected nodes`)
    }

    // Send to all connections
    connections.forEach(([toNode, toPortId]) => {
      log(`==> `, prettyNode(toNode))

      // Send bus event, to be used for monitoring
      this.bus.emit('send', {
        from: {
          nodeId: node.id,
          portId: fromPortId
        },
        to: {
          nodeId: toNode.id,
          portId: toPortId
        },
        message // <= Can cause circular structure JSON error
      })

      // Event to the component
      // Node event
      toNode.getBus().emit('data', message, ctx)

      // Port specific event
      toNode.getBus().emit(`data:${toPortId}`, message, ctx)
    })
  }

  // Core sending mechanism no: 2
  async sendAndWait (node, fromPortId, message, ctx = {}) {
    const { nodes } = this

    // Custom log channel
    const log = debug('event')

    log(`send from: #${node.id} > port:${fromPortId} [${node.component}]`)

    // Get connected nodes on node+port
    const connections = getConnectedNodesOnPort(nodes)(node, fromPortId)
      .filter(elem => elem) // Remove empty connections ?

    if (!connections) {
      // TO THE VOID
      log('message to void')
      return
    } else {
      log(`Sending to ${connections.length} connected nodes`)
    }

    // TODO use promise race
    // For now send to first connection and wait
    const rawSend = async ([toNode, toPortId]) => {
      log(`==> `, prettyNode(toNode))

      // Send bus event, to be used for monitoring
      this.bus.emit('send', {
        from: {
          nodeId: node.id,
          portId: fromPortId
        },
        to: {
          nodeId: toNode.id,
          portId: toPortId
        },
        message // <= Can cause circular structure JSON error
      })

      // Event to the component
      // Node event => use "data:*"
      // toNode.getBus().emit('data', message, ctx)

      // Port specific event
      console.log(toNode.getBus().listeners(`data:${toPortId}`))
      const fn = toNode.getBus().listeners(`data:${toPortId}`)[0]
      const resp = await fn(message)
      return resp
      // const resp = toNode.getBus().emit(`data:${toPortId}`, message, ctx)
      // console.log(resp)
    }

    return rawSend(connections[0])
  }

  getDesign () {
    return this.design
  }

  getComponents () { return this.allComponents }

  async loadComponents (path) {
    this.allComponents = [] // Clear
    return this.addComponents(path)
  }

  // Special alias
  addCoreComponents () {
    const coreComponentPath = `${__dirname}/../components`
    // info(`Adding core components from ${coreComponentPath}`)
    return this.addComponents(coreComponentPath)
  }

  async addComponents (path) {
    const newComponents = await loadComponents(path)

    // Check uniqueness
    newComponents.forEach(newComponent => {
      this.addComponent(newComponent)
    })

    info(`Adding ${newComponents.length} new components from: ${path}`)
    return newComponents
  }

  // Add component to libary
  addComponent (component) {
    // Check uniqueness
    const type = component.id
    const exists = getComponentByType(this.allComponents, type)
    if (exists) {
      warn(`Component ${clc.green(type)} already exists. First one will be used!`)
    }

    this.allComponents.push(component)
  }

  async loadAndRun (file) {
    const design = await load(file)
    return this.run(design)
  }

  createNode (node) {
    const type = node.component
    const { allComponents } = this
    const runtime = this

    const component = getComponentByType(allComponents, type)
    if (!component) {
      warn(`Component "${clc.green(type)}" not found.`)
      this.printComponents()

      if (this.strict) {
        throw new Error(`Component couldn't be found: ${type}`)
      }
    } else {
      // info(`Component found: ${component.id}`)
    }

    const instance = new Node({ node, component, runtime })

    // console.log(instance)

    return instance
  }

  async reboot () {
    await this.run(this.design)
  }

  // alias
  // n () { this.printNodes() },
  printNodes () {
    console.table(this.nodes.map(elem => ({
      name: elem.name
    })))
  }

  // alias
  // c () { this.printComponents() },
  printComponents () {
    console.table(this.allComponents.map(elem => ({
      name: elem.name,
      version: elem.version
      // _source: elem._source
    })))
  }

  // Initialization runtime
  async run (design = { title: 'untitled', author: 'noname', configuration: {} }) {
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

    // Call node created fn
    nodeInstances
      .forEach(node => {
        console.info(`${prettyNode(node)} installing...`)
        node.created()
      })

    // Call node mounted fn
    nodeInstances
      .forEach(node => {
        node.mounted()
      })

    log(clc.green(`design is live`))
    log('')
  }

  stop (code) {
    // if (typeof (process.send) === FUNCTION) { process.send('stop') }
    // self.cache.stop()
    // self.server.close()
    process.exit(code || 0)
  }
}
