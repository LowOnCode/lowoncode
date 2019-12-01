module.exports = {
  name: 'corerestart',
  title: 'corerestart',
  description: `Will reboot the 'targetRuntime' design`,
  version: '1.0.0',
  color: '#656D78',
  inputs: [
    {
      color: '#6BAD57',
      description: `any`
    }
  ],
  outputs: [
    {
      color: '#6BAD57',
      description: `done`
    }
  ],
  mounted ({ on, options, variables, log }) {
    on('data', async (ctx) => {
      const runtime = variables[options.key || 'targetRuntime']

      console.log('REBOOT')
      await runtime.reboot()

      // Finish http chain
      ctx.body = {
        message: 'rebooted'
      }
    })
  }
}
