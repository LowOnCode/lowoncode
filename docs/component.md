# Introduction
A component serves as a blueprint to create nodes.

# Creating your first component
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



# Inputs & Outputs
Inputs and outputs define what data flows in or out the component.
```js
[
    {
        color: '#666D77',
        description: `object`,
        type: 'object'
        id: '0'
    }
]
```
Fields:

| key   |      type      |  description |
|----------|:-------------:|:------|
| color    |  String (optional) | specify the color in the designer |
| description |    String (optional)   |   The description will be shown in the designer to hint the user |
| type |  String (optional) |    The type will handle type checking to |
| id |  Number / String (optional) |    Specify a unique id (not tested yet, please use the array index) |


# Lifecycle
The following methods can be used to control a proper lifecycle:
- `created` ( called when component is created )
- `mounted` ( called when all components have been created )
- `beforeDestroy` ( called when a component has been removed )

# Context
The functions are provided with some handy context helpers:
- The `send` function to send data.
- The `bus` function to listen to events.
- The `options` object contains the data that has been set in the node (or the default values). 

**Note:** `send` can't be used in the `created` method as there is no receiving party yet and the send will go to the **void**.

Available events are:
- `data` will be always trigger on incoming data.
- `data:<port>` is only triggered on incoming data on a certain port

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
