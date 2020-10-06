const lowoncode = require('../../index')

const port = 8081

const handlers = {
  '': (req, res) => {},
  '/test': (req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' })
    res.write('cool')
    res.end()
  }
}

const DEFAULT_HANDLER = (req, res) => {
  // Route traffic to design
  lowoncode.handle(req, res)
}

// Create NodeJs http server
var http = require('http')
http.createServer(function (req, res) {
  const handler = handlers[req.url] || DEFAULT_HANDLER

  handler(req, res)
}).listen(port)

console.log(`Server live at http://localhost:${port}`)
