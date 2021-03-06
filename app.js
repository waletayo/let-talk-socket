/*
 * let talk
 * Developed By tayot51@gmail.com
 */
const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const port = process.env.PORT || 5000;

const clients = {};
app.get('/', function (req, res) {
    res.sendFile(__dirname + '/chat.html');
});
app.use('/cdn', express.static('cdn'));
io.on('connection', function (socket) {
    socket.on('add-user', function (data) {
        var user = {socketId: socket.id, name: data.name, color: data.color, nickname: data.name.substring(0, 1)}
        io.sockets.connected[socket.id].emit('welcome', user);
        clients[socket.id] = user;
        io.emit('ping msg', data.name + ' joined room');
        io.emit('client list', clients);
    });
    socket.on('send-msg', function (data) {
        var array = {sendTo: data.sendTo, sendFrom: socket.id, message: data.message};
        if (data.sendTo == 'overall') {
            array['group'] = 'overall';
            io.emit('chat-message', array);
        } else {
            array['group'] = socket.id;
            io.sockets.connected[data.sendTo].emit('chat-message', array);
            array['group'] = data.sendTo;
            io.sockets.connected[socket.id].emit('chat-message', array);
        }
    });
    socket.on('disconnect', function () {
        for (var socketId in clients) {
            if (socketId === socket.id) {
                console.log('left', clients[socketId]);
                io.emit('ping msg', clients[socketId].name + ' left room');
                delete clients[socketId];
                break;
            }
        }
        io.emit('client list', clients);
    })
});

http.listen(port, function () {
    console.log('listening on *:' + port);
});
