require('dotenv').config()

module.exports = {
	DATABASE_URL: process.env.DATABASE_URL,
	PORT: process.env.PORT || 3001,
	SECRET: process.env.SECRET,
	TEST_DATABASE_URL: process.env.TEST_DATABASE_URL,
}

