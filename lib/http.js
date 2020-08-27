const Koa = require('koa')
const body = require('koa-body')
const logger = require('koa-logger')
const koa2cors = require('koa2-cors')()
// const koarouter = require('koa-router')

module.exports = ({
  port = 5000
} = {}) => {
  const app = new Koa()
  app.use(koa2cors)
  app.use(body())
  app.use(logger())

  // Default router ?
  // const router = koarouter({
  //   prefix: '' // or '/api'
  // })
  // app.use(router.routes())
  // app.use(router.allowedMethods())

  // Start server
  const server = app.listen(port)
  console.log(`* server started on http://localhost:${port}`)

  return {
    app,
    // router,
    server
  }
}
