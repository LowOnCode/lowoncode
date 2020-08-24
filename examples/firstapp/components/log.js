module.exports = {
  description: `Log`,
  version: '0.0.1',

  props: {
    in1: {
      type: 'any'
    }
  },

  mounted ({ console, watch }) {
    watch('in1', (...args) => {
      console.log('*** CUSTOM LOGGER ***', ...args)
    })
  }
}
