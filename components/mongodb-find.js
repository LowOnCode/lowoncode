/* eslint-disable no-tabs */

module.exports = {
  name: 'mongodb-find',
  version: '1.0.0',
  outputs: [
    {
      color: '#666D77',
      description: `result`
    }
  ],
  inputs: [
    {
      color: '#666D77',
      description: `db`
    },
    {
      color: '#666D77',
      description: `ctx`
    }],
  options: {
    key: ''
  },
  mounted: ({ send, bus, state, options, variables }) => {
    // Components internal state
    state = {
      db: {}
    }

    bus.on('data:0', (db) => {
      state.db = db

      const collection = db.collection('tests')

      collection.find({}).toArray(function (err, docs) {
        console.warn(err)
        console.log('Found the following records')
        console.log(docs)
        // callback(docs)
        // send(0, docs)
      })
    })

    bus.on('data:1', (incoming) => {
      console.log('ctx:', incoming)

      const collection = state.db.collection('tests')

      const find = (query = {}) => {
        collection.find({}).toArray(function (err, docs) {
          console.warn(err)
          console.log('Found the following records')
          console.log(docs)
          // callback(docs)
          // send(0, docs)
          incoming = docs

          send(0, {
            proxy: incoming, // Proxy previous input
            data: docs
          })
        })
      }

      setTimeout(find, 1000)
    })
  }
}
