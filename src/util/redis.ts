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
	await redis.set(room.pin, JSON.stringify(room))
	await redis.set(`${room.pin}_member`, JSON.stringify(room.members))
}

export async function getRoom(pin: string): Promise<Room | null> {
	const roomString = await redis.get(pin)
	if (!roomString) return null
	return JSON.parse(roomString)
}

export async function getRoomMembers(pin: string) {
	const roomMemberString = await redis.get(`${pin}_member`)
	if (!roomMemberString) throw new Error('Room member not found')
	const roomMember: RoomMember[] = JSON.parse(roomMemberString)
	return roomMember
}

export async function setName(pin: string, name: string, socketId: string) {
	const roomMembers = await getRoomMembers(pin)
	const memberIndex = roomMembers.findIndex(member => member.name === name)
	roomMembers[memberIndex].socketId = socketId
	const roomMembersString = JSON.stringify(roomMembers)
	await redis.set(`${pin}_member`, roomMembersString)
	return roomMembersString
}

export async function setJoinUser(pin: string, socketId: string) {
	await redis.set(socketId, pin)
}

export async function removeDisconnectUser(socketId: string) {
	const roomPin = await redis.get(socketId)
	if (!roomPin) return null
	const roomMembers = await getRoomMembers(roomPin)
	const memberIndex = roomMembers.findIndex(member => member.socketId === socketId)
	roomMembers[memberIndex].socketId = undefined
	const roomMembersString = JSON.stringify(roomMembers)
	await redis.set(`${roomPin}_member`, roomMembersString)
	return { roomMembersString, roomPin }
}

export async function getUserRoomPin(socketId: string) {
	const roomPin = await redis.get(socketId)
	if (!roomPin) throw new Error('Room not found for this user')
	return roomPin
}

export async function setRoomCount(pin: string, count: number) {
	await redis.set(`${pin}_count`, count)
}

export async function getRoomCount(pin: string) {
	const count = await redis.get(`${pin}_count`)
	if (!count) throw new Error('Count is not found')
	return parseInt(count)
}
