const router = require('express').Router()

const { Blog, User } = require('../models')
const { Op } = require('sequelize')

const blogFinder = async (req, res, next) => {
	req.blog = await Blog.findByPk(req.params.id)
	if (!req.blog) {
		return res.status(404).json({ error: 'Blog not found' })
	}
	next()
}

router.get('/', async (req, res) => {
	// if (!req.user) {
	// 	return res.status(401).json({ error: 'Unauthorized' })
	// }

	// const user = await User.findByPk(req.user.id)
	// if (!user) {
	// 	return res.status(404).json({ error: 'User not found' })
	// }

	const where = {}
	if (req.query.search) {
		where[Op.or] = [
			{
				title: {
					[Op.iLike]: `%${req.query.search}%`,
				},
			},
			{
				author: {
					[Op.iLike]: `%${req.query.search}%`,
				},
			},
		]
	}

	const blogs = await Blog.findAll({
		attributes: { exclude: ['userId'] },
		include: {
			model: User,
			attributes: ['name'],
		},
		where,
		order: [['likes', 'DESC']],
	})
	res.json(blogs)
})

router.get('/:id', blogFinder, async (req, res) => {
	res.json(req.blog)
})

router.post('/', async (req, res) => {
	try {
		// if (!req.user) {
		// 	return res.status(401).json({ error: 'Unauthorized' })
		// }

		// const user = await User.findByPk(req.user.id)
		// if (!user) {
		// 	return res.status(404).json({ error: 'User not found' })
		// }

		const blog = await Blog.create({
			...req.body,
			userId: req.user.id,
		})

		return res.json(blog)
	} catch (error) {
		return res.status(400).json({ error })
	}
})

router.delete('/:id', blogFinder, async (req, res) => {
	try {
		if (!req.user) {
			return res.status(401).json({ error: 'Unauthorized' })
		}

		const user = await User.findByPk(req.user.id)
		if (!user) {
			return res.status(404).json({ error: 'User not found' })
		}

		if (req.blog.userId !== user.id) {
			return res.status(403).json({ error: 'Forbidden' })
		}

		await req.blog.destroy()
		return res.status(204).end()
	} catch (error) {
		return res.status(500).json({ error })
	}
})

router.put('/:id', blogFinder, async (req, res) => {
	try {
		// if (!req.user) {
		// 	return res.status(401).json({ error: 'Unauthorized' })
		// }

		// const user = await User.findByPk(req.user.id)
		// if (!user) {
		// 	return res.status(404).json({ error: 'User not found' })
		// }

		await req.blog.update(req.body)
		return res.json(req.blog)
	} catch (error) {
		return res.status(500).json({ error })
	}
})

module.exports = router

