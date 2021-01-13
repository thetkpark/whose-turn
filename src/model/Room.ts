import { Schema, model, Document } from 'mongoose'

interface IRoom {
	name: String
	members: [String]
	pin: String
	createAt: Date
}

interface IRoomDoc extends IRoom, Document {}

const roomSchemaField: Record<keyof IRoom, any> = {
	name: String,
	members: [String],
	pin: String,
	createAt: {
		type: Date,
		default: Date.now()
	}
}

const roomSchema = new Schema(roomSchemaField)

export const Room = model<IRoomDoc>('room', roomSchema)
