const http = require('http')
const express = require('express')
const app = express()
const cors = require('cors')

/**
 * Create http server
 * @param {*} param0
 */
const createHttp = ({
  port = 5000
} = {}) => {
  app.use(cors())

  const server = http.createServer((req, res) => {
    // res.writeHead(200, { 'Content-Type': 'text/plain' })
    // res.end('okay')

    // Call express
    app(req, res)
  })
    .listen(port)

  console.log(`* server started on http://localhost:${port}`)

  return {
    app,
    // router,
    server
  }
}

module.exports = createHttp
