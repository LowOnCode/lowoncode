/**
 * The main entry for the locruntime
 */
const Runtime = require('./Runtime')
const httpCreate = require('./http')
const monitor = require('./api/monitor')
const __package = require('../package.json')
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

// Default .. TODO MORE JIT
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

// Start the monitor on targetRuntime: rest api + websocket
const startMonitor = async (targetRuntime, options = {}) => {
  if (!targetRuntime) throw new Error('targetRuntime is required')

  // Debug
  const {
    port = process.env.PORT,
    path = '_system'
  } = options
  console.log(`Monitor live at: http://localhost:${port}/${path}`)

  // Start code based websocket monitor
  const router = monitor({
    targetRuntime,
    ...options
  })

  // Attach router (koa)
  const { app } = targetRuntime
  app.use(router.routes())
}

const validate = design => {
  var schema = require('./schemas/design.js')
  var Ajv = require('ajv')
  var ajv = new Ajv() // options can be passed, e.g. {allErrors: true}
  var validate = ajv.compile(schema)
  // var valid = validate(design)
  // if (!valid) {
  //   // console.log(validate.errors)
  //   throw validate.errors
  // }
  return validate.errors
}

/**
 * Load a design and create a runtime instance
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
    repl = false,
    verbose = true
  } = settings

  // set global env for PORT (IMPROVE)
  if (port !== undefined) process.env.PORT = port

  // Validate
  const errors = validate(design)
  if (errors) {
    console.log(errors)
    // kill process
    return
  }

  // ==============
  // All good, start server
  // ==============
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

  // REPL
  if (repl) {
    attachRepl(runtime)
  }

  return runtime
}

const attachRepl = (runtime) => {
  const repl = require('repl')
  repl.start('> ')
  const r = repl.start('> ')
  // Provide context
  // r.context.design = design
  r.context.runtime = runtime
  r.context.c = runtime.allComponents
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
  // Destructure settings
  const {
    port,
    monitor
  } = settings

  // set global env for PORT (IMPROVE)
  if (port !== undefined) process.env.PORT = port

  // Load design file
  console.log(`Loading design from : ${designFile}`)
  const design = await loadFile(designFile)

  const runtime = await load(design, settings)

  // (Optional) Start monitor on our design
  if (monitor) {
    await startMonitor(runtime, {
      ...settings,
      onUpdate (design) {
        console.log(`Saving design to file: ${designFile}`)
        save(design, designFile)
      }
    })
  }
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

  // (Optional) Start monitor on our design
  if (monitor) {
    await startMonitor(runtime, {
      // ...settings, // path, port, ..
      apiKey,
      path: `${prefix}/_system`,
      onUpdate (design) {
        console.log('TODO')
        // console.log(`Saving design to file: ${designFile}`)
        // save(design, designFile)
      }
    })
  }

  // Return
  return runtime
}

module.exports = {
  // State
  version: __package.version,
  app,
  server,
  // Methods
  create,
  createRuntime: create,
  load,
  setServer,
  setApp,
  start,
  // Proxy utils.js
  loadFile,
  save,
  loadComponents,
  getComponentByType,
  prettyNode,
  getConnectedNodesOnPort,
  loadFromFile,
  // API's
  startRestApi: require('./api/routes'),
  startMonitor,
  // Expose Classes
  Runtime,
  // Create http server
  httpCreate
}
