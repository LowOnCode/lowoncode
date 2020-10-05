module.exports = {
  name: 'std',
  version: '0.0.1',
  description: 'Basic components',
  components: [
    require('./debug'),
    require('./design'),
    require('./filereader'),
    require('./input'),
    require('./label'),
    require('./output'),
    require('./template'),
    require('./timeout'),
    require('./variable')
  ]
}
