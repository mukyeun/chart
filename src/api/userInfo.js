import axios from 'axios';

// localStorage 기반 API 구현
const STORAGE_KEY = 'userInfoData';

export const getAllUserInfo = async () => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    const parsedData = data ? JSON.parse(data) : [];
    
    return {
      success: true,
      data: parsedData
    };
  } catch (error) {
    console.error('Get data error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

export const saveUserInfo = async (userData) => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    const parsedData = data ? JSON.parse(data) : [];
    
    const newUserData = {
      ...userData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    
    parsedData.push(newUserData);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(parsedData));
    
    return {
      success: true,
      data: newUserData
    };
  } catch (error) {
    console.error('Save error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

export const deleteUserInfo = async (id) => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    const parsedData = data ? JSON.parse(data) : [];
    
    const updatedData = parsedData.filter(item => item.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedData));
    
    return {
      success: true,
      data: updatedData
    };
  } catch (error) {
    console.error('Delete error:', error);
    throw error;
  }
}; 