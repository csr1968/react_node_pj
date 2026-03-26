const express = require('express');
const http = require('http');
const {Server} = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://localhost:3001",
        methods: ["GET", "POST"]
    }
});

io.on('connection', (socket) =>{
    console.log('유저 접속:', socket.id);

    socket.on('send_message', (data) => {
        console.log('메시지 수신:', data);
        io.emit('receive_message', data);
    });

    socket.on('disconnect', () => {
        console.log('유저 퇴장:', socket.id);
    });
});

server.listen(3000, () => {
    console.log('서버 실행 중 - 포트 3000');
});