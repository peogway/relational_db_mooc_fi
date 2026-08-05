const { describe, it, before, after } = require('node:test')
const assert = require('node:assert')
const axios = require('axios')
const { baseUrl, resetAndSeed, createUser, login } = require('./helper')

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))

// Shared test data for all tests in this file
let testData
let createdBlogId
let sessionUser

// Single setup for the entire test file
before(async () => {
  testData = await resetAndSeed()
  
  // Create session user
  sessionUser = await createUser('session@example.com', 'Session User', 'sessionpass')
  
  // Create a blog for reading list tests
  const newBlog = {
    title: 'Test Blog for Reading List',
    author: 'Reading List Author',
    url: 'https://example.com/reading-list-blog'
  }
  
  const blogResponse = await axios.post(`${baseUrl}/blogs`, newBlog, {
    headers: { Authorization: `Bearer ${testData.tokens[0]}` }
  })
  createdBlogId = blogResponse.data.id
})

describe('Reading Lists API', () => {
  it('can add a blog to reading list', async () => {
    const readingListEntry = {
      blogId: createdBlogId,
      userId: testData.users[0].id
    }
    
    const response = await axios.post(`${baseUrl}/readinglists`, readingListEntry)
    
    assert.ok([200, 201].includes(response.status))
    assert.strictEqual(response.data.blog_id, createdBlogId)
    assert.strictEqual(response.data.user_id, testData.users[0].id)
    assert.strictEqual(response.data.read, false)
  })
  
  it('cannot add same blog to reading list twice', async () => {
    const readingListEntry = {
      blogId: createdBlogId,
      userId: testData.users[0].id
    }
    
    try {
      await axios.post(`${baseUrl}/readinglists`, readingListEntry)
      assert.fail('Should have thrown an error')
    } catch (error) {
      assert.strictEqual(error.response.status, 400)
    }
  })
  
  it('returns 400 when blogId is missing', async () => {
    const readingListEntry = {
      userId: testData.users[0].id
    }
    
    try {
      await axios.post(`${baseUrl}/readinglists`, readingListEntry)
      assert.fail('Should have thrown an error')
    } catch (error) {
      assert.strictEqual(error.response.status, 400)
    }
  })
  
  it('returns 400 when userId is missing', async () => {
    const readingListEntry = {
      blogId: createdBlogId
    }
    
    try {
      await axios.post(`${baseUrl}/readinglists`, readingListEntry)
      assert.fail('Should have thrown an error')
    } catch (error) {
      assert.strictEqual(error.response.status, 400)
    }
  })
  
  it('returns 404 when blog does not exist', async () => {
    const readingListEntry = {
      blogId: 99999,
      userId: testData.users[0].id
    }
    
    try {
      await axios.post(`${baseUrl}/readinglists`, readingListEntry)
      assert.fail('Should have thrown an error')
    } catch (error) {
      assert.strictEqual(error.response.status, 404)
    }
  })
  
  it('returns 404 when user does not exist', async () => {
    const readingListEntry = {
      blogId: createdBlogId,
      userId: 99999
    }
    
    try {
      await axios.post(`${baseUrl}/readinglists`, readingListEntry)
      assert.fail('Should have thrown an error')
    } catch (error) {
      assert.strictEqual(error.response.status, 404)
    }
  })
  
  it('user can view their reading list', async () => {
    const response = await axios.get(`${baseUrl}/users/${testData.users[0].id}`)
    
    assert.ok([200, 201].includes(response.status))
    assert.strictEqual(response.data.name, testData.users[0].name)
    assert.strictEqual(response.data.username, testData.users[0].username)
    assert.ok(Array.isArray(response.data.readings))
    assert.ok(response.data.readings.length > 0)
    
    const reading = response.data.readings[0]
    assert.ok(reading.id)
    assert.ok(reading.title)
    assert.ok(reading.author)
    assert.ok(reading.url)
    assert.ok(reading.reading_list)
    assert.strictEqual(typeof reading.reading_list.read, 'boolean')
  })
  
  it('user can filter reading list by read status', async () => {
    const responseUnread = await axios.get(`${baseUrl}/users/${testData.users[0].id}?read=false`)
    assert.ok([200, 201].includes(responseUnread.status))
    
    const responseRead = await axios.get(`${baseUrl}/users/${testData.users[0].id}?read=true`)
    assert.ok([200, 201].includes(responseRead.status))
    
    // All readings should be unread at this point
    assert.ok(responseUnread.data.readings.length > 0)
    assert.strictEqual(responseRead.data.readings.length, 0)
  })
  
  it('user can mark a blog as read with authentication', async () => {
    const userResponse = await axios.get(`${baseUrl}/users/${testData.users[0].id}`)
    const readingListId = userResponse.data.readings[0].reading_list.id
    
    const response = await axios.put(
      `${baseUrl}/readinglists/${readingListId}`,
      { read: true },
      { headers: { Authorization: `Bearer ${testData.tokens[0]}` } }
    )
    
    assert.ok([200, 201].includes(response.status))
    assert.strictEqual(response.data.read, true)
  })
  
  it('marking as read requires authentication', async () => {
    const userResponse = await axios.get(`${baseUrl}/users/${testData.users[0].id}`)
    const readingListId = userResponse.data.readings[0].reading_list.id
    
    try {
      await axios.put(
        `${baseUrl}/readinglists/${readingListId}`,
        { read: false }
      )
      assert.fail('Should have thrown an error')
    } catch (error) {
      assert.strictEqual(error.response.status, 401)
    }
  })
  
  it('user can only mark their own reading list entries', async () => {
    const userResponse = await axios.get(`${baseUrl}/users/${testData.users[0].id}`)
    const readingListId = userResponse.data.readings[0].reading_list.id
    
    try {
      await axios.put(
        `${baseUrl}/readinglists/${readingListId}`,
        { read: false },
        { headers: { Authorization: `Bearer ${testData.tokens[1]}` } }
      )
      assert.fail('Should have thrown an error')
    } catch (error) {
      assert.strictEqual(error.response.status, 401)
    }
  })
  
  it('returns 404 when marking non-existent reading list entry', async () => {
    try {
      await axios.put(
        `${baseUrl}/readinglists/99999`,
        { read: true },
        { headers: { Authorization: `Bearer ${testData.tokens[0]}` } }
      )
      assert.fail('Should have thrown an error')
    } catch (error) {
      assert.strictEqual(error.response.status, 404)
    }
  })
  
  it('verified that blog is now marked as read', async () => {
    const responseRead = await axios.get(`${baseUrl}/users/${testData.users[0].id}?read=true`)
    assert.ok([200, 201].includes(responseRead.status))
    assert.ok(responseRead.data.readings.length > 0)
    
    const responseUnread = await axios.get(`${baseUrl}/users/${testData.users[0].id}?read=false`)
    assert.ok([200, 201].includes(responseUnread.status))
    assert.strictEqual(responseUnread.data.readings.length, 0)
  })
})

