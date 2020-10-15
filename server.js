const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);

/** 
 * BodyParces is a package that makes it able to get data from POST form
 * https://www.npmjs.com/package/body-parser
 */
const bodyParser = require('body-parser')
app.use( bodyParser.json() );
const urlencodedParser = bodyParser.urlencoded({ extended: false })

app.set('view engine', 'ejs');
app.use(express.static('public'));

/******** Routes ***********/
app.get('/', (req, res) => {
	res.render('waiting-room');
});

app.post('/join-room', urlencodedParser, (req, res) => {
	res.redirect(`/${req.body.input}`)
});

app.get('/:room', (req, res) => {
	res.render('room', { roomId: req.params.room });
});

/** 
 * Socket.io is used to interact with public/script.js
 * https://www.npmjs.com/package/socket.io
 */
io.on('connection', socket => {
	socket.on('join-room', (roomId, userId) => {
		socket.join(roomId);
		socket.to(roomId).broadcast.emit('user-connected', userId);

		socket.on('disconnect', () => {
			socket.to(roomId).broadcast.emit('user-disconnected', userId);
		});
	});
});

server.listen(3000);
