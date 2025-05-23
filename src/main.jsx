// src/main.jsx 리액트앱의 시작점 리액트앱 브라우저연결(렌더링) : 앱 켜는 스위치
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { BrowserRouter } from 'react-router-dom';
import './styles/global.css';


ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);

