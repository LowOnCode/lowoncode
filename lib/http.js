const http = require('http')
const express = require('express')
const app = express()
const cors = require('cors')

/**
 * Create http server
 * @param {*} param0
 */
const createHttp = ({
  port = 5000,
  protocol = 'http',
  host = 'localhost'
} = {}) => {
  app.use(cors())
  app.use(express.json()) // for parsing application/json
  app.use(express.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded

  const server = http.createServer((req, res) => {
    // res.writeHead(200, { 'Content-Type': 'text/plain' })
    // res.end('okay')
    // Call express
    app(req, res)
  })
    .listen(port)

  const url = `${protocol}://${host}:${port}`
  console.log(`* server started on ${url}`)

  return {
    app,
    host,
    port,
    url,
    server
  }
}

module.exports = createHttp
