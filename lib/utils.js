const clc = require('cli-color')
// const error = clc.red.bold
const warn = (...args) => console.log(clc.yellow(args))
// const notice = clc.blue

const fs = require('fs')
const Table = require('cli-table')

const SEPERATOR = `=================================`

const log = console.log

const logH = (...args) => {
  // log()
  log(SEPERATOR)
  log(...args)
  log(SEPERATOR)
}
const getComponentName = node => node.component.id || node.component

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

const loadComponents = async (from) => {
  const components = []
  const files = await fs.promises.readdir(from)

  files.forEach(file => {
    try {
      const component = require(`${from}/${file}`)
      // components.push(component)
      addComponent(components)(component)
    } catch (err) {
      console.error(err)
    }
  })
  return components
}

const addComponent = (components) => (component) => {
  components.push({
    id: component.id || component.name, // Backward compatible
    ...component
  })
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
  log(table.toString())
}

const printComponents = comp => {
  const table = new Table({ head: ['Id', 'Title', 'Author', 'Version'] })
  comp.forEach(elem => {
    table.push(
      [elem.id, elem.title, elem.author || '-', elem.version]
    )
  })
  log(table.toString())
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

// TODO Input port
/**
 * getConnectedNodes
 *
 * @param {*} _nodes
 * @returns {[]} array
 */
const getConnectedNodes = (_nodes) => (node, port = 0) => {
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
      return toNode
    })
  }

  // V2 = [{ fromPortId, toNodeId, toPortId }, ...]
  const asVersion2 = connections => connections.map(to => {
    const { fromPortId, toNodeId, toPortId } = to

    const toNode = getNodeById(_nodes, toNodeId)

    if (!toNode) {
      warn(`Node ${toNodeId} not found in pool of ${_nodes.length} nodes`)
      return false
    }
    return toNode
  })

  // HACKY - Convert v1 to v2 connections
  const isObj = anyVar => typeof anyVar === 'object' && anyVar instanceof Object && !(anyVar instanceof Array)

  // console.log(isObj(connections) ? 'Connection design v1' : 'Connection design v2')
  // console.log(connections)
  return isObj(connections)
    ? asVersion1(connections)
    : asVersion2(connections)
}

module.exports = {
  // Logging
  warn,
  log,
  logH,
  logS () { log(SEPERATOR) },
  SEPERATOR,
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
  getConnectedNodes
}
