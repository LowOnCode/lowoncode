module.exports = {
  name: 'std',
  version: '0.0.1',
  description: 'Basic components',
  components: [
    require('./data'),
    require('./log'),
    require('./map'),
    require('./input'),
    require('./label'),
    require('./output'),
    require('./template'),
    require('./timeout'),
    require('./interval'),
    require('./variable'),
    require('./text')
  ]
}
