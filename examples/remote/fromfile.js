const loc = require('../index')

async function main () {
  const runtime = loc.createRuntime()

  // Load my custom nodes
  await runtime.loadComponents(`${__dirname}/../components`)

  // Load design file
  const design = await runtime.load(`${__dirname}/hello/latest.json`)
  await runtime.run(design)
  // await runtime.loadAndRun('./design.json')

  // (Optional) Start monitor on our design
  await loc.start(runtime)
}

main()
