import Redis, { RedisOptions } from 'ioredis'
import { RoomMember } from '../types'

const redisOption: RedisOptions = {
	host: 'localhost',
	port: 6379
}

export const redis = new Redis(redisOption)

export async function getRoomMembers(pin: string) {
	const roomMemberString = await redis.get(pin)
	if (!roomMemberString) throw new Error('Room member not found')
	const roomMember: RoomMember[] = JSON.parse(roomMemberString)
	return roomMember
}

export async function initRoomMembers(pin: string, members: string[]) {
	const roomMembers: RoomMember[] = []
	members.forEach(member => roomMembers.push({ name: member, socketId: undefined }))

	await redis.set(pin, JSON.stringify(roomMembers))
}

export async function setName(pin: string, name: string, socketId: string) {
	const roomMembers = await getRoomMembers(pin)
	const memberIndex = roomMembers.findIndex(member => !member.socketId && member.name === name)
	roomMembers[memberIndex].socketId = socketId

	await redis.set(pin, JSON.stringify(roomMembers))
}
