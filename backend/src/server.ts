import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { setupSocketEvents } from './socket/socketHandlers';
import { roomManager } from './utils/roomManager';

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5002;

// API Routes
app.get('/api/rooms', (req, res) => {
  const rooms = roomManager.getAllRooms();
  res.json(rooms);
});

setupSocketEvents(io);

server.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
