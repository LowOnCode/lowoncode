/* eslint-disable no-tabs */

const install = ({ log, fetch, state, send, ...instance }) => {
  // Instance state
  state = {
    beg: new Date(),
    durcount: 0,
    dursum: 0
  }
  // var durcount = 0
  // var dursum = 0

  //   instance.on('close', () => UNINSTALL('route', 'name:' + instance.id))

  const reconfigure = () => {
    var options = instance.options

    if (!options.url) {
      instance.status('Not configured', 'red')
      return
    }

    const router = instance.tools.http.router
    const { method = 'GET' } = options

    const handle = function (ctx, next) {
      //   ctx.body = ctx
      send(0, ctx)
    }

    // console.log(methodToFn, method, options.url)
    if (method === 'GET') router.get(options.url, handle)
    if (method === 'POST') router.post(options.url, handle)
    if (method === 'PATCH') router.patch(options.url, handle)
    if (method === 'DELETE') router.delete(options.url, handle)
    if (method === 'ALL') router.all(options.url, handle)
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

module.exports = {
  name: 'httproute',
  title: 'HTTP Route',
  group: 'HTTP',
  version: '1.0.0',
  color: '#5D9CEC',
  icon: 'globe',
  input: true,
  output: 1,
  options: {
    method: 'GET',
    url: '',
    size: 5,
    cacheexpire: '5 minutes',
    cachepolicy: 0,
    timeout: 5
  },

  // TODO dynamic refTemplates
  refTemplate: (props) => `${props.method} ${props.url}`,

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
      description: `raw data`
    },
    {
      color: '#F6BB42',
      description: `cached data`
    }
  ],
  inputs: [],

  // ==========
  // Lifecycle hooks
  // ==========
  install,
  beforeDestroy () {
    console.log('destroy')
  }
}
