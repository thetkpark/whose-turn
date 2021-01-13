const socket = io('http://localhost:4050')
let current = 0
let myname = ''
let members = []
// document.getElementById('next-btn').disabled = true
document.getElementById('join-btn').addEventListener('click', () => {
	const pin = document.getElementById('room-pin-input').value
	const name = document.getElementById('name-input').value
	myname = name
	socket.emit('set-name', pin, name)
})

document.getElementById('start-btn').addEventListener('click', () => {
	current = 1
	document.getElementById('display').textContent = JSON.stringify(members[current - 1])
	socket.emit('start')
})

document.getElementById('next-btn').addEventListener('click', () => {
	socket.emit('next')
})

socket.on('user-join', (msg, roomMember) => {
	console.log('Recieved')
	document.getElementById('display').textContent = msg + ' ' + roomMember
	members = JSON.parse(roomMember)
})

socket.on('start', () => {
	current = 1
	document.getElementById('display').textContent = JSON.stringify(members[current - 1])
	if (members[current - 1].name === myname) document.getElementById('next-btn').disabled = false
})

socket.on('next', number => {
	console.log('next')
	current = parseInt(number)
	console.log(current)
	document.getElementById('display').textContent = JSON.stringify(members[current - 1])
	if (members[current - 1].name === myname) document.getElementById('next-btn').disabled = false
})

socket.on('end', () => {
	document.getElementById('display').textContent = 'FINISHED'
})
