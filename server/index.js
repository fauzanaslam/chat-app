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
        origin: ["https://chat-app-blush-rho-98.vercel.app"],
        methods: ["GET", "POST"],
    }
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

const port = process.env.PORT || 3001;

server.listen(port, () => {
    console.log(`SERVER RUNNING ON ${port}`);
});