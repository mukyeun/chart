import axios from 'axios';

// 일관된 스토리지 키 사용
const STORAGE_KEY = 'userData';  // 'userInfoData'에서 'userData'로 통일

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
    // 기존 데이터 가져오기
    const existingData = localStorage.getItem(STORAGE_KEY);
    let allData = existingData ? JSON.parse(existingData) : [];
    
    // 새 데이터에 계산된 값들 포함
    const newData = {
      ...userData,
      _id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    
    // 데이터 추가
    allData.push(newData);
    
    // 로컬 스토리지에 저장
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allData));
    
    return {
      success: true,
      data: newData
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
    
    const updatedData = parsedData.filter(item => item._id !== id);
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