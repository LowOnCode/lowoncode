const Node = require('./Node')
const Runtime = require('./Runtime')
const httpCreate = require('./http')
const monitor = require('./monitor')
const __package = require('../package.json')
const validate = require('./validate')
const {
  loadFile,
  save,
  loadComponents,
  getComponentByType,
  prettyNode,
  getConnectedNodesOnPort
} = require('./utils')

// Create a single http server
// ( to support hosting environments that use one port, process.env.PORT )
let server = null

// Create Koa server
const Koa = require('koa')
let app = new Koa()

// ============
// Factory
// ============
const setServer = (_value) => {
  server = _value
}
const setApp = (_value) => {
  app = _value
}

// Create new Runtime ( & server if needed )
const create = (variables = {}, options = {}) => {
  // auto create server & only one server
  if (!server) {
    const { app, server } = httpCreate()
    setServer(server)
    setApp(app)
  }

  // const Koa = require('koa')
  // const app = new Koa()

  // Create new Runtime
  const runtime = new Runtime(variables, {
    server,
    app, // DEPRECATE ?
    // router,
    ...options
  })

  return runtime
}

/**
 * Start the monitor on targetRuntime: rest api + websocket
 * @param {*} targetRuntime
 * @param {*} options
 */
const startMonitor = async (targetRuntime = null, options = {}) => {
  if (!targetRuntime) throw new Error('targetRuntime is required')

  // Debug
  const {
    port = process.env.PORT,
    path = '_system'
  } = options

  console.log(`API: http://localhost:${port}/${path}`)

  // Start code based websocket monitor
  const router = monitor({
    targetRuntime,
    ...options
  })

  // Attach router (koa)
  const { app } = targetRuntime
  app.use(router.routes())
}

/**
 * Validate the design, ;oad the components, and return a runtime instance
 *
 * @param {*} [design={ nodes: [] }]
 * @param {*} [settings={}]
 * @returns runtime
 */
const load = async (
  design = { nodes: [] },
  settings = {}
) => {
  const {
    port,
    componentDirectory = `${process.cwd()}/components`,
    verbose = true
  } = settings

  // set global env for PORT (IMPROVE)
  if (port !== undefined) process.env.PORT = port

  // Validate
  // const errors = validate(design)
  // if (errors) {
  //   console.log(errors)
  //   // kill process
  //   return
  // }

  // # All good, start server
  // Create a runtime instance
  const runtime = create({}, settings)

  // Load components
  await runtime.loadComponents(componentDirectory)

  // Debug
  if (verbose) {
    console.log(`The following ${runtime.allComponents.length} components are available:`)
    console.log(runtime.allComponents.map(elem => `${elem.name}@${elem.version}`))
  }

  // Start the engine
  await runtime.run(design)

  return runtime
}

/**
 * Starts up a design
 *
 * @param {*} [design={}]
 * @param {*} [settings={}]
 * @returns runtime
 */
const start = async (design = {}, settings = {}) => {
  // Destructure settings
  const {
    monitor,
    prefix,
    apiKey
  } = settings

  // Create new runtime instance from design and settings
  const runtime = await load(design, settings)

  // (Optional) Start monitor ( REST API + Websocket server)
  if (monitor) {
    await startMonitor(runtime, {
      apiKey,
      path: `${prefix}/_system`,
      onUpdate (design) {
        // console.log(`Saving design to file: ${designFile}`)
        // save(design, designFile)
      }
    })
  }

  // Return
  return runtime
}

/**
 * Load a design from a file
 *
 * @param {string} [designFile=`${process.cwd()}/design.json`]
 * @param {*} [settings={}]
 */
const loadFromFile = async (
  designFile = `${process.cwd()}/design.json`,
  settings = {}
) => {
  console.log(`Loading design from : ${designFile}`)
  const design = await loadFile(designFile)

  return start(design, settings)
}

// Expose lib methods
module.exports = {
  version: __package.version,
  app,
  server,
  create,
  createRuntime: create,
  load,
  setServer,
  setApp,
  start,
  loadFile,
  save,
  validate,
  /**
   * Creates a Node that can be used with nodejs
   * @param {*} component
   */
  node (component = {}, node = {}) {
    // console.log(component)
    return new Node({ component, node })
  },

  loadComponents,
  getComponentByType,
  prettyNode,
  getConnectedNodesOnPort,
  loadFromFile,
  // startRestApi: require('./api/routes'),
  startMonitor,
  Runtime,
  httpCreate
}
