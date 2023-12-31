import React, { useState } from 'react';

function MessageInput({ ws }) {
  const [text, setText] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (text.trim() && ws) {
      const message = { type: 'text', content: text.trim() };
      setText('');

      try {
        await fetch('http://localhost:3001/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(message),
        });
      } catch (error) {
        console.error('Error:', error);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <button type="submit">Send Message</button>
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Type a message"
      />
    </form>
  );
}

export default MessageInput;
