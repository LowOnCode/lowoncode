/**
 * The main entry for the locruntime
 */
const Runtime = require('./lib/Runtime')
const httpCreate = require('./lib/http')
const monitor = require('./monitor')
const {
  save
} = require('./lib/utils')

// Create a single http server ( to support hosting environments that use process.env.PORT )
let http = null

// Factory
const createRuntime = (variables, options) => {
  // Create once
  if (!http) {
    http = httpCreate({})
  }

  return new Runtime(variables, {
    http,
    ...options
  })
}

// Start the monitor on targetRuntime
const start = async (targetRuntime, options = {}) => {
  const {
    port = process.env.PORT,
    path = '_system',
    logs = `${__dirname}/tmp`
  } = options

  // Get the components of the target runtime
  const targetComponents = targetRuntime.getComponents()
  // (Optional) Create tmp file for debugging
  await targetRuntime.savePretty(targetComponents, `${logs}/components.json`)

  // TODO: change core.json to not use filesystem ?
  const design = targetRuntime.getDesign()
  save(design, `${logs}/design.json`)

  // ============
  // Create monitor from design ( Yes, even for the core we use a lowoncode design )
  // ============
  // Inject these variable
  const variables = {
    targetRuntime
  }
  const runtime = createRuntime(variables)

  // Load needed components for the core design
  // await runtime.loadComponents(`${__dirname}/components`)
  // Load core design and and inject it with the targetRuntime
  // await runtime.loadAndRun(`${__dirname}/monitor.json`, targetRuntime)

  console.log(`Monitor live at: http://localhost:${port}/${path}`)

  // Return the runtime
  return runtime
}

module.exports = {
  start
}
