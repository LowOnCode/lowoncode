/* eslint-disable no-tabs */

module.exports = {
  id: 'input',
  title: 'Input',
  version: '1.0.0',
  color: '#5D9CEC',
  icon: 'file-text-o',
  outputs: [],
  inputs: [
    {
      color: '#666D77',
      description: `ctx`
    }],
  options: {
    key: ''
  },
  readme: `This node passes a global variable`,
  created: ({ send, options, variables }) => {
    console.log('Hello from input')
    // bus.on('data', (incoming) => {
    //   console.log('DEBUG received:', incoming)
    // })
    send(0, variables[options.key])
  }
}