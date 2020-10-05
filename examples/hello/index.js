const loc = require('../../index')

loc.loadFromFile(
  `${__dirname}/design.json`,
  {
    componentDirectory: `${process.cwd()}/../../components`
  }
)
