import React, { useState, useEffect } from 'react';
import { getAllUserInfo, deleteUserInfo } from '../../api/userInfo';
import * as XLSX from 'xlsx';
import './UserDataTable.css';

const UserDataTable = () => {
  const [userData, setUserData] = useState([]);
  const [checkedItems, setCheckedItems] = useState(new Set());

  useEffect(() => {
    loadUserData();
  }, []);

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

  const toggleAllCheckboxes = (e) => {
    if (e.target.checked) {
      const allIds = userData.map(user => user._id);
      setCheckedItems(new Set(allIds));
    } else {
      setCheckedItems(new Set());
    }
  };

  const handleDeleteSelected = async () => {
    if (checkedItems.size === 0) {
      alert('삭제할 항목을 선택해주세요.');
      return;
    }

    if (window.confirm(`선택한 ${checkedItems.size}개의 데이터를 삭제하시겠습니까?`)) {
      try {
        const deletePromises = Array.from(checkedItems).map(id => deleteUserInfo(id));
        await Promise.all(deletePromises);
        await loadUserData();
        setCheckedItems(new Set());
        alert('선택한 데이터가 삭제되었습니다.');
      } catch (error) {
        console.error('Delete error:', error);
        alert('삭제 중 오류가 발생했습니다.');
      }
    }
  };

  const formatDate = (dateString) => {
    try {
      if (!dateString) return '-';
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return '-';
      }
      return `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
    } catch (error) {
      return '-';
    }
  };

  const loadUserData = async () => {
    try {
      const result = await getAllUserInfo();
      console.log('Raw data from localStorage:', result);

      if (result.success) {
        const formattedData = result.data.map(item => {
          const uniqueId = item.id || item._id || Date.now().toString();
          return {
            ...item,
            id: uniqueId,
            createdAt: formatDate(item.createdAt)
          };
        });
        
        console.log('Formatted data:', formattedData);
        console.log('Current checkedItems:', checkedItems);
        
        setUserData(formattedData);
      }
    } catch (error) {
      console.error('Data loading error:', error);
    }
  };

  const handleExcelDownload = () => {
    // 엑셀로 내보낼 데이터 가공
    const excelData = userData.map(user => ({
      '등록일시': user.createdAt,
      '이름': user.name,
      '주민등록번호': user.residentNumber,
      '성별': user.gender,
      '연락처': user.phone,
      '성격': user.personality,
      '신장(cm)': user.height,
      '체중(kg)': user.weight,
      'BMI 지수': user.bmi,
      '스트레스': user.stress,
      '노동강도': user.workIntensity,
      '맥박(회/분)': user.pulse,
      '수축기 혈압': user.systolicBP,
      '이완기 혈압': user.diastolicBP,
      '증상': Array.isArray(user.selectedSymptoms) ? user.selectedSymptoms.join(', ') : user.selectedSymptoms,
      '복용약물': user.medication,
      '기호식품': user.preference,
      '메모': user.memo
    }));

    // 워크북 생성
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(excelData);

    // 열 너비 자동 조정
    const colWidths = Object.keys(excelData[0]).map(key => ({
      wch: Math.max(key.length, ...excelData.map(row => 
        String(row[key] || '').length
      ))
    }));
    ws['!cols'] = colWidths;

    // 워크시트를 워크북에 추가
    XLSX.utils.book_append_sheet(wb, ws, '환자데이터');

    // 파일 이름 생성 (현재 날짜 포함)
    const today = new Date();
    const fileName = `환자데이터_${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}${String(today.getDate()).padStart(2, '0')}.xlsx`;

    // 엑셀 파일 다운로드
    XLSX.writeFile(wb, fileName);
  };

  return (
    <div className="data-page-container">
      <div className="data-header">
        <h2>환자 데이터 조회</h2>
        <div className="header-buttons">
          <button 
            onClick={handleDeleteSelected}
            className="delete-selected-button"
            disabled={checkedItems.size === 0}
          >
            선택 삭제 ({checkedItems.size})
          </button>
          <button onClick={loadUserData} className="refresh-button">
            새로고침
          </button>
          <button onClick={handleExcelDownload} className="excel-button">
            엑셀 다운로드
          </button>
        </div>
      </div>

      <div className="table-wrapper">
        <table className="user-data-table">
          <thead>
            <tr>
              <th style={{ 
                width: '50px', 
                textAlign: 'center',
                padding: '8px'
              }}>
                <input
                  type="checkbox"
                  style={{
                    width: '20px',
                    height: '20px',
                    cursor: 'pointer',
                    accentColor: '#1976d2'
                  }}
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
              <tr key={user._id}>
                <td style={{ 
                  width: '50px', 
                  textAlign: 'center',
                  padding: '8px'
                }}>
                  <input
                    type="checkbox"
                    style={{
                      width: '20px',
                      height: '20px',
                      cursor: 'pointer',
                      accentColor: '#1976d2'
                    }}
                    checked={checkedItems.has(user._id)}
                    onChange={(e) => toggleCheckbox(user._id, e)}
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