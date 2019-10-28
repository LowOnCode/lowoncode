const EventEmitter2 = require('eventemitter2').EventEmitter2 // require('events').EventEmitter
const { info, warn } = require('./logger')
const { prettyNode } = require('./utils')
const clc = require('cli-color')

module.exports = class Node {
  constructor ({
    node = {},
    blueprint = {},
    runtime = {}
  }) {
    if (!blueprint.version) {
      throw new Error('Blueprint needs to contain a version')
    }

    // Merge
    Object.assign(this, node) // TODO write out ?
    // Object.assign(this, blueprint) // Too much mixing ?

    this.id = node.id || node.name
    this.name = node.name
    this._component = blueprint

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

    const self = this

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
      sendAndWait (port, ...args) {
        return runtime.sendAndWait(self, port, ...args)
      },
      send (port, ...args) {
        // console.log('send')
        runtime.send(self, port, ...args)
      },
      sendToAll (msg) {
        info(`sendToAll: #${node.id} > all | "${node.name}" - ${msg}`)
        warn(`WIP`)
      },
      log (msg) { info(`${prettyNode(node)} - ${msg}`) },
      status (msg) { info(`${prettyNode(node)} - ${msg}`) }, // TODO fix status channel ?
      custom: {} // Node can attach custom function here
    }

    // Attach to class
    this.context = context
    this.blueprint = blueprint
    this.node = node
  }

  //= ==========
  // Lifecycle hooks
  //= ==========
  beforeDestroy () {
    const { blueprint, context } = this

    if (!blueprint.beforeDestroy) {
      return false
    }
    blueprint.beforeDestroy(context)
    return true
  }

  // Called when all nodes are installed
  mounted () {
    const { blueprint, context, node } = this

    if (!blueprint.mounted) {
      info(`${prettyNode(node)} hasn't got a ${clc.yellow('mounted')} function.`)
      return false
    }
    blueprint.mounted(context)
    return true
  }

  created () {
    const { blueprint, context, node } = this

    if (!blueprint.created) {
      info(`${prettyNode(node)} hasn't got a ${clc.yellow('created')} function.`)
      return false
    }
    blueprint.created(context)
    return true
  }
}
