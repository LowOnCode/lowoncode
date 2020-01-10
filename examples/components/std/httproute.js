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
    timeout: { type: 'number', default: 2000, description: 'Time in seconds' }
  },

  outputs: [
    {
      color: '#6BAD57',
      description: `ctx`
    }
    // {
    //   color: '#F6BB42',
    //   description: `body`
    // }
  ],
  inputs: [],

  // ==========
  // Lifecycle hooks
  // ==========
  beforeDestroy ({ tools, ...instance }) {
    const { router } = tools

    // Clear route
    const name = `httproute-${instance.id}`
    var r = router.stack
    const index = r.findIndex(route => route.name === name)
    r.splice(index, 1)
  },

  created ({ tools, Message, send, id, options, setStatus }) {
    const { router } = tools

    // console.log(router)

    const reconfigure = () => {
      if (!options.url) {
        setStatus('Not configured', 'red')
        return
      }

      const { method = 'GET' } = options

      const handle = async (ctx, next) => {
        // Timeout
        // console.log(options.timeout)

        var promise1 = new Promise(function (resolve, reject) {
          setTimeout(resolve, options.timeout, 'one')
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
        const message = new Message()
        message.getContext = () => {
          return ctx
        }
        send(0, message)
        // send(0, ctx)
        // send(0, new Message(ctx))
        // send(1, ctx.body, ctx)

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
