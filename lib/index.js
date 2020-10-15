const Node = require('./Node')
const __package = require('../package.json')
const start = require('./start')
const loadFromFile = require('./loadFromFile')
const {
  componentsFromDirectoryFlat,
  componentsFromDirectory,
  createLookup
} = require('./utils')

/**
* Create a Node
* @param {*} component
*/
function node (mixed = {}, node = {}) {
  const component = typeof mixed === 'string'
    ? {}
    : mixed

  return new Node(component, node)
}

// Exports
module.exports = {
  version: __package.version,
  Node,
  node,
  start,
  componentsFromDirectory,
  async loadAllFrom (dir = '', lookup = true) {
    const array = await componentsFromDirectory(dir)
    return lookup
      ? createLookup('name')(array)
      : array
  },
  async componentsFromDirectoryFlat (dir = '') {
    const components = await componentsFromDirectoryFlat(dir)
    // return components
    return createLookup('name')(components)
  },
  // getConnectedNodesOnPort,
  // Used by CLI
  loadFromFile
  // startRestApi: require('./api/routes'),
  // startMonitor,
  // Runtime,
  // httpCreate
}
