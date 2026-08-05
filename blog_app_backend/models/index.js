const Blog = require('./blog')
const User = require('./user')

Blog.belongsTo(User)
User.hasMany(Blog)

User.sync({ alter: true })
Blog.sync({ alter: true })

module.exports = {
	Blog,
	User,
}

