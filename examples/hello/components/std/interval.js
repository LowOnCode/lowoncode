module.exports = {
  name: 'interval',

  props: {
    in1: {
      input: true,
      name: 'in1',
      color: '#666D77',
      description: `any`
    },
    duration: {
      setting: true,
      default: 3000
    }
  },

  outputs: [
    {
      name: 'out1',
      color: '#666D77',
      description: `any`
    }
  ],

  mounted ({ setInterval, state, $emit }) {
    // console.log('Enabled')

    const handle = () => {
      // console.log('trigger', new Date())
      $emit('out1')
    }

    // Immediate ?
    handle()
    // Interval
    setInterval(handle, state.duration || 1000)
  }
}
