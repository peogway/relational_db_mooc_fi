const jwt = require('jsonwebtoken')
const { SECRET } = require('./config')

const tokenExtractor = (req, res, next) => {
	const authorization = req.get('authorization')
	if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
		try {
			req.decodedToken = jwt.verify(authorization.substring(7), SECRET)
		} catch {
			return res.status(401).json({ error: 'token invalid' })
		}
	} else {
		return res.status(401).json({ error: 'token missing' })
	}
	next()
}

const userExtractor = (req, res, next) => {
	if (req.decodedToken) {
		const decodedToken = jwt.verify(req.token, process.env.SECRET)
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

