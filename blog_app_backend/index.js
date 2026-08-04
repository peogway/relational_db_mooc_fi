require('dotenv').config()
const { Sequelize, Model, DataTypes } = require('sequelize')
const express = require('express')
const app = express()
app.use(express.json())

const sequelize = new Sequelize(process.env.DATABASE_URL, {
	dialectOptions: {
		ssl: {
			require: true,
			rejectUnauthorized: false,
		},
	},
})

class Blogs extends Model {}
Blogs.init(
	{
		id: {
			type: DataTypes.INTEGER,
			primaryKey: true,
			autoIncrement: true,
		},
		author: {
			type: DataTypes.TEXT,
		},
		url: {
			type: DataTypes.TEXT,
			allowNull: false,
		},
		title: {
			type: DataTypes.TEXT,
			allowNull: false,
		},
		likes: {
			type: DataTypes.INTEGER,
			defaultValue: 0,
		},
	},
	{
		sequelize,
		underscored: true,
		timestamps: false,
		modelName: 'blog',
	},
)
Blogs.sync()

app.get('/api/blogs', async (req, res) => {
	const blogs = await Blogs.findAll()
	res.json(blogs)
})

app.post('/api/blogs', async (req, res) => {
	try {
		// const blog = Blogs.build(req.body)
		// await blog.save()
		const blog = await Blogs.create({ ...req.body })
		return res.json(blog)
	} catch (error) {
		return res.status(400).json({ error })
	}
})

app.delete('/api/blogs/:id', async (req, res) => {
	try {
		const blog = await Blogs.findByPk(req.params.id)
		if (!blog) {
			return res.status(404).json({ error: 'Blog not found' })
		}
		await blog.destroy()
		return res.status(204).end()
	} catch (error) {
		return res.status(500).json({ error })
	}
})

app.put('/api/blogs/:id', async (req, res) => {
	try {
		const blog = await Blogs.findByPk(req.params.id)
		if (!blog) {
			return res.status(404).json({ error: 'Blog not found' })
		}
		await blog.update(req.body)
		return res.json(blog)
	} catch (error) {
		return res.status(500).json({ error })
	}
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`)
})

