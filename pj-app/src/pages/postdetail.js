import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import '../styles/board.css';

function PostDetail() {
    const [post, setPost]       = useState(null);
    const [comment, setComment] = useState('');

    const navigate              = useNavigate();

    const { id } = useParams();

    const token    = localStorage.getItem('token');
    const username = localStorage.getItem('username');

    const fetchPost = async () => {
        try {
            const response = await fetch(`/api/posts/${id}`);
            const data     = await response.json();
            setPost(data);
        } catch (error) {
            console.error('게시글 상세 조회 오류: ', error);
        }
    };

    useEffect(() => {
        fetchPost();
    }, []);

    const handleDelete = async () => {
        if (!window.confirm('정말 삭제하시겠습니까?')) return;
        try {
            const response = await fetch(`/api/posts/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                alert('삭제했습니다!');
                navigate('/board');
            }
        } catch (error) {
            console.error('게시글 삭제 오류: ', error);
        }
    };

    const handleLike = async () => {
        try {
            const response = await fetch(`/api/posts/${id}/like`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                fetchPost();
            }
        } catch (error) {
            console.error('좋아요 오류: ', error);
        }
    };

    const handleComment = async () => {
        if (!comment.trim()) return;
        try {
            const response = await fetch (`/api/posts/${id}/comments`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ content: comment })
            });

            if (response.ok) {
                setComment('');
                fetchPost();
            }
        } catch (error) {
            console.error('댓글 작성 오류: ', error);
        }
    };

    const handleCommentDelete = async (commentId) => {
        if (!window.confirm('댓글을 삭제할까요?')) return;

        try {
            const response = await fetch(`/api/posts/${id}/comments/${commentId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                fetchPost();
            }
        } catch (error) {
            console.error('댓글 삭제 오류: ', error);
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}`
    };
    if (!post) return <div className="board-container">로딩 중...</div>;

    return (
        <div className="board-container">

      {/* 상단 헤더 */}
      <div className="board-header">
        <button className="back-button" onClick={() => navigate('/board')}>
          ← 목록으로
        </button>
        <h1 className="board-title">📋 게시판</h1>
        <div></div>
      </div>

      {/* 게시글 본문 */}
      <div className="post-detail">
        <div className="post-detail-header">
          <h2 className="post-detail-title">{post.title}</h2>
          <div className="post-detail-info">
            <span>👤 {post.author}</span>
            <span>{formatDate(post.createdAt)}</span>
          </div>
        </div>

        <div className="post-detail-content">
          {post.content}
        </div>

        {/* 좋아요 + 삭제 버튼 */}
        <div className="post-detail-actions">
          <button
            className={`like-button ${post.likes.includes(localStorage.getItem('userId')) ? 'liked' : ''}`}
            onClick={handleLike}
          >
            ❤️ {post.likes.length}
          </button>

          {/* 작성자 본인만 삭제 버튼 표시 */}
          {post.author === username && (
            <button className="delete-button" onClick={handleDelete}>
              🗑️ 삭제
            </button>
          )}
        </div>
      </div>

      {/* 댓글 목록 */}
      <div className="comment-section">
        <h3 className="comment-title">댓글 {post.comments.length}개</h3>

        {post.comments.map((c) => (
          <div key={c._id} className="comment-item">
            <div className="comment-header">
              <span className="comment-author">👤 {c.author}</span>
              <span className="comment-date">{formatDate(c.createdAt)}</span>
            </div>
            <p className="comment-content">{c.content}</p>

            {/* 댓글 작성자 본인만 삭제 버튼 표시 */}
            {c.author === username && (
              <button
                className="comment-delete"
                onClick={() => handleCommentDelete(c._id)}
              >
                삭제
              </button>
            )}
          </div>
        ))}

        {/* 댓글 입력창 */}
        <div className="comment-input-area">
          <input
            className="comment-input"
            placeholder="댓글을 입력해주세요..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
                handleComment();
              }
            }}
          />
          <button className="comment-submit" onClick={handleComment}>등록</button>
        </div>
      </div>

    </div>
  );
}

export default PostDetail;