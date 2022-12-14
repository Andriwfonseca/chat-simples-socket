const express = require('express');
const path = require('path');
const http = require('http');
const socketIO = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

server.listen(3000);

app.use(express.static(path.join(__dirname, '../public')));

let connectedUsers = [];

io.on('connection', (socket) =>{
    console.log("Conexão detectada...");

    //ao receber a msg 'join-request'
    socket.on('join-request', (username)=>{
        socket.username = username;
        connectedUsers.push(username);
        console.log(connectedUsers);

        //manda a msg 'user-ok' para o usuario
        socket.emit('user-ok', connectedUsers);

        //manda a msg pra todo mundo, menos para o usuario
        socket.broadcast.emit('list-update',{
            joined: username,
            list: connectedUsers
        });
    });

    //remover usuario ao desconectar
    socket.on('disconnect', ()=>{
        connectedUsers = connectedUsers.filter(u => u != socket.username);

        socket.broadcast.emit('list-update', {
            left: socket.username,
            list: connectedUsers
        });
    });

    socket.on('send-msg', (txt)=>{
        let obj = {
            username: socket.username,
            message: txt
        };

        socket.broadcast('show-msg', obj);
    });
});