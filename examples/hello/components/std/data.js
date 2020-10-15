const DUMMY = {
  hello: 'World'
}

module.exports = {
  name: 'data',
  title: 'data',
  outputs: [
    {
      name: 'out1',
      color: '#666D77',
      description: `ctx`
    }
  ],
  props: {
    name: { type: 'string', default: 'name' },
    type: { type: 'string', default: 'string' },
    color: { type: 'string', default: 'green' },
    data: { type: 'any', default: DUMMY }
  },
  mounted ({ $emit, state }) {
    $emit('out1', state.data)
  }
}
