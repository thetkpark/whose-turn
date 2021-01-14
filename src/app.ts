import express, { Request, Response } from 'express'
import bodyParser from 'body-parser'
import RoomModel from './model/Room'
import { generateId } from './util/nanoid'
import { getRoom, getRoomMembers, initRoom, isPinUnique } from './util/redis'
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
		let pin: string = ''
		let unique = false
		while (!unique) {
			pin = generateId()
			unique = await isPinUnique(pin)
		}

		const roomMembers: RoomMember[] = []
		req.body.members.forEach(member => roomMembers.push({ name: member, socketId: undefined }))

		const room: Room = {
			name: req.body.name,
			pin,
			members: roomMembers
		}
		await Promise.all([
			RoomModel.create({
				...req.body,
				pin
			}),
			initRoom(room)
		])
		res.status(201).send(room)
	} catch (error) {
		res.status(500).send(error)
	}
})

app.get('/api/room/:pin', async (req, res) => {
	try {
		const { pin } = req.params
		const room = await getRoom(pin)
		if (!room) return res.status(400).send({ error: 'Room not found' })
		res.send(room)
	} catch (error) {
		res.status(500).send(error)
	}
})

export default app
