const fs = require('fs')
const glob = require('glob')
const path = require('path')

const circularReplacer = () => {
  const seen = new WeakSet()
  return (key, value) => {
    if (typeof value === 'object' && value !== null) {
      if (seen.has(value)) {
        return '[Circular]'
      }
      seen.add(value)
    }
    return value
  }
}

const save = async (design, dest = './design.json', pretty = true) => {
  const data = pretty ? JSON.stringify(design, null, 2) : JSON.stringify(design)
  fs.writeFileSync(dest, data)
}

const loadFile = async (file = '') => {
  const raw = fs.readFileSync(file, 'utf8')
  const design = JSON.parse(raw)
  return design
}

/**
 * Component Resolving Strategy
 *
 * @param {*} dir
 * @returns {array}
 */
const componentsFromDirectory = async (dir = './components') => {
  // Resolve rules
  const files = [
    ...glob.sync(`${dir}/*.js`),
    ...glob.sync(`${dir}/*/index.js`)
  ]

  const components = files.map(filepath => {
    // Require file
    const component = require(filepath)

    // Add _source
    return {
      name: path.parse(filepath).name, // Default component name to filename
      ...component,
      $source: filepath // Save filepath for debugging
    }
  })

  return components
}

/**
 * flattenOnKey
 * @param {*} array
 * @param {*} KEY
 * @returns {Array} Array
 */
const flattenOnKey = (array = [], KEY = 'components') => array.reduce(
  (arr, elem) => arr.concat(elem[KEY]), []
)

const componentsFromDirectoryFlat = async (dir = './components') => {
  const components = await componentsFromDirectory(dir)

  return flattenOnKey(components, 'components')
}

const uuid = (pattern = 'xxxxxxxx-xxxx') => {
  return pattern.replace(/[xy]/g, function (c) {
    var r = Math.random() * 16 | 0
    var v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

const createLookup = (key = 'name') => (arr = []) => {
  const lookupTable = {}
  arr
    .filter(elem => elem) // Only set items
    .forEach(elem => {
      const uid = elem[key]
      lookupTable[uid] = elem
    })
  return lookupTable
}

module.exports = {
  circularReplacer,
  createLookup,
  uuid,
  save,
  loadFile,
  flattenOnKey,
  componentsFromDirectory,
  componentsFromDirectoryFlat
}
