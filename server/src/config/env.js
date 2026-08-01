const requiredVariables = ['MONGODB_URI']

function validateEnvironment() {
  const missingVariables = requiredVariables.filter((name) => !process.env[name])

  if (missingVariables.length > 0) {
    throw new Error(`Missing required environment variables: ${missingVariables.join(', ')}`)
  }
}

module.exports = { validateEnvironment }
