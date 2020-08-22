module.exports = {
  name: 'input',
  title: 'Input',
  description: `Use this component to add an input to your design`,
  version: '1.0.0',
  color: '#5D9CEC',
  inputs: [

  ],
  outputs: [
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
