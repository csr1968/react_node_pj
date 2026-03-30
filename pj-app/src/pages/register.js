import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/auth.css';

function Register() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    
    const navigate = useNavigate();

    const handleRegister = async () => {
        if (!username || !password || !confirmPassword) {
            alert('모든 항목을 입력해주세요.');
            return;
        }
        
        if (password !== confirmPassword) {
            alert('비밀번호가 일치하지 않습니다.');
            return;
        }

        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();

            if (response.ok) {
                alert('회원가입에 성공했습니다. 로그인 해주세요.');

                navigate('/');
            } else {
                alert(data.message);
            }
        } catch (error) {
            console.error('회원가입 오류: ', error);
            alert('서버 오류가 발생했습니다.');
        }
    };

    return (
        <div className="auth-container">
      <div className="auth-box">
        <h1 className="auth-title">💬 AI 채팅</h1>
        <p className="auth-subtitle">회원가입하고 대화를 시작하세요</p>

        <input
          className="auth-input"
          type="text"
          placeholder="아이디"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          className="auth-input"
          type="password"
          placeholder="비밀번호"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <input
          className="auth-input"
          type="password"
          placeholder="비밀번호 확인"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
              handleRegister();
            }
          }}
        />

        <button className="auth-button" onClick={handleRegister}>
          회원가입
        </button>

        <p className="auth-link">
          이미 계정이 있으신가요?{' '}
          <span onClick={() => navigate('/')}>로그인</span>
        </p>

      </div>
    </div>
    );
}

export default Register;