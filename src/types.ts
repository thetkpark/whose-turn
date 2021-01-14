export interface RoomMember {
	name: string
	socketId?: string
	// isIn: boolean
}

export interface Room {
	name: string
	pin: string
	members: RoomMember[]
}
