module.exports = {
  name: 'output',
  title: 'output',
  readme: `Use this component to add an output to your design`,
  version: '1.0.0',
  color: '#5D9CEC',
  outputs: [],
  inputs: [
    {
      color: '#666D77',
      description: `ctx`
    }
  ],

  props: {
    name: { type: 'string', default: 'name' },
    type: { type: 'string', default: 'string' },
    color: { type: 'string', default: 'green' }
  },
  mounted: ({ send, options, variables }) => {
    send(0, variables[options.key])
  }
}
