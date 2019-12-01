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

  created  ({ log, fetch, state, tools, send, id, options, ...instance }) {
    const reconfigure = () => {
      if (!options.url) {
        instance.status('Not configured', 'red')
        return
      }

      const router = tools.http.router
      const { method = 'GET' } = options

      const handle = async (ctx, next) => {
        // Timeout
        var promise1 = new Promise(function (resolve, reject) {
          setTimeout(resolve, 5000, 'one')
        })

        // Try node chain
        var promise2 = new Promise(function (resolve, reject) {
          // Bind next to ctx for easy access
          ctx.next = () => {
            ctx.body = ctx.body || 'ai no response'
            resolve(ctx.body)
          }
        })

        // Send to nodechain
        send(0, ctx)
        send(1, ctx.body, ctx)

        // Wait on timeout or get response from the node chain
        await Promise.race([promise1, promise2]).then(function (value) {
          // console.log(value)
        })
      }

      const _id = `httproute-${id}`
      const { url } = options

      if (method === 'GET') router.get(_id, url, handle)
      if (method === 'POST') router.post(_id, url, handle)
      if (method === 'PATCH') router.patch(_id, url, handle)
      if (method === 'DELETE') router.delete(_id, url, handle)
      if (method === 'ALL') router.all(_id, url, handle)
    }

    // instance.on('options', reconfigure)
    reconfigure()
  }
}
