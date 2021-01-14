const socket = io('http://localhost:4050')
let current = 0
let myname = ''
let members = []

document.getElementById('get-room-btn').addEventListener('click', () => {
	const pin = document.getElementById('room-pin-input').value
	axios.get(`http://localhost:4050/api/room/${pin}`).then(res => {
		const avaliableUser = res.data.filter(member => !member.socketId)
		let htmlNameOption = ''
		avaliableUser.forEach(user => (htmlNameOption += `<option value="${user.name}">${user.name}</option>`))
		document.getElementById('select-name').innerHTML = htmlNameOption
	})
})

document.getElementById('join-btn').addEventListener('click', () => {
	const pin = document.getElementById('room-pin-input').value
	const name = document.getElementById('select-name').value
	myname = name
	socket.emit('set-name', pin, name)
	document.getElementById('start-btn').disabled = false
})

document.getElementById('start-btn').addEventListener('click', () => {
	socket.emit('start')
})

document.getElementById('next-btn').addEventListener('click', () => {
	socket.emit('next')
})

socket.on('user-join', (msg, roomMember) => {
	members = JSON.parse(roomMember)
	let memberList = ''
	members.forEach(member => {
		if (member.socketId) {
			memberList += `<div class="text-dark">${member.name} is here</div>`
		} else {
			memberList += `<div class="text-muted">${member.name}</div>`
		}
	})
	document.getElementById('member-display').innerHTML = memberList
})

socket.on('user-out', roomMember => {
	document.getElementById('display').textContent = roomMember
	members = JSON.parse(roomMember)
})

socket.on('start', () => {
	current = 1
	document.getElementById('display').textContent = getQ()
})

socket.on('next', number => {
	current = parseInt(number)
	document.getElementById('display').textContent = getQ()
})

socket.on('end', () => {
	document.getElementById('display').textContent = 'FINISHED'
})

socket.on('error', msg => {
	alert(msg)
})

function getQ() {
	const myIndex = members.findIndex(member => member.name === myname)
	if (myIndex === -1) {
		return `Error in q`
	} else if (current - 1 < myIndex) {
		document.getElementById('next-btn').disabled = true
		return `${myIndex - (current - 1)} more turn until your`
	} else if (current - 1 === myIndex) {
		document.getElementById('next-btn').disabled = false
		return `It's your turn now!`
	} else {
		document.getElementById('next-btn').disabled = true
		return `Your turn has passed`
	}
}
