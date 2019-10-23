const EventEmitter2 = require('eventemitter2').EventEmitter2 // require('events').EventEmitter
const { info, warn } = require('./logger')
const { prettyNode } = require('./utils')
const clc = require('cli-color')

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
    runtime,

    // Alias (to be deprecated ? better use bus)
    on (event, fn) { return bus.on(event, fn) },
    handle (event, fn) { return bus.on(event, fn) },
    addListener: bus.addListener,
    emit: bus.emit,

    // Methods
    send,
    sendToAll (msg) {
      info(`sendToAll: #${node.id} > all | "${node.name}" - ${msg}`)
      warn(`WIP`)
    },
    log (msg) { info(`${prettyNode(node)} - ${msg}`) },
    status (msg) { info(`${prettyNode(node)} - ${msg}`) }, // TODO fix status channel ?
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
      info(`Component ${prettyNode(node)} hasn't got a ${clc.yellow('mounted')} function.`)
      return false
    }
    blueprint.mounted(context)
    return true
  }

  this.created = () => {
    if (!blueprint.created) {
      info(`Component ${prettyNode(node)} hasn't got a ${clc.yellow('created')} function.`)
      return false
    }
    blueprint.created(context)
    return true
  }
}
