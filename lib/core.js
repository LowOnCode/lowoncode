const httpCreate = require('./http')
const ws = require('ws')
const fetch = require('node-fetch')
const stats = require('./stats')
const EventEmitter2 = require('eventemitter2').EventEmitter2 // require('events').EventEmitter

// Create single http server ( to support hosting environments with expose only process.env.PORT )
const http = httpCreate({})

const {
  logH,
  logS,
  save,
  load,
  loadComponents,
  getComponentByType,
  log,
  prettyNode,
  getConnectedNodes
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

    send (node, port, message) {
      logS()
      log(`send from ${node.id} > ${port}`)

      // Get connected nodes on node+port
      const connections = getConnectedNodes(this.nodes)(node, port)

      if (!connections) {
        // TO THE VOID
        return
      }

      // Do real send
      connections.forEach(toNode => {
        // Send bus event, to be used for monitoring
        this.bus.emit('send', {
          // from: {
          //   node,
          //   port
          // },
          // to: {
          //   node: toNode,
          //   port: 0 // TODO multiple input ports
          // },
          from: {
            nodeId: node.id,
            portId: port
          },
          to: {
            nodeId: toNode.id,
            portId: 0
          },
          message
        })

        // TODO port
        toNode.bus.emit('data', message)
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
      // Hotswap counter
      this.hotswapcounter += 1

      // Design is running ? => then cleanup
      if (this.design) {
        const resp = this.nodes
          .map(node => node.beforeDestroy())
          .filter(elem => elem)
        log(`Called ${resp.length} beforeDestroy functions`)
      }

      // Save for later use
      this.design = design

      // Emit runtime event
      bus.emit('created', design)

      logH(`Running design "${design.title}" by ${design.author || '-'}`)

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
          log(`creating node: ${prettyNode(node)}`)
          return instance
        })

      // Save nodes
      this.nodes = nodeInstances

      // Call node install fn
      nodeInstances
        .map(node => {
          log(`installing node: ${prettyNode(node)}`)
          const installFn = node.install
          installFn(node)
          return node
        })

      // Call node mounted fn
      nodeInstances
        .forEach(node => {
          node.mounted()
        })

      logH(`run finished`)
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
