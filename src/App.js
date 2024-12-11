import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import UserInfoForm from './components/UserInfoForm';
import UserDataTable from './components/UserDataTable';
import './App.css';

function App() {
  return (
    <div className="App">
      <nav className="nav-menu">
        <div className="nav-left">
          <h1>SmartPulse Human</h1>
        </div>
        <div className="nav-right">
          <Link to="/" className="nav-link">데이터 입력</Link>
          <Link to="/data" className="nav-link">데이터 조회</Link>
        </div>
      </nav>
      
      <Routes>
        <Route path="/" element={<UserInfoForm />} />
        <Route path="/data" element={<UserDataTable />} />
      </Routes>
    </div>
  );
}

export default App;
