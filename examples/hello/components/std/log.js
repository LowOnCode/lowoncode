module.exports = {
  name: 'log',
  outputs: [],
  props: {
    name: { type: 'String', default: 'logger1' },
    enabled: { type: 'Boolean', default: true },
    showMessage: { type: 'Boolean', default: false }
    // in1: {
    //   // name: 'in1',
    //   description: `Anything`,
    //   type: 'any'
    // }
  },

  inputs: [
    {
      name: 'in1',
      description: `Anything`,
      type: 'any'
    }
  ],

  mounted ({ state, watch, console }) {
    // const circularReplacer = () => {
    //   const seen = new WeakSet()
    //   return (key, value) => {
    //     if (typeof value === 'object' && value !== null) {
    //       if (seen.has(value)) {
    //         return '[Circular]'
    //       }
    //       seen.add(value)
    //     }
    //     return value
    //   }
    // }

    watch('in1', (incoming) => {
      if (state.enabled) {
        // console.log(`[${state.name}] received something`)
        console.log(`[${state.name}] received:`, state.showMessage ? incoming.toString() : '???')
      }
    })
  }
}
