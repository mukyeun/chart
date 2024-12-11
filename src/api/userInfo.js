import axios from 'axios';

// 로컬 스토리지 키 상수
const STORAGE_KEY = 'userInfoData';

// 데이터 저장 함수
export const saveUserInfo = async (userData) => {
  try {
    // 현재 날짜 생성
    const now = new Date();
    // YYYY/MM/DD 형식으로 변환
    const formattedDate = [
      now.getFullYear(),
      String(now.getMonth() + 1).padStart(2, '0'),
      String(now.getDate()).padStart(2, '0')
    ].join('/');

    // 새 데이터 추가
    const newData = {
      id: Date.now(),
      createdAt: formattedDate,  // 간단한 날짜 형식
      ...userData
    };

    // 기존 데이터 가져오기
    let existingData = [];
    const storedData = localStorage.getItem(STORAGE_KEY);
    
    if (storedData) {
      try {
        existingData = JSON.parse(storedData);
      } catch (e) {
        console.error('Failed to parse stored data:', e);
        existingData = [];
      }
    }

    // 배열이 아닌 경우 새 배열 생성
    if (!Array.isArray(existingData)) {
      existingData = [];
    }

    // 데이터 추가
    existingData.push(newData);

    // localStorage에 저장
    localStorage.setItem(STORAGE_KEY, JSON.stringify(existingData));

    return {
      success: true,
      message: '정보가 성공적으로 저장되었습니다.'
    };
  } catch (error) {
    console.error('Save error:', error);
    return {
      success: false,
      message: '저장 중 오류가 발생했습니다.'
    };
  }
};

// 엑셀 다운로드를 위한 데이터 포맷팅
export const getAllUserInfo = async () => {
  try {
    const storedData = localStorage.getItem(STORAGE_KEY);
    let data = [];
    
    if (storedData) {
      try {
        data = JSON.parse(storedData);
      } catch (e) {
        console.error('Failed to parse stored data:', e);
      }
    }

    return {
      success: true,
      data: Array.isArray(data) ? data : []
    };
  } catch (error) {
    console.error('Fetch error:', error);
    return {
      success: false,
      message: '데이터 조회 중 오류가 발생했습니다.'
    };
  }
};

// 데이터 삭제
export const deleteUserInfo = async (id) => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    let allData = data ? JSON.parse(data) : [];
    
    allData = allData.filter(item => item.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allData));

    return {
      success: true,
      message: '삭제되었습니다.'
    };
  } catch (error) {
    return {
      success: false,
      message: '삭제 중 오류가 발생했습니다.'
    };
  }
}; 