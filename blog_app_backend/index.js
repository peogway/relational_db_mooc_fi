const app = require('./app')
const { PORT } = require('./utils/config')
const { connectToDatabase } = require('./utils/db')
const { syncModels } = require('./models')

const start = async () => {
	await connectToDatabase()
	await syncModels()

	app.listen(PORT, () => {
		console.log(`Server running on port ${PORT}`)
	})
}

start()
