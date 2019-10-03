/* eslint-disable no-tabs */

module.exports = {
  id: 'restproxy',
  title: 'Proxy',
  group: 'REST',
  color: '#6B9CE6',
  outputs: [
    {
      id: 0,
      color: '#6BAD57',
      description: `first output contains a __response__`
    },
    {
      id: 1,
      color: '#F6BB42',
      description: `second output contains received data`
    },
    {
      id: 2,
      color: '#666D77',
      description: `third output contains a average time of duration \`Number\``
    }
  ],
  author: 'Jelle',
  icon: 'globe',
  version: '1.0.1',
  cloning: false,
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
  readme: `This component creates a REST proxy between local endpoint and external API. Proxy supports dynamic arguments between URL addresses via \`{key}\` markup (keys must be same).`,
  install ({ log, state, send, tools, ...instance }) {
    // Instance state
    state = {
      beg: new Date(),
      durcount: 0,
      dursum: 0
    }
    // var durcount = 0
    // var dursum = 0

    //   instance.on('close', () => UNINSTALL('route', 'id:' + instance.id))

    const reconfigure = () => {
      var options = instance.options

      if (!options.url) {
        instance.status('Not configured', 'red')
        return
      }

      // console.log(options)
      // console.dir(instance.tools.http.router)
      const router = tools.http.router

      router.get(options.url, async (ctx, next) => {
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

    // instance.on('service', function () {
    //   state.dursum = 0
    //   state.durcount = 0
    // })

    // // Avg calculations
    // instance.custom.duration = function () {
    //   const avg = (state.dursum / state.durcount).floor(2)
    //   instance.status(`${avg} sec.`)
    //   send(2, avg)
    // }

    instance.on('options', reconfigure)
    reconfigure()
  }
}
