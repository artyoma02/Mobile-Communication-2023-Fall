const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const WebSocket = require('ws');

const CryptoJS = require("crypto-js");

// Secret key for AES. In a real application, store this securely and keep it secret.
const SECRET_KEY = 'xaxpaglbrdm';

const encryptText = (plainText) => {
    return CryptoJS.AES.encrypt(plainText, SECRET_KEY).toString();
};

const decryptText = (cipherText) => {
    const bytes = CryptoJS.AES.decrypt(cipherText, SECRET_KEY);
    return bytes.toString(CryptoJS.enc.Utf8);
};

const app = express();
const PORT = 3002;

app.use(bodyParser.json());
app.use(cors());

mongoose.connect('mongodb://127.0.0.1:27017/xerisdb', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('Could not connect to MongoDB', err));

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

const multer = require('multer');
const upload = multer({ dest: 'uploads/' }); // Adjust the destination as needed


const Image = require('./models/image'); // Import the Image model

app.post('/upload', upload.single('image'), async (req, res) => {
  try {
    const imagePath = req.file.path; // The path to the saved image
    const newImage = new Image({ path: imagePath });
    await newImage.save();

    res.status(201).json({ message: 'Image uploaded successfully', path: imagePath });

    // Broadcast to all clients
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send('new_image');
      }
    });
  } catch (error) {
    res.status(500).send(error);
  }
});

app.get('/images/last', async (req, res) => {
    try {
      const lastImage = await Image.findOne().sort({ createdAt: -1 });
      if (lastImage) {
        res.status(200).json(lastImage);
      } else {
        res.status(404).send('No images found');
      }
    } catch (error) {
      res.status(500).send(error);
    }
  });

    const path = require('path');

  
  app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
