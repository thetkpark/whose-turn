import express, { Request, Response } from 'express'
import bodyParser from 'body-parser'
import { Room } from './model/Room'
import { generateId } from './util/nanoid'
import { getRoomMembers, initRoomMembers } from './util/redis'
import { RoomMember } from './types'

const app = express()

app.use(bodyParser.json())

type reqBodyCreateRoom = {
	name: string
	members: string[]
}

// type reqBodyJoinMember = {
//     name: string,

// }

app.post('/api/room', async (req: Request<{}, {}, reqBodyCreateRoom>, res: Response) => {
	const pin = generateId()
	const room = {
		...req.body,
		pin
	}
	await Room.create(room)

	await initRoomMembers(pin, room.members)

	res.status(201).send(room)
})

app.get('/api/room/:pin', async (req, res) => {
	const { pin } = req.params
	const room = await Room.findOne({ pin })
	if (!room) return res.status(400).send({ error: 'Room not found' })

	const roomMember = await getRoomMembers(pin)

	res.send(roomMember)
})

// app.patch('/api/room/:pin', async (req, res) => {
//     const { pin } = req.params
// })

export default app
