// TODO better topic system
// // Ws Topics
// const topics = {
//   heartbeat: {
//     minInteral: 1000,
//     fn () {
//       return {
//         action: 'ping'
//       }
//     }
//   },
//   stats: {
//     minInteral: 1000,
//     fn ({ tools }) {
//       return {
//         mem: tools.stats.mem()
//       }
//     }
//   }
// }

/* eslint-disable no-tabs */
module.exports = {
  name: 'wsservercore',
  title: 'wsservercore',
  version: '1.0.0',
  color: '#656D78',
  options: {
    enabled: true
  },
  inputs: [
    {
      color: '#6BAD57',
      description: `targetRuntime`
    }
  ],
  outputs: [

  ],
  readme: `Core Ws monitoring server`,

  install (instance) {
    const { tools, log, bus, options, status } = instance
    const state = {}

    // -----------
    // Helpers
    // -----------
    // const wsMessage = (action, payload) => ({ action, payload })

    const createws = () => {
      status('No client connected')

      const WebSocket = tools.ws
      const settings = {
        // port: 5050,
        path: '/ws',
        server: tools.http.server, // Attach to main http server
        ...options // Merge with node settings
      }
      const wss = new WebSocket.Server(settings)

      const broadcast = (msgMixed) => {
        const msg = JSON.stringify(msgMixed)
        // log(`Currently ${wss.clients.size} clients connected`)

        // Broadcast to all
        wss.clients.forEach((client) => {
          // console.log('client')

          if (client.readyState === WebSocket.OPEN) {
            client.send(msg)
          }
        })
      }

      wss.on('connection', (ws, client) => {
        // console.log('Client connected', client)

        const updateStatus = () => status(`${ws && ws.online} client(s) connected`)

        ws.on('open', function (client) {
          updateStatus()
        })

        ws.on('close', function (client) {
          updateStatus()
        })

        ws.on('message', function (data) {
          log(data)
          //   var flowdata = instance.make(message)
          //   flowdata.repository.client = client
          //   instance.send(flowdata)
          // broadcast(data)
        })

        ws.on('error', function (err, client) {
          instance.throw(err)
        })
      })

      log(`Websocket server setup as ws://0.0.0.0:${settings.port}/${settings.path} `)

      return { wss, broadcast }
    }

    // Wait on targetRuntime input
    bus.on('data', (targetRuntime) => {
      // console.log('WS Received', targetRuntime)
      state.targetRuntime = targetRuntime

      // Received the targetRuntime .. start up
      const { broadcast } = createws()

      const { bus } = targetRuntime
      bus.onAny((event, value) => {
        // console.log(event, value)
        // To Websocket
        broadcast([
          event, value
        ])
      })
    })
  }
}
