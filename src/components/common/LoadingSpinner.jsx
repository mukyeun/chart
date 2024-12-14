// src/components/common/LoadingSpinner.jsx
import React from 'react';
import '../../styles/components/LoadingSpinner.css';

export const LoadingSpinner = ({ size = 'medium' }) => (
  <div className={`loading-spinner ${size}`}>
    <div className="spinner-circle"></div>
    <span className="spinner-text">처리중...</span>
  </div>
);