module.exports = {
  name: 'hello',
  description: `A very simple component`,
  version: '0.0.1',
  color: '#5D9CEC',
  icon: 'file-text-o',
  inputs: [
    {
      color: '#666D77',
      description: `object`,
      type: 'object'
    }
  ],
  outputs: [
    {
      color: '#666D77',
      description: `string`,
      type: 'string'
    }
  ],
  props: {
    enabled: { type: 'bool', default: true }
  },
  mounted: ({ send, on, options }) => {
    on('data:0', (incoming) => {
      if (options.enabled) {
        send(0, incoming)
      }
    })
  }
}
