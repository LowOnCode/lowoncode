const stringTemplateParser = (expression, valueObj = {}) => {
  const templateMatcher = /{{\s?([^{}\s]*)\s?}}/g
  const text = expression.replace(templateMatcher, (substring, value, index) => {
    value = valueObj[value]
    return value
  })
  return text
}

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
    },
    out1: {
      output: true,
      color: '#666D77',
      description: `string`,
      type: 'string'
    }
  },

  mounted ({ $emit, watch, options }) {
    watch('in1', (message) => {
      console.log(message)

      const context = message
      const { template } = options
      // TODO: process template
      const parsed = stringTemplateParser(template, context.request)

      // Send
      // send(0, parsed)

      // TODO: come up with something to pass ctx
      // message.set(parsed)
      $emit('out1', parsed)
    })
  }
}
