module.exports = {
  name: 'std',
  version: '0.0.1',
  description: 'Some basic core components',
  components: [
    require('./debug'),
    require('./design'),
    require('./filereader'),
    require('./httpresponse'),
    require('./httproute'),
    require('./input'),
    require('./label'),
    require('./output'),
    require('./restproxy'),
    require('./template'),
    require('./timeout'),
    require('./variable')
  ]
}
