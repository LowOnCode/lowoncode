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

module.exports = ({ runtime, targetRuntime }) => {
  const { app } = runtime.tools.http

  const router = koarouter({
    prefix: '' // or '/api'
  })

  router.get('/_system/debug', (ctx, next) => {
    ctx.type = 'json'
    ctx.body = JSON.stringify(targetRuntime, getCircularReplacer()) // util.inspect(targetRuntime)
    // ctx.body = targetRuntime
  })

  // ========
  // Nodes
  router.get('/_system/nodes', (ctx, next) => {
    ctx.body = targetRuntime.nodes
  })

  router.get('/_system/nodes/:id', (ctx, next) => {
    const node = targetRuntime.findNodeById(ctx.params.id)

    ctx.body = node // JSON.stringify(node, getCircularReplacer())
  })

  app.use(router.routes())
}
