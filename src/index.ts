import { createServer } from 'http'
import { Server, Socket } from 'socket.io'
import app from './app'
import { establishDbConnection } from './model/mongoose'
import { setName } from './util/redis'

const port = process.env.PORT || 4050

const httpServer = createServer(app)
const io = new Server(httpServer, {
	cors: {
		origin: '*'
	}
})

io.on('connection', (socket: Socket) => {
	console.log(`${socket.id} connected`)
	socket.on('set-name', async (pin: string, name: string) => {
		await setName(pin, name, socket.id)
	})
})

establishDbConnection()
	.then(() => {
		httpServer.listen(port, () => {
			console.log(`Running on ${port}`)
		})
	})
	.catch(err => {
		console.error(err)
	})
