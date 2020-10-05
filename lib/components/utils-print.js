const Table = require('cli-table')

const prettyComponent = component => {
  return `[${component.name}@${component.version}]`
}

const printNodes = comp => {
  const table = new Table({ head: ['Name', 'Type'] })
  comp.forEach(elem => {
    table.push(
      { [elem.name]: elem.component }
    )
  })
  return table.toString()
}

const printComponents = comp => {
  const table = new Table({ head: ['Id', 'Title', 'Author', 'Version'] })
  comp.forEach(elem => {
    table.push(
      [elem.id, elem.title, elem.author || '-', elem.version]
    )
  })
  return table.toString()
}
