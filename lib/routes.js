module.exports = (router, node = {}) => {
  // ========
  router.get('/', (ctx, next) => {
    console.log(node)
    // ctx.body = `<pre>${JSON.stringify(node)}</pre>`
    ctx.body = JSON.stringify(node)
  })

  // ========
  router.get('/components', (ctx, next) => {
    ctx.body = node.components
  })

  return router
}
