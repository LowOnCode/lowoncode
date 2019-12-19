/**
 * The main entry for the locruntime
 */
const Runtime = require('./lib/Runtime')
const httpCreate = require('./lib/http')
const monitor = require('./monitor')
const {
  load,
  save,
  loadComponents,
  getComponentByType,
  prettyNode,
  getConnectedNodesOnPort
} = require('./lib/utils')

// Create a single http server ( to support hosting environments that use process.env.PORT )
let http = null

// Factory
const create = (variables, options) => {
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
  // Debug
  const {
    port = process.env.PORT,
    path = '_system'
  } = options
  console.log(`Monitor live at: http://localhost:${port}/${path}`)

  // Start code based monitor
  monitor({
    targetRuntime,
    ...options
  })
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

const loadFromFile = async ({
  port,
  designFile = `${process.cwd()}/design.json`,
  componentDirectory = `${process.cwd()}/components`,
  monitor,
  strict = false,
  repl = false
} = {}) => {
  // set global env for PORT (IMPROVE)
  if (port !== undefined) process.env.PORT = port

  // Load design file
  console.log(`Loading design from : ${designFile}`)
  const design = await load(designFile)

  // Validate
  const errors = validate(design)
  if (errors) {
    console.log(errors)
    return // kill process
  }

  // Debug
  console.log(`...done. Design contains ${design.nodes.length} nodes`)

  // ==============
  // All good, start server
  // ==============
  // Create a runtime instance
  const runtime = create({}, {
    strict
  })

  // Load components
  await runtime.loadComponents(componentDirectory)

  // Load core components
  // await runtime.loadComponents(`${__dirname}/../components`)

  // Start the engine
  await runtime.run(design)

  // (Optional) Start monitor on our design
  if (monitor) {
    await start(runtime, {
      onUpdate (design) {
        console.log(`Saving design to file: ${designFile}`)
        // console.log(design)
        save(design, designFile)
      }
    })
  }

  // REPL
  if (repl) {
    const repl = require('repl')
    repl.start('> ').context.design = design
    const r = repl.start('> ')
    r.context.design = design
    r.context.designFile = designFile
    r.context.runtime = runtime
    // Alias
    r.context.c = runtime.allComponents
  }

  return true
}

// const loadFromRemote = async ({
//   port,
//   designFile
// } = {}) => {
//   // set global env for PORT (IMPROVE)
//   if (port !== undefined) process.env.PORT = port

//   // Not our business but sometimes needed
//   // process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0

//   if (!designFile) {
//     throw new Error('Please set the DESIGN env!')
//   }

//   // ==========
//   // Load design file: local or remote
//   // ==========
//   console.log(`Fetching design from : ${designUrl}`)
//   const axios = require('axios')
//   const DESIGN_ID = process.env.DESIGN_ID || '5d98e3a19a33d6001711aaec' // < Remove defaults
//   const DESIGN_SECRET = process.env.DESIGN_SECRET || 'supersecret'
//   const designUrl = `http://localhost:1337/designs/${DESIGN_ID}/${DESIGN_SECRET}`
//   const design = await axios.get(designUrl).then(resp => resp.data)

//   // Debug
//   console.log(`...done. Design contains ${data.nodes.length} nodes`)

//   // All good, start server
//   serve(data)
// }

const lowoncode = {
  create,
  createRuntime: create,
  load,
  save,
  loadComponents,
  getComponentByType,
  prettyNode,
  getConnectedNodesOnPort,
  start,
  loadFromFile

  // async loadById (id, secret) {
  //   const url = `http://localhost:1337/designs/${id}/${secret}`

  //   // Load design file
  //   const design = await axios.get(url).then(resp => resp.data)
  //   return design
  // },
}

module.exports = lowoncode
