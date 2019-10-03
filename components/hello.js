module.exports = {
  id: 'hello',
  title: 'hello',
  version: '1.0.0',
  color: '#656D78',
  icon: 'dashboard',

  // New style?
  ports: [
    {
      direction: 'out',
      color: '#6BAD57',
      description: `string`
    },
    {
      direction: 'out',
      color: '#6BAD57',
      description: `string`
    },
    {
      direction: 'in',
      color: '#6BAD57',
      description: `request`
    }
  ],

  outputs: [
    {
      color: '#6BAD57',
      description: `string`
    },
    {
      color: '#6BAD57',
      description: `string`
    }
  ],
  inputs: [
    {
      color: '#6BAD57',
      description: `request`
    }
  ],
  // options: { // DEPRECATED use props
  //   enabled: true
  // },
  props: {
    enabled: { type: 'boolean', default: true }
  },
  install (instance) {
    instance.globalBus.emit('event')

    instance.on('data', (incoming) => {
      // Proxy and append data
      instance.send(0, {
        proxy: incoming,
        data: 'Hello'
      })
    })
  }
}
