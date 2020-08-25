const EventEmitter2 = require('eventemitter2').EventEmitter2
const { prettyNode, uuid } = require('./utils')
const Message = require('./Message')

const STATUS_COLORS = {
  mounted: 'white',
  disabled: 'grey',
  error: 'red'
}

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
  // ?
  id: '',
  x: 0,
  y: 0,
  connections: [],
  children: []
}

const CONNECTION = [
  NODE,
  ''
]

const LOG = console.log
// const LOG = () => { }

module.exports = class Node {
  constructor (component = COMPONENT, node = NODE, runtime = RUNTIME) {
    // // Validation
    // if (!component.name) {
    //   throw new Error('Component name is required')
    // }

    // # Set this
    // Track javascript events, for early kills
    this.timeouts = []
    this.intervals = []
    this.$props = {}
    this.children = []
    this.connections = []

    // Default component
    const _component = {
      ...COMPONENT,
      ...component
    }

    // Merge this with component info
    Object.assign(this, {
      id: uuid(),
      ...node,
      ..._component
    })

    // Create eventemitter
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

    // Create props
    const props = {
      ...propDefaults,
      ...component.options, // DEPRECATE
      ...node.options // DEPRECATE
    } || {}
    const options = props

    // Require here to prevent cyclic import
    // const Runtime = require('./Runtime')

    // Log all messages
    this.logFn = LOG
    // bus.onAny((event, value) => {
    //   this.logFn(event, value)
    // })

    const self = this

    // Private - to hide these objects from logging
    this.getBus = function () { return bus }
    this.getNode = function () { return node }
    this.getContext = function () {
      // Call the lifecycle methods with this context
      const context = {
        // Capture console log function ( TODO debug, info, error )
        console: {
          ...console,
          log: this.log.bind(this)
        },
        // Capture Timeouts
        setTimeout: (fn = () => { }, ms = 0) => {
          const id = setTimeout(fn, ms)
          // Track ids for early kill
          this.timeouts.push(id)
          return id
        },
        // Capture Intervals
        setInterval: (fn = () => { }, ms = 0) => {
          const id = setInterval(fn, ms)
          // Track ids for early kill
          this.intervals.push(id)
          return id
        },
        ...this,
        instance: this,
        // id: node.id || node.name,
        // name: node.name,
        options,
        props,
        // tools: runtime.tools,
        // variables: runtime.variables, // Global runtime variables
        runtime,
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
    this.getComponent = function () { return _component }
    this.getRuntime = function () { return runtime }

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
    this.getBus().emit(`$emit:${port}`, payload)
  }

  /**
   * Set input property/port value (externally)
   * @param {*} port
   * @param {*} payload
   */
  set (mixed = 0, payload = {}) {
    // Validate - property exists
    const prop = this.props[mixed]
    if (!prop) {
      console.warn(this)
      throw new Error(`No property called '${mixed}' in Node: ${this.name}`, this)
    }

    // Validate - valid direction ?
    // if (!prop.output) {
    //   throw new Error(`No property called '${mixed}'`)
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
    // this.$props[mixed] = payload
    this[mixed] = payload

    // Emit on eventbus
    this.getBus().emit(`$set:${mixed}`, payload)
  }

  /**
   * Capture change (externally)
   * @param {(number|string)} event
   * @param {*} cb
   */
  watch (mixed = 0, cb = () => { }) {
    const bus = this.getBus()

    const event = `$emit:${mixed}`
    // console.log(`New listener: ${event}`)
    return bus.on(event, cb)
  }

  /**
   * Capture change (internally)
   * @param {(number|string)} event
   * @param {*} cb
   */
  watchInternally (mixed = 0, cb = () => { }) {
    const bus = this.getBus()

    const event = `$set:${mixed}`
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
    this.getBus().emit(`out:${port}`, payload)
  }

  /**
   * Wire up child components
   * @param {*} connection1
   * @param {*} connection2
   */
  connect (connection1 = CONNECTION, connection2 = CONNECTION) {
    // console.log('added connection', connection1, connection2)
    const connection = [connection1, connection2]
    this.connections.push(connection)

    // Wire up with eventbus
    connection1[0].watch(connection1[1], newValue => {
      console.log(`Output is ${newValue}`)
      connection2[0].set(connection2[1], newValue)
    })

    return connection
  }

  /**
   * Mount node to server
   * @param {*} server
   */
  $mount (server = null) {
    console.log(server)

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
    this.intervals.map(id => {
      clearTimeout(id)
    })

    // Clear timeouts
    this.timeouts.map(id => {
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
    // console.log(this.children)
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
    //   {
    //     "component": "template",
    //     "id": "9bc86250-56ee",
    //     "x": 295,
    //     "y": 198,
    //     "options": {
    //         "template": "Hello from Design v1"
    //     },
    //     "connections": [
    //         {
    //             "id": "d568e0f9-ddd1",
    //             "type": "connection",
    //             "fromNodeId": "9bc86250-56ee",
    //             "fromPortId": 0,
    //             "toNodeId": "response1",
    //             "toPortId": 0
    //         }
    //     ]
    // }
    return {
      component: this.name,
      id: this.id,
      x: this.x,
      y: this.y,
      z: this.z,
      options: this.options, // ??
      children: this.children.map(node => node.toJson()),
      connections: this.connections.map(connection => ([
        [connection[0][0].id, connection[0][1]],
        [connection[1][0].id, connection[1][1]]
      ])),
      components: this.components
    }
  }

  toString () {
    return JSON.stringify(this.toJson())
  }
}
