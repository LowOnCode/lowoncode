
module.exports = {
  props: {
    method: { type: 'enum', enum: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'], default: 'GET' },
    url: { type: 'string', default: '' }
  },

  mounted () {
    const Router = require('@koa/router')

    const router = new Router()

    router.get('/', (ctx, next) => {
      // ctx.router available
      ctx.body = 'hello'
    })

    // app
    // .use(router.routes())
    // .use(router.allowedMethods());
  }
}
