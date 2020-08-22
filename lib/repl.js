const repl = require('repl')

const attachRepl = (runtime) => {
  repl.start('> ')
  const r = repl.start('> ')
  // Provide context
  // r.context.design = design
  r.context.runtime = runtime
  r.context.c = runtime.allComponents
}

module.exports = {
  attachRepl
}
