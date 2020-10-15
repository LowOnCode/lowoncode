const {
  loadFile,
  // componentsFromDirectoryFlat,
  flattenOnKey,
  createLookup
} = require('./utils')
const { SETTINGS } = require('./types')
const start = require('./start')

/**
 * Load a design from a file
 *
 * @param {string} [designFile=`${process.cwd()}/design.json`]
 * @param {*} [settings={}]
 */
module.exports = async (
  designFile = `${process.cwd()}/design.json`,
  settings = SETTINGS
) => {
  const { componentDirectory } = settings

  // console.log(`Loading design from : ${designFile}`)
  const design = await loadFile(designFile)

  // Search for components
  // const componentsArray = await componentsFromDirectoryFlat(componentDirectory)
  // console.log(componentsArray)
  // Use barrel
  const componentsTree = require(componentDirectory)
  // console.log(componentsTree)
  const componentsArray = flattenOnKey(componentsTree, 'components')

  const components = createLookup('name')(componentsArray)
  console.log(`Found ${componentsArray.length} components in directory: ${componentDirectory}`)

  start({
    ...design,
    components
  }, settings)
}
