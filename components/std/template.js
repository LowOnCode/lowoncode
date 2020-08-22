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
  options: {
    template: '<h1>Hello {{url}}</h1>'
  },
  props: {
    template: { type: 'string', default: '<h1>Hello {{request}}</h1>' }
  },
  mounted: ({ send, on, options }) => {
    on('data', (message) => {
      // console.log(message)
      // console.log(options)

      const context = message
      const { template } = options
      // TODO: process template
      const parsed = stringTemplateParser(template, context.request)

      // Send
      // send(0, parsed)

      // TODO: come up with something to pass ctx
      message.set(parsed)
      send(0, message)
    })
  }
}
