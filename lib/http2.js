// ===========
// Handle http
// ===========
// New Koa Object
const Koa = require('koa')
const app = new Koa()

// Use a router for each design
const createRouter = require('koa-router')
const { prefix } = this
const router = createRouter({
  prefix // or '/api'
})

// Expose router for components to use
// TODO not clear code
this.tools.router = router
this.tools.app = app // Used by api, TO DEPRECATE ?

// Bind router to koa singleton
// const { app } = this.tools.http
app.use(router.routes())
app.use(router.allowedMethods())

// Connect server
const { server, port } = this
// const port = 5000 // TODO
console.log(`* router created at http://localhost:${port}${prefix}`)
