const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const WebSocket = require('ws');
const Message = require('./models/message'); // Assuming you have a Message model

const app = express();
const PORT = process.env.PORT || 3001;

app.use(bodyParser.json());
app.use(cors());

mongoose.connect('mongodb://127.0.0.1:27017/xerisdb', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('Could not connect to MongoDB', err));

// WebSocket server setup
const wss = new WebSocket.Server({ noServer: true });

wss.on('connection', (ws) => {
    console.log('New client connected');
  
    ws.isAlive = true;
  
    ws.on('pong', () => {
      ws.isAlive = true;
    });
  
    ws.on('close', () => {
      console.log('Client has disconnected');
    });
  });
  
  // Ping connected clients every 30 seconds
  setInterval(() => {
    wss.clients.forEach((ws) => {
      if (!ws.isAlive) return ws.terminate();
  
      ws.isAlive = false;
      ws.ping(null, false);
    });
  }, 30000);
  

const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

server.on('upgrade', (request, socket, head) => {
  wss.handleUpgrade(request, socket, head, (ws) => {
    wss.emit('connection', ws, request);
  });
});

// POST endpoint for new messages
app.post('/messages', async (req, res) => {
  try {
    const message = new Message(req.body);
    await message.save();
    res.status(201).json(message);

    // Broadcast to all clients
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send('new_message');
      }
    });
  } catch (error) {
    res.status(500).send(error);
  }
});

// GET endpoint for last message
app.get('/messages/last', async (req, res) => {
  try {
    const message = await Message.findOne().sort({ createdAt: -1 });
    res.status(200).json(message);
  } catch (error) {
    res.status(500).send(error);
  }
});
