module.exports = {
  name: 'coresplash',
  version: '1.0.0',
  color: '#656D78',
  inputs: [
    {
      color: '#6BAD57',
      description: `Request`
    }
  ],
  outputs: [
    {
      color: '#6BAD57',
      description: `Template`
    }
  ],
  options: {
    key: ''
  },
  description: `Renders out some basic info`,

  mounted ({ on, send, options, runtime, variables }) {
    on('data', async (ctx) => {
      const routes = ctx.router.stack
      // .map(i => `${i.methods} ${i.path}`)

      const systemRootUrl = '/_system'

      const targetRuntime = variables[options.key || 'targetRuntime']

      // ==============
      // Renderers
      // ==============
      const prettyRuntime = runtime => ` 
      <h2>${runtime.design.title}</h2>
      <small>v ${runtime.design.version} by ${runtime.design.author}</small>
      <h3><a href='/_system/nodes'>Nodes</a> (${runtime.nodes.length})</h3>
      ${prettyNodes(runtime.nodes)}
      <h3>Components (${runtime.allComponents.length})</h3>
      ${prettyComponents(targetRuntime.allComponents, runtime.design.nodes)}
      `
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

      const prettyComponents = (components, nodes = []) => `
      <table>
      <tr><th>id</th><th>title</th><th>version</th><th>used</th></tr>
      ${components.map(item => `<tr>
      <td><small>${item.id}<small></td> 
      <td>${item.title}</td>
      <td>${item.version}</td>
      <td>${nodes.filter(elem => elem.component === item.id).length}</td>
      </tr>`).join('')}
      </table>`

      // ==============
      // Body
      // ==============
      console.log(targetRuntime.nodes)

      const template = `
      <h1>All routes</h1>
      <ul>
      ${routes.map(elem => `<li>${elem.methods}<a href="${elem.path}">${elem.path}</a></li>`).join('')}
      </ul>

      <h1>Running designs</h1>
      ${prettyRuntime(targetRuntime)}

      ${prettyRuntime(runtime)}
      `

      // ctx.body = template
      send(0, template, ctx)
    })
  }
}