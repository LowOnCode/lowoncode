/* eslint-disable no-tabs */

const install = ({ tools, ...instance }) => {
  // console.log(instance)
  // proxy should be a ctx of koa < BAD CODE
  instance.localBus.on('data', (incoming) => {
    const { proxy, data } = incoming
    // console.log('Received', proxy)
    proxy.body = data
  })
}

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
      description: `String`
    }],
  options: {
    filename: '',
    append: true,
    delimiter: '\\n'
  },
  install
}
