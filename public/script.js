const socket = io('/');
const videoGrid = document.getElementById('video-grid');

/**
 * PeerJs
 * https://peerjs.com/
 */
/* const myPeer = new Peer(undefined, {
	host: 'https://shrouded-waters-30838.herokuapp.com/',
	port: '3001',
}); */

const myPeer = new Peer(undefined, {
	host: '/',
	port: '3001',
});

const myVideo = document.createElement('video');
myVideo.muted = true;
myVideo.className = 'video';
const peers = {};

// navigator.mediaDevices.getUserMedia() will give the browser access to the microphone and camera
navigator.mediaDevices.getUserMedia({
	video: true,
	audio: true
}).then(stream => {
	addVideoStream(myVideo, stream);

	myPeer.on('call', call => {
		call.answer(stream);
		const video = document.createElement('video');
		call.on('stream', userVideoStream => {
			addVideoStream(video, userVideoStream);
		});
	});

	socket.on('user-connected', userId => {
		connectToNewUser(userId, stream);
	});
});

socket.on('user-disconnected', userId => {
	if (peers[userId]) peers[userId].close();
});

myPeer.on('open', id => {
	socket.emit('join-room', ROOM_ID, id);
});

/**
 * addVideoStream() receive the peers camera images and makes the video play when displayed.
 * and it appends the video to the Grid in views/room.ejs
 */
function addVideoStream(video, stream) {
	video.srcObject = stream;
	video.addEventListener('loadedmetadata', () => {
		video.play();
	});
	videoGrid.append(video);
}

/**
 * connectToNewUser() creates a call object to listen to the events. within this function we call on addVideoStream()
 * when clossing the call, we remove the video element.
 */
function connectToNewUser(userId, stream) {
	const call = myPeer.call(userId, stream);
	const video = document.createElement('video');
	call.on('stream', userVideoStream => {
		addVideoStream(video, userVideoStream);
	});
	call.on('close', () => {
		video.remove();
	});

	peers[userId] = call;
}
