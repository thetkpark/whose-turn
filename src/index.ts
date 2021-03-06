import { createServer } from 'http'
import { Server, Socket } from 'socket.io'
import app from './app'
import { establishDbConnection } from './model/mongoose'
import {
	setName,
	setJoinUser,
	getUserRoomPin,
	getRoomCount,
	setRoomCount,
	getRoomMembers,
	removeDisconnectUser
} from './util/redis'

const port = process.env.PORT || 4050

const httpServer = createServer(app)
const io = new Server(httpServer, {
	cors: {
		origin: '*'
	}
})

io.on('connection', (socket: Socket) => {
	// console.log(`${socket.id} connected`)
	socket.on('set-name', async (pin: string, name: string) => {
		const roomMembers = await getRoomMembers(pin)
		const nameIsUsed = roomMembers.some(member => member.name === name && member.socketId)
		if (!nameIsUsed) {
			const roomMemberString = await setName(pin, name, socket.id)
			await setJoinUser(pin, socket.id)
			socket.join(pin)
			socket.emit('user-join', `${name} has join the room`, roomMemberString)
			socket.broadcast.to(pin).emit('user-join', `${name} has join the room`, roomMemberString)
		} else {
			socket.emit('error', `${name} is in use`)
		}
	})

	socket.on('start', async () => {
		const roomPin = await getUserRoomPin(socket.id)
		const roomMember = await getRoomMembers(roomPin)
		if (roomMember.every(member => member.socketId)) {
			await setRoomCount(roomPin, 1)
			// console.log('Start' + roomPin)
			socket.emit('start')
			socket.broadcast.to(roomPin).emit('start')
		} else {
			socket.emit('error', 'Not every member has joined')
		}
	})

	socket.on('next', async () => {
		const roomPin = await getUserRoomPin(socket.id)
		const roomMember = await getRoomMembers(roomPin)
		let roomCount = await getRoomCount(roomPin)
		if (roomMember[roomCount - 1].socketId === socket.id) {
			roomCount += 1
			if (roomCount <= roomMember.length) {
				// Keep going
				socket.emit('next', roomCount)
				socket.broadcast.to(roomPin).emit('next', roomCount)
				await setRoomCount(roomPin, roomCount)
			} else {
				socket.emit('end')
				socket.broadcast.to(roomPin).emit('end')
			}
		}
	})

	socket.on('disconnect', async () => {
		const rooms = await removeDisconnectUser(socket.id)
		if (rooms) socket.broadcast.to(rooms.roomPin).emit('user-out', rooms.roomMembersString)
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
