/* eslint-disable no-tabs */
module.exports = {
  id: 'wsservercorestats',
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
    const { tools, log } = instance

    const options = {
      heartbeat: true,
      ...instance.options
    }

    log(options)

    // -----------
    // Helpers
    // -----------

    const createws = () => {
      instance.status('No client connected')

      const WebSocket = tools.ws
      const settings = {
        port: 5050,
        path: '/ws',
        ...options // Merge with node settings
      }
      const wss = new WebSocket.Server(settings)

      // ============
      // Timed broadcasts
      // ============
      // if (options.heartbeat) {
      //   // log('sending ping')
      //   setInterval(function () {
      //     log('sending ping')
      //     broadcast({ action: 'ping' })
      //   }, 1000)
      // }

      const wsMessage = (action, payload) => ({ action, payload })

      // if (options.stats) {
      setInterval(function () {
        broadcast(wsMessage('stats', {
          mem: tools.stats.mem()
        }))
      }, 1000)
      // }

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
        const updateStatus = () => instance.status(`${ws && ws.online} client(s) connected`)

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
          broadcast(data)
        })

        ws.on('error', function (err, client) {
          instance.throw(err)
        })
      })

      log(`Websocket server setup as ws://0.0.0.0:${settings.port}/${settings.path} `)
    }

    createws()
  }
}
