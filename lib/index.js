const Node = require('./Node')
const createServer = require('./http')
// const createMonitor = require('./monitor')
const __package = require('../package.json')
// const validate = require('./validate')
const createRouter = require('./router')
const {
  loadFile,
  componentsFromDirectoryFlat,
  // getConnectedNodesOnPort,
  componentsFromDirectory,
  createLookup
} = require('./utils')
const createRoutes = require('./routes')
const createWss = require('./wss')

// # Create a single http server
// ( to support hosting environments that use one port, process.env.PORT )
// const server = null

// Default settings
const SETTINGS = {
  componentDirectory: `${process.cwd()}/components`,
  prefix: '',
  port: 5678,
  apiKey: '',
  api: true,
  apiPrefix: '/_system'
}

const createMonitor = ({
  runtime, app, server,
  prefix = '/_system',
  port = 5678
} = {}) => {
  // # REST API

  const router = createRouter()
  createRoutes(router, runtime)
  console.log(`* REST API started on http://localhost:${port}${prefix}`)
  app.use(prefix, router)

  // # Websocket service
  const {
    // wss,
    broadcast
  } = createWss({
    server
  })
  // Tap into runtime message system
  const bus = runtime.getBus()

  // Heartbeat
  // setInterval(() => {
  //   broadcast('beat')
  // }, 1000)

  bus.onAny((event, value) => {
    // console.log(event, value)
    // To all Websocket
    broadcast([
      event
    ])
    // broadcast([
    //   event, value
    // ])
  })

  bus.on('request', value => {
    // console.log(value)
  })

  // console.log(bus)
}

/**
 * Start design
 *
 * @param {string} [designFile=`${process.cwd()}/design.json`]
 * @param {*} [settings={}]
 */
const start = async (
  design = {},
  settings = SETTINGS
) => {
  const {
    componentDirectory,
    // apiKey,
    api,
    prefix, // Root mount prefix default /
    apiPrefix, // True / false
    port
  } = {
    ...SETTINGS,
    ...settings
  }

  // console.log(`Loading design from : ${designFile}`)

  // Load components
  const componentsArray = await componentsFromDirectoryFlat(componentDirectory)
  const components = createLookup('name')(componentsArray)
  console.log(`Found ${componentsArray.length} components in directory: ${componentDirectory}`)

  // # Convert children to Nodes()
  const children = design.children || design.nodes
  console.log(`Found ${children.length} nodes in design`)
  // console.log(children)

  // Root node
  const runtime = new Node({
    components,
    name: 'app',
    connections: design.connections,
    children: children.map(node => new Node({
      ...components[node.component],
      ...node
    }))
  })

  // Bind root Node to NodeJs http ?
  // # Create http server
  const { app, server } = createServer({ port })

  // Create router
  const router = createRouter()
  app.use(prefix, router)

  // # Start monitor (Optional) ( REST API + Websocket server)
  if (api) {
    createMonitor({ runtime, app, server, port, prefix: apiPrefix })
    // console.log(wss)
    console.log(`* Websocket server setup as ws://localhost:${port}${apiPrefix}`)
  }

  // Start root node and mount as middleware
  const rootNodeHandler = runtime.$mount()
  app.use(rootNodeHandler)

  // app.use((req, res) => {
  //   res.status(404).send('Page not found')
  // })

  console.log(`Root node mounted 😎`)
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
  // console.log(`Loading design from : ${designFile}`)
  const design = await loadFile(designFile)

  start(design, settings)
}

/**
* Create a Node
* @param {*} component
*/
function node (mixed = {}, node = {}) {
  const component = typeof mixed === 'string'
    ? {}
    : mixed

  return new Node(component, node)
}

// Exports
module.exports = {
  version: __package.version,
  // validate,
  Node,
  node,

  // Alias
  start,
  // load: loadFromFile,

  componentsFromDirectory,
  async loadAllFrom (dir = '', lookup = true) {
    const array = await componentsFromDirectory(dir)
    console.log(array)

    return lookup
      ? createLookup('name')(array)
      : array
  },
  async componentsFromDirectoryFlat (dir = '') {
    const components = await componentsFromDirectoryFlat(dir)
    // return components
    return createLookup('name')(components)
  },
  // getConnectedNodesOnPort,
  // Used by CLI
  loadFromFile
  // startRestApi: require('./api/routes'),
  // startMonitor,
  // Runtime,
  // httpCreate
}
