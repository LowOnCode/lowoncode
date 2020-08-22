/**
 * Monitor REST API
 *
 */

const getCircularReplacer = () => {
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

module.exports = (router, settings = {}) => {
  // Destructure settings
  const {
    targetRuntime = null,
    onUpdate = () => {}
    // systemRootUrl = '/_system' // Presentation only
  } = settings

  if (!targetRuntime) throw new Error('targetRuntime is required')

  // Get prefix from router
  const systemRootUrl = router.opts.prefix
  // console.log(router)

  // ========
  router.get('/', (ctx, next) => {
    const routes = ctx.router.stack
    // .map(i => `${i.methods} ${i.path}`)
    // const targetRuntime = variables[options.key || 'targetRuntime']

    // ==============
    // Renderers
    // ==============
    const prettyRuntime = runtime => ` 
       <h2>${runtime.design.title}</h2>
       <small>v ${runtime.design.version} by ${runtime.design.author}</small>
       <h3><a href='/_system/nodes'>Nodes</a> (${runtime.nodes.length})</h3>
       ${prettyNodes(runtime.nodes)}
       <h3><a href='/_system/components'>Components</a> (${runtime.allComponents && runtime.allComponents.length})</h3>
       ${prettyComponents(targetRuntime.getAllComponentsFlat(), runtime.design.nodes)}
       `
    // <h3>Components (${runtime.allComponents && runtime.allComponents.length})</h3>
    const prettyNodes = arr => `
       <table>
       <tr><th>id</th><th>name</th><th>connections</th><th>component</th><th>status</th></tr>
       ${arr.map(item => `<tr>
       <td><small><a href='${systemRootUrl}/nodes/${item.id}'>${item.id}</a><small></td> 
       <td>${item.name}</td>
       <td>${item.connections && item.connections.length}</td>
       <td>${item.component}</td>
       <td>${item.status}</td>
       </tr>`).join('')}
       </table>`

    const prettyComponents = (components = [], nodes = []) => `
       <table>
       <tr><th>id</th><th>name</th><th>title</th><th>version</th><th>used</th></tr>
       ${components.map(item => `<tr>
       <td><small>${item.id}<small></td> 
       <td><small>${item.name}<small></td> 
       <td>${item.title}</td>
       <td>${item.version}</td>
       <td>${nodes.filter(elem => elem.component === item.id).length}</td>
       </tr>`).join('')}
       </table>`

    // ==============
    // Body
    // ==============
    // console.log(targetRuntime.nodes)
    // console.log(targetRuntime.allComponents)

    const template = `
       <h1>All routes</h1>
       <a href="${systemRootUrl}/routes">View as JSON</a>
       <ul>
       ${routes.map(elem => `<li>${elem.methods}<a href="${elem.path}">${elem.path}</a></li>`).join('')}
       </ul>
  
       <h1>Running designs</h1>
       ${prettyRuntime(targetRuntime)}
       `

    // OUTPUT
    ctx.body = template
  })

  router.get('/debug', (ctx, next) => {
    ctx.type = 'json'
    ctx.body = JSON.stringify(targetRuntime, getCircularReplacer())
  })

  router.get('/routes', (ctx, next) => {
    ctx.body = ctx.router.stack
  })

  router.get('/design', async (ctx, next) => {
    ctx.body = targetRuntime.design
  })

  // Hotswap only
  router.put('/design', async (ctx, next) => {
    console.log('Hotswapping new design')
    const resp = await targetRuntime.run(ctx.request.body)
    ctx.body = resp
  })

  // save
  router.post('/design', async (ctx, next) => {
    console.log('save new design')
    const design = ctx.request.body

    try {
      const resp = await targetRuntime.run(design)
      ctx.body = resp

      // TODO Save ?
      // HOOK: POST /design
      onUpdate(design)
    } catch (err) {
      console.warn(err)
      ctx.status = 400
      ctx.body = err.message
    }
  })

  router.get('/nodes', (ctx, next) => {
    ctx.body = targetRuntime.nodes
  })

  router.get('/nodes/:id', (ctx, next) => {
    ctx.body = targetRuntime.findNodeById(ctx.params.id)
  })

  router.get('/components', (ctx, next) => {
    ctx.body = targetRuntime.getAllComponentsFlat()
  })

  router.get('/components/tree', (ctx, next) => {
    ctx.body = targetRuntime.allComponents
  })

  router.get('/components/:id', (ctx, next) => {
    ctx.body = targetRuntime.findNodeById(ctx.params.id)
  })

  router.get('/restart', async (ctx, next) => {
    await targetRuntime.restart()
    ctx.body = 'ok'
  })

  return router
}
