const readme = `# File Reader

This component reads a file from file system.

## Input
If incomming object has a path property then filename option is ignored.

Example of incomming object
\`\`\`javascript
{
path: '/public/robots.txt',
type: 'text', // optional, default text
encoding: 'utf8' // optional, default utf8
}
\`\`\`
`

const fs = require('fs')

const install = function ({ log, send, localBus, options, ...instance }) {
  localBus.on('data', (incoming) => {
    const path = `.${options.filename}`
    log(path)
    const resp = fs.readFileSync(path, 'utf8')
    log(`Filesize: ${resp.length} bytes`)

    // instance.send(0, incoming)

    // Proxy and append data
    send(0, {
      proxy: incoming, // Proxy previous input
      data: resp
    })

    // var data = incoming.data
    // var options = instance.options
    // var path
    // var enc
    // var type

    // if (!data || !data.path) {
    //   if (!options.filename) { return }

    //   path = options.filename
    //   enc = options.encoding || 'utf8'
    //   type = options.type || 'buffer'
    // } else {
    //   path = data.path
    //   enc = data.encoding || 'utf8'
    //   type = data.type || 'buffer'
    // }

    // // path = F.path.root(path)

    // if (type === 'buffer') {
    //   fs.readFile(path, function (err, buffer) {
    //     if (err) { instance.throw(err) } else { instance.send2({ buffer }) }
    //   })
    // } else {
    //   fs.readFile(path, enc, function (err, data) {
    //     if (err) { instance.throw(err) } else { instance.send2({ data }) }
    //   })
    // }
  })
}

module.exports = {
  id: 'filereader',
  title: 'File Reader',
  version: '1.0.0',
  color: '#656D78',
  icon: 'file-text-o',
  // input: true,
  // output: 1,

  outputs: [
    {
      color: '#6BAD57',
      description: `String`
    }
  ],
  inputs: [
    {
      color: '#666D77',
      description: `Expects a Path Object`
    }],
  options: { filename: '', append: true, delimiter: '\\n' },
  readme,
  install
}
