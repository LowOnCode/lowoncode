const createRouter = require('./router')
const api = require('./api')
const createWss = require('./wss')

module.exports = ({
  root,
  app,
  server,
  url = 'http://localhost:5678',
  prefix = '/_system',
  heartbeat = false,
  heartbeatInterval = 5000
} = {}) => {
  // # REST API
  const router = createRouter()
  api(router, root)

  console.log(`* REST API started on ${url}${prefix}`)
  console.log(`* Swagger available on ${url}${prefix}/index.html`)

  app.use(prefix, router)

  // # Websocket service
  const {
    broadcast
  } = createWss({
    server
  })

  // Heartbeat
  if (heartbeat) {
    setInterval(() => {
      broadcast('beat')
    }, heartbeatInterval)
  }

  // Tap into root message system
  const bus = root.getBus()
  bus.onAny((event = '', payload) => {
    // See https://github.com/LowOnCode/lowoncode/blob/master/lib/Runtime.js
    const { from } = payload

    // Send to all connected clients
    broadcast([
      event,
      from
    ])
  })

  bus.on('request', value => {
    // console.log(value)
  })

  // console.log(bus)
}
