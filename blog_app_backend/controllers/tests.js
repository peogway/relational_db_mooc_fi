const router = require('express').Router()

const { User, Blog } = require('../models')

router.post('/api/reset', async (req, res) => {
	await Blog.destroy({ where: {} })
	await User.destroy({ where: {} })

	res.status(204).end()
})

router.get('/', (req, res) => {
	res.sendStatus(200)
})

module.exports = router

