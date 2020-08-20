// =============
// Programmatic  Monitor
// =============
const koarouter = require('@koa/router')
const installMonitorRoutes = require('./routes')

module.exports = (settings = {}) => {
  const {
    targetRuntime,
    // prefix = '/',
    path = '/_system',
    apiKey = '',
    // (Leave empty = no Protection) Secret key for authorization,
    // needed to be set as header "Authorization: apiKey XXX"
    // enableRestApi = true, // Starts up an restapi server
    enableMonitor = false // Starts up an websocket server
    // onUpdate = () => {}
  } = settings

  // console.log('Install at', settings)

  // =============
  // REST
  // =============
  // Get koa
  // const { app } = targetRuntime.tools

  const router = koarouter({
    prefix: path || '_system'
  })

  // Add Validation middleware if apiKey is supplied
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
  installMonitorRoutes(router, settings)

  // Attach router
  // app.use(router.routes())

  // ========
  // Websocket server
  // ========
  if (enableMonitor) {
    const wsserver = require('./wsservercore')

    console.log('starting websocket')
    wsserver(targetRuntime)({
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
        //   path: `${prefix.path}/ws`
        path: `${path}/ws`
      },
      status (...args) { console.log(...args) }
    })
  }

  return router
}
