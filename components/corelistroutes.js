module.exports = {
  id: 'corelistroutes',
  version: '1.0.0',
  color: '#656D78',
  inputs: [
    {
      color: '#6BAD57',
      description: `Request`
    }
  ],
  outputs: [

  ],
  mounted ({ localBus }) {
    localBus.on('data', async (ctx) => {
      ctx.body = ctx.router.stack.map(i => `${i.methods} ${i.path}`)
    })
  }
}
