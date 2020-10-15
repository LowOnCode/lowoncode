module.exports = {
  name: 'http:route',
  title: 'HTTP Route',
  group: 'HTTP',
  version: '1.0.1',
  color: '#5D9CEC',
  icon: 'globe',
  refTemplate: `{{method}} {{url}}`,

  props: {
    method: { type: 'enum', enum: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'], default: 'GET' },
    url: { type: 'string', default: '/' },
    timeout: { type: 'number', default: 2000, description: 'Time in seconds' },
    verbose: { type: 'boolean', default: true },
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

  mounted ({ on, state, console, setTimeout, $emit }) {
    on('request', (req, res, next) => {
      if (state.verbose) {
        console.log('request', req.url)
        // console.log('match', state.url)
      }

      var url = req.url
      if (url === state.url) {
        // res.writeHead(200, { 'Content-Type': 'text/html' })
        // res.write('<h1>about us page<h1>') // write a response
        // res.end() // end the response

        const duration = 3000
        setTimeout(() => {
          // Check status?
          if (res.headersSent) {
            console.log('Headers already send')
            return
          }

          res.writeHead(408, { 'Content-Type': 'text/html' })
          res.write(`timeout / exceeded ${duration} ms`)
          res.end()
        }, duration)

        const ctx = { req, res, next }
        if (state.verbose) {
          console.log(`match: '${req.url}' === '${state.url}'`)
        }

        $emit('out1', ctx)
      } else {
        if (state.verbose) {
          console.log(`no match: '${req.url}' !== '${state.url}'`)
        }
        // Not for this node
        // next()
      }
    })
  }
}
