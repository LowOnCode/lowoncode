const EventEmitter2 = require('eventemitter2').EventEmitter2
const { info, warn } = require('./logger')
const { prettyNode, prettyComponent } = require('./utils')
const clc = require('cli-color')
const Message = require('./Message')

const COMPONENT = {
  name: '',
  description: '',
  color: '',
  inputs: [],
  outputs: [],
  props: {},
  mounted: () => {},
  beforeDestroy: () => {}
  // ...
}

module.exports = class Node {
  constructor ({
    node = {
      // ?
      id: '',
      x: 0,
      y: 0,
      connections: []
    },
    component = COMPONENT,
    // AKA parent
    runtime = {
      variables: {},
      tools: {},
      setStatusOfNode: (node, newStatus) => {}
    }
  }) {
    // Validation
    // if (!node.name) {
    //   throw new Error(`Node needs to contain a name ${node}`)
    // }

    // Merge node with this
    Object.assign(this, {
      ...COMPONENT,
      ...component
    }) // TODO write out ?
    // Object.assign(this, component) // Too much mixing ?

    // this.id = node.id || node.name
    // this.name = node.name
    // this.status = 'starting'
    // this.statusColor = 'orange'
    // this._component = component

    // Create new eventemitter
    const bus = new EventEmitter2({
      wildcard: true
    })

    // # Create options / props
    // Merge component & node options
    const componentProps = Object.entries(component.props || {})
    const propDefaults = {}
    componentProps.forEach(([key, value]) => {
      propDefaults[key] = value.default
    })
    // console.log('propDefaults', propDefaults)

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

    // Log all messages
    this._logger = () => { } // console.log
    bus.onAny((event, value) => {
      this._logger(event, value)
    })

    // Track javascript events, for early kills
    this.timeouts = []
    this.intervals = []

    const context = {
      // Capture
      console: {
        log: this._logger
      },
      setTimeout: (fn = () => {}, ms = 0) => {
        const id = setTimeout(fn, ms)
        // Track ids for early kill
        this.timeouts.push(id)
        return id
      },
      setInterval: (fn = () => {}, ms = 0) => {
        const id = setInterval(fn, ms)
        // Track ids for early kill
        this.intervals.push(id)
        return id
      },
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

      // Sugar for bus
      watch (event = '', fn) {
        if (typeof event !== 'string') {
          // throw new Error('Event needs to be a string')
          return bus.on(`data:${event}`, fn)
        }
        return bus.on(event, fn)
      },
      on (event = '', fn) {
        return bus.on(event, fn)
      },
      // Are these needed ?
      addListener: bus.addListener,
      emit: bus.emit,
      setStatus: this.setStatus.bind(this),
      setState: this.setState.bind(this),
      sendToNodes: (...args) => runtime.sendToNodes(self, ...args),
      // Experimental
      // sendAndWait (port, ...args) {
      //   return runtime.sendAndWait(self, port, ...args)
      // },
      send (port, ...args) {
        runtime.send(self, port, ...args)
      },
      log (msg) { info(`${prettyNode(node)} - ${msg}`) },
      status (msg) { info(`${prettyNode(node)} - ${msg}`) }, // TODO fix status channel ?
      custom: {} // Node can attach custom function here
    }

    // Private - to hide these objects from debugging and logging
    this.getBus = function () { return bus }
    this.getNode = function () { return node }
    this.getContext = function () { return context }
    this.getComponent = function () { return component }
    this.getRuntime = function () { return runtime }
  }

  logger (cb = () => {}) {
    this._logger = cb
  }

  set (port = 0, payload = {}) {
    console.log(port)
    this.getBus().emit('data:0', payload)
  }

  setStatusByObject (newStatus = {
    text: '',
    color: ''
  }) {
    // Update state
    this.status = newStatus.text
    this.statusColor = newStatus.color

    // Tell status change to parent
    const parent = this.getRuntime()
    if (parent) {
      parent.setStatusOfNode(this, newStatus)
    }
  }

  // Set node internal status
  setStatus (mixed = 'done', color = 'grey') {
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
  // beforeDestroy () {
  destroy () {
    const context = this.getContext()

    // Clear intervals
    this.intervals.map(id => {
      clearTimeout(id)
    })

    // Clear timeouts
    this.timeouts.map(id => {
      clearTimeout(id)
    })

    // Call component beforeDestroy hook
    this.beforeDestroy(context)
    return true
  }

  // Called when all nodes are installed
  // mounted () {
  mount () {
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

  // created () {
  create () {
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
