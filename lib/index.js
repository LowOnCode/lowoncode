const Node = require('./Node')
const createServer = require('./http')
// const createMonitor = require('./monitor')
const __package = require('../package.json')
const validate = require('./validate')
const {
  loadFile,
  componentsFromDirectory,
  getConnectedNodesOnPort,
  createLookup
} = require('./utils')

// # Create a single http server
// ( to support hosting environments that use one port, process.env.PORT )
// const server = null

// Default settings
const SETTINGS = {
  monitor: true,
  componentDirectory: `${process.cwd()}/components`,
  apiKey: '',
  prefix: '',
  port: 5678
}

/**
 * Load a design from a file
 *
 * @param {string} [designFile=`${process.cwd()}/design.json`]
 * @param {*} [settings={}]
 */
const loadFromFile = async (
  designFile = `${process.cwd()}/design.json`,
  settings = SETTINGS
) => {
  const {
    componentDirectory,
    monitor,
    apiKey,
    prefix,
    port
  } = {
    ...SETTINGS,
    ...settings
  }

  // console.log(`Loading design from : ${designFile}`)
  const design = await loadFile(designFile)

  // Load components
  const components = await componentsFromDirectory(componentDirectory)
  console.log(`Found ${components.length} components in directory: ${componentDirectory}`)

  // # Convert children to Nodes()
  // const count1 = new Node(components.count, { x: 50, y: 100 })
  // const log1 = new Node(components.log, { label: '*** CUSTOM LOGGER ***', x: 300, y: 100 })
  const childrenRaw = design.children || design.nodes
  const children = childrenRaw.map(node => new Node(components[node.component], node))

  // Root node
  const runtime = new Node({
    components,
    name: 'app',
    children // [count1, log1, route, ...]
  })

  // Start up root node
  runtime.mount()

  // Bind root Node to NodeJs http ?
  // # Create Koa server
  const { app } = createServer({ port })

  // (Optional) Start monitor ( REST API + Websocket server)
  if (monitor) {
    // const router = createMonitor({
    //   runtime
    //   // ...options
    // })
    const koarouter = require('@koa/router')
    const routes = require('./routes')

    const router = koarouter({
      prefix: '/_system'
      // prefix: path
    })
    routes(router, runtime)

    app.use(router.routes())
    // const { app } = targetRuntime
    // app.use(router.routes())
  }
}

// Expose lib methods
module.exports = {
  version: __package.version,
  // app,
  // server,
  // // Global components
  // components: [],
  // create,
  // createRuntime: create,
  // load,
  // setServer,
  // setApp,
  // start,
  // loadFile,
  // save,
  // validate,

  Node,
  /**
   * Creates a Node that can be used with nodejs
   * @param {*} component
   */
  node (mixed = {}, node = {}) {
    // console.log(this)
    const component = typeof mixed === 'string'
      // Use global component
      ? {}
      : mixed

    return new Node(component, node)
  },

  async componentsFromDirectory (dir = '') {
    const components = await componentsFromDirectory(dir)
    // console.log(dir, components)
    this.components = components
    // return components
    return createLookup(components, 'name')
  },
  getConnectedNodesOnPort,

  // Used by CLI
  loadFromFile
  // startRestApi: require('./api/routes'),
  // startMonitor,
  // Runtime,
  // httpCreate
}
