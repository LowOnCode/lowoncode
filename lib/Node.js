const EventEmitter2 = require('eventemitter2').EventEmitter2
const { uuid } = require('./utils')
const Message = require('./Message')

// const STATUS_COLORS = {
//   mounted: 'white',
//   disabled: 'grey',
//   error: 'red'
// }

const RUNTIME =
{
  variables: {},
  tools: {},
  setStatusOfNode: (node, newStatus) => { },
  send: (node, port, ...args) => {
    console.log('VOID')
  }
}

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
  id: '',
  x: 0,
  y: 0,
  z: 0,
  connections: [],
  children: [],
  components: {} // Sub components
}

const CONNECTION_LEG = [
  NODE,
  '' // port name
]

// Capture console
// const CONSOLE = {
//   log () {}
// }

const LOG =
  console.log
// () => { }

module.exports = class Node {
  constructor (component = COMPONENT, node = NODE, runtime = RUNTIME) {
    // // Validation
    // if (!component.name) {
    //   throw new Error('Component name is required')
    // }

    // Default component
    const _component = {
      ...COMPONENT,
      ...component
    }

    // Create eventemitter
    const bus = new EventEmitter2({
      wildcard: true
    })

    // # Create default props
    const componentProps = Object.entries(component.props || {})
    const propDefaults = {}
    componentProps.forEach(([key, value]) => {
      propDefaults[key] = value.default
    })

    // Create props
    const $props = {
      ...propDefaults,
      ...component.options, // DEPRECATE
      ...node.options // DEPRECATE
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
        // id: node.id || node.name,
        // name: node.name,
        // options: props, // Alias ?
        // $props: props, // Default props
        // tools: runtime.tools,
        // variables: runtime.variables, // Global runtime variables
        // runtime,
        bus,
        $emit: this.$emit.bind(self),
        port: this.port.bind(self),
        watch: this.watchInternally.bind(self),
        send: this.send.bind(self),
        // log (msg) { info(`${prettyNode(node)} - ${msg}`) },
        custom: {}, // Node can attach custom function here
        Message
      }

      return context
    }

    // Merge this
    Object.assign(this, {
      $timeouts: [],
      $intervals: [],
      $props,
      children: [],
      $connections: [],
      id: uuid(),
      ...NODE, // Default NODE: id,x,y,z,...
      ...node,
      ..._component,
      ...propDefaults,
      logFn: LOG,
      // > NOTE Methods here will show up in console.log
      getBus () { return bus },
      getNode () { return node },
      getComponent  () { return _component },
      // getRuntime () { return runtime },
      getContext
    })

    // TODO Handle missing props
    // return new Proxy(this, {
    //   get (target, field) {
    //     if (field in target) return target[field] // normal case

    //     console.log("Access to non-existent property '" + field + "'")
    //   }
    // })
  }

  /**
   * Set output port value
   * @param {*} port
   * @param {*} payload
   */
  $emit (port = 0, payload = {}) {
    // Save new value
    // this.$props[port] = payload
    this[port] = payload

    // Emit on eventbus
    this.emit(`emit:${port}`, payload)
  }

  /**
   * Raw emit (private)
   * @param {*} event
   * @param {*} payload
   */
  emit (event = '', payload) {
    // console.log('EMIT', event, payload)
    this.getBus().emit(event, payload)
  }

  /**
   * Set input property/port value (externally)
   * @param {*} port
   * @param {*} payload
   */
  set (name = '', payload = {}) {
    // Validate - property exists
    // const prop = this.$props[mixed]  // <= TODO
    const prop = this.props[name]
    // const prop = this[mixed]

    // console.log(payload)

    if (!prop) {
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
    // Add to connections
    const connection = [connection1, connection2]
    this.$connections.push(connection)
    // As object?
    // this.$connections[id] = connection

    // Wire up with eventbus
    connection1[0].watch(connection1[1], newValue => {
      connection2[0].set(connection2[1], newValue)
    })

    return this
  }

  /**
   * Mount node to server
   * @param {*} server
   */
  $mount (server = null) {
    if (!server) {
      const http = require('http')
      const requestListener = function (req, res) {
        res.writeHead(200)
        res.end('Hello, World!')
      }
      const server = http.createServer(requestListener)
      server.listen(8080)

      console.log(`Server live at http://localhost:8080`)
    }
  }

  /**
   * Log message to custom logging stream
   * @param  {...any} args
   */
  log (...args) {
    this.logFn(...args)
  }

  /**
   * Set console stream
   * @param  {...any} args
   */
  // console (console = CONSOLE) {
  //   this.logFn(...args)
  // }

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
  mount () {
    const component = this.getComponent()

    // Call component mounted fn
    const context = this.getContext()
    const fn = component.mounted.bind(this)
    fn(context)

    // Handle children
    this.children.map(node => {
      node.mount()
    })

    // Set status
    this.setStatus('mounted')

    return true
  }

  /**
   * Convert Node to string
   */
  toJson () {
    return {
      component: this.name,
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
