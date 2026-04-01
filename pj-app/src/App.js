import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Chat from './pages/chat';
import Login from './pages/login';
import Register from './pages/register';
import Board from './pages/board';
import PostDetail from './pages/postdetail';

function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/board" element={<Board />} />
        <Route path="/board/:id" element={<PostDetail />}/>
      
      </Routes>
    </BrowserRouter>
  );
}

export default App;
