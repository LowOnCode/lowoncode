module.exports = {
  name: 'timeout',
  // inputs: [
  //   {
  //     name: 'in1',
  //     color: '#666D77',
  //     description: `any`
  //   }
  // ],
  props: {
    in1: {
      input: true,
      name: 'in1',
      color: '#666D77',
      description: `any`
    },
    duration: {
      setting: true,
      default: 1000
    }
  },

  outputs: [
    {
      name: 'out1',
      color: '#666D77',
      description: `any`
    }
  ],

  mounted ({ watch, setTimeout, state, console, $emit }) {
    watch('in1', (incoming) => {
      console.log(`Start timeout of ${state.duration}`)

      const handle = () => {
        console.log(` timeout finished`)

        $emit('out1', incoming)
      }
      setTimeout(handle, state.duration || 1000)
    })
  }
}
