const axios = require('axios')

const baseUrl = 'http://localhost:3001/api'

const resetDatabase = async () => {
  await axios.post(`${baseUrl}/reset`)
}

const createUser = async (username, name, password) => {
  const response = await axios.post(`${baseUrl}/users`, {
    username,
    name,
    password
  })
  return response.data
}

const login = async (username, password) => {
  const response = await axios.post(`${baseUrl}/login`, {
    username,
    password
  })
  return response.data.token
}

const resetAndSeed = async () => {
  await resetDatabase()

  const user1 = await createUser('test1@example.com', 'Test User 1', 'password123')
  const user2 = await createUser('test2@example.com', 'Test User 2', 'password456')

  const token1 = await login('test1@example.com', 'password123')
  const token2 = await login('test2@example.com', 'password456')

  return {
    users: [user1, user2],
    tokens: [token1, token2]
  }
}

module.exports = {
  baseUrl,
  resetAndSeed,
  createUser,
  login
}
