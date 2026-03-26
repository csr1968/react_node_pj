import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';

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
    <div style={styles.container}>
      <h1 style={styles.header}>채팅앱</h1>
      <div style={styles.chatBox}>
        {chatList.map((chat, index) => (
          <div key={index} style={styles.bubble}>  
            <p style={styles.bubbleText}>{chat.text}</p>
          </div>
        ))}
      </div>
      <div style={styles.inputArea}>
        <input
          style={styles.input}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="메시지 입력..."
        />
        <button style={styles.button} on Click={sendMessage}>전송</button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '600px',
    margin: '40px auto',
    fontFamily: 'sans-serif',
    display: 'flex',
    flexDirection: 'column',
    height: '90vh'
  },
  header: {
    textAlign: 'center',
    color: '#333',
    marginBottom: '10px',
  },
  chatBox: {
    flex: 1,
    overflowY: 'auto',
    border: '1px solid #ddd',
    borderRadius: '12px',
    padding: '16px',
    backgroudColor: '#f9f9f9',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  bubble: {
    alignSelf: 'flex-start',
    backgroudColor: '#fff',
    border: '1px solid #ddd',
    borderRadius: '18px',
    padding: '10px 16px',
    maxWidth: '70%',
    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
  },
  bubbleText: {
    margin: 0,
    fontSize: '15px',
    color: '#333',
  },
  inputArea: {
    display: 'flex',
    gap: '8px',
    marginTop: '12px',
  },
  input: {
    flex: 1,
    padding: '12px 16px',
    borderRadius: '24px',
    border: '1px solid #ddd',
    fontSize: '15px',
    outline: 'none',
  },
  button: {
    padding: '12px 20px',
    borderRadius: '24px',
    border: 'none',
    backgroundColor: '#4AF50',
    color: '#fff',
    fontSize: '15px',
    cursor: 'pointer',
  },
};

export default App;
