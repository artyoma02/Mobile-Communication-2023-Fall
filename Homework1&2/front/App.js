import React, { useState, useEffect } from 'react';
import MessageInput from './components/MessageInput';
import ImageInput from './components/ImageInput';
import MessageDisplay from './components/MessageDisplay';
import './App.css';

function App() {
  const [messages, setMessages] = useState([]);
  const [images, setImages] = useState([]);
  const [wsText, setWsText] = useState(null);
  const [wsImage, setWsImage] = useState(null);


  useEffect(() => {
    // Establish WebSocket connection for text messages
    const newTextWs = new WebSocket('ws://localhost:3001');
    setupWebSocket(newTextWs, setWsText, 'new_message');

    // Establish WebSocket connection for images
    const newImageWs = new WebSocket('ws://localhost:3002');
    setupWebSocket(newImageWs, setWsImage, 'new_image');

    return () => {
      newTextWs.close();
      newImageWs.close();
    };
  }, []);

  const onSendImage = (newImage) => {
    console.log(newImage); // Log to check the image message structure
    setMessages([...messages, newImage]);
  };
  

  const setupWebSocket = (ws, setWsFunc, messageType) => {
    ws.onopen = () => console.log(`Connected to WebSocket on ${messageType}`);
    ws.onmessage = (event) => {
      if (event.data === messageType) {
        updateMessages();
      }
    };
    ws.onerror = (error) => console.error(`WebSocket error on ${messageType}:`, error);
    ws.onclose = () => console.log(`Disconnected from WebSocket on ${messageType}`);

    setWsFunc(ws);
  };

   const updateMessages = async () => {
    try {
      const textResponse = await fetch('http://localhost:3001/messages/last');
      const imageResponse = await fetch('http://localhost:3002/images/last');

      if (textResponse.ok) {
        const textData = await textResponse.json();
        if (textData && (!messages.length || messages[messages.length - 1]._id !== textData._id)) {
          setMessages([...messages, textData]);
        }
      }

      if (imageResponse.ok) {
        const imageData = await imageResponse.json();
        if (imageData && (!images.length || images[images.length - 1]._id !== imageData._id)) {
          setImages([...images, imageData]);
        }
      }
    } catch (error) {
      console.error('Error fetching the latest content:', error);
    }
  };

  return (
    <div className="App">
      <MessageInput ws={wsText} />
      <ImageInput onSend={onSendImage}/>
      <MessageDisplay messages={messages} images={images} />
    </div>
  );
}

export default App;
