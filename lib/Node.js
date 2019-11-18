const EventEmitter2 = require('eventemitter2').EventEmitter2 // require('events').EventEmitter
const { info, warn } = require('./logger')
const { prettyNode, prettyComponent } = require('./utils')
const clc = require('cli-color')

module.exports = class Node {
  constructor ({
    node = {},
    component = {},
    runtime = {}
  }) {
    // Validation
    // if (!component.version) {
    //   throw new Error(`Component needs to contain a version ${component.name}`)
    // }

    // Merge
    Object.assign(this, node) // TODO write out ?
    // Object.assign(this, component) // Too much mixing ?

    this.id = node.id || node.name
    this.name = node.name
    this.status = 'starting'
    // this._component = component

    // Create new eventemitter
    const bus = new EventEmitter2({
      wildcard: true
    })

    // ======
    // Create options / props
    // ======
    // Merge component & node options
    const options = {
      ...component.options,
      ...node.options
    }
    // TODO : move to props based ?
    const props = node.options || {}

    const self = this

    // Context for component
    // TODO Move to class ??
    const context = {
      id: node.id || node.name,
      name: node.name,
      options,
      props,
      tools: runtime.tools,
      variables: runtime.variables, // Global runtime variables
      runtime,

      bus,
      // Bus aliasses
      on (event, fn) { return bus.on(event, fn) },
      // Are these needed ?
      handle (event, fn) { return bus.on(event, fn) },
      addListener: bus.addListener,
      emit: bus.emit,

      setStatus (newState) {
        console.log(`Setting new state: ${newState}`)
        runtime.setStateOfNode(self, newState)
      },

      // Used to send internal state
      setState (newState) {
        console.log(`Setting new state: ${newState}`)
        runtime.setStateOfNode(self, newState)
      },

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

    // Public
    // this.context = context
    // this.node = node
    // this.component = component
    // this.bus = bus

    // Private - hide these objects from debugging and logging
    this.getBus = function () { return bus }
    this.getNode = function () { return node }
    this.getContext = function () { return context }
    this.getComponent = function () { return component }
    this.getRuntime = function () { return runtime }
  }

  // // Used to send internal state
  // setState (newState) {
  //   console.log(`Setting new state: ${newState}`)
  //   this.getRuntime().setStateOfNode(this, newState)
  // }

  //= ==========
  // Lifecycle hooks
  //= ==========
  beforeDestroy () {
    const { component, context } = this

    if (!component.beforeDestroy) {
      return false
    }
    component.beforeDestroy(context)
    return true
  }

  // Called when all nodes are installed
  mounted () {
    const component = this.getComponent()
    const context = this.getContext()

    if (!component.mounted) {
      info(`${prettyComponent(component)} hasn't got a ${clc.yellow('mounted')} function.`)
      return false
    }
    component.mounted(context)
    return true
  }

  created () {
    const component = this.getComponent()
    const context = this.getContext()

    if (!component.created) {
      info(`${prettyComponent(component)} hasn't got a ${clc.yellow('created')} function.`)
      return false
    }
    component.created(context)
    return true
  }
}
