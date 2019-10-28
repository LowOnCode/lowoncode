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

const prettyNode = node => {
  // console.log(node._component)
  return `#${trimString(node.id, 20).padEnd(25)}[${clc.green(getComponentName(node))}@${node._component && node._component.version}] `
}
const prettyNodeLong = node => `#${node.id}\t"${node.name}"\t[${clc.green(getComponentName(node))}@${node._component && node._component.version}] `
const prettyNodeShort = node => `#${node.id} [${getComponentName(node)}]`
// const prettyPort = (connection) => `#${node.id} "${node.name}"`

const save = async (design, dest = './design.json', pretty = true) => {
  const data = pretty ? JSON.stringify(design, null, 2) : JSON.stringify(design)
  fs.writeFileSync(dest, data)
}

const load = async (file) => {
  const raw = fs.readFileSync(file)
  const design = JSON.parse(raw)
  return design
}

const loadComponents = async (dir) => {
  const components = []
  const files = await fs.promises.readdir(dir)

  files.forEach(file => {
    // log(file)
    const isDirectory = fs.statSync(`${dir}/${file}`).isDirectory()
    const path = isDirectory
      ? `${dir}/${file}/${file}`
      : `${dir}/${file}`

    try {
      // Include file
      const _component = require(path)
      const component = createComponent(_component)
      components.push({
        ...component,
        _source: path
      })
    } catch (err) {
      error(err)
    }
  })

  return components
}

// TO Class ?
const createComponent = (component) =>
  ({
    id: component.id || component.name, // Backward compatible
    title: component.title || component.id || component.name,
    ...component
  })

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
const getComponentByType = (nodes, type) =>
  nodes.find(elem => elem.id === type)

const getNodeById = (nodes, id) =>
  nodes.find(elem => elem.id === id)

// ----------
// Connection send
// ----------
const getConnectedNodesOnPort = (_nodes) => (node, port = 0) => {
  const { connections } = node

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
  prettyNode,
  printNodes,
  printComponents,
  prettyNodeShort,

  // File
  save,
  load,
  loadComponents,

  // Node & Connections
  getComponentByType,
  getNodeById,
  getConnectedNodesOnPort
}
