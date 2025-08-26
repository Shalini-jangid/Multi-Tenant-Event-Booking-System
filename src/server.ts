import express from 'express'
import payload from 'payload'
import dotenv from 'dotenv'
import payloadConfig from './payload.config' // import the actual config object

dotenv.config()

const app = express()

// Redirect root to Admin panel
app.get('/', (_, res) => {
  res.redirect('/admin')
})

const start = async () => {
  // Initialize Payload with actual config object
  await payload.init({
    config: payloadConfig,
    onInit: async () => {
      payload.logger.info(`Payload Admin URL: ${payload.getAdminURL()}`)
    },
  })

  const PORT = process.env.PORT || 3000
  app.listen(PORT, () => {
    payload.logger.info(`Server listening on port ${PORT}`)
  })
}

start()
