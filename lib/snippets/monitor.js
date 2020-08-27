const koarouter = require('@koa/router')
const routes = require('./routes')
// const wsserver = require('./components/wscore')

module.exports = (settings = {}) => {
  const {
    // targetRuntime,
    path = '/_system',
    apiKey = ''
    // (Leave empty = no Protection) Secret key for authorization,
    // needed to be set as header "Authorization: apiKey XXX"
  } = settings

  const router = koarouter({
    prefix: path
  })

  // Add authorization middleware if apiKey is supplied
  if (apiKey) {
    const getApiKey = (req) => {
      return req.query.apikey ||
        (req.headers['authorization'] &&
        req.headers['authorization'].replace('ApiKey ', '')) ||
        false
    }

    router.use((ctx, next) => {
      const calledWithApiKey = getApiKey(ctx.request)
      console.log(calledWithApiKey)
      console.log('Should be:', apiKey)

      const isValid = calledWithApiKey === apiKey

      if (isValid) {
        next()
      } else {
        ctx.throw(401)
        // actual error will be in JSON API 1.0 format
      }
    })
  }

  // Install routes
  routes(router, settings)

  // ========
  // Websocket server
  // ========
  // if (enableMonitor) {
  // console.log('starting websocket')
  // wsserver(targetRuntime)({
  //   tools: targetRuntime.tools,
  //   log (...args) { console.log(...args) },
  //   on (event, cb) {
  //     if (event === 'data:0') {
  //       cb(targetRuntime)
  //     }
  //   },
  //   options: {
  //     path: `${path}/ws`
  //   },
  //   status (...args) { console.log(...args) }
  // })
  // }

  return router
}
