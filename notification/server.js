require('dotenv').config({ path: '../backend/.env' });

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Create HTTP server from Express app
// Socket.io needs raw HTTP server not just Express
const server = http.createServer(app);

// Initialize Socket.io on the HTTP server
const io = new Server(server, {
  cors: {
    origin: '*', // allow all origins
    methods: ['GET', 'POST']
  }
});

// ─── TRACK CONNECTED CLIENTS ──────────────────────────
let connectedClients = 0;

// ─── SOCKET CONNECTION ────────────────────────────────
// This runs every time a browser connects
io.on('connection', (socket) => {
  connectedClients++;
  console.log(`Client connected. Total: ${connectedClients}`);

  // When client disconnects (closes tab etc.)
  socket.on('disconnect', () => {
    connectedClients--;
    console.log(`Client disconnected. Total: ${connectedClients}`);
  });
});

// ─── NOTIFICATION ENDPOINT ────────────────────────────
// Our main backend calls THIS endpoint when PO status changes
// Then we broadcast to all connected browsers
app.post('/notify/po-status', (req, res) => {
  const { referenceNo, oldStatus, newStatus, vendorName } = req.body;

  // Build notification object
  const notification = {
    type: 'PO_STATUS_CHANGE',
    message: `PO ${referenceNo} status changed from ${oldStatus} to ${newStatus}`,
    referenceNo,
    oldStatus,
    newStatus,
    vendorName,
    timestamp: new Date().toISOString()
  };

  // Broadcast to ALL connected clients
  // io.emit = send to everyone
  io.emit('po-notification', notification);

  console.log('Notification sent:', notification.message);

  res.status(200).json({
    success: true,
    message: 'Notification sent',
    connectedClients
  });
});

// ─── STATUS ENDPOINT ──────────────────────────────────
app.get('/status', (req, res) => {
  res.json({
    status: 'Notification server running',
    connectedClients,
    port: 5001
  });
});

// ─── START SERVER ─────────────────────────────────────
const PORT = 5001;
server.listen(PORT, () => {
  console.log(`🔔 Notification server running on http://localhost:${PORT}`);
});