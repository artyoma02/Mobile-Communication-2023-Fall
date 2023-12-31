import React from 'react';

function MessageDisplay({ messages, images }) {
  const getImageUrl = (path) => {
    const normalizedPath = path.replace(/\\/g, '/');
    return `http://localhost:3002/${normalizedPath}`;
  };

  // Function to determine and display the latest entry
  const displayLatestEntry = () => {
    const latestMessage = messages[messages.length - 1];
    const latestImage = images[images.length - 1];

    // Determine which is newer based on createdAt timestamps
    if (latestMessage && (!latestImage || new Date(latestMessage.createdAt) > new Date(latestImage.createdAt))) {
      return <p>{latestMessage.content}</p>;
    } else if (latestImage) {
      return <img src={getImageUrl(latestImage.path)} alt="Latest Uploaded" style={{ maxWidth: '100%', height: 'auto' }} />;
    }
    return <p>No messages or images yet.</p>;
  };

  return (
    <div>
      {displayLatestEntry()}
    </div>
  );
}

export default MessageDisplay;
