module.exports = {
  name: 'httpresponse',
  title: 'HTTP Response',
  version: '1.0.0',
  color: '#5D9CEC',
  icon: 'file-text-o',
  outputs: [],
  inputs: [
    {
      color: '#666D77',
      description: `ctx`,
      type: `ctx`
    }],
  created ({ tools, bus }) {
    bus.on('data', (incoming) => {
      const isCtx = mixed => (mixed.app && mixed.request)

      if (isCtx(incoming)) {
        incoming.body = incoming.body ? incoming.body : 'cool'
      }
    })
  }
}
