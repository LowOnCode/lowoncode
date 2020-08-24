module.exports = {
  description: `Count two inputs`,
  version: '0.0.1',

  props: {
    in1: {
      type: 'number',
      default: 0
    },
    in2: {
      type: 'number',
      default: 0
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
