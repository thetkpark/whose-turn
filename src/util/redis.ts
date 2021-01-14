import Redis, { RedisOptions } from 'ioredis'
import { Room, RoomMember } from '../types'

const redisOption: RedisOptions = {
	host: 'localhost',
	port: 6379
}

const redis = new Redis(redisOption)

export async function isPinUnique(pin: string) {
	const existingPin = await redis.get(pin)
	return !existingPin ? true : false
}

export async function initRoom(room: Room) {
	await redis.set(room.pin, JSON.stringify(room), 'EX', 86400)
	// await redis.set(`${room.pin}_member`, JSON.stringify(room.members))
}

export async function getRoom(pin: string): Promise<Room | null> {
	const roomString = await redis.get(pin)
	if (!roomString) return null
	return JSON.parse(roomString)
}

export async function getRoomMembers(pin: string) {
	const roomString = await redis.get(pin)
	if (!roomString) throw new Error('Room not found')
	const room: Room = JSON.parse(roomString)
	return room.members
}

export async function setName(pin: string, name: string, socketId: string) {
	const room = await getRoom(pin)
	if (!room) throw new Error('Room not found')
	const memberIndex = room.members.findIndex(member => member.name === name)
	room.members[memberIndex].socketId = socketId
	const roomString = JSON.stringify(room)
	await redis.set(pin, roomString, 'EX', 86400)
	return JSON.stringify(room.members)
}

export async function setJoinUser(pin: string, socketId: string) {
	await redis.set(socketId, pin, 'EX', 86400)
}

export async function removeDisconnectUser(socketId: string) {
	const roomPin = await redis.get(socketId)
	if (!roomPin) return null
	const room = await getRoom(roomPin)
	if (!room) throw new Error('Room not found')
	const memberIndex = room.members.findIndex(member => member.socketId === socketId)
	room[memberIndex].socketId = undefined
	const roomString = JSON.stringify(room)
	await redis.set(roomPin, roomString, 'EX', 86400)

	const roomMembersString = JSON.stringify(room.members)
	return { roomMembersString, roomPin }
}

export async function getUserRoomPin(socketId: string) {
	const roomPin = await redis.get(socketId)
	if (!roomPin) throw new Error('Room not found for this user')
	return roomPin
}

export async function setRoomCount(pin: string, count: number) {
	await redis.set(`${pin}_count`, count, 'EX', 86400)
}

export async function getRoomCount(pin: string) {
	const count = await redis.get(`${pin}_count`)
	if (!count) throw new Error('Count is not found')
	return parseInt(count)
}
