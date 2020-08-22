const loc = require('../../index')
const component = require('./hello')

const hello = loc.node(component, { enabled: true })

console.log(hello)
// Start up node
hello.mount()

// Set logging stream
hello.logger(console.log)
hello.logger()

// Use inputs by port index
hello.set(0, 'payload')
hello.set(0, { hello: 'world' })

// Call non-existing port
hello.set(1, { hello: 'world' })

hello.set('enabled', true)
hello.set('enabled', false)

// Kill component early (killing internal setTimeout or setInterval)
hello.destroy()
