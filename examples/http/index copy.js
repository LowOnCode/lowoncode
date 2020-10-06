const lowoncode = require('../../index')

const handlers = {
  '': (req, res) => {},
  '/test': (req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' })
    res.write('cool')
    res.end()
  }
}
const port = 8081

const DEFAULT_HANDLER = (req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' })
  res.write('Hello World!')
  res.end()
}

var http = require('http')
http.createServer(function (req, res) {
  const handler = handlers[req.url] || DEFAULT_HANDLER

  handler(req, res)
}).listen(port)

console.log(`Server live at http://localhost:${port}`)
