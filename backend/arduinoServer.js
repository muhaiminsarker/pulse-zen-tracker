// backend/server.js

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');



const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

app.use(cors());
const PORT = 5000;

// COM3 is where my arduino is right now
const port = new SerialPort({ path: 'COM3', baudRate: 9600 });
const parser = port.pipe(new ReadlineParser({ delimiter: '\n' }));

let currentMode = 'sim'; // 'sim' or 'live'
let inSession = false;

// When UI connects
io.on('connection', (socket) => {
  console.log('Client connected');

  // Send initial state
  socket.emit('state', { mode: currentMode, inSession });

  // Handle mode toggle from frontend
  socket.on('setMode', (mode) => {
    if (mode === 'sim' || mode === 'live') {
      currentMode = mode;
      port.write(`mode:${mode}\n`);
      console.log(`Mode changed to: ${mode}`);
    }
  });

  // Handle session control
  socket.on('toggleSession', (status) => {
    inSession = status;
    const cmd = status ? 'start' : 'stop';
    port.write(`${cmd}\n`);
    console.log(`Session ${cmd}`);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

// Parse incoming serial messages from Arduino
parser.on('data', (data) => {
  data = data.trim();
  if (data.startsWith('BPM:')) {
    const bpm = parseInt(data.replace('BPM:', ''));
    if (!isNaN(bpm)) {
      io.emit('bpm', bpm);
      console.log(`Emitted BPM to UI: ${bpm}`);
    }
  } else {
    console.log('Serial:', data);
  }
});

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});