import { createServer } from 'http'
import { Server, Socket } from 'socket.io'
import app from './app'
import { establishDbConnection } from './model/mongoose'
import { setName, setJoinUser, getUserRoomPin } from './util/redis'

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
		const roomMember = await setName(pin, name, socket.id)
		await setJoinUser(pin, socket.id)
		socket.join(pin)
		socket.emit('user-join', `${name} has join the room`, roomMember)
		socket.broadcast.to(pin).emit('user-join', `${name} has join the room`, roomMember)
	})

	socket.on('start', async () => {
		const roomPin = await getUserRoomPin(socket.id)
		console.log('Start from ' + roomPin)
		socket.broadcast.to(roomPin).emit('start')
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
