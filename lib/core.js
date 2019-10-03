// const comm = require('./comm')
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
    variables,

    tools: {
      // comm,
      // http: httpCreate(), // For now a koa server
      http,
      ws,
      fetch,
      stats
    },
    nodes: [],
    nodesOriginal: [],
    allComponents: [],
    verbose: false,
    save,
    savePretty (...args) { return save(...args, true) },
    load,

    send (node, port, message) {
      logS()
      log(`send from ${node.id} > ${port}`)

      // Get connected nodes
      const connections = getConnectedNodes(this.nodes)(node, port)
      // log('connections', connections)
      // logS()

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

      // return send(node, this.nodes)(port, message)
    },
    bus,
    globalBus: bus, // Alias

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
      // Emit runtime event
      bus.emit('created', design)

      logH(`Running design "${design.title}" by ${design.author || '-'}`)

      // IMPROVE perhaps http server is not needed for every design ?
      // this.tools.http = httpCreate(design.configuration)
      // this.tools.http = httpCreate({})

      // Merge component blueprint with node settings
      const { nodes = [] } = design

      // console.log(nodes)
      const nodeInstances = nodes
        .filter(elem => elem)
        .filter(elem => !elem.disabled)
        .map(node => {
          const instance = this.createNode(node)
          log(`creating node: ${prettyNode(node)}`)
          return instance
        })
        // .filter(elem => elem)

      // Save nodes
      this.nodes = nodeInstances

      // Call node installers
      nodeInstances
        .map(node => {
          const installFn = node.install
          log(`installing node: ${prettyNode(node)}`)
          installFn(node)
          return node
        })

      // Call node created
      nodeInstances
        .forEach(node => {
          node.created()
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
