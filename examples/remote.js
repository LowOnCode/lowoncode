const loc = require('../index')
const fetch = require('node-fetch')

process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0

const DESIGN = process.env.DESIGN

async function main () {
  // Create a runtime instance
  const runtime = loc.createRuntime()

  // Load components
  await runtime.loadComponents(`${__dirname}/../components`)

  // Start monitor on our design
  await loc.start(runtime)

  // Load design file
  const design = await fetch(DESIGN).then(res => res.json())

  // Start the engine
  await runtime.run(design)
}

main()
