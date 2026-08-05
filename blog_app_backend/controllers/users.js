const router = require('express').Router()
const bcrypt = require('bcrypt')

const { User, Blog } = require('../models')

router.get('/', async (req, res) => {
	const users = await User.findAll({
		include: {
			model: Blog,
			attributes: { exclude: ['user_id'] },
		},
	})
	res.json(users)
})

router.post('/', async (req, res) => {
	const { username, name, password } = req.body

	const saltRounds = 10
	const passwordHash = await bcrypt.hash(password, saltRounds)

	const user = await User.create({
		...req.body,
		password_hash: passwordHash,
	})
	res.json(user)
})

router.get('/:id', async (req, res) => {
	const user = await User.findByPk(req.params.id)
	if (user) {
		res.json(user)
	} else {
		res.status(404).end()
	}
})

router.put('/:username', async (req, res) => {
	const user = await User.findOne({
		where: { username: req.params.username },
	})
	if (!user) {
		return res.status(404).json({ error: 'User not found' })
	}

	await user.update({
		...req.body,
		updatedAt: new Date(),
	})
	return res.json(user)
})

module.exports = router

