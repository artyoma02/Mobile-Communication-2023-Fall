import React, { useState } from 'react';

function ImageInput({ onSend }) {
  const [image, setImage] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (image) {
      const formData = new FormData();
      formData.append('image', image);
  
      try {
        const response = await fetch('http://localhost:3002/upload', {
          method: 'POST',
          body: formData,
        });
  
        if (response.ok) {
          const data = await response.json();
          console.log('Image data:', data);
          onSend({ type: 'image', content: data.path });
        }
      } catch (error) {
        console.error('Error:', error);
      }
  
      setImage(null);
    }
  };
  

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="file"
        onChange={(e) => setImage(e.target.files[0])}
        accept="image/*"
        style={{ flex: '1' }}
      />
      <button type="submit">Send Picture</button>
    </form>
  );
}

export default ImageInput;
