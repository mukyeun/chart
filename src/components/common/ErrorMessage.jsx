// src/components/common/ErrorMessage.jsx
import React from 'react';
import '../../styles/components/ErrorMessage.css';

export const ErrorMessage = ({ message, type = 'error' }) => (
  <div className={`error-message ${type}`}>
    <span className="error-icon">⚠️</span>
    <span className="error-text">{message}</span>
  </div>
);