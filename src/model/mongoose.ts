import { connect } from 'mongoose'
import { config } from 'dotenv'

config()

export async function establishDbConnection() {
	try {
		await connect(process.env.MONGO_CONNECTION_STRING as string, {
			useNewUrlParser: true,
			useUnifiedTopology: true,
			useFindAndModify: false,
			useCreateIndex: true
		})
		console.log('Mongo Atlas is connected')
	} catch (error) {
		throw new Error('Connection to Mongo Atlas is not establish successfully')
	}
}
