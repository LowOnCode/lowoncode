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

  ],
  options: {
    key: ''
  },
  description: `Renders out some basic info`,

  mounted ({ localBus, options, runtime, variables }) {
    localBus.on('data', async (ctx) => {
      const routes = ctx.router.stack
      // .map(i => `${i.methods} ${i.path}`)

      const targetRuntime = variables[options.key || 'targetRuntime']

      const prettyRuntime = runtime => ` 
      <h2>${runtime.design.title}</h2>
      <small>v ${runtime.design.version} by ${runtime.design.author}</small>
      <h3>Contains ${runtime.design.nodes.length} nodes</h3>
      ${prettyNodes(runtime.design.nodes)}
      <h3>Contains ${runtime.allComponents.length} components</h3>
      ${prettyComponents(targetRuntime.allComponents, runtime.design.nodes)}
      `
      const prettyNodes = arr => `
      <table>
      <tr><th>id</th><th>name</th><th>connections</th><th>component</th></tr>
      ${arr.map(item => `<tr>
      <td><small>${item.id}<small></td> 
      <td>${item.name}</td>
      <td>${item.connections && item.connections.length}</td>
      <td>${item.component}</td>
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

      ctx.body = `
      <h1>All routes</h1>
      <ul>
      ${routes.map(elem => `<li>${elem.methods}<a href="${elem.path}">${elem.path}</a></li>`).join('')}
      </ul>

      <h1>Running designs</h1>
      ${prettyRuntime(targetRuntime)}

      ${prettyRuntime(runtime)}
      `
    })
  }
}
