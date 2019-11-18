const Koa = require('koa')
const body = require('koa-body')
const logger = require('koa-logger')
const koa2cors = require('koa2-cors')()
const koarouter = require('koa-router')

module.exports = ({
  port = process.env.PORT || 5000
}) => {
//   const path = require('path')

  const app = new Koa()

  // Middleware

  //= ================
  // Error Handler
  //= ================

  // // DEBUG ONLY, can leak internals
  // app.use(async (ctx, next) => {
  //   try {
  //     await next()
  //   } catch (err) {
  //     ctx.status = err.status || 500
  //     ctx.body = err.message
  //     ctx.app.emit('error', err, ctx)
  //   }
  // })

  // app.on('error', (err, ctx) => {
  //   /* centralized error handling:
  //    *   console.log error
  //    *   write error to log file
  //    *   save error and request information to database if ctx.request match condition
  //    *   ...
  //   */
  // })

  app.use(koa2cors)
  app.use(body())
  app.use(logger())
  //   app.use(require('koa-static')(path.resolve(__dirname, '..', 'designer', 'dist')))

  const router = koarouter({
    prefix: '' // or '/api'
  })

  // Test
  // router.get('/debug', (ctx, next) => {
  //   // ctx.router available
  //   ctx.body = 'Hello World'
  //   // ctx.body = router.stack.map(i => i.path)
  // })
  // router.get('/', (ctx, next) => {
  //   ctx.body = ctx.router.stack.map(i => i.path)
  // })
  app.use(router.routes())
  app.use(router.allowedMethods())

  // Start server
  const server = app.listen(port)
  console.log(`* server started on port %s http://localhost:${port}`)

  return { app, router, server }
}
