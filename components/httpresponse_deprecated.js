module.exports = {
  name: 'httpresponse_deprecated',
  title: 'HTTP Response (deprecated)',
  version: '1.0.0',
  color: '#5D9CEC',
  icon: 'file-text-o',
  outputs: [],
  inputs: [
    {
      color: '#666D77',
      description: `String`
    }],
  options: {
    filename: '',
    append: true,
    delimiter: '\\n'
  },
  created ({ tools, on }) {
    // console.log(instance)
    // proxy should be a ctx of koa < BAD CODE
    on('data', (incoming) => {
      const { proxy, data } = incoming
      // console.log('Received', proxy)
      proxy.body = data
    })
  }
}
