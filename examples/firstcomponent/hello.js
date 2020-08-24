module.exports = {
  name: 'hello',
  description: `A very simple component`,
  version: '0.0.1',
  color: '#5D9CEC',

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

  // Called when component is being destroyed
  beforeDestroy ({ console }) {
    console.log('bye')
  },

  // Called when component is created
  mounted: ({ setTimeout, console, send, watch, options }) => {
    console.log('Hello created')

    setTimeout(() => {
      console.log('Interval done')
    },
    2000)

    watch('enabled', (newValue) => {
      console.log('Enabled changed to', newValue)
    })

    watch(0, (newValue) => {
      console.log('Port 0 received', newValue)
    })

    watch('data:0', (incoming) => {
      console.log('data:0', incoming)
    })

    watch(0, (incoming) => {
      // send(0, incoming)
      console.log('data:0', incoming)
    })
  }
}
