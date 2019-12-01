// =============
// Programmatic  Monitor
// =============
const koarouter = require('koa-router')

const getCircularReplacer = () => {
  const seen = new WeakSet()
  return (key, value) => {
    if (typeof value === 'object' && value !== null) {
      if (seen.has(value)) {
        return '[Circular]'
      }
      seen.add(value)
    }
    return value
  }
}

module.exports = ({
  targetRuntime,
  path = '/_system',
  onUpdate = () => {}
}) => {
  const { app } = targetRuntime.tools.http

  const router = koarouter({
    prefix: path // or '/api'
  })

  // ========
  // Debug
  // ========
  router.get('/debug', (ctx, next) => {
    ctx.type = 'json'
    ctx.body = JSON.stringify(targetRuntime, getCircularReplacer())
  })

  router.get('/routes', (ctx, next) => {
    ctx.body = ctx.router.stack
  })

  // ========
  // Design
  // ========
  router.get('/design', async (ctx, next) => {
    ctx.body = targetRuntime.design
  })

  // Hotswap only
  router.put('/design', async (ctx, next) => {
    console.log('Hotswapping new design')
    const resp = await targetRuntime.run(ctx.request.body)
    ctx.body = resp
  })

  // Hotswap & save ?
  router.post('/design', async (ctx, next) => {
    console.log('Hotswapping new design')
    const design = ctx.request.body

    const resp = await targetRuntime.run(design)

    // TODO Save ?
    // HOOK: POST /design
    onUpdate(design)

    ctx.body = resp
  })

  // ========
  // Nodes
  // ========
  router.get('/nodes', (ctx, next) => {
    ctx.body = targetRuntime.nodes
  })

  router.get('/nodes/:id', (ctx, next) => {
    ctx.body = targetRuntime.findNodeById(ctx.params.id)
  })

  // ========
  // components
  // ========
  router.get('/components', (ctx, next) => {
    ctx.body = targetRuntime.allComponents
  })

  router.get('/components/:id', (ctx, next) => {
    ctx.body = targetRuntime.findNodeById(ctx.params.id)
  })

  // ========
  // Websocket server
  // ========
  const wsserver = require('./components/wsservercore')
  wsserver.created({
    tools: targetRuntime.tools,
    log (...args) { console.log(...args) },
    on (event, cb) {
      if (event === 'data:0') {
        cb(targetRuntime)
      }
    },
    options: {
      // port: process.env.PORT,
      // port: 5050,
      path: `${path}/ws`
    },
    status (...args) { console.log(...args) }
  })

  app.use(router.routes())
}
