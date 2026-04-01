const express    = require('express');
const http       = require('http');
const {Server}   = require('socket.io');
const path       = require('path')
const mongoose   = require('mongoose')
const authRouter = require('./routes/auth');
const passport   = require('passport');
const postRouter = require('./routes/post');

// .env 파일 불러오는 패키지
require('dotenv').config();

const Groq = require('groq-sdk')
const groq = new Groq({ apikey: process.env.GROQ_API_KEY})

const app  = express();

app.use(express.json());
app.use(passport.initialize());
app.use('/api/auth', authRouter);
app.use('/api/posts', postRouter);

mongoose.connect(process.env.MONGO_URL)
    .then(() => console.log('MongoDB 연결 성공'))
    .catch((err) => console.log('MongoDB 연결 실패: ', err));

const server = http.createServer(app);
const io     = new Server(server, {
    cors: {
        origin: "http://localhost:3001",
        methods: ["GET", "POST"]
    }
});

// API 호출
async function callGemini(messages) {
    
    // const response = await fetch(
    //     `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
    //     {
    //         method: 'POST',
    //         headers: { 'Content-Type': 'application/json' },
    //         body: JSON.stringify({
    //             contents: messages
    //         })
    //     }
    // );
    // const data = await response.json();
    // return data.candidates[0].content.parts[0].text;

    const groqMessages = messages.map((msg) => ({
        role   : msg.role === 'model' ? 'assistant' : msg.role,
        content: msg.parts[0].text
    }));

    const response     = await groq.chat.completions.create({
        model   : 'llama-3.3-70b-versatile',
        messages: groqMessages,
    });

    return response.choices[0].message.content;
}

io.on('connection', (socket) =>{
    console.log('유저 접속:', socket.id);

    io.emit('notice', { text: '새로운 유저가 입장했습니다.' });

    let conversationHistory = [];

    socket.on('send_message', async (data) => {
        console.log('메시지 수신:', data.text);

        conversationHistory.push({
            role : 'user',
            parts: [{ text: data.text }]
        });

        try {
            const aiReply = await callGemini(conversationHistory);

            conversationHistory.push({
                role : 'model',
                parts: [{ text:aiReply }]
            });

            socket.emit('receive_message', { sender: 'ai', text: aiReply });
        } catch (error) {
            console.error('API 오류', JSON.stringify(error.message));
            
            socket.emit('receive_message', {
                sender: 'ai',
                text  : '오류 발생. 다시 시도해주세요'
            });
        }
    });

    socket.on('disconnect', () => {
        console.log('유저 퇴장:', socket.id);

        io.emit('notice', { text: '유저가 퇴장했습니다.' });
    });
});


const fs        = require('fs');
const buildPath = path.join(__dirname, 'pj-app/build')

// React 빌드 파일 서빙
if (fs.existsSync(buildPath)) {
    app.use(express.static(buildPath));
    app.get('/{*path}', (req, res) => {
        res.sendFile(path.join(buildPath, 'index.html'));
    });
}

server.listen(3000, () => {
    console.log('서버 실행 중 - 포트 3000');
});