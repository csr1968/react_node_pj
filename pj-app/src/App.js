import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import './App.css';

const socket = io('http://localhost:3000');

function App() {
  const [message, setMessage] = useState('');
  const [chatList, setChatList] = useState([]);

  useEffect(() => {
    socket.on('receive_message', (data) => {
      setChatList((prev) => [...prev, data]);
    });

    return () => {
      socket.off('receive_message');
    };
  }, []);

  const sendMessage = () => {
    if (message.trim() === '') return;
    socket.emit('send_message', { text: message });
    setMessage('');
  };

  return (
    <div className="container">
      <h1 className="header">채팅앱</h1>
      <div className="chat-box">
        {chatList.map((chat, index) => (
          <div key={index} className="bubble">  
            <p className="bubble-text">{chat.text}</p>
          </div>
        ))}
      </div>
      <div className="input-area">
        <input
          className="input"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="메시지 입력..."
        />
        <button className="button" onClick={sendMessage}>전송</button>
      </div>
    </div>
  );
}

export default App;
