/* eslint-disable no-tabs */
const fetch = require('node-fetch')

module.exports = {
  name: 'restproxy',
  title: 'Proxy',
  group: 'REST',
  color: '#6B9CE6',
  input: 0,
  //   output: ['#6BAD57', '#F6BB42', '#666D77'],
  outputs: [
    {
      name: 0,
      color: '#6BAD57',
      description: `first output contains a __response__ - disabling this output will cause automatic response with code "503 service unavailable"`
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
  readme: `# REST: Proxy

  This component creates a REST proxy between local endpoint and external API. Proxy supports dynamic arguments between URL addresses via \`{key}\` markup (keys must be same).
  
  __Outputs__:
  
  - first output contains a __response__
  - second output contains received data
  - third output contains a average time of duration \`Number\``,
  html: `TODO`,
  install ({ log, state, send, ...instance }) {
    // Instance state
    state = {
      beg: new Date(),
      durcount: 0,
      dursum: 0
    }
    // var durcount = 0
    // var dursum = 0

    //   instance.on('close', () => UNINSTALL('route', 'name:' + instance.id))

    instance.reconfigure = function () {
      var options = instance.options

      if (!options.url) {
        instance.status('Not configured', 'red')
        return
      }

      // console.log(options)
      // console.dir(instance.tools.http.router)
      const router = instance.tools.http.router

      router.get(options.url, async (ctx, next) => {
        state.beg = new Date()

        const resp = await fetch(options.target)
          .then(res => res.text())

        console.log(((new Date() - state.beg) / 1000))

        state.durcount++
        state.dursum += ((new Date() - state.beg) / 1000)
        // setTimeout2(instance.id, instance.custom.duration, 500, 10)

        ctx.body = resp
        // send(0, resp)
      })
    }

    instance.on('service', function () {
      state.dursum = 0
      state.durcount = 0
    })

    // Avg calculations
    instance.custom.duration = function () {
      const avg = (state.dursum / state.durcount).floor(2)
      instance.status(`${avg} sec.`)
      send(2, avg)
    }

    instance.on('options', instance.reconfigure)
    instance.reconfigure()
  }
}
