// Start custom http server
const http = require('http')
const port = process.env.PORT || 8089
const server = http.createServer(function (req, res) {
  if (req.url === '/') {
    res.writeHead(200, { 'Content-Type': 'text/html' })
    res.write('Hello World! <a href="/app1">open design</a>')
    res.end()
  }
})

// ==================
const lowoncode = require('@lowoncode/runtime')
// Load two design
const designv1 = require('./v1.json')

async function main () {
// Tell lowoncode which server object to use
  lowoncode.setServer(server)

  const runtime = await lowoncode.start(designv1, {
    prefix: '/app1',
    componentDirectory: `${process.cwd()}/../components`,
    monitor: true,
    apiKey: '123'
  })
  console.log(runtime.app)

  // ==================
  // add additional listener
  server.on('request', function (req, res) {
    console.log(req.url)

    if (req.url === '/goodbye') {
      res.writeHead(200, { 'Content-Type': 'text/plain' })
      res.end('goodbye')
    }
  })
  server.on('request', runtime.app.callback())

  server.listen(port)

  console.log(`Open at: http://localhost:${port}`)
}
main()
