module.exports = {
  name: 'label',
  description: `Label component`,
  inputs: [
    {
      color: '#666D77',
      description: `any`,
      type: 'any'
    }
  ],
  outputs: [
    {
      color: '#666D77',
      description: `any`,
      type: 'any'
    }
  ],
  props: {},

  mounted ({ send, sendToNodes, on, runtime, instance, id }) {
    // TODO

    // const VIRTUAL_PORT = 1

    // // Virtual port
    // on(`data:${VIRTUAL_PORT}`, (incoming) => {
    //   // Detect mode: broadcasting or listening
    //   // return

    //   // Proxy
    //   send(0, incoming)
    // })

    // on('data:0', (...messages) => {
    //   // Send to all other label with the same name
    //   const labelNodes = runtime.getAllNodesByComponent('label')

    //   const myName = instance.name

    //   const otherLabelNodes = labelNodes
    //   // same name
    //     .filter(elem => elem.name === myName)
    //   // Remove me
    //     .filter(elem => elem.id !== id)

    //   // console.log(otherLabelNodes)

    //   sendToNodes([otherLabelNodes, VIRTUAL_PORT], ...messages)
    // })
  }
}
