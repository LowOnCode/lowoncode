// Default settings
const SETTINGS = {
  componentDirectory: `${process.cwd()}/components`,
  prefix: '',
  port: 5678,
  apiKey: '',
  api: true,
  apiPrefix: '/_system'
}

const NODE = {
  children: [],
  components: {},
  connections: []
}

module.exports = {
  SETTINGS,
  NODE
}
