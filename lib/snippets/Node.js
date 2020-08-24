const EventEmitter2 = require('eventemitter2').EventEmitter2
const { info } = require('./logger')
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
    setStatusOfNode: (node, newStatus) => {},
    send: (node, port, ...args) => {
      console.log('VOID')
    }
  }

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

module.exports = class Node {
  constructor (component = COMPONENT, node = NODE, runtime = RUNTIME) {
    // // Validation
    // if (!component.name) {
    //   throw new Error('Component name is required')
    // }

    // Merge this with component info
    Object.assign(this, {
      id: uuid(),
      ...node,
      ...COMPONENT,
      ...component
    })

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
    this.logFn = () => { }
    bus.onAny((event, value) => {
      this.logFn(event, value)
    })

    // Track javascript events, for early kills
    this.timeouts = []
    this.intervals = []
    this.$props = {}
    this.children = []
    this.connections = []

    const self = this

    // Private - to hide these objects from logging
    this.getBus = function () { return bus }
    this.getNode = function () { return node }
    this.getContext = function () {
      // Call the lifecycle methods with this context
      const context = {
      // Captures
        console: {
          log: this.log.bind(this)
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

        // Methods
        $emit: this.$emit.bind(self),
        port: this.port.bind(self),
        watch: this.watchInternally.bind(self),
        // on (event = '', fn) {
        //   return bus.on(event, fn)
        // },
        send: this.send.bind(self),
        log (msg) { info(`${prettyNode(node)} - ${msg}`) },
        // status (msg) { info(`${prettyNode(node)} - ${msg}`) }, // TODO fix status channel ?
        custom: {}, // Node can attach custom function here

        // Classes
        Message
        // Runtime
      }

      return context
    }
    this.getComponent = function () { return component }
    this.getRuntime = function () { return runtime }

    // Handle missing props
    return new Proxy(this, {
      get (target, field) {
        if (field in target) return target[field] // normal case

        console.log("Access to non-existent property '" + field + "'")
      }
    })
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
    const { type = 'string' } = prop
    // TODO multiple type check
    // eslint-disable-next-line valid-typeof
    const valid = typeof payload === type
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
   * Return the port value
   * @param {*} no
   */
  port (port = 0) {
    // return this.$props[port]
    return this[port]
  }

  /**
   * Capture change (externally)
   * @param {(number|string)} event
   * @param {*} cb
   */
  watch (mixed = 0, cb = () => {}) {
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
  watchInternally (mixed = 0, cb = () => {}) {
    const bus = this.getBus()

    const event = `$set:${mixed}`
    return bus.on(event, cb)
  }

  /**
   * Send message to output port
   * @param {*} event
   * @param {*} cb
   */
  send (port = 0, payload = '') {
    // Save new value
    // this.$props[port] = payload
    this[port] = payload

    // Emit on eventbus
    this.getBus().emit(`out:${port}`, payload)

    // Tell parent?
    //   runtime.send(this, port, ...args)
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
    // connection1[0].watch(connection1[1], newValue => {
    //   console.log(`Output is ${newValue}`)
    // })

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
      // const createRouter = require('@koa/router')
      // // const { prefix } = this
      // const router = createRouter({
      //   prefix // or '/api'
      // })
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
  logger (cb = () => {}) {
    this.logFn = cb
  }

  // setStatusByObject (newStatus = {
  //   text: '',
  //   color: ''
  // }) {
  //   // Update state
  //   this.status = newStatus.text
  //   this.statusColor = newStatus.color

  //   // Tell status change to parent
  //   const parent = this.getRuntime()
  //   parent.setStatusOfNode(this, newStatus)
  // }

  /**
   * Set node internal status
   * @param {*} type
   */
  setStatus (type = 'done') {
    // const newStatus = (typeof mixed === 'string') ? {
    //   text: mixed,
    //   color: color
    // }
    //   : mixed
    this.$status = type
    // return this.setStatusByObject(newStatus)
  }

  // // Set node internal state
  // setState (newState) {
  //   // Mutate
  //   this.state = newState

  //   // Notify status change to core
  //   this.getRuntime().setStateOfNode(this, newState)
  // }

  //= ==========
  // Lifecycle hooks
  //= ==========
  // beforeDestroy () {
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

  // Called when all nodes are installed
  // mounted () {
  mount () {
    const component = this.getComponent()

    // if (this.disabled) {
    //   info('Component is not enabled')
    //   this.setStatus('disabled')
    //   return false
    // }

    // if (!component.mounted) {
    //   info(`${prettyComponent(component)} hasn't got a ${clc.yellow('mounted')} function.`)
    //   return false
    // }

    // Call fn
    const context = this.getContext()
    const fn = component.mounted.bind(this)
    fn(context)

    // Set status
    this.setStatus('mounted')

    return true
  }

  // created () {
  // create () {
  //   const component = this.getComponent()
  //   const context = this.getContext()

  //   if (this.disabled) {
  //     info('Component is not enabled')
  //     this.setStatus('disabled')
  //     return false
  //   }

  //   if (!component.created) {
  //     info(`${prettyComponent(component)} hasn't got a ${clc.yellow('created')} function.`)
  //     return false
  //   }
  //   component.created(context)
  //   return true
  // }
}
