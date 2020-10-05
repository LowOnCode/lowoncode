module.exports = (router, node = {}) => {
  router.get('/', (req, res, next) => {
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

    const body = JSON.parse(
      JSON.stringify(node, circularReplacer())
    )
    // console.log(body)
    // res.setHeader('Content-Type', 'application/json')
    res.json(body)
  })

  router.get('/info', (req, res, next) => {
    const body = node.children.map(elem => elem.id)
    res.send(body)
  })

  // Alias
  router.get('/design', (req, res, next) => {
    // const body = node // TODO ?
    const body = node.toJson()
    res.send(body)
  })

  router.get('/children/:id', (req, res, next) => {
    const { id } = req.params
    const body = node.children.find(elem => elem.id === id)
    res.send(body)
  })

  router.get('/children', (req, res, next) => {
    const body = node.children
    res.send(body)
  })

  router.get('/events', (req, res, next) => {
    const body = node.getBus()
    res.send(body)
  })

  router.get('/routes', (req, res, next) => {
    const body = req.router.stack
    res.send(body)
  })

  router.get('/components', (req, res, next) => {
    const flattenOnKey = (array, KEY = 'components') => array.reduce(
      (arr, elem) => arr.concat(elem[KEY]), []
    )

    const body = req.query.flat
      ? flattenOnKey(node.components, 'components')
      : node.components

    res.send(body)
  })

  return router
}
