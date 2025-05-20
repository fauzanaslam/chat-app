import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import cors from 'cors'
import {
    userJoin,
    formatMessage,
    botName,
    getRoomUsers,
    userLeave,
    getCurrentUser
} from "./utils.js";

const app = express();

const server = createServer(app);

const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"],
        credentials: true,
    },
});

io.on("connection", (socket) => {
    socket.on("joinRoom", (payload) => {
        const user = userJoin({ ...payload, id: socket.id });
        socket.join(user.room);
        console.log("IN Join Room Event");
        socket.broadcast
            .to(user.room)
            .emit(
                "message",
                formatMessage(botName, `${user.username} has joined the chat`)
            );

        io.to(user.room).emit("roomUsers", {
            room: user.room,
            users: getRoomUsers(user.room),
        });
    });

    socket.on('chatMessage', (msg) => {

        const user = getCurrentUser(socket.id)
        if (user) {
            io.to(user.room).emit('message', formatMessage(user.username, msg))
        }

    })
    socket.on("disconnect", () => {
        const user = userLeave(socket.id);
        if (user) {
            io.to(user.room).emit(
                "message",
                formatMessage(botName, `${user.username} has left the chat`)
            );
            io.to(user.room).emit("roomUsers", {
                room: user.room,
                users: getRoomUsers(user.room),
            });
        }
    });
});

io.on('connection', (socket) => {
    console.log(`User Connected: ${socket.id}`);

    // socket.on('join_room', (data) => {
    //     socket.join(data);
    //     console.log(`User with ID: ${socket.id} joined room: ${data}`);
    // });

    // socket.on('send_message', (data) => {
    //     socket.to(data.room).emit('receive_message', data);
    // });

    // socket.on('disconnect', () => {
    //     console.log('User Disconnected', socket.id);
    // });
});

const port = process.env.PORT || 3001;

server.listen(port, () => {
    console.log(`SERVER RUNNING ON ${port}`);
});