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

module.exports = {
  create,
  createRuntime: create,
  load,
  save,
  loadComponents,
  getComponentByType,
  prettyNode,
  getConnectedNodesOnPort,
  start

  // async loadById (id, secret) {
  //   const url = `http://localhost:1337/designs/${id}/${secret}`

  //   // Load design file
  //   const design = await axios.get(url).then(resp => resp.data)
  //   return design
  // },

}
