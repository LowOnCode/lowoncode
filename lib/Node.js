const EventEmitter2 = require('eventemitter2').EventEmitter2
const { uuid, createLookup } = require('./utils')
// const Message = require('./Message')

const COMPONENT = {
  name: '',
  description: '',
  components: {}, // Sub components
  color: '',
  inputs: [],
  outputs: [],
  props: {},
  mounted: () => { },
  beforeDestroy: () => { }
}

const NODE = {
  ...COMPONENT,
  id: '',
  x: 0,
  y: 0,
  z: 0,
  connections: [],
  children: [],
  components: {}, // Sub components
  // TODO
  logFn: console.log
}

// Event prefixes
const SET_EVENT = 'set'
const EMIT_EVENT = 'emit'

const CONNECTION_LEG = [
  NODE,
  '' // port name
]

class NodeEvent {
  constructor (data) {
    Object.assign(this, data)
  }
}

const getDefaults = (props) => {
  const componentProps = Object.entries(props || {})
  const propDefaults = {}
  componentProps.forEach(([key, value]) => {
    // TODO use function to protect against referenced defaults like Array & Objects
    propDefaults[key] = value.default
  })
  return propDefaults
}

const connectionsByPort = (connections = [], from = ['', '']) => {
  return connections
    .filter(elem => elem.from[0] === from[0]) // Correct node
    .filter(elem => elem.from[1] === from[1]) // Correct port
}

