import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/auth.css';

function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const navigate    = useNavigate();
    const handleLogin = async () => {
        if (!username || !password) {
            alert('아이디와 비밀번호를 입력해주세요.');
            return;
        }

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('username', data.username);

                navigate('/chat');
            } else {
                alert(data.message);
            }
        } catch (error) {
            console.error('로그인 오류: ', error);
            alert('서버 오류가 발생했습니다.');
        }
    };
    
    return (
        <div className="auth-container">
            <div className="auth-box">
                <h1 className="auth-title">💬 AI 채팅서비스</h1>
                <p className="auth-subtitle">로그인 후 대화를 시작하세요</p>

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
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
                            handleLogin();
                        }
                    }}
                />

                <button className="auth-button" onClick={handleLogin}>
                    로그인
                </button>

                <p className="auth-link">
                    계정이 없으신가요?{' '}
                    <span onClick={() => navigate('/register')}>회원가입</span>
                </p>
            </div>
        </div>
    );
}

export default Login;