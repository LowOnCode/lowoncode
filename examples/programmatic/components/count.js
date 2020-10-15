module.exports = {
  description: `Count two inputs`,
  props: {
    in1: {
      type: 'number',
      default: 0,
      input: true
    },
    in2: {
      type: 'number',
      default: 0,
      input: true
    },
    out1: {
      type: 'number',
      output: true
    }
  },

  mounted ({ $emit, watch }) {
    const calc = () => {
      $emit('out1', this.in1 + this.in2)
    }

    watch('in1', calc)
    watch('in2', calc)
  }
}
