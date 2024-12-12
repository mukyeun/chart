import React, { useState, useEffect } from 'react';
import { getAllUserInfo, deleteUserInfo } from '../../api/userInfo';
import './UserDataTable.css';

const UserDataTable = () => {
  const [userData, setUserData] = useState([]);
  const [checkedItems, setCheckedItems] = useState(new Set());

  useEffect(() => {
    loadUserData();
  }, []);

  // 개별 체크박스 처리
  const toggleCheckbox = (id, e) => {
    e.stopPropagation();
    const newCheckedItems = new Set(checkedItems);
    
    if (newCheckedItems.has(id)) {
      newCheckedItems.delete(id);
    } else {
      newCheckedItems.add(id);
    }
    
    setCheckedItems(newCheckedItems);
  };

  // 전체 선택/해제 처리
  const toggleAllCheckboxes = (e) => {
    e.stopPropagation();
    if (e.target.checked) {
      const allIds = userData.map(user => user.id);
      setCheckedItems(new Set(allIds));
    } else {
      setCheckedItems(new Set());
    }
  };

  const formatDate = (dateString) => {
    try {
      if (!dateString) return '-';
      
      const date = new Date(dateString);
      
      // 유효한 날짜인지 확인
      if (isNaN(date.getTime())) {
        return '-';
      }
      
      return `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
    } catch (error) {
      return '-';
    }
  };

  const loadUserData = async () => {
    const result = await getAllUserInfo();
    if (result.success) {
      const formattedData = result.data.map(item => ({
        ...item,
        createdAt: formatDate(item.createdAt)
      }));
      setUserData(formattedData);
    }
  };

  return (
    <div className="data-page-container">
      <div className="data-header">
        <h2>환자 데이터 조회</h2>
        <div className="header-buttons">
          <button onClick={loadUserData} className="refresh-button">
            새로고침
          </button>
          <button className="excel-button">
            엑셀 다운로드
          </button>
        </div>
      </div>

      <div className="table-container">
        <table className="user-data-table">
          <thead>
            <tr>
              <th>
                <input
                  type="checkbox"
                  checked={userData.length > 0 && checkedItems.size === userData.length}
                  onChange={toggleAllCheckboxes}
                />
              </th>
              <th>등록일시</th>
              <th>이름</th>
              <th>주민등록번호</th>
              <th>성별</th>
              <th>연락처</th>
              <th>성격</th>
              <th>신장(cm)</th>
              <th>체중(kg)</th>
              <th>BMI 지수</th>
              <th>스트레스</th>
              <th>노동강도</th>
              <th>맥박(회/분)</th>
              <th>수축기 혈압</th>
              <th>이완기 혈압</th>
              <th>증상</th>
              <th>복용약물</th>
              <th>기호식품</th>
              <th>메모</th>
            </tr>
          </thead>
          <tbody>
            {userData.map((user) => (
              <tr key={user.id}>
                <td onClick={(e) => e.stopPropagation()}>
                  <input
                    type="checkbox"
                    checked={checkedItems.has(user.id)}
                    onChange={(e) => toggleCheckbox(user.id, e)}
                  />
                </td>
                <td>{user.createdAt}</td>
                <td>{user.name}</td>
                <td>{user.residentNumber}</td>
                <td>{user.gender}</td>
                <td>{user.phone}</td>
                <td>{user.personality}</td>
                <td>{user.height}</td>
                <td>{user.weight}</td>
                <td>{user.bmi}</td>
                <td>{user.stress}</td>
                <td>{user.workIntensity}</td>
                <td>{user.pulse}</td>
                <td>{user.systolicBP}</td>
                <td>{user.diastolicBP}</td>
                <td>{Array.isArray(user.selectedSymptoms) ? user.selectedSymptoms.join(', ') : user.selectedSymptoms}</td>
                <td>{user.medication}</td>
                <td>{user.preference}</td>
                <td>{user.memo}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserDataTable;