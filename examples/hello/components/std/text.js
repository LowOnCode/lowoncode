module.exports = {
  name: 'text',
  outputs: [
    {
      name: 'out1',
      color: '#666D77',
      description: `any`,
      type: 'any'
    }
  ],
  props: {
    text: {
      default: 'Some text'
    }
  },

  mounted ({ watch, state, console, $emit }) {
    console.log(`initial send: ${state.text}`)
    // $emit('out1', this.text)

    setTimeout(() => {
      $emit('out1', state.text)
    }, 500)

    // watch('text', newValue => {
    //   $emit('out1', this.text)
    // })
  }
}
