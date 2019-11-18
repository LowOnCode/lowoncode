/*
  Native Javascript Service to interact programmaticly with the LowOnCode designs
*/

const stringTemplateParser = (expression, valueObj) => {
  const templateMatcher = /{{\s?([^{}\s]*)\s?}}/g
  const text = expression.replace(templateMatcher, (substring, value, index) => {
    value = valueObj[value]
    return value
  })
  return text
}

const uuidv4 = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    var r = Math.random() * 16 | 0; var v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

// Helpers
const findIndexInNodeConnections = (nodeConnections, {
  fromNodeId, fromPortId,
  toNodeId, toPortId
}) => {
  // Loop node's connections
  return nodeConnections.findIndex(elem => {
    return fromPortId === Number(elem.fromPortId) &&
      // elem.fromNodeId === fromNodeId && // <= see above
      toNodeId === elem.toNodeId &&
      toPortId === Number(elem.toPortId)
  })
}

// ===========
// Mapping
// ===========
export const getComponentFromNode = (node = {}) => {
  // console.log({ ...node })
  return node._component || {}
}

/**
 * Create a node (could become a class ?)
 *
 * @param {*} [settings={}]
 * @returns
 */
const createNode = (settings = {}) => {
  // console.log(settings._component)
  if (!settings._component) { console.warn(`No _component attached to node.id: ${settings.id}`) }
  const { _component = {} } = settings

  return {
    ...settings,
    ref: stringTemplateParser(_component.refTemplate || settings.name || '-noref-', settings.options)
  }
}

export default {
  // ===========
  // State
  // ===========

  nodes: [],
  components: [],

  // ===========
  // Init
  // ===========
  set ({ components, nodes }) {
    this.setComponents(components)
    this.setNodes(nodes)
  },

  // ===========
  // Components
  // ===========
  setComponents (comp) {
    this.components = comp
  },

  findComponent (name) {
    return this.components.find(elem => elem.id === name)
  },

  // ===========
  // Nodes
  // ===========
  // Handy to remove vue reactivity, note sub nodes info like connections aren't cloned yet
  getNodesCloned () { return [...this.nodes.map(elem => ({ ...elem }))] },

  updateNodeOptionsById (id, options = {}) {
    const node = this.findNodeById(id)
    node.options = options
    return node
  },

  setNodes (value) {
    this.nodes = value.map(createNode)
  },

  mergeNodeById (id, newNode) {
    const node = this.findNodeById(id)
    Object.assign(node, newNode)
    return node
  },

  findNodeById (id, key = 'id') {
    return this.nodes.find(elem => elem[key] === id)
  },

  findNodeByIdVerbose (id, key = 'id') {
    const node = this.findNodeById(id, key)
    if (!node) {
      console.warn(`Couldn't find node ${id}`)
      return null
    }
    return node
  },

  addNodeFromComponentId (componentId, nodeSettings) {
    const blueprint = this.findComponent(componentId)

    console.log('addNode', blueprint)
    const id = uuidv4()
    const node = {
      _component: blueprint,
      // Get some defaults from component
      color: blueprint.color,
      name: blueprint.name,
      ...blueprint, // <= needs cleaning
      connections: [],
      ...nodeSettings,
      id
    }
    this.nodes.push(node)
    return id
  },

  addNode (settings) {
    console.warn('DEPRECATED : use addNodeFromComponentId')
    return this.addNodeFromComponentId(settings.component, settings)
  },

  removeNodeById (id) {
    const { nodes } = this
    const node = this.findNodeById(id)

    if (!node) {
      console.warn(`Node not found: ${id}`)
      return
    }

    const index = nodes.indexOf(node)
    if (index !== -1) {
      nodes.splice(index, 1)
    }
  },

  removeNodesById (arr) {
    arr.forEach(id => {
      this.removeNodeById(id)
    })
  },

  removeElem (mixed) {
    const { id, type = 'node' } = mixed

    if (!id) {
      console.warn(`Can't remove an element without id`)
      return
    }
    if (!type) {
      console.warn(`Can't remove an element without a type`)
      return
    }

    // Mixed = node or connection
    console.log('removeElem', mixed, id)

    const fnMap = {
      node: this.removeNodeById.bind(this),
      connection: this.removeConnectionById.bind(this)
    }

    // Detect type
    fnMap[type](id)
  },

  // ===========
  // Connections
  // ===========
  findConnectionById (id, key = 'id') {
    const connections = this.getAllConnectionsFlat()
    return connections.find(elem => elem[key] === id)
  },

  findConnection ({
    fromNodeId, fromPortId = 0,
    toNodeId, toPortId = 0
  }) {
    // const connections = this.getAllConnectionsFlat()

    // Note - connections are currently attached to the from node
    const node = this.findNodeById(fromNodeId)
    if (!node) {
      console.warn(`Couldn't find node ${fromNodeId}`, this.nodes)
      return
    }
    const nodeConnections = this.getConnectionsFromNode(node)

    // Loop node's connections
    const connections = nodeConnections.find(elem => {
      return Number(fromPortId) === Number(elem.fromPortId) &&
        // elem.fromNodeId === fromNodeId && // <= see above
        toNodeId === elem.toNodeId &&
        Number(toPortId) === Number(elem.toPortId)
    })

    return connections
  },

  getConnectionsFromNode (node = {}) {
    return node.connections
  },

  getAllConnections () {
    // TODO CACHE ?
    return this.nodes
      .map(node => node.connections)
      .filter(elem => elem) // Remove empty
  },

  getAllConnectionsFlat () {
    return this.getAllConnections()
      .flat()
  },

  addConnection ([fromNodeId, fromPortId], [toNodeId, toPortId]) {
    if (!fromNodeId) {
      throw new Error(`fromNodeId is required`)
    }

    const from = this.findNodeById(fromNodeId)

    if (!from) {
      console.warn(`Couldn't find fromNode: ${fromNodeId}`)
      console.warn(`Connection not created`)
      return false
    }
    // Mutate
    // from.connections = {
    //   0: {
    //     index: toPortId,
    //     id: toNodeId
    //   }
    // }
    from.connections.push(
      {
        id: uuidv4(),
        type: 'connection',
        fromNodeId, // (Optional)
        fromPortId,
        toNodeId,
        toPortId
      }
    )
  },

  removeConnectionById (id) {
    const connections = this.getAllConnectionsFlat()
    const connection = this.findConnectionById(id)

    if (!connection) {
      console.warn(`Connection not found: ${id} in :`, connections)
      return
    }

    const index = connections.indexOf(connection)
    if (index !== -1) {
      console.log(`Connection remove on index: ${index}`, connections)
      connections.splice(index, 1)
    }
    // IMPROVE - decouple node & connections ?

    // FOR NOW the connection is attached to the from node
    const node = this.findNodeById(connection.fromNodeId)

    const nodeConnectionIndex = findIndexInNodeConnections(node.connections, connection)
    node.connections.splice(nodeConnectionIndex, 1)
  }
}
