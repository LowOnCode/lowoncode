module.exports = {
  name: 'httproute',
  title: 'HTTP Route',
  group: 'HTTP',
  version: '1.0.0',
  color: '#5D9CEC',
  icon: 'globe',
  options: {
    method: 'GET',
    url: '',
    size: 5,
    cacheexpire: '5 minutes',
    cachepolicy: 0,
    timeout: 5
  },

  // TODO dynamic refTemplates
  refTemplate: `{{method}} {{url}}`,

  props: {
    method: { type: 'enum', enum: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'], default: 'GET' },
    url: { type: 'string', default: '' },
    size: { type: 'number', default: 5 },
    cacheexpire: { type: 'number', default: '5 minutes' },
    cachepolicy: { type: 'number', default: 0 },
    timeout: { type: 'number', default: 5 }
  },
  outputs: [
    {
      color: '#6BAD57',
      description: `ctx`
    },
    {
      color: '#F6BB42',
      description: `body`
    }
  ],
  inputs: [],

  // ==========
  // Lifecycle hooks
  // ==========
  beforeDestroy ({ tools, ...instance }) {
    const router = tools.http.router

    // Clear route
    const name = `httproute-${instance.id}`
    var r = router.stack
    const index = r.findIndex(route => route.name === name)
    r.splice(index, 1)
  },

  created  ({ log, fetch, state, send, ...instance }) {
    const reconfigure = () => {
      var options = instance.options

      if (!options.url) {
        instance.status('Not configured', 'red')
        return
      }

      const router = instance.tools.http.router
      const { method = 'GET' } = options

      const handle = function (ctx, next) {
        // ctx.body = 'cool'
        send(0, ctx)
        send(1, ctx.body)
      }

      // console.log(methodToFn, method, options.url)
      const id = `httproute-${instance.id}`
      const { url } = options

      if (method === 'GET') router.get(id, url, handle)
      if (method === 'POST') router.post(id, url, handle)
      if (method === 'PATCH') router.patch(id, url, handle)
      if (method === 'DELETE') router.delete(id, url, handle)
      if (method === 'ALL') router.all(id, url, handle)
    }

    instance.on('options', reconfigure)
    reconfigure()
  }
}

// const reconfigure = () => {
//   var options = instance.options

//   if (!options.url) {
//     instance.status('Not configured', 'red')
//     return
//   }

//   // console.log(options)
//   // console.dir(instance.tools.http.router)
//   const router = tools.http.router

//   router.get(`restproxy-${instance.id}`, options.url, async (ctx, next) => {
//     state.beg = new Date()

//     const resp = await tools.fetch(options.target)
//       .then(res => res.text())

//     const duration = ((new Date() - state.beg) / 1000)
//     // console.log(duration)

//     state.durcount++
//     state.dursum += duration
//     // setTimeout2(instance.id, instance.custom.duration, 500, 10)

//     ctx.body = resp
//     // Output
//     send(0, ctx)
//     send(1, resp)
//     send(2, duration)
//   })
// }
