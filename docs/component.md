# Introduction
A component serves as a blueprint to create nodes.

# Creating your first component
To create a component best is to start with making a copy of the `hello` components below. Just place it in the folder called `/components`. If you run the instance in dev modus it will automaticly refresh and pick up your newly created component.

# Component in depth
See below a simple component. It consists of one `input` and one `output` and a `props` field which can be used to control the `options` that are availible in your code.

The magic happens what you specify in the lifecycle function `created` or `mounted`. There is a slight different between both function. As in the `created` you aren't able to `send` out messages as the other component aren't most likely not initialized. Therefor we suggest to use `mounted` lifecycle function to start coding.

The `mounted` function is being called with some `context` which you can use in your component. In the example below we destructure the `context` directly.

The `on` and `send` functions are at the heart of the system. With the `on` function you can listen to incoming messages. 
And with the `send` function you can send a `payload` to the connected components on a certain `port`.

```js
module.exports = {
  name: 'hello',
  description: `A very simple component`,
  version: '0.0.1',
  color: '#5D9CEC',
  icon: 'file-text-o',
  inputs: [
    {
      color: '#666D77',
      description: `object`,
      type: 'object'
    }
  ],
  outputs: [
    {
      color: '#666D77',
      description: `string`,
      type: 'string'
    }
  ],
  props: {
    enabled: { type: 'bool', default: true }
  },
  mounted: ({ send, on, options }) => {
    on('data:0', (incoming) => {
      if (options.enabled) {
        send(0, incoming)
      }
    })
  }
}
```

# Connections
The inputs and outputs define what data flows in or out the component. See below an example:
```js
[
   inputs: [
      {
        color: '#666D77',
        description: `object`,
        type: 'object'
        name: 'object',
      }
    ]
    outputs: [
      {
        color: '#666D77',
        description: `object`,
        type: 'object'
        name: 'object',
      }
    ]
]
```

> In the newer version all inputs & outputs can be merged like this:

```js
[
    connections: [
      {
        color: '#666D77',
        description: `object`,
        type: 'object'
        name: 'object',
        direction: 'in'
      }
    ]
]
```
Fields:

| key   |      type      |  description |
|----------|:-------------:|:------|
| color    |  String (optional) | Specify the color in the designer |
| description |    String (optional)   |   The description will be shown in the designer to hint the user |
| type |  String (optional) |    The type will handle type checking to |
| name |  Number / String (optional) |    Specify a unique name |


# Lifecycle
The following methods can be used to control a proper lifecycle:
- `created` ( called when component is created )
- `mounted` ( called when all components have been created )
- `beforeDestroy` ( called when a component has been removed )

# Context
All lifecycle methods are provided with a context. This context consist of some functions to interact with other nodes like :
- The `send` function to send data.
- The `bus` function to listen to events.
- The `options` object contains the data that has been set in the node (or the default values). 

**Note:** `send` can't be used in the `created` method as there is no receiving party yet and the send will go to the **void**.

Available events are:
- `data` will always trigger on incoming data.
- `data:<port>`, e.g. `data:2` is only triggered on incoming data on a certain port. 

# State

# Errors
To trigger an error use:
```js 
throw new Error("Ai big problem")
```

Example:
```js
mounted: ({ send, on, options }) => {
    on('data:0', (incoming) => {
        send(0, incoming)
    })
}
```

# Component resolving
The runtime will parse all top level files as components and sub directories containing a index.js as components.
Loading components can be done with:
```js
await runtime.addComponents(`${__dirname}/components`)
```
