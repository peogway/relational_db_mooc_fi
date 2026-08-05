const jwt = require('jsonwebtoken')
const { SECRET } = require('./config')

const tokenExtractor = (req, res, next) => {
	const authorization = req.get('Authorization') // Get Authorization header
	if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
		req.token = authorization.substring(7) // Extract the token from "Bearer <token>"
	} else {
		req.token = null // No token found
	}
	next() // Proceed to the next middleware
}

const userExtractor = (req, res, next) => {
	if (req.token) {
		const decodedToken = jwt.verify(req.token, SECRET)
		if (!decodedToken.id) {
			req.user = null
		} else {
			req.user = decodedToken
		}
	} else {
		req.user = null
	}

	next()
}

const errorHandler = (error, req, res, next) => {
	if (
		error.name === 'SequelizeValidationError' ||
		error.name === 'SequelizeUniqueConstraintError'
	) {
		return res.status(400).json({
			error: error.errors.map((e) => e.message),
		})
	}

	next(error)
}

const unknownEndpoint = (req, res) => {
	res.status(404).send({ error: 'unknown endpoint' })
}

module.exports = {
	tokenExtractor,
	userExtractor,
	errorHandler,
	unknownEndpoint,
}

