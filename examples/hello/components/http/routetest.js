module.exports = {
  name: 'http:routetest',
  props: {
    method: { type: 'enum', enum: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'], default: 'GET' },
    url: { type: 'string', default: '/' },
    timeout: { type: 'number', default: 2000, description: 'Time in seconds' },
    request: {
      hidden: true
    }
  },

  outputs: [
    {
      name: 'out1',
      color: '#6BAD57',
      description: `match`,
      output: true
    },
    {
      name: 'out2',
      color: '#6BAD57',
      description: `no match`,
      output: true
    }
  ],

  mounted ({ on, state, console, $emit }) {
    on('request', (req, res, next) => {
      // console.log('request', req, res)
      console.log('request', req.url)
      // console.log('Node prop', state.url)

      const url = req.url
      if (url === state.url) {
        res.writeHead(200, { 'Content-Type': 'text/html' })
        res.write('<h1>Hello World</h1>') // write a response
        res.write(`<p>${new Date()}</p>`) // write a response
        res.end() // end the response

        $emit('out1', req, res)
      } else {
        // console.log('No match', url, state.url)
        $emit('out2', req, res)

        // Proceed
        // next()
      }
    })
  }
}
