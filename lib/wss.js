const WebSocket = require('ws')

// See https://github.com/websockets/ws
const DEFAULT = {
  server: {}, // Attach to main http server
  path: '/_system'
}

const stringifySafe = obj => {
  try {
    return JSON.stringify(obj)
  } catch (err) {
    // TypeError: Converting circular structure to JSON ?
    // console.warn("couldn't stringify object, message will contain empty string")
    return err.toString()
  }
}

const broadcastJson = (wss = {}) => (msgMixed = {}) => {
  // Convert to string (safe)
  const msg = stringifySafe(msgMixed)

  // Broadcast to all
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(msg)
    }
  })
}

module.exports = (settings = DEFAULT) => {
  const _settings = {
    ...DEFAULT,
    ...settings
  }
  // console.log(_settings)

  const wss = new WebSocket.Server(_settings)

  const actionHandlers = {
    '/nodes': ({ action, payload }) => {
      // TODO
      return []
    },
    default: ({ action, payload }) => {
      return 'unsupported action'
    }
  }

  wss.on('connection', (socket, client) => {
    console.log('Client Search 😋connected')
    console.log(client)

    // Welcome message
    socket.send('hi')

    const updateStatus = () => console.log(`${socket && socket.online} client(s) connected`)

    socket.on('open', function (client) {
      updateStatus()
    })

    socket.on('close', function (client) {
      updateStatus()
    })

    socket.on('message', async (data = '') => {
      // log(data)

      // Handle raw incoming message
      // console.log(data)
      try {
        const parsed = JSON.parse(data)

        const [action, payload] = parsed

        // Call action
        const fn = actionHandlers[action] || actionHandlers['default']

        const newPayload = await fn({ action, payload })
        const message = [action, newPayload]
        console.log('Sending', message)
        socket.send(JSON.stringify(message))
      } catch (err) {
        // JSON parse error ?
        console.warn(err)
        socket.send(err.toString())
      }
      // console.log(action)
    })

    socket.on('error', function (err, client) {
      // instance.throw(err)
      throw new Error(err)
    })
  })

  return { wss, broadcast: broadcastJson(wss) }
  // }

  // return wss
}
