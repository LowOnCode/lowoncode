const http = require('http')

const server = http.createServer()
server.listen(8080)

const server2 = http.createServer()
server2.listen(8081)
