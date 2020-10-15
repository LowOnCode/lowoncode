const { uuid } = require('./utils')

const CONNECTION_LEG = [
  '', // nodeid
  '' // port name
]

module.exports = class Connection {
  constructor (from = CONNECTION_LEG, to = CONNECTION_LEG, id = uuid()) {
    this.id = id
    this.from = from
    this.to = to
  }

  toString () {
    return JSON.stringify(this)
  }
}
