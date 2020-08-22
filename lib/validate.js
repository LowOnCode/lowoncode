var Ajv = require('ajv')

const validate = design => {
  const schema = require('./schemas/design.js')
  const ajv = new Ajv() // options can be passed, e.g. {allErrors: true}
  const validate = ajv.compile(schema)
  const valid = validate(design)
  if (!valid) {
    // console.log(validate.errors)
    throw validate
  }
  return validate.errors
}

module.exports = validate
