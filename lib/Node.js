const EventEmitter2 = require('eventemitter2').EventEmitter2 // require('events').EventEmitter
const { log, warn } = require('./logger')
const { prettyNode } = require('./utils')

module.exports = function Node ({
  node = {},
  blueprint = {},
  runtime = {}
}) {
  this.id = node.id || node.name
  this.name = node.name
  this._component = blueprint

  // Merge
  Object.assign(this, node) // TODO write out
  // Object.assign(this, blueprint) // Too much mixing ?

  const send = (port, message) => {
    // console.log('send')
    runtime.send(this, port, message)
  }

  // Create new eventemitter
  const bus = new EventEmitter2({
    wildcard: true
  })

  // Public
  this.bus = bus

  // ======
  // Create options / props
  // ======
  // Merge component & node options
  const options = {
    ...blueprint.options,
    ...node.options
  }
  // TODO : move to props based ?
  const props = node.options || {}

  // Context for blueprint
  const context = {
    id: node.id || node.name,
    name: node.name,
    options,
    props,
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

  this.created = () => {
    if (!blueprint.created) {
      warn(`Blueprint ${prettyNode(node)} hasn't got a install fn`)
      return false
    }
    blueprint.created(context)
    return true
  }
}