describe('Session Management API', () => {
  let sessionToken

  it('login creates a session', async () => {
    const response = await axios.post(`${baseUrl}/login`, {
      username: 'session@example.com',
      password: 'sessionpass'
    })
    
    assert.ok([200, 201].includes(response.status))
    assert.ok(response.data.token)
    assert.strictEqual(response.data.username, 'session@example.com')
    assert.strictEqual(response.data.name, 'Session User')
    sessionToken = response.data.token
  })
  
  it('authenticated request works with valid session', async () => {
    const newBlog = {
      title: 'Blog with Session',
      author: 'Session Author',
      url: 'https://example.com/session-blog'
    }
    
    const response = await axios.post(`${baseUrl}/blogs`, newBlog, {
      headers: { Authorization: `Bearer ${sessionToken}` }
    })
    
    assert.ok([200, 201].includes(response.status))
    assert.strictEqual(response.data.title, newBlog.title)
  })
  
  it('logout removes user sessions', async () => {
    const response = await axios.delete(`${baseUrl}/logout`, {
      headers: { Authorization: `Bearer ${sessionToken}` }
    })
    
    assert.strictEqual(response.status, 204)
  })
  
  it('authenticated request fails after logout', async () => {
    const newBlog = {
      title: 'Blog After Logout',
      author: 'Logout Author',
      url: 'https://example.com/logout-blog'
    }
    
    try {
      await axios.post(`${baseUrl}/blogs`, newBlog, {
        headers: { Authorization: `Bearer ${sessionToken}` }
      })
      assert.fail('Should have thrown an error')
    } catch (error) {
      assert.strictEqual(error.response.status, 401)
    }
  })
  
  it('logout without token returns 401', async () => {
    try {
      await axios.delete(`${baseUrl}/logout`)
      assert.fail('Should have thrown an error')
    } catch (error) {
      assert.strictEqual(error.response.status, 401)
    }
  })
  
  it('logout with invalid token returns 401', async () => {
    try {
      await axios.delete(`${baseUrl}/logout`, {
        headers: { Authorization: 'Bearer invalidtoken123' }
      })
      assert.fail('Should have thrown an error')
    } catch (error) {
      assert.strictEqual(error.response.status, 401)
    }
  })
  
  it('multiple logins create separate sessions', async () => {
    const token1 = await login('session@example.com', 'sessionpass')
    await sleep(1100)
    const token2 = await login('session@example.com', 'sessionpass')
    
    assert.notStrictEqual(token1, token2)
    
    const newBlog1 = {
      title: 'Blog with First Token',
      author: 'Token1',
      url: 'https://example.com/token1'
    }
    
    const response1 = await axios.post(`${baseUrl}/blogs`, newBlog1, {
      headers: { Authorization: `Bearer ${token1}` }
    })
    assert.ok([200, 201].includes(response1.status))
    
    const newBlog2 = {
      title: 'Blog with Second Token',
      author: 'Token2',
      url: 'https://example.com/token2'
    }
    
    const response2 = await axios.post(`${baseUrl}/blogs`, newBlog2, {
      headers: { Authorization: `Bearer ${token2}` }
    })
    assert.ok([200, 201].includes(response2.status))
  })
  
  it('logout removes all sessions for that user', async () => {
    // Previous test created two sessions; logout should remove both
    await sleep(1100)
    const token = await login('session@example.com', 'sessionpass')
    
    await axios.delete(`${baseUrl}/logout`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    
    const newBlog = {
      title: 'Blog After Mass Logout',
      author: 'Logout All',
      url: 'https://example.com/logout-all'
    }
    
    try {
      await axios.post(`${baseUrl}/blogs`, newBlog, {
        headers: { Authorization: `Bearer ${token}` }
      })
      assert.fail('Should have thrown an error')
    } catch (error) {
      assert.strictEqual(error.response.status, 401)
    }
  })
  
  it('active user can make authenticated requests', async () => {
    await sleep(1100)
    const token = await login('session@example.com', 'sessionpass')
    
    const newBlog = {
      title: 'Blog for Active User',
      author: 'Active',
      url: 'https://example.com/active'
    }
    
    const response = await axios.post(`${baseUrl}/blogs`, newBlog, {
      headers: { Authorization: `Bearer ${token}` }
    })
    
    assert.ok([200, 201].includes(response.status))
  })
})

describe('Integration: Reading Lists and Sessions', () => {
  let integrationBlogId
  let integrationReadingListId
  let integrationToken
  
  it('create blog and add to reading list', async () => {
    integrationToken = await login('test2@example.com', 'password456')
    
    const newBlog = {
      title: 'Integration Test Blog',
      author: 'Integration Author',
      url: 'https://example.com/integration'
    }
    
    const blogResponse = await axios.post(`${baseUrl}/blogs`, newBlog, {
      headers: { Authorization: `Bearer ${integrationToken}` }
    })
    integrationBlogId = blogResponse.data.id
    
    const readingListEntry = {
      blogId: integrationBlogId,
      userId: testData.users[1].id
    }
    
    const response = await axios.post(`${baseUrl}/readinglists`, readingListEntry)
    
    assert.ok([200, 201].includes(response.status))
    assert.strictEqual(response.data.blog_id, integrationBlogId)
    integrationReadingListId = response.data.id
  })
  
  it('can mark blog as read with valid session', async () => {
    const response = await axios.put(
      `${baseUrl}/readinglists/${integrationReadingListId}`,
      { read: true },
      { headers: { Authorization: `Bearer ${integrationToken}` } }
    )
    
    assert.ok([200, 201].includes(response.status))
    assert.strictEqual(response.data.read, true)
  })
  
  it('cannot mark blog as read after session expires (logout)', async () => {
    await axios.delete(`${baseUrl}/logout`, {
      headers: { Authorization: `Bearer ${integrationToken}` }
    })
    
    try {
      await axios.put(
        `${baseUrl}/readinglists/${integrationReadingListId}`,
        { read: false },
        { headers: { Authorization: `Bearer ${integrationToken}` } }
      )
      assert.fail('Should have thrown an error')
    } catch (error) {
      assert.strictEqual(error.response.status, 401)
    }
  })
  
  it('new session allows access to reading list operations again', async () => {
    await sleep(1100)
    const newToken = await login('test2@example.com', 'password456')
    
    const response = await axios.put(
      `${baseUrl}/readinglists/${integrationReadingListId}`,
      { read: false },
      { headers: { Authorization: `Bearer ${newToken}` } }
    )
    
    assert.ok([200, 201].includes(response.status))
    assert.strictEqual(response.data.read, false)
  })
})