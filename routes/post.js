require('dotenv').config();

const express = require('express');
const router  = express.Router();
const jwt     = require('jsonwebtoken');
const Post    = require('../models/post');

// JWT 토큰 검증 미들웨어: 로그인한 유저만 권한부여
const authMiddleware = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: '로그인이 필요합니다.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ message: '토큰이 유효하지 않습니다.' });
    }
};

// 게시글 목록 조회 + 검색
router.get('/', async (req, res) => {
    try {
        const { search } = req.query;

        // 검색어가 있으면 제목이나 내용으로 검색
        const query = search
            ? {
                $or: [
                    { title: { $regex: search, $options: 'i' }},
                    { content: { $regex: search, $options: 'i' }}
                ]
            }
            : {};
        
        const posts = await Post.find(query).sort({ createdAt: -1 });
        res.json(posts);
    } catch (error) {
        console.error('게시글 조회 오류: ', error);
        res.status(500).josn({ message: '서버 오류가 발생했습니다.' });
    }
});

// 게시글 상세 조회
router.get('/:id', async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ message: '게시글을 찾을 수 없습니다.' });
        }
        res.json(post);
    } catch (error) {
        console.error('게시글 상세 조회 오류: ', error);
        res.status(500).json({ message: '서버 오류가 발생했습니다.' });
    }
});

// 게시글 작성
router.post('/', authMiddleware, async (req, res) => {
    try {
        const { title, content } = req.body;

        if (!title || !content) {
            return res.status(400).json({ message: '제목과 내용을 입력해주세요.' });
        }

        const post = new Post({
            title,
            content,
            author: req.user.username
        });

        await post.save();
        res.status(201).json({ message: '게시글 작성 성공!' });
    } catch (error) {
        console.error('게시글 작성 오류', error);
        res.status(500).json({ message: '서버 오류가 발생했습니다.' });
    }
});

// 게시글 삭제
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({ message: '게시글을 찾을 수 없습니다.' });
        }

        if (post.author !== req.user.username) {
            return res.status(403).json({ message: '삭제 권한이 없습니다.' });
        }

        await Post.findByIdAndDelete(req.params.id);
        res.json({ message: '게시글 삭제 성공!' });
    } catch (error) {
        console.error('게시글 삭제 오류: ', error);
        res.status(500).json({ message: '서버 오류가 발생했습니다.' });
    }
});

// 좋아요 토글
router.post('/:id/like', authMiddleware, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({ message: '게시글을 찾을 수 없습니다.' });
        }

        const userId = req.user.id;

        if (post.likes.includes(userId)) {
            post.likes = post.likes.filter((id) => id !== userId);
        } else {
            post.likes.push(userId);
        }

        await post.save();
        res.json({ likes: post.likes.length });
    } catch (error) {
        console.error('좋아요 오류: ', error);
        res.status(500).json({ message: '서버 오류가 발생했습니다.' });
    }
});

// 댓글 작성
router.post('/:id/comments', authMiddleware, async (req, res) => {
    try {
        const { content } = req.body;
        if (!content) {
            return res.status(400).json({ message: '제목과 내용을 입력해주세요.' });
        }

        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ message: '게시글을 찾을 수 없습니다.' });
        }

        post.comments.push({
            author: req.user.username,
            content
        });

        await post.save();
        res.status(201).json({ message: '댓글 작성 성공', comments: post.comments });
    } catch (error) {
        console.error('댓글 작성 오류: ', error);
        res.status(500).json({ message: '서버 오류가 발생했습니다.' });
    }
});

// 댓글 삭제
router.delete('/:id/comments/:commentId', authMiddleware, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ message: '게시글을 찾을 수 없습니다.' });
        }

        const comment = post.comments.id(req.params.commentId);
        if (comment.author !== req.user.username){
            return res.status(403).json({ message: '삭제 권한이 없습니다.' });
        }

        post.comments = post.comments.filter(
            (c) => c._id.toString() !== req.params.commentId
        );

        await post.save();
        res.json({ message: '댓글 삭제 성공' });
    } catch (error) {
        console.error('댓글 삭제 오류: ', error);
        res.status(500).json({ message: '서버 오류가 발생했습니다.' });
    }
});

module.exports = router;