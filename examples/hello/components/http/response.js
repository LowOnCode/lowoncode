module.exports = {
  name: 'http:response',
  title: 'HTTP Response',
  version: '1.0.2',
  color: '#5D9CEC',

  props: {
    // in1: {
    //   type: 'any',
    //   input: true
    // }
  },

  // outputs: [],
  inputs: [
    {
      name: 'in1',
      color: '#666D77',
      description: `ctx`
    },
    {
      name: 'body',
      color: '#666D77',
      default: '<h1>No body<h1>'
    }
  ],

  mounted ({ watch, state, console }) {
    watch('body', newValue => {
      console.log(newValue)
    })

    watch('in1', (ctx) => {
      console.log('http:response', state.body)

      const { res } = ctx

      if (!res) {
        console.log('res not found')
        return
      }

      if (res.headersSent) {
        console.log('Headers already send')
        return
      }

      // Serve a page
      // res.writeHead(200, { 'Content-Type': 'text/html' })
      // res.write('<h1>Hello World<h1>') // write a response
      // res.write(ctx.body || '<h1>No body<h1>') // write a response
      // res.end() // end the response
      res.send(ctx.body || state.body || '<h1>No body<h1>')

      // console.log('http:response send')
    })
  }
}
