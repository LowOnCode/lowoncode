const stringifySafe = obj => {
  try {
    return JSON.stringify(obj)
  } catch (err) {
    // TypeError: Converting circular structure to JSON ?
    console.warn("couldn't stringify object, message will contain empty string")
    return null
  }
}

module.exports = targetRuntime => ({ tools, log, on, options, status }) => {
  const { ws, http } = tools

  const createws = () => {
    status('No client connected')
    // console.log(http)

    const WebSocket = ws
    const settings = {
      // port: 5050,
      // path: '/ws',
      server: http.server, // Attach to main http server
      ...options // Merge with node settings
    }

    const wss = new WebSocket.Server(settings)
    console.log(`Websocket server setup as ws://0.0.0.0:${settings.port || http.server.address().port}${settings.path} `)

    const broadcast = (msgMixed) => {
      // console.log('MSG IN', msgMixed)

      const msg = stringifySafe(msgMixed)
      // log(`Currently ${wss.clients.size} clients connected`)
      // console.log('MSG toString', msg)

      // Broadcast to all
      wss.clients.forEach((client) => {
        // log('client')

        if (client.readyState === WebSocket.OPEN) {
          client.send(msg)
        }
      })
    }

    wss.on('connection', (socket, client) => {
      // log('Client connected', client)

      const updateStatus = () => status(`${socket && socket.online} client(s) connected`)

      socket.on('open', function (client) {
        updateStatus()
      })

      socket.on('close', function (client) {
        updateStatus()
      })

      socket.on('message', async (data) => {
        log(data)

        // Handle raw incoming message
        // console.log(data)
        const parsed = JSON.parse(data)
        const [action, payload] = parsed
        // console.log(action)

        const actionHandlers = {
          '/nodes': ({ action, payload }) => {
            // TODO
            return []
          },
          default: ({ action, payload }) => {
            return 'unsupported action'
          }
        }

        // Call action
        const fn = actionHandlers[action] || actionHandlers['default']

        const newPayload = await fn({ action, payload })
        const message = [action, newPayload]
        console.log('Sending', message)
        socket.send(JSON.stringify(message))
      })

      socket.on('error', function (err, client) {
        // instance.throw(err)
        throw new Error(err)
      })
    })

    return { wss, broadcast }
  }

  // ================
  // Wait on targetRuntime
  // ================
  // Received the targetRuntime .. start up
  const { broadcast } = createws()

  // ================
  // Tap into runtime message system
  // ================
  const { bus } = targetRuntime
  bus.onAny((event, value) => {
    // log(event, value)
    // To all Websocket
    broadcast([
      event, value
    ])
  })
}
