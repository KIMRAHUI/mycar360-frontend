// src/api/axios.js
import axios from 'axios';

const instance = axios.create({
  baseURL: 'https://mycar360-backend.onrender.com', // ✅ 무조건 이 주소로 고정
  withCredentials: true,
});

export default instance;