module.exports = class Node {
  constructor (node = NODE) {
    // Default component
    const _component = {
      ...COMPONENT,
      ...node
    }

    // Create private eventemitter
    const bus = new EventEmitter2({
      wildcard: true
    })

    // # Create default props

    // Create internal state
    const state = {
      ...getDefaults(node.props),
      // v1 format
      ...node.options
      // in1: 'test'
      // ...createLookup(node.inputs, 'name')
    } || {}

    // Computed $props from props, inputs
    const $props = {
      ...node.props,
      ...createLookup('name')(node.inputs)
    }
    // console.log($props, node.inputs, createLookup('name')(node.inputs))

    // Assign
    Object.assign(this, {
      ...NODE, // Default NODE: id,x,y,z,props,inputs,outputs,...
      $timeouts: [],
      $intervals: [],
      // $props,
      // Values
      state,
      // For access props directly with this.<propname>: NOTE reserved props like: $..., children, id
      // ...state,
      children: [],
      connections: [],
      id: uuid(),
      ...node,
      // ...propDefaults,
      // Private functions
      getProps () { return $props },
      getBus () { return bus },
      getNode () { return node },
      getComponent  () { return _component },
      getParent: this.getParent
      // getContext
    })

    Object.assign(this, {
      // Computed
      inputs: this.getInputs(),
      outputs: this.getOutputs()
    })
    // console.log(this.id, $props)
  }

  // Create context for component
  getContext () {
    const bus = this.getBus()
    // Save ref
    const self = this

    const setTimeoutWrapper = (fn = () => { }, ms = 0) => {
      const id = setTimeout(fn, ms)
      // Track ids for early kill
      this.$timeouts.push(id)
      return id
    }

    const setIntervalWrapper = (fn = () => { }, ms = 0) => {
      const id = setInterval(fn, ms)
      // Track ids for early kill
      this.$intervals.push(id)
      return id
    }

    // Call the lifecycle methods with this context
    const context = {
      // Capture function ( TODO debug, info, error )
      console: {
        ...console, // Default with window.console
        log: this.log.bind(this)
      },
      setTimeout: setTimeoutWrapper,
      setInterval: setIntervalWrapper,
      ...this,
      instance: this,
      bus,
      $emit: this.$emit.bind(self),
      port: this.port.bind(self),

      // Alias
      // Root event like "request"
      on: (event = '', cb) => {
        // return bus.on(event, cb)
        return this.getRoot().getBus().on(event, cb)
        // return this.$parent.getBus().on(event, cb)
      },
      // Internal change
      watch: this.watchInternally.bind(self),
      send: this.send.bind(self)
    }

    return context
  }

  /**
   * Set output port value
   * @param {*} port
   * @param {*} payload
   */
  $emit (port = 0, payload = {}) {
    // console.log('Tell parent', this.getParent().id, port)
    // console.log( payload)

    // Save new value
    this[port] = payload

    // Emit on local eventbus, to trigger: watch('*')
    this.emit(`emit:${port}`, payload)

    // Emit on parent eventbus
    const parentBus = this.getParent().getBus()
    if (!parentBus) { throw new Error('Parent bus not found') }

    // Tell parent
    const event = new NodeEvent({
      from: [this.id, port],
      data: payload
    })
    parentBus.emit(EMIT_EVENT, event)
  }

  /**
   * Raw emit (private)
   * @param {*} event
   * @param {*} payload
   */
  emit (event = '', ...payload) {
    this.getBus().emit(event, ...payload)
  }

  /**
   * Set input property/port value
   * @param {*} port
   * @param {*} payload
   */
  set (name = '', payload = {}) {
    const props = this.getProps()

    // Validate - property exists
    const prop = props[name]

    if (!prop) {
      console.warn(props)
      throw new Error(`No property called '${name}' in Node: ${this.name}`, this)
    }

    // Validate - valid direction ?
    // if (!prop.output) {
    //   throw new Error(`No property called '${name}'`)
    // }

    // Validate - duck type check
    const { type = 'any' } = prop
    // TODO multiple type check
    // eslint-disable-next-line valid-typeof
    const valid = type === 'any' ? true : typeof payload === type
    if (!valid) {
      // if (typeof payload === 'string') {
      throw new Error(`Type checking failed. Payload '${payload}' is not of type: '${type}'`)
    }

    // Save new value
    // this.$props[name] = payload
    this[name] = payload
    this.state[name] = payload

    // Emit on internal node's eventbus to trigger the watch function's
    this.emit(`${SET_EVENT}:${name}`, payload)
  }

  /**
   * Capture all events
   * @param {*} cb
   */
  onAny (cb = () => {}) {
    const bus = this.getBus()
    return bus.onAny(cb)
  }

  on (event = '', cb = () => {}) {
    const bus = this.getBus()
    return bus.on(event, cb)
  }

  /**
   * Capture change (externally)
   * @param {(number|string)} event
   * @param {*} cb
   */
  watch (port = '', cb = () => { }) {
    const bus = this.getBus()

    const event = `emit:${port}`
    return bus.on(event, cb)
  }

  /**
   * Capture change (internally)
   * @param {(number|string)} event
   * @param {*} cb
   */
  watchInternally (mixed = 0, cb = () => { }) {
    const bus = this.getBus()
    const event = `${SET_EVENT}:${mixed}`

    // TODO Check if port exist?
    // if(this.ports[])

    return bus.on(event, cb)
  }

  /**
   * Return the port value
   * @param {*} no
   */
  port (port = '') {
    return this[port]
  }

  /**
   * Send message to output port
   * @param {*} event
   * @param {*} cb
   */
  send (port = '', payload = '') {
    // Save new value
    this[port] = payload

    // Emit on eventbus
    this.emit(`out:${port}`, payload)
  }

  /**
   * Wire up two nodes directly DEPRECATE
   * @param {*} connection1
   * @param {*} connection2
   */
  connect (connection1 = CONNECTION_LEG, connection2 = CONNECTION_LEG, id = uuid()) {
    // Save to connections
    const connection = [connection1, connection2]
    this.connections.push(connection)
    // As object?
    // this.connections[id] = connection

    // Wire up both event busses directly
    connection1[0].watch(connection1[1], newValue => {
      // console.log('😎', newValue)
      connection2[0].set(connection2[1], newValue)
    })

    // Allow chaining
    return this
  }

  /**
   * Log message to custom logging stream
   * @param  {...any} args
   */
  log (...args) {
    this.logFn(`\x1b[1m[${this.id}]\x1b[0m`, ...args)
  }

  /**
   * Set logging stream
   * @param {*} cb
   */
  logger (cb = () => { }) {
    this.logFn = cb
  }

  /**
   * Set node internal status
   * @param {*} type
   */
  setStatus (type = 'done') {
    this.$status = type
  }

  /**
   * Lifecycle initiator: beforeDestroy
   */
  destroy () {
    const context = this.getContext()

    // Call component beforeDestroy hook
    this.beforeDestroy(context)

    // Clear intervals
    this.$intervals.map(id => {
      clearTimeout(id)
    })

    // Clear timeouts
    this.$timeouts.map(id => {
      clearTimeout(id)
    })

    return true
  }

  /**
   * Lifecycle initiator for mounted function
   */
  mount (parent = {}, root = {}) {
    const component = this.getComponent()

    // Save parent & root
    this.getParent = () => parent
    this.getRoot = () => root

    // Call component mounted fn
    const context = this.getContext()
    const fn = component.mounted.bind(this)
    fn(context)

    // Mount all children ( recursive )
    this.children.map(node => {
      node.mount(this, root)
    })

    // Set status
    this.setStatus('mounted')

    return true
  }

  /**
   * Mount (root) node to server
   */
  $mount () {
    // Calling this function makes this Node the root
    this.$isRoot = true

    // Start up node and children
    this.mount(this, this)

    /**
       * Send To Helper
       * @param {*} to
       * @param {*} data
       */
    const sendTo = (to = ['', ''], data) => {
      // Find Node
      const toNode = this.children.find(elem => elem.id === to[0])

      if (!toNode) {
        console.warn(`toNode not found: ${to[0]}`)
        return
      }

      // Set new port value
      const port = to[1]
      toNode.set(port, data)
    }

    // Catch all emit's
    this.on(EMIT_EVENT, (event) => {
      // console.log('[event]', event, payload.from)
      const from = event.from || []

      // Get connection on port
      const connections = connectionsByPort(this.connections, from)

      if (!connections.length) {
        console.warn('No connections found')
        return
      }

      // Broadcast to all connected nodes
      connections.map(connection => {
        sendTo(connection.to, event.data)
      })
    })

    // Return http request handler
    return (req, res, next) => {
      console.log('request in rootNode')
      console.log(next)

      // Dispatch to all children
      this.getBus().emit('request', req, res, () => {
        // Custom next handler
        console.log('Custom next handler')
      })
    }
  }

  getPropsAsArray () {
    const props = this.getProps()

    return Object.entries(props).map(([name, elem]) => ({
      name,
      ...elem
    }))
  }

  // Computed from props: {}, inputs: []
  getInputs () {
    const propsArray = this.getPropsAsArray()
    return [
      ...this.inputs,
      ...propsArray.filter(elem => elem.input)
    ]
  }

  // Computed from props: {}, outputs: [], (TODO) emits: {}
  getOutputs () {
    return [
      ...this.outputs
      // ...this.$props.filter(elem => )
    ]
  }

  toJSON () {
    return this
  }

  /**
   * Convert Node to JSON
   * @param {*} full
   */
  toObject (full = true) {
    // console.log(this)
    const componentFields = full ? {
      props: this.props,
      // $props: this.$props,
      // options: this.options,
      // Computed props
      inputs: this.getInputs(),
      outputs: this.getOutputs(),
      defaults: getDefaults(this.props) || {}
    } : {}

    return {
      // Force these fields
      type: this.type,
      name: this.name,
      component: this.component,
      id: this.id,
      x: this.x,
      y: this.y,
      z: this.z,
      props: this.props,
      state: this.state,
      // options: this.state, // ??
      children: this.children
        .map(node => node.toObject()),
      // connections: this.connections.map(connection => ([
      //   [connection[0][0].id, connection[0][1]],
      //   [connection[1][0].id, connection[1][1]]
      // ])),
      connections: this.connections,
      components: this.components,
      // Clone component
      ...componentFields
    }
  }
}
