// Alias to CLI command: `lowoncode ./design.json --monitor --port 5678 -c ../../components`
const loc = require('../../index')

loc.loadFromFile(
  `${__dirname}/design.json`,
  {
    componentDirectory: `${process.cwd()}/../../components`
  }
)
