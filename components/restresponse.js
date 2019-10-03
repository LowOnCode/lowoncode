/* eslint-disable no-tabs */

module.exports = {
  id: 'restresponse',
  title: 'HTTP Response',
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
  install: ({ tools, bus }) => {
    bus.on('data', (incoming) => {
      // console.log('Received', incoming)
    })
  }
}
