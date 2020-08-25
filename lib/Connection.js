const CONNECTION_LEG = [
  '', // nodeid
  '' // port name
]

module.exports = class Connection {
  constructor (from = CONNECTION_LEG, to = CONNECTION_LEG, id = '') {
    this.id = id
    this.from = from
    this.to = to
  }

  toString () {
    return JSON.stringify(this.toJson())
  }
}
