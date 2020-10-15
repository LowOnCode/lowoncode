module.exports = {
  name: 'map',
  outputs: [
    {
      name: 'out1',
      color: '#666D77',
      description: `any`
    }
  ],
  inputs: [
    {
      name: 'in1',
      color: '#666D77',
      description: `any`
    }
  ],
  mounted ({ on, $emit }) {
    on('in1', (incoming) => {
      // TODO
      $emit('out1', incoming)
    })
  }
}
