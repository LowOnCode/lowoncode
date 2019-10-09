const Table = require('cli-table')
const fs = require('fs')
const { warn, error, log } = require('./logger')

const getComponentName = node => {
  return (node.component && node.component.id) || node.component
}

const prettyNode = node => `#${node.id} [${getComponentName(node)}] "${node.name}"`
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

/*
// TODO - not working at the moment ?

const loadComponent = (dir) => (path) => {
  console.log(path)
  if (fs.statSync(`${dir}/${path}`).isDirectory()) {
    // filelist = walkSync(dir + path + '/', filelist)
    log('Directory', path)
    return
  } else {
    // filelist.push(file)
  }

  try {
    // Include file
    const _component = require(`${dir}/${path}`)
    return createComponent(_component)
  } catch (err) {
    console.error(err)
  }
}

const loadComponents = async (dir) => {
  const files = await fs.promises.readdir(dir)
  const components = files.map(loadComponent(dir))
  // console.log(components)
  return components
}
*/
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
      components.push(createComponent(_component))
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

const getConnectedNodesOldV1 = (_nodes) => (node, port = 0) => {
  const { connections } = node

  // DEPRECATED V1 = { 0 : [{index, id}], ...}
  const asVersion1 = connections => {
    const toArr = connections[port] || []
    if (!toArr.length) {
      warn(`Nothing connected to port ${port}`)
      return []
    }

    return toArr.map(to => {
    // Scope to port
      const { id, index } = to
      const toNode = getNodeById(_nodes, id)

      if (!toNode) {
        warn(`Node ${id} not found in pool of ${_nodes.length} nodes`)
        return false
      }
      return [toNode, 0] // DEPRECATE No input port
    })
  }

  return asVersion1(connections)
}

const getConnectedNodesOnPort = (_nodes) => (node, port = 0) => {
  const { connections } = node

  // [{ fromPortId, toNodeId, toPortId }, ...]
  return connections
    .filter(elem => String(elem.fromPortId) === String(port))
    .map(to => {
      const { toNodeId, toPortId } = to

      const toNode = getNodeById(_nodes, toNodeId)

      if (!toNode) {
        warn(`Node ${toNodeId} not found in pool of ${_nodes.length} nodes`)
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
