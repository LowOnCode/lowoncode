module.exports = {
  name: 'template',
  description: `A very simple template parser`,
  version: '0.0.2',
  color: '#5D9CEC',
  icon: 'file-text-o',

  props: {
    in1: {
      type: 'any',
      input: true
    },
    template: {
      setting: true,
      type: 'string',
      default: '<h1>Hello {{request}}</h1>'
    }
    // out1: {
    //   output: true,
    //   color: '#666D77',
    //   description: `string`,
    //   type: 'string'
    // }
  },

  // TODO
  // emits: {
  //   out1: {
  //     color: '#666D77',
  //     description: `string`,
  //     type: 'string'
  //   }
  // },

  outputs: [
    {
      name: 'out1',
      color: '#666D77',
      description: `string`,
      type: 'string'
    }
  ],

  mounted ({ $emit, watch, state }) {
    const stringTemplateParser = (expression, valueObj = {}) => {
      const templateMatcher = /{{\s?([^{}\s]*)\s?}}/g
      const text = expression.replace(templateMatcher, (substring, value, index) => {
        value = valueObj[value]
        return value
      })
      return text
    }

    watch('in1', (message) => {
      console.log('Incoming message', Object.keys(message).length)

      // const context = message
      const parsed = stringTemplateParser(state.template, message)

      $emit('out1', parsed)
    })
  }
}
