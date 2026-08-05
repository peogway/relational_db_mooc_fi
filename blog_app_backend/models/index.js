const Blog = require('./blog')
const User = require('./user')

Blog.belongsTo(User)
User.hasMany(Blog)

Blog.sync({ alter: true })
User.sync({ alter: true })

module.exports = {
	Blog,
	User,
}

