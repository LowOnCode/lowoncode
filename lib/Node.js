const EventEmitter2 = require('eventemitter2').EventEmitter2
const { uuid } = require('./utils')
const Message = require('./Message')

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
  // ...
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

const CONNECTION_LEG = [
  NODE,
  '' // port name
]
module.exports = class Node {
  constructor (node = NODE) {
    // constructor (node = NODE, parent = NODE) {
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
    const componentProps = Object.entries(node.props || {})
    const propDefaults = {}
    componentProps.forEach(([key, value]) => {
      propDefaults[key] = value.default
    })

    // Create internal $props
    const $props = {
      ...propDefaults
      // ...node.options // DEPRECATE
    } || {}

    // Save ref
    const self = this

    // Create context for component
    const getContext = function () {
      // Call the lifecycle methods with this context
      const context = {
        // Capture console log function ( TODO debug, info, error )
        console: {
          ...console, // Default with window.console
          log: this.log.bind(this)
        },
        // Capture Timeouts
        setTimeout: (fn = () => { }, ms = 0) => {
          const id = setTimeout(fn, ms)
          // Track ids for early kill
          this.$timeouts.push(id)
          return id
        },
        // Capture Intervals
        setInterval: (fn = () => { }, ms = 0) => {
          const id = setInterval(fn, ms)
          // Track ids for early kill
          this.$intervals.push(id)
          return id
        },
        ...this,
        instance: this,
        bus,
        $emit: this.$emit.bind(self),
        port: this.port.bind(self),
        // Root event
        on: (event = '', cb) => {
          // return bus.on(event, cb)
          return this.$root.getBus().on(event, cb)
          // return this.$parent.getBus().on(event, cb)
        }, // External change
        watch: this.watchInternally.bind(self), // Internal change
        send: this.send.bind(self),
        custom: {}, // Node can attach custom function here
        Message
      }

      return context
    }

    // Assign
    Object.assign(this, {
      $timeouts: [],
      $intervals: [],
      $props,
      children: [],
      $connections: [],
      ...NODE, // Default NODE: id,x,y,z,...
      id: uuid(),
      ...node,
      ...propDefaults,
      getBus () { return bus },
      getNode () { return node },
      getComponent  () { return _component },
      getParent () { return this.$parent },
      getContext
    })
  }

  /**
   * Set output port value
   * @param {*} port
   * @param {*} payload
   */
  $emit (port = 0, payload = {}) {
    console.log('Tell parent', this.$parent.id, port, payload)

    // Save new value
    // this.$props[port] = payload
    this[port] = payload

    // Emit on local eventbus
    this.emit(`emit:${port}`, payload)

    // Emit on parent eventbus
    this.$parent.getBus().emit(`${port}`, ...payload)
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
   * Set input property/port value (externally)
   * @param {*} port
   * @param {*} payload
   */
  set (name = '', payload = {}) {
    // Validate - property exists
    // const prop = this.$props[mixed]  // <= TODO
    // const prop = this.props[name]
    const prop = this.props[name]

    if (!prop) {
      console.log(this)
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

    // Emit on eventbus
    this.emit(`set:${name}`, payload)
  }

  /**
   * Capture change (externally)
   * @param {(number|string)} event
   * @param {*} cb
   */
  watch (mixed = 0, cb = () => { }) {
    const bus = this.getBus()

    const event = `emit:${mixed}`
    return bus.on(event, cb)
  }

  /**
   * Capture change (internally)
   * @param {(number|string)} event
   * @param {*} cb
   */
  watchInternally (mixed = 0, cb = () => { }) {
    const bus = this.getBus()

    const event = `set:${mixed}`
    return bus.on(event, cb)
  }

  /**
   * Return the port value
   * @param {*} no
   */
  port (port = 0) {
    return this[port]
  }

  /**
   * Send message to output port
   * @param {*} event
   * @param {*} cb
   */
  send (port = 0, payload = '') {
    // Save new value
    this[port] = payload

    // Emit on eventbus
    this.emit(`out:${port}`, payload)
  }

  /**
   * Wire up child components
   * @param {*} connection1
   * @param {*} connection2
   */
  connect (connection1 = CONNECTION_LEG, connection2 = CONNECTION_LEG, id = uuid()) {
    // Save to connections
    const connection = [connection1, connection2]
    this.$connections.push(connection)
    // As object?
    // this.$connections[id] = connection

    // Wire up both Node event busses directly
    connection1[0].watch(connection1[1], newValue => {
      console.log('😎', newValue)
      connection2[0].set(connection2[1], newValue)
    })

    return this
  }

  /**
   * Log message to custom logging stream
   * @param  {...any} args
   */
  log (...args) {
    this.logFn(...args)
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
   * Lifecycle initiator: mounted
   */
  mount (parent = {}, root = {}) {
    const component = this.getComponent()

    // Save parent
    this.$parent = parent
    this.$root = root

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

    // Eagerly add connections
    console.log(this.connections)
    this.connections.forEach(connection => {
      const [fromNodeString, fromPort] = connection.from
      const [toNodeString, toPort] = connection.to

      const fromNode = this.children.find(elem => elem.id === fromNodeString)
      const toNode = this.children.find(elem => elem.id === toNodeString)
      // this.connect(connection.from, connection.to)
      this.connect([fromNode, fromPort], [toNode, toPort])
    })

    // Test
    // this.getBus().on('request', props => {
    //   console.log(props)
    // })

    // Return http request handler
    return (req, res, next) => {
      // console.log('request in rootNode')

      // Dispatch to all children
      this.getBus().emit('request', req, res, next)
    }
  }

  /**
   * Convert Node to string
   */
  toJson () {
    return {
      name: this.name,
      component: this.component,
      id: this.id,
      x: this.x,
      y: this.y,
      z: this.z,
      options: this.$options, // ??
      children: this.children.map(node => node.toJson()),
      connections: this.$connections.map(connection => ([
        [connection[0][0].id, connection[0][1]],
        [connection[1][0].id, connection[1][1]]
      ])),
      // connections: this.$connections,
      components: this.components
    }
  }

  toString () {
    return JSON.stringify(this.toJson())
  }
}
