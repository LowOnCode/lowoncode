const { Node } = require('../../index')

const hello = new Node(require('./components/count'), { enabled: true })

// # Logging
// Set logging stream
// hello.logger(console.log)

// # Listen to events
hello.watch('out1', newValue => {
  console.log(`Output is ${newValue}`)
})

// Start up node
hello.mount()

// # Inputs
// Setting port values
hello.set('in1', 10)
hello.set('in2', 20)
hello.set('in2', 30)

// Setting non-existing port
// hello.set('in3', 30)

// Setting not valid type
// hello.set('in2', '30')
