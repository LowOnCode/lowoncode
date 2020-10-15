const Node = require('./Node')
const createServer = require('./http')
const createRouter = require('./router')
const createMonitor = require('./createMonitor')
const { SETTINGS, NODE } = require('./types')

/**
 * Start design
 *
 * @param {string} [designFile=`${process.cwd()}/design.json`]
 * @param {*} [settings={}]
 */
module.exports = async (
  rootNode = NODE,
  settings = SETTINGS
) => {
  const {
    // apiKey,
    api,
    prefix, // Root mount prefix default /
    apiPrefix, // True / false
    port
  } = {
    ...SETTINGS,
    ...settings
  }

  const { connections, components, children } = rootNode

  // # Convert children to Nodes()
  console.log(`Found ${children.length} nodes in design`)
  // console.log(children)

  // Create root node
  const root = new Node({
    components,
    name: 'app',
    connections,
    children: children.map(node => new Node({
      ...components[node.component],
      ...node
    }))
  })

  // Bind root Node to NodeJs http ?
  // # Create http server
  const { app, server, url } = createServer({ port })

  // Create instance router
  const router = createRouter()
  app.use(prefix, router)

  // # Start monitor (Optional) ( REST API + Websocket server)
  if (api) {
    createMonitor({ root, app, url, server, port, prefix: apiPrefix })
    // console.log(wss)
    console.log(`* Websocket server setup as ws://localhost:${port}${apiPrefix}`)
  }

  // Start root node and mount as middleware
  console.log(`Mounting root node 🚀`)

  const rootNodeHandler = root.$mount()
  app.use(rootNodeHandler)

  // Tap into events
  // runtime.onAny((event, payload) => {
  //   console.log('[event]', event, payload.from)
  // })

  console.log(`Root node mounted 😎`)
}
