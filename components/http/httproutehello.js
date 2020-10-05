// const router =

const { on } = require('commander')

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
      color: '#6BAD57',
      description: `ctx`
    }
  ],
  inputs: [

  ],

  beforeDestroy ({ tools, ...instance }) {
    const { router } = tools

    // Clear route
    const name = `httproute-${instance.id}`
    var r = router.stack
    const index = r.findIndex(route => route.name === name)
    r.splice(index, 1)
  },

  mounted ({ on }) {
    console.log('httproute created!')

    on('request', (req, res) => {
      console.log('request')

      var url = req.url
      // if (url === '/') {
      res.writeHead(200, { 'Content-Type': 'text/html' }) // http header
      res.write('<h1>about us page<h1>') // write a response
      res.end() // end the response
      // }

      // if (url === '/about') {
      //   res.write('<h1>about us page<h1>') // write a response
      //   res.end() // end the response
      // } else if (url === '/contact') {
      //   res.write('<h1>contact us page<h1>') // write a response
      //   res.end() // end the response
      // } else {
      //   res.write('<h1>Hello World!<h1>') // write a response
      //   res.end() // end the response
      // }
    })
  }
}
