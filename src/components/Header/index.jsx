import React from 'react';
import { Link } from 'react-router-dom';
import '../../styles/Header.css';

const Header = () => {
  return (
    <header className="header">
      <Link to="/" className="header-title">
        SmartPulse Human
      </Link>
      <div className="header-actions">
        <Link to="/data-input" className="header-link">
          데이터 입력
        </Link>
        <Link to="/data-view" className="header-link">
          데이터 조회
        </Link>
      </div>
    </header>
  );
};

export default Header; 