const loc = require('../index')

async function main () {
  const runtime = loc.createRuntime()

  // Load my custom nodes
  await runtime.loadComponents(`${__dirname}/../components`)

  // Start monitor on our design runtime
  await loc.start(runtime)

  // Load design file
  const design = await runtime.load(`${__dirname}/hello/latest.json`)
  await runtime.run(design)
  // await runtime.loadAndRun('./design.json')

  // TEST - Do request
  const { tools } = runtime
  const { fetch } = tools
  const resp = await fetch(`http://localhost:${process.env.PORT}/hello`)
  console.log('Response:', await resp.text())
}

main()
