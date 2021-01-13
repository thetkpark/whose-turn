const socket = io('http://localhost:4050')
let members = []
document.getElementById('join-btn').addEventListener('click', () => {
	const pin = document.getElementById('room-pin-input').value
	const name = document.getElementById('name-input').value
	console.log(pin)
	console.log(name)
	socket.emit('set-name', pin, name)
})

document.getElementById('start-btn').addEventListener('click', () => {
	socket.emit('start')
})

socket.on('user-join', (msg, roomMember) => {
	console.log('Recieved')
	document.getElementById('display').textContent = msg + ' ' + roomMember
	members = roomMember
	console.log(msg + ' ' + roomMember)
})

socket.on('start', () => {
	document.getElementById('display').textContent = members
})
