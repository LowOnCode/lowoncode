const loc = require('../../index')
const component = require('./hello')

const hello = loc.node(component, { enabled: true })

// Log
console.log(hello)

// Start up node
hello.mount()

// # Logging
// Set logging stream
hello.logger(console.log)
console.log('*** Log on')

// Use logger
hello.log('Hello')

// Disable logging
hello.logger()
console.log('*** Log off')

// # Inputs
// Use inputs by port index
hello.set(0, 'payload')
hello.set(0, { hello: 'world' })

// Call non-existing port
hello.set(1, { hello: 'world' })

// # Change props
hello.set('enabled', true)
hello.set('enabled', false)

// Log to console
hello.logger(console.log)

// Kill component early (killing internal setTimeout or setInterval)
hello.destroy()
