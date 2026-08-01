const path = require('path')

require('dotenv').config({ path: path.resolve(__dirname, '../../.env') })

const { app } = require('./app')
const { connectDatabase } = require('./config/database')
const { validateEnvironment } = require('./config/env')

const port = Number(process.env.PORT || 5000)

async function startServer() {
  validateEnvironment()
  await connectDatabase()

  app.listen(port, () => {
    console.log(`API server is running on port ${port}`)
  })
}

startServer().catch((error) => {
  console.error('Server failed to start', error)
  process.exit(1)
})
