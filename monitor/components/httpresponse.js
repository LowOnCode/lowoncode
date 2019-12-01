const isCtx = mixed => (mixed.app && mixed.request)

module.exports = {
  name: 'httpresponse',
  title: 'HTTP Response',
  version: '1.0.1',
  color: '#5D9CEC',
  icon: 'file-text-o',
  outputs: [],
  inputs: [
    {
      color: '#666D77',
      description: `ctx`,
      type: `ctx`
    }],
  created ({ on }) {
    on('data', (mixed, ctx) => {
      if (isCtx(mixed)) {
        mixed.body = mixed.body ? mixed.body : 'missing body'
        // ctx.next()
        return
      }
      // console.log('httpresponse', mixed)
      // // console.log(mixed)
      // // console.log(ctx)
      // // ctx.body = 'cool'

      ctx.body = mixed
      ctx.next()
    })
  }
}
