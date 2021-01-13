import express, { Request, Response } from 'express'
import bodyParser from 'body-parser'
import { Room } from './model/Room'
import { generateId } from './util/nanoid'
import { Query } from 'mongoose'
import redis from './util/redis'

const app = express()

app.use(bodyParser.json())

type reqBodyFrom = {
	name: string
	members: string[]
}

interface RoomMember {
	name: string
	socketId?: string
	isIn: boolean
}

app.post('/api/room', async (req: Request<{}, {}, reqBodyFrom>, res: Response) => {
	const pin = generateId()
	const room = {
		...req.body,
		pin
	}
	await Room.create(room)

	const roomMembers: RoomMember[] = []
	room.members.forEach(member => roomMembers.push({ isIn: false, name: member, socketId: undefined }))
	await redis.set(pin, JSON.stringify(roomMembers))

	res.status(201).send(room)
})

app.get('/api/room/:pin', async (req, res) => {
	const { pin } = req.params
	const room = await Room.findOne({ pin })
	if (!room) return res.status(400).send({ error: 'Room not found' })

	const roomMemberString = await redis.get(pin)
	if (!roomMemberString) return res.status(400).send({ error: 'Room member not found' })
	const roomMember: RoomMember[] = JSON.parse(roomMemberString)

	res.send(roomMember)
})

export default app
