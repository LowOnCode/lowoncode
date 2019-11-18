/* eslint-disable no-tabs */

module.exports = {
  name: 'debug',
  title: 'Debug',
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
    filename: '',
    append: true,
    delimiter: '\\n'
  },
  readme: `This node logs the incoming message to the console`,
  created: ({ on, log }) => {
    on('data', (incoming) => {
      log('DEBUG received:', incoming)
    })
  }
}
