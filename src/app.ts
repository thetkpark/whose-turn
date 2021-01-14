import express, { Request, Response } from 'express'
import bodyParser from 'body-parser'
import RoomModel from './model/Room'
import { generateId } from './util/nanoid'
import { getRoomMembers, initRoom } from './util/redis'
import cors from 'cors'
import { Room, RoomMember } from './types'

const app = express()

app.use(cors())
app.use(bodyParser.json())

type reqBodyCreateRoom = {
	name: string
	members: string[]
}

// type reqBodyJoinMember = {
//     name: string,

// }

app.post('/api/room', async (req: Request<{}, {}, reqBodyCreateRoom>, res: Response) => {
	try {
		const pin = generateId()

		const roomMembers: RoomMember[] = []
		req.body.members.forEach(member => roomMembers.push({ name: member, socketId: undefined }))

		const room: Room = {
			name: req.body.name,
			pin,
			members: roomMembers
		}
		await RoomModel.create(room)
		await initRoom(room)
		res.status(201).send(room)
	} catch (error) {
		res.status(500).send(error)
	}
})

app.get('/api/room/:pin', async (req, res) => {
	try {
		const { pin } = req.params
		const room = await RoomModel.findOne({ pin }).sort({ createAt: 'desc' })
		if (!room) return res.status(400).send({ error: 'Room not found' })
		console.log(room)
		const roomMember = await getRoomMembers(pin)

		res.send(roomMember)
	} catch (error) {
		res.status(500).send(error)
	}
})

// app.patch('/api/room/:pin', async (req, res) => {
//     const { pin } = req.params
// })

export default app
