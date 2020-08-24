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
    },
    enabled: {
      type: 'number',
      setting: true
    }
  },

  mounted ({ $emit, watch, get }) {
    $emit('out1', 0)

    const calc = () => {
      $emit('out1', this.in1 + this.in2)
      // $emit('out1', get('in1') + get('in2'))
    }

    watch('in1', calc)
    watch('in2', calc)
  }
}
