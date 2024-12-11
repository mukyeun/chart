const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// 미들웨어 설정
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 데이터베이스 설정 파일 불러오기
const db = require('./config/database');

// 기본 라우트
app.get('/', (req, res) => {
  res.json({ message: 'Pulse Wave Data Collector API' });
});

// 서버 시작
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
