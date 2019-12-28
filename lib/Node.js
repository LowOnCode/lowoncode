const EventEmitter2 = require('eventemitter2').EventEmitter2 // require('events').EventEmitter
const { info, warn } = require('./logger')
const { prettyNode, prettyComponent } = require('./utils')
const clc = require('cli-color')
const Message = require('./Message')

module.exports = class Node {
  constructor ({
    node = {},
    component = {},
    runtime = {}
  }) {
    // Validation
    // if (!node.name) {
    //   throw new Error(`Node needs to contain a name ${node}`)
    // }

    // Merge
    Object.assign(this, node) // TODO write out ?
    // Object.assign(this, component) // Too much mixing ?

    this.id = node.id || node.name
    this.name = node.name
    this.status = 'starting'
    this.statusColor = 'orange'
    // this._component = component

    // Create new eventemitter
    const bus = new EventEmitter2({
      wildcard: true
    })

    // ======
    // Create options / props
    // ======
    // Merge component & node options
    const componentProps = Object.entries(component.props || {})
    const propDefaults = {}
    componentProps.forEach(([key, value]) => {
      propDefaults[key] = value.default
    })
    console.log('propDefaults', propDefaults)

    // TODO : move to props based ?
    const props = {
      ...propDefaults,
      ...component.options, // DEPRECATE
      ...node.options // DEPRECATE
    } || {}
    const options = props

    const self = this

    // Dependency inject this context for component
    // TODO Move to class ??

    // Require here to prevent cyclic import
    const Runtime = require('./Runtime')

    const context = {
      // Classes
      Message,
      Runtime,

      instance: self,
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

      setStatus: this.setStatus.bind(this),
      setState: this.setState.bind(this),

      sendToNodes: (...args) => runtime.sendToNodes(self, ...args),

      // Experimental
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

  setStatusByObject (newStatus = {}) {
    this.status = newStatus.text
    this.statusColor = newStatus.color

    // Notify status change to core
    this.getRuntime().setStatusOfNode(this, newStatus)
  }

  // Set node internal status
  setStatus (mixed, color = 'grey') {
    const newStatus = (typeof mixed === 'string') ? {
      text: mixed,
      color: color
    }
      : mixed

    return this.setStatusByObject(newStatus)
  }

  // Set node internal state
  setState (newState) {
    // Mutate
    this.state = newState

    // Notify status change to core
    this.getRuntime().setStateOfNode(this, newState)
  }

  //= ==========
  // Lifecycle hooks
  //= ==========
  beforeDestroy () {
    const component = this.getComponent()
    const context = this.getContext()

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

    if (this.disabled) {
      info('Component is not enabled')
      this.setStatus('disabled')
      return false
    }

    if (!component.mounted) {
      info(`${prettyComponent(component)} hasn't got a ${clc.yellow('mounted')} function.`)
      return false
    }
    // Call fn
    component.mounted(context)

    // Set status
    this.setStatus('mounted', 'white')

    return true
  }

  created () {
    const component = this.getComponent()
    const context = this.getContext()

    if (this.disabled) {
      info('Component is not enabled')
      this.setStatus('disabled')
      return false
    }

    if (!component.created) {
      info(`${prettyComponent(component)} hasn't got a ${clc.yellow('created')} function.`)
      return false
    }
    component.created(context)
    return true
  }
}
