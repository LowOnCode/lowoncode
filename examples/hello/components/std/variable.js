module.exports = {
  name: 'variable',
  title: 'variable',
  version: '1.0.0',
  color: '#5D9CEC',
  outputs: [
    {
      name: 0,
      color: '#666D77',
      description: `ctx`
    }
  ],
  props: {
    key: {
      type: 'string',
      hint: 'A key like `api`',
      default: ''
    }
  },
  description: `Use a global variable`,
  mounted ({ $emit, state, variables }) {
    $emit(0, variables[state.key])
  }
}
