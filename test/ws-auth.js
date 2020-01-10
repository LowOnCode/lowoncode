const WebSocket = require('ws')

const { server } = targetRuntime.tools
const wss = new WebSocket.Server({ noServer: true })

console.log(server)

// Keep track of users
const mapUsers = new Map()

wss.on('connection', function connection (ws, request, client) {
  const userId = request.session.userId
  mapUsers.set(userId, ws)

  ws.on('message', function message (msg) {
    console.log(`Received message ${msg} from user ${client}`)
  })
  ws.on('close', function () {
    mapUsers.delete(userId)
  })
})

const authenticate = (req) => {
  console.log(req)
}

server.on('upgrade', function upgrade (request, socket, head) {
  authenticate(request, (err, client) => {
    if (err || !client) {
      socket.destroy()
      return
    }

    wss.handleUpgrade(request, socket, head, function done (ws) {
      wss.emit('connection', ws, request, client)
    })
  })
})
