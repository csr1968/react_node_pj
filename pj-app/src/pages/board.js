import React, { useState, useEffect } from 'react';
import { useNavigate  } from 'react-router-dom';
import '../styles/board.css';

function Board() {
    
    const [posts, setPosts]       = useState([]);
    const [search, setSearch]     = useState('');
    const [showForm, setShowForm] = useState(false);
    const [title, setTitle]       = useState('');
    const [content, setContent]   = useState('');
    
    const navigate                = useNavigate();

    const token    = localStorage.getItem('token');
    const username = localStorage.getItem('username');

    useEffect(() => {
        if (!token) {
            navigate('/');
        }
    }, []);

    const fetchPosts = async (searchKeyword = '') => {
        try {
            const url = searchKeyword
                ? `/api/posts?search=${searchKeyword}`
                : '/api/posts';
            
            const response = await fetch(url);
            const data     = await response.json();
            setPosts(data);
        } catch (error) {
            console.error('게시글 조회 오류: ', error);
        }
    };

    useEffect(() => {
        fetchPosts();
    }, []);

    const handleSearch = () => {
        fetchPosts(search);
    };

    const handleSubmit = async () => {
        if (!title || !content) {
            alert('제목과 내용을 입력해주세요.');
            return;
        }

        try {
            const response = await fetch('/api/posts', {
                method: 'POST',
                headers: {
                    'Content-Type' : 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ title, content })        
            });

            if (response.ok) {
                alert('게시글 작성 성공');
                setTitle('');
                setContent('');
                setShowForm(false);
                fetchPosts();
            }
        } catch (error) {
            console.error('게시글 작성 오류: ', error);
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}`
    };

    return (
        <div className="board-container">

      {/* 상단 헤더 */}
      <div className="board-header">
        <button className="back-button" onClick={() => navigate('/chat')}>
          ← 채팅으로
        </button>
        <h1 className="board-title">📋 게시판</h1>
        <button className="write-button" onClick={() => setShowForm(!showForm)}>
          ✏️ 글쓰기
        </button>
      </div>

      {/* 게시글 작성 폼 - showForm이 true일 때만 표시 */}
      {showForm && (
        <div className="post-form">
          <input
            className="form-input"
            placeholder="제목"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <textarea
            className="form-textarea"
            placeholder="내용을 입력해주세요"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
          <div className="form-buttons">
            <button className="submit-button" onClick={handleSubmit}>등록</button>
            <button className="cancel-button" onClick={() => setShowForm(false)}>취소</button>
          </div>
        </div>
      )}

      {/* 검색창 */}
      <div className="search-area">
        <input
          className="search-input"
          placeholder="제목 또는 내용 검색..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
              handleSearch();
            }
          }}
        />
        <button className="search-button" onClick={handleSearch}>검색</button>
      </div>

      {/* 게시글 목록 */}
      <div className="post-list">
        {posts.length === 0 ? (
          <p className="no-posts">게시글이 없어요. 첫 글을 작성해보세요!</p>
        ) : (
          posts.map((post) => (
            <div
              key={post._id}
              className="post-item"
              onClick={() => navigate(`/board/${post._id}`)}
            >
              <div className="post-item-header">
                <h3 className="post-item-title">{post.title}</h3>
                <span className="post-item-date">{formatDate(post.createdAt)}</span>
              </div>
              <div className="post-item-footer">
                <span className="post-item-author">👤 {post.author}</span>
                <div className="post-item-stats">
                  <span>❤️ {post.likes.length}</span>
                  <span>💬 {post.comments.length}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

    </div>
    );
}

export default Board;