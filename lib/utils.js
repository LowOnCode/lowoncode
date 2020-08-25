const Table = require('cli-table')
const fs = require('fs')
const clc = require('cli-color')
const glob = require('glob')
const path = require('path')

const getComponentName = node => {
  return (node.component && node.component.id) || node.component
}

const prettyComponent = component => {
  return `[${component.name}@${component.version}]`
}

const prettyNode = node => `#${node.id}[${clc.green(getComponentName(node))}@${node._component && node._component.version}] `

const niceDesignName = design => `"${clc.yellow(design.title)}" version: ${design.version || '?'} by ${design.author || 'unknown author'}`

const prettyNodeShort = node => `#${node.id} [${getComponentName(node)}]`

const save = async (design, dest = './design.json', pretty = true) => {
  const data = pretty ? JSON.stringify(design, null, 2) : JSON.stringify(design)
  fs.writeFileSync(dest, data)
}

const loadFile = async (file) => {
  const raw = fs.readFileSync(file, 'utf8')
  const design = JSON.parse(raw)
  return design
}

// ===================
// Components
// ===================
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

const componentsFromDirectory = async (dir) => {
  const files = [
    ...glob.sync(`${dir}/*.js`),
    ...glob.sync(`${dir}/*/index.js`)
  ]

  const components = files.map(filepath => {
    const component = require(filepath)

    // Add _source
    return {
      name: path.parse(filepath).name, // Default component name to filename
      ...component,
      $source: filepath
    }
  })

  // console.log(components)
  // const newComponents = createComponents(components)

  return components
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
        throw new Error(`Node ${clc.green(toNodeId)} not found in pool of ${_nodes.length} nodes`)
      }

      return [toNode, toPortId]
    })
}

const uuid = (pattern = 'xxxxxxxx-xxxx') => {
  return pattern.replace(/[xy]/g, function (c) {
    var r = Math.random() * 16 | 0
    var v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

module.exports = {
  uuid,
  prettyComponent,
  printComponents,
  niceDesignName,
  prettyNode,
  printNodes,
  prettyNodeShort,
  save,
  loadFile,
  componentsFromDirectory,
  getComponentByName,
  getNodeById,
  getConnectedNodesOnPort
}
