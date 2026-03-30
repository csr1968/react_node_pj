import React, { useState, useEffect, useRef } from 'react';
import '../App.css';
import io from 'socket.io-client';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/sidebar'


const socket = io(window.location.origin);

function App() {
  // localStorage에서 토큰과 유저명 가져오기
  const token    = localStorage.getItem('token');
  const username = localStorage.getItem('username');
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      navigate('/');
    }
  }, []);

  // message: 입력창에 현재 타이핑 중인 텍스트
  const [message, setMessage] = useState('');
  
  // chatList: 화면에 표시할 메세지 목록, 'me'이면 내 메세지, 'ai'면 ai 메세지
  const [chatList, setChatList] = useState([
    {sender:'ai', text: '안녕하세요. 궁금한것을 물어보세요!!'}
  ]);

  // isloading: Ai가 답변중일 때 로딩 애니메이션
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const chatBottomRef = useRef(null);

  useEffect(() => {
    socket.on('receive_message', (data) => {
      setChatList((prev) => [...prev, data]);
      setIsLoading(false);
    });

    socket.on('notice', (data) => {
      setChatList((prev) => [...prev, { sender: 'notice', text: data.text }]);
    })

    return () => {
      socket.off('receive_message');
    };
  }, []);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatList, isLoading]);

  const sendMessage = () => {
    //빈 메세지는 전송 안함
    if (message.trim() === '') return;
    
    // 내 메시지를 chatList에 추가
    const myMessage = { sender: 'me', text:message };
    setChatList((prev) => [...prev, myMessage])

    socket.emit('send_message', { text:message });

    // 입력창을 비우고
    setMessage('');

    // 로딩 애니메이션 켜기
    setIsLoading(true);
  };

  return (
  <div className="page-container">

    {/* 사이드바 컴포넌트 */}
    <Sidebar
      isOpen={isSidebarOpen}
      onClose={() => setIsSidebarOpen(false)}
    />

    <div className="app-container">

      {/* 상단 헤더 */}
      <div className="header">

        {/* 햄버거 버튼 - 클릭하면 사이드바 열림 */}
        <button
          className="hamburger-button"
          onClick={() => setIsSidebarOpen(true)}
        >
          ☰
        </button>

        <div className="header-icon">🤖</div>
        <div>
          <p className="header-name">AI 어시스턴트</p>
          <p className="header-status">온라인</p>
        </div>

        {/* 기존 로그아웃 버튼 제거 - 사이드바로 이동했어요 */}

      </div>

      {/* 메시지 목록 */}
      <div className="chat-box">
        {chatList.map((chat, index) => (
          chat.sender === 'ai' ? (
            <div key={index} className="message-row-ai">
              <div className="ai-icon">🤖</div>
              <div className="ai-message-group">
                <p className="ai-name">AI 어시스턴트</p>
                <div className="bubble-ai">
                  <p className="bubble-text">{chat.text}</p>
                </div>
              </div>
            </div>
          ) : (
            <div key={index} className="message-row-me">
              <div className="bubble-me">
                <p className="bubble-text">{chat.text}</p>
              </div>
            </div>
          )
        ))}

        {isLoading && (
          <div className="message-row-ai">
            <div className="ai-icon">🤖</div>
            <div className="ai-message-group">
              <p className="ai-name">AI 어시스턴트</p>
              <div className="loading-dots">
                <span className="dot"></span>
                <span className="dot"></span>
                <span className="dot"></span>
              </div>
            </div>
          </div>
        )}

        <div ref={chatBottomRef} />
      </div>

      {/* 하단 입력 영역 */}
      <div className="input-area">
        <input
          className="input"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
              sendMessage();
            }
          }}
          placeholder="메시지 입력..."
        />
        <button className="send-button" onClick={sendMessage}>➤</button>
      </div>

    </div>
  </div>
);
}

export default App;
