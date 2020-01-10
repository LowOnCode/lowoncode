module.exports = {
  name: 'variable',
  title: 'variable',
  version: '1.0.0',
  color: '#5D9CEC',
  outputs: [],
  inputs: [
    {
      color: '#666D77',
      description: `ctx`
    }],
  options: {
    key: ''
  },
  readme: `With this component you can use a global variable`,
  mounted: ({ send, options, variables }) => {
    send(0, variables[options.key])
  }
}
