
const EventEmitter2 = require('eventemitter2').EventEmitter2 // require('events').EventEmitter

const {
  log,
  warn,
  prettyNode
} = require('./utils')

module.exports = function Node ({ node = {}, blueprint = {}, runtime = {} }) {
  Object.assign(this, node)
  // Object.assign(this, blueprint) // Too much mixing ?

  const send = (port, message) => {
    // console.log('send')
    runtime.send(node, port, message)
  }

  // Inject with this
  const bus = new EventEmitter2({
    wildcard: true
  })

  // Public
  this.bus = bus

  // Context for blueprint
  const context = {
    id: node.id,
    options: node.options || {},
    tools: runtime.tools,
    variables: runtime.variables, // Global runtime variables
    bus,
    localBus: bus, // Alias

    // Alias (to be deprecated ? better use bus)
    on (event, fn) { return bus.on(event, fn) },
    handle (event, fn) { return bus.on(event, fn) },
    addListener: bus.addListener,
    emit: bus.emit,

    // Methods
    send,
    sendToAll (msg) {
      log(`sendToAll: #${node.id} > all | "${node.name}" - ${msg}`)
      log(`WIP`)
    },
    log (msg) { log(`LOG: ${prettyNode(node)} - ${msg}`) },
    status (msg) { log(`STATUS: ${prettyNode(node)} - ${msg}`) },
    custom: {} // Node can attach custom function here
  }

  //= ==========
  // Lifecycle hooks
  //= ==========
  this.beforeDestroy = () => {
    if (!blueprint.beforeDestroy) {
      return false
    }
    blueprint.beforeDestroy(context)
    return true
  }

  // Called when all nodes are installed
  this.mounted = () => {
    if (!blueprint.mounted) {
      //  warn(`Blueprint ${prettyNode(node)} hasn't got a mounted fn`)
      return false
    }
    blueprint.mounted(context)
    return true
  }

  this.install = () => {
    if (!blueprint.install) {
      warn(`Blueprint ${prettyNode(node)} hasn't got a install fn`)
      return false
    }
    blueprint.install(context)
    return true
  }
}
