import { createServer } from 'http'
import { Server, Socket } from 'socket.io'
import app from './app'

const port = process.env.PORT || 4050

const httpServer = createServer(app)
const io = new Server(httpServer, {
	cors: {
		origin: '*'
	}
})

io.on('connection', (socket: Socket) => {
	// ...
	console.log(`${socket.id} connected`)
	socket.on('create', msg => {
		console.log(`${msg}`)
	})
})

httpServer.listen(port, () => {
	console.log(`Running on ${port}`)
})
