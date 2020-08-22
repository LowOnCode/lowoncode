/* eslint-disable no-tabs */

module.exports = {
  name: 'timeout',
  version: '1.0.0',
  color: '#5D9CEC',
  outputs: [
    {
      color: '#666D77',
      description: `any`
    }
  ],
  inputs: [
    {
      color: '#666D77',
      description: `any`
    }],
  options: {
    timeout: 1000
  },
  created: ({ on, send, options }) => {
    on('data', (incoming) => {
      const handle = () => {
        send(0, incoming)
      }
      setTimeout(handle, options.timeout || 1000)
    })
  }
}
