const loc = require('../index') // require('@lowoncode/runtime')
const axios = require('axios')

process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0

const DESIGN_ID = process.env.DESIGN_ID || '5d98e3a19a33d6001711aaec' // < Remove defaults
const DESIGN_SECRET = process.env.DESIGN_SECRET || 'supersecret'
const designUrl = `http://localhost:1337/designs/${DESIGN_ID}/${DESIGN_SECRET}`

if (!DESIGN_ID) {
  throw new Error('Please set the DESIGN env!')
}

// NODE's Future : Give up on unhandledRejection
// process.on('unhandledRejection', up => { throw up })

async function main () {
  // Create a runtime instance
  const runtime = loc.createRuntime()

  // Load core components
  await runtime.loadComponents(`${__dirname}/../components`)

  // Load design file
  console.log(`Fetching design from : ${designUrl}`)
  const design = await axios.get(designUrl).then(resp => resp.data)
  console.log(`...done. Design contains ${design.nodes.length} nodes`)

  // Start the engine
  await runtime.run(design)

  // (Optional) Start monitor on our design
  await loc.start(runtime)
}

main()
