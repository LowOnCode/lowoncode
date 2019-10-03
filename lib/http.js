const Koa = require('koa')
const body = require('koa-body')
const logger = require('koa-logger')
const koa2cors = require('koa2-cors')()
const koarouter = require('koa-router')

module.exports = ({ port = process.env.PORT }, installRoutesCb = () => {}) => {
//   const path = require('path')

  const app = new Koa()

  // Middleware
  app.use(koa2cors)
  app.use(body())
  app.use(logger())
  //   app.use(require('koa-static')(path.resolve(__dirname, '..', 'designer', 'dist')))

  const router = koarouter({
    prefix: '' // or '/api'
  })
  //   installRoutesCb(router)
  router.get('/debug', (ctx, next) => {
    // ctx.router available
    ctx.body = 'Hello World'
    ctx.body = router.stack.map(i => i.path)
  })
  router.get('/', (ctx, next) => {
    ctx.body = ctx.router.stack.map(i => i.path)
  })
  app.use(router.routes())
  app.use(router.allowedMethods())

  // Start server
  app.listen(port)
  console.log('* server started on port %s', port)

  return { app, router }
}
