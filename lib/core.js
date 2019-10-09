const httpCreate = require('./http')
const ws = require('ws')
const fetch = require('node-fetch')
const stats = require('./stats')
const { logH, logS, log, info } = require('./logger')
const EventEmitter2 = require('eventemitter2').EventEmitter2

// Create single http server ( to support hosting environments with expose only process.env.PORT )
const http = httpCreate({})

const {
  save,
  load,
  loadComponents,
  getComponentByType,
  prettyNode,
  getConnectedNodesOnPort
} = require('./utils')

const Node = require('./Node')

/**
 * Core Runtime
 *
 * @returns instance
 */
module.exports = function Core (variables) {
  // Private

  const bus = new EventEmitter2({
    wildcard: true
  })

  // Public
  return {
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
    savePretty (...args) { return save(...args, true) },
    load,

    // Core sending mechanism
    send (node, fromPortId, message) {
      logS()
      log(`send from: #${node.id} > port:${fromPortId} [${node.component}]`)

      // Get connected nodes on node+port
      const connections = getConnectedNodesOnPort(this.nodes)(node, fromPortId)
      // console.log('connections', connections)

      if (!connections) {
        // TO THE VOID
        console.warn('message to void')
        return
      } else {
        console.log(`Sending to ${connections.length} connected nodes`)
      }
      // console.log(connections)

      // Do real send
      connections.forEach(([toNode, toPortId]) => {
        console.log(`==> `, prettyNode(toNode))

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
        toNode.bus.emit('data', message)

        // Port specific event
        toNode.bus.emit(`data:${toPortId}`, message)
      })
    },
    bus,
    globalBus: bus, // Alias

    getDesign () {
      return this.design
    },
    getComponents () { return this.allComponents },

    async loadComponents (path) {
      this.allComponents = await loadComponents(path)
    },

    // Special alias
    addCoreComponents () {
      const coreComponentPath = `${__dirname}/../components`
      console.log(`Adding core components from ${coreComponentPath}`)
      return this.addComponents(coreComponentPath)
    },

    async addComponents (path) {
      const componentSet = await loadComponents(path)
      this.allComponents = [
        ...this.allComponents,
        ...componentSet
      ]
      console.log(`Adding ${componentSet.length} new components from: ${path}`)
      return componentSet
    },

    async loadAndRun (file) {
      const design = await load(file)
      return this.run(design)
    },

    createNode (node) {
      const type = node.component
      const { allComponents } = this
      const runtime = this

      const blueprint = getComponentByType(allComponents, type)
      const instance = new Node({ node, blueprint, runtime })
      return instance
    },

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

      // Save for later use ?
      this.design = design

      // Emit runtime event
      bus.emit('created', design)

      const niceDesignName = `"${design.title}" v${design.version || '?'} by ${design.author || '-'}`
      logH(`Running design: ${niceDesignName}`)

      // IMPROVE perhaps http server is not needed for every design ?
      // this.tools.http = httpCreate(design.configuration)
      // this.tools.http = httpCreate({})

      // Merge component blueprint with node settings
      const { nodes = [] } = design
      const nodeInstances = nodes
        .filter(elem => elem)
        .filter(elem => !elem.disabled)
        .map(node => {
          const instance = this.createNode(node)
          info(`creating node: ${prettyNode(node)}`)
          return instance
        })

      // Save nodes
      this.nodes = nodeInstances

      // Call node install fn
      nodeInstances
        .map(node => {
          info(`installing node: ${prettyNode(node)}`)
          node.created()
          return node
        })

      // Call node mounted fn
      nodeInstances
        .forEach(node => {
          node.mounted()
        })

      logH(`run finished: ${niceDesignName}`)
      log('')
    },

    /**
 * Stop the server and exit
 *
 * @param {*} code
 * @returns
 */
    stop (code) {
      // if (typeof (process.send) === FUNCTION) { process.send('stop') }
      // self.cache.stop()
      // self.server.close()
      process.exit(code || 0)
    }
  }
}
