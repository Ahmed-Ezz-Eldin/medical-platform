const cors = require('cors')
const express = require('express')
const helmet = require('helmet')
const rateLimit = require('express-rate-limit')

const app = express()

const allowedOrigins = [process.env.CLIENT_URL, process.env.ADMIN_URL].filter(Boolean)

app.use(helmet())
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true)
      }

      return callback(new Error('Origin is not allowed by CORS'))
    },
    credentials: true,
  }),
)
app.use(express.json({ limit: '20kb' }))
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
  }),
)

app.get('/api/v1/health', (_request, response) => {
  response.status(200).json({ status: 'ok' })
})

app.use((error, _request, response, _next) => {
  if (error.message === 'Origin is not allowed by CORS') {
    return response.status(403).json({ message: 'Origin is not allowed' })
  }

  return response.status(500).json({ message: 'Unexpected server error' })
})

module.exports = { app }
