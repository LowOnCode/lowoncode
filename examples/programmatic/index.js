const { loadAllFrom, Node } = require('../../index')

async function main () {
  // Load global components
  const components = await loadAllFrom(`${__dirname}/components`)

  console.log(components)

  // Create nodes
  const count1 = new Node({
    ...components.count,
    x: 50,
    y: 100
  })
  const log1 = new Node({
    ...components.log,
    label: '*** CUSTOM LOGGER ***',
    x: 300,
    y: 100
  })

  // Root node
  const app = new Node({
    components,
    name: 'app',
    children: [count1, log1]
  })
  // Start up node
  app.mount()

  // Add connection
  app.connect([count1, 'out1'], [log1, 'in1'])
  // console.log('Connections', app.$connections)

  // Listen to events
  count1.watch('out1', newValue => {
    console.log(`Output is ${newValue}`)
  })

  // Tap into app eventbus
  // const bus = app.getBus()
  // bus.onAny((event, value) => {
  //   console.log(event, value)
  // })

  // Test logger
  log1.set('in1', 'hello world')

  // Change setting
  log1.set('enabled', false)
  count1.set('in1', 10) // This message wont be logged
  log1.set('enabled', true)

  // Change input value
  count1.set('in1', 10)
  count1.set('in2', 30)

  // Get design
  // console.log(app.toJson())
  console.log(app.toString())
}

main()
