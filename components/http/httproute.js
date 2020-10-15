module.exports = {
  name: 'httproute',
  title: 'HTTP Route',
  group: 'HTTP',
  version: '1.0.1',
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
    timeout: { type: 'number', default: 2000, description: 'Time in seconds' },

    request: {
      hidden: true
    }
  },

  outputs: [
    {
      name: 'out1',
      color: '#6BAD57',
      description: `ctx`,
      output: true
    }
  ],

  beforeDestroy ({ tools, ...instance }) {
    const { router } = tools

    // Clear route
    const name = `httproute-${instance.id}`
    var r = router.stack
    const index = r.findIndex(route => route.name === name)
    r.splice(index, 1)
  },

  mounted ({ on, setTimeout, $emit }) {
    console.log('httproute created!')

    on('request', (req, res) => {
      // console.log('request', req, res)

      var url = req.url
      if (url === '/test') {
        res.writeHead(200, { 'Content-Type': 'text/html' })
        res.write('<h1>about us page<h1>') // write a response
        res.end() // end the response
      }

      // Timeouts
      setTimeout(() => {
        res.writeHead(408, { 'Content-Type': 'text/html' })
        res.write('timeout / not found')
        res.end()
      }, 1000)

      if (url === '/') {
        // res.writeHead(200, { 'Content-Type': 'text/html' })
        // res.write('<h1>about us page<h1>') // write a response
        // res.end() // end the response
        console.log('Sending')

        // Tell parent
        $emit('out1', 'payload')
        // $emit('out1', req, res)
        // $emit(0, req, res)
      }
    })
  }
}
