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

const main = async () => {
	try {
		await sequelize.authenticate()
		const blogs = await Blogs.findAll()
		blogs.map((blog) => {
			console.log(`${blog.author}: ${blog.title}, ${blog.likes} likes`)
		})
		sequelize.close()
	} catch (error) {
		console.error('Unable to connect to the database:', error)
	}
}

main()

