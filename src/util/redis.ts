import Redis, { RedisOptions } from 'ioredis'
import { RoomMember } from '../types'

const redisOption: RedisOptions = {
	host: 'localhost',
	port: 6379
}

const redis = new Redis(redisOption)

export async function getRoomMembers(pin: string) {
	const roomMemberString = await redis.get(`${pin}_member`)
	if (!roomMemberString) throw new Error('Room member not found')
	const roomMember: RoomMember[] = JSON.parse(roomMemberString)
	return roomMember
}

export async function initRoomMembers(pin: string, members: string[]) {
	const roomMembers: RoomMember[] = []
	members.forEach(member => roomMembers.push({ name: member, socketId: undefined }))

	await redis.set(`${pin}_member`, JSON.stringify(roomMembers))
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
