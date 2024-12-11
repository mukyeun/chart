const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, '../../data/database.sqlite');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err);
    return;
  }
  console.log('Connected to SQLite database');
  
  // 사용자 정보 테이블
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    contact TEXT,
    resident_number TEXT,
    height REAL,
    weight REAL,
    blood_sugar REAL,
    temperature REAL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // 건강 데이터 테이블
  db.run(`CREATE TABLE IF NOT EXISTS health_data (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    physical_labor TEXT,
    stress_level TEXT,
    personality TEXT,
    symptoms TEXT,
    medications TEXT,
    pulse_wave_data TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
  )`);
});

module.exports = db;
