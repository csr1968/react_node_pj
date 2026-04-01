import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../styles/sidebar.css';

function Sidebar({ isOpen, onClose }) {
    const navigate = useNavigate();
    const location = useLocation();

    const menuItems = [
        {label: '채팅', path: '/chat'},
        {label: '게시판', path: '/board'},
        // 나중에 페이지 추가시 여기에 추가
    ];

    const handleNavigate = (path) => {
        navigate(path);
        onClose();
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        navigate('/');
    };

    return (
        <>
            {isOpen && (
                <div className="sidebar-overlay" onClick={onClose} />
            )}

            <div className={`sidebar ${isOpen ? 'open' : ''}`}>

                <div className="sidebar-header">
                    <h2 className="sidebar-title"> 메뉴 </h2>
                    <button className="sidebar-close" onClick={onClose}>x</button>
                </div>
            

                <div className="sidebar-user">
                    <p>{localStorage.getItem('username')}</p>
                </div>

                <nav className="sidebar-menu">
                    {menuItems.map((item) => (
                        <button
                            key={item.path}
                            className={`sidebar-menu-item ${location.pathname === item.path ? 'active' : ''}`}
                            onClick={() => handleNavigate(item.path)}
                        >
                            {item.label}
                        </button>
                    ))}
                </nav>

                <div className="sidebar-footer">
                    <button className="sidebar-logout" onClick={handleLogout}>
                        로그아웃
                    </button>
                </div>
            </div>
        </>
    );
}

export default Sidebar;