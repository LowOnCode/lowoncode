module.exports = {
  title: 'HTTP Response',
  version: '1.0.2',
  color: '#5D9CEC',

  props: {
    in1: {
      type: 'string',
      input: true
    }
  },

  // outputs: [],
  // inputs: [
  //   {
  //     color: '#666D77',
  //     description: `ctx`,
  //     type: `ctx`
  //   }],

  mounted ({ on }) {
    // on('data:0', async (message) => {
    //   // Validation
    //   if (!message.getContext) {
    //     // Message to the void (IMPROVE)
    //     return false
    //   }

    //   const ctx = message.getContext()
    //   ctx.body = message.value
    //   ctx.next()
    // })
  }
}
