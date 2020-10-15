
const express = require('express')
const path = require('path')
const Node = require('./Node')

module.exports = (router = {}, root = new Node()) => {
  // router.use(express.static('public'))
  router.use(express.static(path.join(__dirname, 'public')))
  // router.get('/', (req, res, next) => {
  //   const body = JSON.parse(
  //     JSON.stringify(root, circularReplacer())
  //   )
  //   // res.setHeader('Content-Type', 'application/json')
  //   res.json(body)
  // })

  // Keep event log
  const events = []
  root.onAny((event, payload) => {
    // console.log('[event]', event, payload.from)
    // events.push({ event, from: payload.from, to: payload.to })
    events.push({ createdAt: new Date(), event, from: payload.from })
  })
  router.get('/events', (req, res, next) => {
    // const resp = root.getEvents()
    // console.log(resp)
    res.send(events)
  })

  router.get('/info', (req, res, next) => {
    const body = root.children.map(elem => elem.id)
    res.send(body)
  })

  /* Design */
  router.get('/design?raw', (req, res, next) => {
    res.send(root)
  })

  router.get('/design', (req, res, next) => {
    res.send({
      server: 'http://localhost:5678/',
      // ...root.toJSON()
      ...root.toObject()
    })
  })

  router.post('/design', (req, res, next) => {
    console.log(req.body)
    const data = req.body
    // Update design
    var fs = require('fs')
    // fs.writeFileSync('backup.json', JSON.stringify(data, null, 2))
    fs.renameSync('design.json', `commits/${new Date()}.json`)
    fs.writeFileSync('design.json', JSON.stringify(data, null, 2))
    res.send(data)
  })

  router.get('/children/:id', (req, res, next) => {
    const { id } = req.params
    const format = req.query.format || 'latest'
    const cloned = req.query.cloned || false
    const node = root.children.find(elem => elem.id === id)
    res.send({
      format,
      cloned,
      ...node.toObject(cloned)
    })
  })

  router.get('/children', (req, res, next) => {
    const body = root.children
    res.send(body)
  })

  router.get('/routes', (req, res, next) => {
    const body = req.router.stack
    res.send(body)
  })

  /** Components */
  router.get('/components', (req, res, next) => {
    res.send(Object.values(root.components))
  })

  router.get('/components?lookup', (req, res, next) => {
    const flattenOnKey = (array, KEY = 'components') => array.reduce(
      (arr, elem) => arr.concat(elem[KEY]), []
    )

    const body = req.query.flat
      ? flattenOnKey(root.components, 'components')
      : root.components

    res.send(body)
  })

  /** findById */
  router.get('/components/:id?raw', (req, res, next) => {
    const id = req.params.id
    const component = root.components[id]
    res.send(component)
  })

  router.get('/components/:id', (req, res, next) => {
    const id = req.params.id
    // const format = req.params.format || 'all'
    const component = root.components[id]

    const childnode = new Node(component)

    res.send(childnode.toJSON())
  })

  // Else..
  router.use((req, res, next) => {
    res.status(404)
    res.send('not found')
  })

  return router
}
