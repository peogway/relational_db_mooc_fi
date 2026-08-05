const express = require('express')
const app = express()
const middleware = require('./util/middleware')

const testsRouter = require('./controllers/tests')

const blogsRouter = require('./controllers/blogs')
const usersRouter = require('./controllers/users')
const loginRouter = require('./controllers/login')
const authorsRouter = require('./controllers/authors')

app.use(express.json())

app.use(middleware.tokenExtractor)

app.use('/', testsRouter)

app.use('/api/blogs', middleware.userExtractor, blogsRouter)
app.use('/api/authors', middleware.userExtractor, authorsRouter)
app.use('/api/users', usersRouter)
app.use('/api/login', loginRouter)

app.use(middleware.unknownEndpoint)
app.use(middleware.errorHandler)

module.exports = app

