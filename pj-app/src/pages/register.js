import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/auth.css';

function Register() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    
    const navigate = useNavigate();

    // 비밀번호 유효성 검사
    const passwordCheck = {
      length : password.length >= 8,
      number : /[0-9]/.test(password),
      special: /[!@#$%^&*]/.test(password),
    };
    const isPasswordValid = Object.values(passwordCheck).every(Boolean);

    const handleRegister = async () => {
        if (!username || !password || !confirmPassword) {
            alert('모든 항목을 입력해주세요.');
            return;
        }

        if (!isPasswordValid) {
          alert('비밀번호 조건을 모두 만족해주세요.');
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
        {password.length > 0 && (
          <div className="password-rules">
            <p className={passwordCheck.length ? 'rule-pass' : 'rule-fail'}>
              {passwordCheck.length ? '✓' : '✗'} 8자리 이상
            </p>
            <p className={passwordCheck.number ? 'rule-pass' : 'rule-fail'}>
              {passwordCheck.number ? '✓' : '✗'} 숫자 포함
            </p>
            <p className={passwordCheck.special ? 'rule-pass' : 'rule-fail'}>
              {passwordCheck.special ? '✓' : '✗'} 특수문자 포함
            </p>
          </div>
        )}
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

        {confirmPassword.length > 0 && (
          <p className={password === confirmPassword ? 'rule-pass' : 'rule-fail'}>
            {password === confirmPassword ? '비밀번호가 일치합니다' : '비밀번호가 일치하지 않습니다'}
          </p>
        )}    

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