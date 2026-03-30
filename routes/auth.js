const express = require('express');
const router  = express.Router();
const bcrypt  = require('bcrypt');
const jwt     = require('jsonwebtoken')
const User    = require('../models/user')

// 회원가입 API
router.post('/register', async (req, res) => {
    try {
        const { username, password } = req.body;

        const passwordRegex = /^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*]).{8,}$/;
        if (!passwordRegex.test(password)) {
            return res.status(400).json({ message: '비밀번호 조건을 만족하지 않습니다.'});
        }

        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ message: '이미 사용중인 아이디입니다.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            username,
            password: hashedPassword
        });
        await newUser.save();

        res.status(201).json({ message: '회원가입을 완료했습니다.' });
    } catch (error) {
        console.log('회원가입 오류: ', error);

        res.status(500).json({ message: '서버 오류가 발생했습니다.' });
    }
});

//로그인 API
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        const user = await User.findOne({ username });
        if (!user) {
            return res.status(400).json({ message: '아이디나 비밀번호가 틀렸습니다.' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: '아이디나 비밀번호가 틀렸습니다.' });
        }

        // JWT 토큰 발급
        const token = jwt.sign(
            { id: user.id, username: user.username },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.json({
            message: '로그인 성공',
            token,
            username: user.username
        });
    } catch (error) {
        console.error('로그인 오류: ', error);
        
        res.status(500).json({ message: '서버 오류가 발생했습니다.' });
    }
});

module.exports = router;