/**
 * The main entry for the locruntime
 */
const Runtime = require('./lib/Runtime')
const httpCreate = require('./lib/http')
const monitor = require('./api/monitor')
const {
  loadFile,
  save,
  loadComponents,
  getComponentByType,
  prettyNode,
  getConnectedNodesOnPort
} = require('./lib/utils')

// Create a single http server
// ( to support hosting environments that use one port, process.env.PORT )
let server = null
let app = null

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

// Start the monitor on targetRuntime
const startMonitor = async (targetRuntime, options = {}) => {
  // Debug
  const {
    port = process.env.PORT,
    path = '_system'
  } = options
  console.log(`Monitor live at: http://localhost:${port}/${path}`)

  // Start code based monitor
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

const load = async (
  design = { nodes: [] },
  settings = {}
) => {
  const {
    port,
    componentDirectory = `${process.cwd()}/components`,
    repl = false
  } = settings

  // console.log('settings', settings)

  // set global env for PORT (IMPROVE)
  if (port !== undefined) process.env.PORT = port

  // Validate
  const errors = validate(design)
  if (errors) {
    console.log(errors)
    // kill process
    return
  }

  // Debug
  console.log(`...done.`)
  console.log(`Design contains ${design.nodes.length} nodes`)

  // ==============
  // All good, start server
  // ==============
  // Create a runtime instance
  const runtime = create({}, settings)

  // Load components
  await runtime.loadComponents(componentDirectory)

  // Debug
  console.log(`The following ${runtime.allComponents.length} components are available:`)
  console.log(runtime.allComponents.map(elem => `${elem.name}@${elem.version}`))

  // Load core components
  // await runtime.loadComponents(`${__dirname}/../components`)

  // Start the engine
  await runtime.run(design)

  // REPL
  if (repl) {
    const repl = require('repl')
    repl.start('> ').context.design = design
    const r = repl.start('> ')
    r.context.design = design
    // r.context.designFile = designFile
    r.context.runtime = runtime
    // Alias
    r.context.c = runtime.allComponents
  }

  return runtime
}

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

module.exports = {
  create,
  createRuntime: create,
  load,

  setServer,
  setApp,

  start: async (design = {}, settings = {}) => {
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
  },

  // Proxy utils.js
  loadFile,
  save,
  loadComponents,
  getComponentByType,
  prettyNode,
  getConnectedNodesOnPort,
  startMonitor,
  loadFromFile,

  // Expose Classes
  Runtime,

  // Create http server
  httpCreate,
  createRouter: require('koa-router')
}
