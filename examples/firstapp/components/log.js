module.exports = {
  description: `Log`,
  version: '0.0.1',

  props: {
    in1: {
      type: 'any',
      input: true
    },
    in2: {
      type: 'any',
      input: true
    },
    label: {
      type: 'string',
      default: '* LOG *',
      setting: true
    },
    enabled: {
      type: 'boolean',
      setting: true,
      default: true
    }
  },

  mounted ({ console, watch }) {
    // console.log(this)

    watch('in1', (...args) => {
      if (!this.enabled) {
        console.log(this.label, '<LOG IS DISABLED>')
        return
      }
      console.log(this.label, ...args)
    })

    watch('enabled', (value) => {
      console.log(this.label, value ? '<ON>' : '<OFF>')
    })
  }
}
