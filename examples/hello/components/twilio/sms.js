module.exports = {
  name: 'twilio/sms',
  title: 'SMS',
  props: {
    enabled: {
      default: true
    },
    trigger: {
      input: true,
      color: '#6BAD57'
    },
    message: {
      input: true,
      color: '#6BAD57',
      default: 'This will be the body of the new message!'
    },
    to: {
      input: true,
      color: '#6BAD57',
      default: '+31641107624'
    },
    apiKey: {
      default: 'SIGN-UP-FOR-KEY'
    }
  },

  outputs: [
    {
      name: 'response',
      color: 'blue'
    },
    {
      name: 'success',
      color: 'green'
    },
    {
      name: 'error',
      color: 'red'
    }
  ],

  mounted ({ console, state, $emit, watch }) {
    console.log(`Using apiKey: ${state.apiKey}`)

    watch('message', (newValue) => {
      console.log('Message changed to', newValue)
    })

    watch('trigger', (incoming) => {
      const axios = require('axios')

      const account = 'AC9844e611bdf6ed773589000a09217721'
      const encodeData = params => Object.entries(params)
        .map(([key, val]) => `${key}=${encodeURIComponent(val)}`)
        .join('&')

      const request = {
        data: encodeData({
          Body: state.message || 'This will be the body of the new message!',
          From: '+12059464234',
          To: state.to || '+31641107624'
        }),
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          authorization: `Basic U0s3ZDMyZTg0OTM4NDIwNDQ1MTg1NzBmZjEzMmExYTc5NTp2Vm5HZzZtQVZSQmEzaUpSRDBKS3llckNZd0kwbHNXcA==`
        },
        method: 'POST',
        url: `https://api.twilio.com/2010-04-01/Accounts/${account}/Messages.json`
      }
      // console.log(request)

      // const { res } = incoming

      axios(request)
        .then((response) => {
          console.log(response)
          $emit('success', response)
          $emit('response', {
            ...incoming,
            body: response.data
          })
          // res.send(response.data)
        })
        .catch((error) => {
          console.log(error)
          $emit('error', error)
          $emit('response', {
            ...incoming,
            body: error
          })
          // res.send(error)
        })
    })
  }
}
