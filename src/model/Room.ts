import { Schema, model } from 'mongoose'

const roomSchema = new Schema({
	name: String,
	members: [String],
	createAt: {
		type: Date,
		default: Date.now()
	}
})

export const Room = model('room', roomSchema)
