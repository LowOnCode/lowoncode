/* eslint-disable no-tabs */

module.exports = {
  name: 'http:proxy',
  title: 'Proxy',
  color: '#6B9CE6',
  outputs: [
    {
      name: 0,
      color: '#6BAD57',
      description: `first output contains a __response__`
    },
    {
      name: 1,
      color: '#F6BB42',
      description: `second output contains received data`
    },
    {
      name: 2,
      color: '#666D77',
      description: `third output contains a average time of duration \`Number\``
    }
  ],
  author: 'Jelle',

  options: {
    method: 'GET',
    url: '',
    target: '',
    headersreq: true,
    headersres: false,
    nodns: false,
    auth: false,
    middleware: [],
    length: 5,
    respond: false,
    timeout: 5,
    cacheexpire: '5 minutes',
    cachepolicy: 0,
    duration: false
  },

  description: `This component creates a REST proxy between local endpoint and external API.`,

  // ==========
  // Lifecycle hooks
  // ==========
  beforeDestroy ({ tools, ...instance }) {
    const router = tools.http.router

    // Clear route
    const name = `restproxy-${instance.id}`
    var r = router.stack
    const index = r.findIndex(route => route.name === name)
    r.splice(index, 1)
  },

  mounted ({ log, state, send, tools, ...instance }) {
    // Instance state
    state = {
      beg: new Date(),
      durcount: 0,
      dursum: 0
    }

    const reconfigure = () => {
      var options = instance.options

      if (!options.url) {
        instance.status('Not configured', 'red')
        return
      }

      // console.log(options)
      const { router } = tools
      router.get(`restproxy-${instance.id}`, options.url, async (ctx, next) => {
        state.beg = new Date()

        const resp = await tools.fetch(options.target)
          .then(res => res.text())

        const duration = ((new Date() - state.beg) / 1000)
        // console.log(duration)

        state.durcount++
        state.dursum += duration
        // setTimeout2(instance.id, instance.custom.duration, 500, 10)

        ctx.body = resp
        // Output
        send(0, ctx)
        send(1, resp)
        send(2, duration)
      })
    }

    // instance.on('options', reconfigure)
    reconfigure()
  }
}
