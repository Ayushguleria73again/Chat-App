import dotenv from 'dotenv';
dotenv.config();

import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';
import { Server } from 'socket.io';
import connectDB from './src/lib/db';
import Message from './src/models/Message';


const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = parseInt(process.env.PORT || '3000', 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(async () => {
    await connectDB();
    console.log('Connected to MongoDB');

    const httpServer = createServer((req, res) => {
        const parsedUrl = parse(req.url!, true);
        handle(req, res, parsedUrl);
    });

    const io = new Server(httpServer);

    io.on('connection', (socket) => {
        console.log('Client connected:', socket.id);

        socket.on('join', (username: string) => {
            console.log(`${username} joined`);
            socket.data.username = username;
            // Broadcast to others that a user joined
            socket.broadcast.emit('user-joined', username);
        });

        socket.on('message', async (data: { text: string; user: string }) => {
            try {
                const newMessage = new Message({
                    user: data.user,
                    text: data.text,
                    createdAt: new Date(),
                });
                await newMessage.save();

                // Broadcast the message to all clients including sender
                io.emit('message', {
                    _id: newMessage._id,
                    user: newMessage.user,
                    text: newMessage.text,
                    createdAt: newMessage.createdAt,
                });
            } catch (error) {
                console.error('Error saving message:', error);
            }
        });

        socket.on('disconnect', () => {
            const username = socket.data.username;
            if (username) {
                console.log(`${username} disconnected`);
                socket.broadcast.emit('user-left', username);
            }
        });
    });

    httpServer.listen(port, () => {
        console.log(`> Ready on http://${hostname}:${port}`);
    });
});
