
// ============
// Monitor Server
const { bus } = targetRuntime
bus.onAny(function (event, value) {
  // console.log(event, value)
  // To Websocket
})
targetRuntime.bus.on('*', (payload) => {
  console.log('cool', payload)
})
// ============
