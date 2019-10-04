const loc = require('../index') // require('@lowoncode/runtime')
const fetch = require('node-fetch')

process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0

const DESIGN = process.env.DESIGN

if (!DESIGN) {
  throw new Error('Please set the DESIGN env!')
}

async function main () {
  // Create a runtime instance
  const runtime = loc.createRuntime()

  // Load components
  await runtime.loadComponents(`${__dirname}/components`)

  // Load design file
  const design = await fetch(DESIGN).then(res => res.json())

  // Start the engine
  await runtime.run(design)

  // (Optional) Start monitor on our design
  await loc.start(runtime)
}

main()
