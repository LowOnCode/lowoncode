const Table = require('cli-table')
const fs = require('fs')
const clc = require('cli-color')
const { warn, error } = require('./logger')

const getComponentName = node => {
  return (node.component && node.component.id) || node.component
}

const trimString = function (string, length) {
  return string.length > length
    ? string.substring(0, length) + '...'
    : string
}

const prettyComponent = component => {
  return `[${component.name}@${component.version}]`
}

const prettyNode = node => `#${node.id}[${clc.green(getComponentName(node))}@${node._component && node._component.version}] `

const niceDesignName = design => `"${clc.yellow(design.title)}" version: ${design.version || '?'} by ${design.author || 'unknown author'}`

// const prettyNodeLong = node => `#${node.id}\t"${node.name}"\t[${clc.green(getComponentName(node))}@${node._component && node._component.version}] `
const prettyNodeShort = node => `#${node.id} [${getComponentName(node)}]`
// const prettyPort = (connection) => `#${node.id} "${node.name}"`

const save = async (design, dest = './design.json', pretty = true) => {
  const data = pretty ? JSON.stringify(design, null, 2) : JSON.stringify(design)
  fs.writeFileSync(dest, data)
}

const load = async (file) => {
  const raw = fs.readFileSync(file, 'utf8')
  const design = JSON.parse(raw)
  return design
}

// ===================
// Components
// ===================

// TO Class ?
const createComponent = (component) =>
  ({
    id: component.id || component.name, // Backward compatible
    title: component.title || component.id || component.name,
    ...component
  })

const createComponents = (array = [], flat = false) => {
  const components = []

  array.map(_component => {
    // Create Component (TODO Class ?)
    const component = createComponent(_component)

    // Push to local array
    components.push(component)

    // Detect sub components
    // console.log(`${parent.id || parent.name || ''}>`, component.id || component.name)

    // Flat list sub components ?
    if (flat && _component.components) {
      // console.log('Component has subcomponents')
      // console.log(component.components)
      // Flat list them as well...
      const newComponents = createComponents(_component.components, _component)
      // Add flattened to registery
      components.push(...newComponents)
    }
  })
  return components
}

/**
 * Component Resolving Strategy
 *
 * @param {*} dir
 * @returns
 */
const glob = require('glob')

const loadComponentsFromDirectory = async (dir) => {
  // const files = await fs.promises.readdir(dir)
  // console.log(files)
  const files = [
    ...glob.sync(`${dir}/*.js`),
    ...glob.sync(`${dir}/*/index.js`)
  ]

  // console.log(files)

  const _components = files.map(path => {
    const _component = require(path)
    // return _component
    // Add _source
    return {
      ..._component,
      _source: path
    }
  })

  const newComponents = createComponents(_components)
  // console.log(newComponents.map(elem => elem.title))

  return newComponents
}

// ----------
// Debug
// ----------
const printNodes = comp => {
  const table = new Table({ head: ['Name', 'Type'] })
  comp.forEach(elem => {
    table.push(
      { [elem.name]: elem.component }
    )
  })
  return table.toString()
}

const printComponents = comp => {
  const table = new Table({ head: ['Id', 'Title', 'Author', 'Version'] })
  comp.forEach(elem => {
    table.push(
      [elem.id, elem.title, elem.author || '-', elem.version]
    )
  })
  return table.toString()
}

// ----------
// Finders
// ----------
const getComponentByName = (arr = [], name) =>
  arr.find(elem => elem.name === name)

const getNodeById = (nodes = [], id) =>
  nodes.find(elem => elem.id === id)

// ----------
// Connection send
// ----------
const getConnectedNodesOnPort = (_nodes) => (node, port = 0) => {
  const { connections = [] } = node

  // [{ fromPortId, toNodeId, toPortId }, ...]
  return connections
    .filter(elem => String(elem.fromPortId) === String(port))
    .map(to => {
      const { toNodeId, toPortId } = to

      const toNode = getNodeById(_nodes, toNodeId)

      if (!toNode) {
        warn(`Node ${clc.green(toNodeId)} not found in pool of ${_nodes.length} nodes`)
        return false
      }
      return [toNode, toPortId]
    })
}

module.exports = {
  prettyComponent,
  printComponents,
  niceDesignName,

  prettyNode,
  printNodes,
  prettyNodeShort,

  // File
  save,
  load,
  loadComponentsFromDirectory,

  // Node & Connections
  getComponentByName,
  getNodeById,
  getConnectedNodesOnPort
}
