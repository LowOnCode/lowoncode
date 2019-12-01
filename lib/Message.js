module.exports = class Message {
  constructor (message) {
    // Merge
    Object.assign(this, message)
  }

  set (newValue) {
    // TODO Track changes for debugging
    this.value = newValue
  }

  append (newValue) {
    // TODO Track changes for debugging
    this.value += newValue
  }

  toString () { return this.value }
}
