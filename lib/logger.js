const debug = require('debug')

// # error
// # warn
// # info
// # verbose
// # debug
const SEPERATOR = `=================================`

const log = debug('log') // console.log

const logH = (...args) => {
  log(SEPERATOR)
  log(...args)
  log(SEPERATOR)
}

module.exports = {
  // Logging
  error: debug('error'),
  warn: debug('warn'),
  info: debug('info'),
  verbose: debug('verbose'),
  debug: debug('debug'),

  log,
  logH,
  logS () { log(SEPERATOR) },
  SEPERATOR
}
