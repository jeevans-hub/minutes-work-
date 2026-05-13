import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';
import { Server } from 'socket.io';

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  });

  const io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    }
  });

  // Make io available globally for API routes
  global.io = io;

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    socket.on('join_booking', (bookingId) => {
      socket.join(bookingId);
      console.log(`Socket ${socket.id} joined booking ${bookingId}`);
    });

    socket.on('join_user', (userId) => {
      socket.join(userId);
      console.log(`Socket ${socket.id} joined user room ${userId}`);
    });

    socket.on('send_message', (data) => {
      // Broadcast to all clients in the room
      io.to(data.bookingId).emit('receive_message', data);
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });

  const PORT = process.env.PORT || 3000;
  server.listen(PORT, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://localhost:${PORT}`);
  });
});
