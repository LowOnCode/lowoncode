// Start two designs on different prefix /api/v1 and /api/v2

const lowoncode = require('@lowoncode/runtime')

// Load two design
const designv1 = require('./v1.json')
const designv2 = require('./v2.json')

const runtime1 = lowoncode.start(designv1, {
  prefix: '/app1',
  componentDirectory: `${process.cwd()}/../components`,
  monitor: true,
  apiKey: '123'
})

const runtime2 = lowoncode.start(designv2, {
  prefix: '/app2',
  componentDirectory: `${process.cwd()}/../components`,
  monitor: true
  // apiKey: '111'
  // TODO Note at the moment only 1 ws can be used
})
