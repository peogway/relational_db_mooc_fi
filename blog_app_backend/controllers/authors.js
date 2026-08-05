const router = require('express').Router()

const { Blog, User } = require('../models')
const { Op } = require('sequelize')
const { sequelize } = require('../util/db')

router.get('/', async (req, res) => {
	if (!req.user) {
		return res.status(401).json({ error: 'Unauthorized' })
	}

	const user = await User.findByPk(req.user.id)
	if (!user) {
		return res.status(404).json({ error: 'User not found' })
	}

	const authors = await Blog.findAll({
		attributes: [
			'author',
			[sequelize.fn('COUNT', sequelize.col('id')), 'blogs'],
			[sequelize.fn('SUM', sequelize.col('likes')), 'likes'],
		],
		group: ['author'],
		order: [[sequelize.fn('SUM', sequelize.col('likes')), 'DESC']],
	})

	res.json(authors)
})

module.exports = router

