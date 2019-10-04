module.exports = {
  id: 'coreapplydesign',
  title: 'core-apply-design',
  version: '1.0.0',
  color: '#656D78',
  inputs: [
    // {
    //   color: '#6BAD57',
    //   description: `targetRuntime`
    // },
    {
      color: '#6BAD57',
      description: `Request`
    }
  ],
  outputs: [

  ],
  options: {
    key: ''
  },
  description: `Swaps received design`,

  mounted ({ localBus, send, options, variables, log }) {
    localBus.on('data', async (ctx) => {
      const runtime = variables[options.key || 'targetRuntime']

      // console.log(ctx.request.body)
      // console.log(runtime.hotswapcounter)
      log('Hotswapping new design')
      await runtime.run(ctx.request.body)

      // Finish http chain
      ctx.body = {
        ...runtime
      }
    })
  }
}
