import React, { useState, useEffect } from 'react';
import { saveUserInfo, getAllUserInfo } from '../../api/userInfo';
import { 증상카테고리 } from '../../data/symptoms';
import { 약물카테고리 } from '../../data/medications';
import { 기호식품카테고리 } from '../../data/preferences';
import * as XLSX from 'xlsx';
import '../../styles/UserInfoForm.css';
// Excel 날짜 숫자를 Date 객체로 변환하는 함수
const excelDateToJSDate = (excelDate) => {
  const EXCEL_1900_EPOCH = new Date(Date.UTC(1899, 11, 30));
  const days = Math.floor(excelDate);
  const fraction = excelDate - days;
  const millisecondsInDay = 24 * 60 * 60 * 1000;
  const milliseconds = days * millisecondsInDay + (fraction * millisecondsInDay);
  
  return new Date(EXCEL_1900_EPOCH.getTime() + milliseconds);
};
// parseDateParts 함수
const parseDateParts = (dateValue) => {
  try {
    let date;
    
    // 숫자인 경우 (Excel 날짜)
    if (typeof dateValue === 'number') {
      date = excelDateToJSDate(dateValue);
      return {
        year: date.getFullYear(),
        month: date.getMonth() + 1,
        day: date.getDate(),
        hour: date.getHours(),
        minute: date.getMinutes(),
        date,
        timestamp: date.getTime()
      };
    }
    
    // 문자열인 경우
    const [datePart, timePart] = dateValue.split(' ');
    const [month, day, yearStr] = datePart.split('/');
    const [hours, minutes] = timePart.split(':');
    const fullYear = parseInt(yearStr, 10) < 100 ? 2000 + parseInt(yearStr, 10) : parseInt(yearStr, 10);
    date = new Date(fullYear, parseInt(month, 10) - 1, parseInt(day, 10), parseInt(hours, 10), parseInt(minutes, 10));
    return {
      year: fullYear,
      month: parseInt(month, 10),
      day: parseInt(day, 10),
      hour: parseInt(hours, 10),
      minute: parseInt(minutes, 10),
      date,
      timestamp: date.getTime()
    };
  } catch (error) {
    console.error('날짜 파싱 오류:', { 입력값: dateValue, 에러: error.message });
    return null;
  }
};
// UserInfoForm 컴포넌트 정의
function UserInfoForm() {
  const [formData, setFormData] = useState({
    name: '',
    residentNumber: '',
    phone: '',
    personality: '',
    height: '',
    weight: '',
    bmi: '',
    gender: '',
    stressLevel: '',
    workIntensity: '',
    medication: '',
    preference: '',
    memo: '',
    selectedCategory: '',
    selectedSubCategory: '',
    selectedSymptom: '',
    selectedSymptoms: [],
    pulse: '',
    systolicBP: '',
    diastolicBP: '',
    stress: '',
    workIntensity: '',
    ab_ms: '',
    ac_ms: '',
    ad_ms: '',
    ae_ms: '',
    ba_ratio: '',
    ca_ratio: '',
    da_ratio: '',
    ea_ratio: ''
  });
  // BMI 자동 계산 함수
  const calculateBMI = (height, weight) => {
    if (height && weight) {
      const heightInMeters = height / 100;
      const bmi = (weight / (heightInMeters * heightInMeters)).toFixed(1);
      setFormData(prev => ({ ...prev, bmi }));
    }
  };
  // 전화번호 포맷팅 함수 추가
  const formatPhoneNumber = (value) => {
    const numbers = value.replace(/[^0-9]/g, '');
    if (numbers.length <= 3) {
      return numbers;
    } else if (numbers.length <= 7) {
      return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
    } else {
      return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`;
    }
  };
  // handleInputChange 함수 수정
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // 전화번호 입력 처리
    if (name === 'phone') {
      const formattedPhone = formatPhoneNumber(value);
      if (formattedPhone.replace(/-/g, '').length <= 11) {
        setFormData(prev => ({
          ...prev,
          [name]: formattedPhone
        }));
      }
      return;
    }
    // 신장이나 체중이 변경될 때 BMI 재계산
    if (name === 'height' || name === 'weight') {
      const height = name === 'height' ? value : formData.height;
      const weight = name === 'weight' ? value : formData.weight;
      calculateBMI(height, weight);
    }
    // 기본 입력 처리
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  const handleCategoryChange = (e) => {
    setFormData(prev => ({
      ...prev,
      selectedCategory: e.target.value,
      selectedSubCategory: '',
      selectedSymptom: ''
    }));
  };
  const handleSubCategoryChange = (e) => {
    setFormData(prev => ({
      ...prev,
      selectedSubCategory: e.target.value,
      selectedSymptom: ''
    }));
  };
  const handleSymptomChange = (e) => {
    const symptom = e.target.value;
    if (symptom && !formData.selectedSymptoms.includes(symptom)) {
      setFormData(prev => ({
        ...prev,
        selectedSymptoms: [...prev.selectedSymptoms, symptom],
        selectedSymptom: ''
      }));
    }
  };
  const removeSymptom = (symptomToRemove) => {
    setFormData(prev => ({
      ...prev,
      selectedSymptoms: prev.selectedSymptoms.filter(symptom => symptom !== symptomToRemove)
    }));
  };
  const determineGender = (secondPart) => {
    if (!secondPart) return '';
    const firstDigit = secondPart.charAt(0);
    if (['1', '3', '5'].includes(firstDigit)) {
      return 'male';
    } else if (['2', '4', '6'].includes(firstDigit)) {
      return 'female';
    }
    return '';
  };
  const formatResidentNumber = (value) => {
    const numbers = value.replace(/[^0-9]/g, '');
    if (numbers.length <= 6) return numbers;
    return `${numbers.slice(0, 6)}-${numbers.slice(6, 13)}`;
  };
  const handleResidentNumberChange = (e) => {
    const formatted = formatResidentNumber(e.target.value);
    if (formatted.replace('-', '').length <= 13) {
      setFormData(prev => ({
        ...prev,
        residentNumber: formatted,
        gender: determineGender(formatted.split('-')[1])
      }));
    }
  };
  const handleExportExcel = async () => {
    try {
      const response = await getAllUserInfo();
      if (response.success && response.data) {
        const worksheet = XLSX.utils.json_to_sheet(response.data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Users");
        XLSX.writeFile(workbook, "user_info.xlsx");
      } else {
        alert('데이터 조회에 실패했습니다.');
      }
    } catch (error) {
      console.error('Excel export error:', error);
      alert('엑셀 다운로드 중 오류가 발생했습니다.');
    }
  };
  // 폼 제출 핸들러 추가
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 필수 필드 검증
    if (!formData.name.trim()) {
      alert('이름을 입력해주세요.');
      return;
    }
    if (!formData.residentNumber.trim()) {
      alert('주민등록번호를 입력해주세요.');
      return;
    }
    try {
      const result = await saveUserInfo(formData);
      if (result.success) {
        alert('정보가 성공적으로 저장되었습니다.');
        // 폼 초기화
        setFormData({
          name: '',
          residentNumber: '',
          gender: '',
          phone: '',
          personality: '',
          height: '',
          weight: '',
          bmi: '',
          stress: '',
          workIntensity: '',
          pulse: '',
          systolicBP: '',
          diastolicBP: '',
          selectedCategory: '',
          selectedSubCategory: '',
          selectedSymptom: '',
          selectedSymptoms: [],
          medication: '',
          preference: '',
          memo: ''
        });
      } else {
        alert(result.message || '저장 중 오류가 발생했습니다.');
      }
    } catch (error) {
      console.error('Save error:', error);
      alert('저장 중 오류가 발생했습니다.');
    }
  };
  // parseExcelDate 함수 수정
  const parseExcelDate = (dateStr) => {
    console.log('입력된 날짜 문자열:', dateStr);
    // "M/D/YY HH:mm" 형식 파싱 (예: "7/17/24 18:02")
    const match = dateStr.match(/(\d{1,2})\/(\d{1,2})\/(\d{2})\s+(\d{1,2}):(\d{2})/);
    if (match) {
      const [_, month, day, year, hour, minute] = match;
      const date = new Date(2000 + parseInt(year), parseInt(month) - 1, parseInt(day), parseInt(hour), parseInt(minute));
      
      console.log('파싱된 날짜 정보:', {
        원본: dateStr,
        년: 2000 + parseInt(year),
        월: parseInt(month),
        일: parseInt(day),
        시: parseInt(hour),
        분: parseInt(minute),
        생성된Date: date.toISOString()
      });
      return {
        dateStr: dateStr,
        date: date
      };
    }
    console.log('날짜 파싱 실패:', dateStr);
    return null;
  };
  // 날짜 파싱 함수 새로 작성
  function parseDateParts(dateStr) {
    try {
      // 입력 예: "10/1/24 8:37"
      const [datePart, timePart] = dateStr.split(' ');
      const [month, day, yearStr] = datePart.split('/');
      const [hours, minutes] = timePart.split(':');
      
      // 2024년으로 변환 (24 -> 2024)
      const fullYear = 2000 + parseInt(yearStr, 10);
      
      const result = {
        year: fullYear,
        month: parseInt(month, 10),
        day: parseInt(day, 10),
        hour: parseInt(hours, 10),
        minute: parseInt(minutes, 10)
      };
      console.log('날짜 파싱 결과:', {
        입력: dateStr,
        결과: result
      });
      return result;
    } catch (error) {
      console.error('날짜 파싱 오류:', {
        입력값: dateStr,
        에러: error.message
      });
      return null;
    }
  }
  // 날짜 비교 함수 최적화
  const compareDates = (dateStrA, dateStrB) => {
    const partsA = parseDateParts(dateStrA);
    const partsB = parseDateParts(dateStrB);
    // Date 객체 생성 (월은 0-based이므로 1을 빼줌)
    const dateA = new Date(
      partsA.year, 
      partsA.month - 1, 
      partsA.day, 
      partsA.hour, 
      partsA.minute
    );
    const dateB = new Date(
      partsB.year, 
      partsB.month - 1, 
      partsB.day, 
      partsB.hour, 
      partsB.minute
    );
    console.log('날짜 비교:', {
      A: dateStrA,
      A_date: dateA.toISOString(),
      B: dateStrB,
      B_date: dateB.toISOString(),
      차이: dateA.getTime() - dateB.getTime()
    });
    // timestamp 비교
    return dateA.getTime() - dateB.getTime();
  };
  const loadUbioData = async () => {
    try {
      const fileInput = document.querySelector('input[type="file"]');
      if (!fileInput || !fileInput.files || !fileInput.files[0]) {
        alert('먼저 Excel 파일을 선택해주세요.');
        return;
      }
      const currentUserName = formData.name;
      if (!currentUserName) {
        alert('먼저 기본 정보의 이름을 입력해주세요.');
        return;
      }
      const file = fileInput.files[0];
      const reader = new FileReader();
      // JavaScript에서 날짜 형식 통일
      const formatDate = (date) => {
        const yy = date.getFullYear().toString().slice(-2);
        const mm = String(date.getMonth() + 1).padStart(2, '0');
        const dd = String(date.getDate()).padStart(2, '0');
        const hh = String(date.getHours()).padStart(2, '0');
        const min = String(date.getMinutes()).padStart(2, '0');
        
        return `${yy}/${mm}/${dd} ${hh}:${min}`;
      };
      reader.onload = async (e) => {
        try {
          const data = e.target.result;
          const workbook = XLSX.read(data, { type: 'array' });
          const worksheet = workbook.Sheets[workbook.SheetNames[0]];
          
          const rows = XLSX.utils.sheet_to_json(worksheet, { 
            header: 1,
            raw: false
          });
          console.log('검색할 사용자 이름:', currentUserName);
          
          // 1단계: 이름이 일치하는 행들 찾기
          const matchingRows = rows.filter((row, index) => {
            if (index === 0) return false;
            return row[0] === formData.name;
          });
          console.log('매칭된 모든 행:', matchingRows.map(row => ({
            행: rows.indexOf(row) + 1,
            날짜: row[5],
            이름: row[0],
            전체데이터: row
          })));
          // 2단계: 날짜 비교하여 정렬
          const sortedRows = matchingRows
            .map(row => {
              const rowIndex = rows.indexOf(row) + 1;
              const dateStr = row[5];
              const dateParts = parseDateParts(dateStr);
              
              if (!dateParts) {
                console.log('날짜 파싱 실패:', {
                  행: rowIndex,
                  날짜문자열: dateStr
                });
                return null;
              }
              
              const date = new Date(
                dateParts.year,
                dateParts.month - 1,
                dateParts.day,
                dateParts.hour,
                dateParts.minute
              );
              
              return {
                rowIndex,
                dateStr,
                dateParts,
                date,
                timestamp: date.getTime(),
                row
              };
            })
            .filter(item => item !== null && item.date instanceof Date && !isNaN(item.date.getTime()))
            .sort((a, b) => b.timestamp - a.timestamp);
          console.log('정렬된 결과:', sortedRows.map(item => ({
            행: item.rowIndex,
            날짜: item.dateStr,
            타임스탬프: item.timestamp
          })));
          if (sortedRows.length === 0) {
            alert('유효한 날짜 데이터를 찾을 수 없습니다.');
            return;
          }
          const latestData = sortedRows[0];
          console.log('선택된 데이터:', {
            행: latestData.rowIndex,
            날짜: latestData.dateStr,
            파싱된날짜: latestData.dateParts
          });
          // 데이터 입력
          setFormData(prev => ({
            ...prev,
            ab_ms: worksheet[`J${latestData.rowIndex}`]?.v?.toString() || '',
            ac_ms: worksheet[`K${latestData.rowIndex}`]?.v?.toString() || '',
            ad_ms: worksheet[`L${latestData.rowIndex}`]?.v?.toString() || '',
            ae_ms: worksheet[`M${latestData.rowIndex}`]?.v?.toString() || '',
            ba_ratio: worksheet[`N${latestData.rowIndex}`]?.v?.toString() || '',
            ca_ratio: worksheet[`O${latestData.rowIndex}`]?.v?.toString() || '',
            da_ratio: worksheet[`P${latestData.rowIndex}`]?.v?.toString() || '',
            ea_ratio: worksheet[`Q${latestData.rowIndex}`]?.v?.toString() || ''
          }));
        } catch (error) {
          console.error('Excel 파일 처리 중 오류:', error);
          console.log('에러 상세:', error);
          alert('Excel 파일을 처리하는 중 오류가 발생했습니다.');
        }
      };
      reader.readAsArrayBuffer(file);
    } catch (error) {
      console.error('파일 로드 중 오류:', error);
      alert('파일을 로드하는 중 오류가 발생했습니다.');
    }
  };
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = e.target.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        if (jsonData && jsonData.length > 0) {
          const latestData = jsonData[jsonData.length - 1];
          
          // 맥파 데이터 필드 매핑
          setFormData(prev => ({
            ...prev,
            ab_ms: latestData['a-b'] || '',
            ac_ms: latestData['a-c'] || '',
            ad_ms: latestData['a-d'] || '',
            ae_ms: latestData['a-e'] || '',
            ba_ratio: latestData['b/a'] || '',
            ca_ratio: latestData['c/a'] || '',
            da_ratio: latestData['d/a'] || '',
            ea_ratio: latestData['e/a'] || ''
          }));
          console.log('Loaded Excel data:', latestData); // 데이터 확인용 로그
        }
      } catch (error) {
        console.error('Excel 파일 읽기 실패:', error);
        alert('Excel 파일을 읽는 중 오류가 발생했습니다.');
      }
    };
    reader.onerror = (error) => {
      console.error('FileReader 오류:', error);
      alert('파일을 읽는 중 오류가 발생했습니다.');
    };
    reader.readAsBinaryString(file);
  };
  // 날짜 파싱 캐시 추가
  const dateCache = new Map();
  function getParsedDate(dateStr) {
    if (!dateCache.has(dateStr)) {
      const [date, time] = dateStr.split(' ');
      const [month, day, year] = date.split('/');
      const [hours, minutes] = time.split(':');
      
      dateCache.set(dateStr, {
        month: parseInt(month),
        day: parseInt(day),
        year: parseInt(year),
        hours: parseInt(hours),
        minutes: parseInt(minutes)
      });
    }
    
    return dateCache.get(dateStr);
  }
  return (
    <form onSubmit={handleSubmit} className="form-container">
      {/* 기본 정보 섹션 */}
      <div className="form-section basic-info-section">
        <h3 className="section-title">기본 정보</h3>
        
        <div className="input-row">
          <div className="input-group vertical">
            <label className="form-label required">이름</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="이름을 입력하세요"
            />
          </div>
          <div className="input-group vertical">
            <label className="form-label required">주민등록번호</label>
            <input
              type="text"
              name="residentNumber"
              value={formData.residentNumber}
              onChange={handleResidentNumberChange}
              placeholder="주민등록번호 13자리"
              maxLength="14"
            />
          </div>
          <div className="input-group">
            <label className="form-label">성별</label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleInputChange}
            >
              <option value="">선택하세요</option>
              <option value="male">남성</option>
              <option value="female">여성</option>
            </select>
          </div>
        </div>
        {/* 연락처와 성격을 같은 input-row에 배치 */}
        <div className="input-row">
          <div className="input-group phone-field">
            <label className="form-label">연락처</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
            />
          </div>
          <div className="input-group personality-field">
            <label className="form-label">성격</label>
            <select
              name="personality"
              value={formData.personality}
              onChange={handleInputChange}
            >
              <option value="">선택하세요</option>
              <option value="매우 급함">매우 급함</option>
              <option value="급함">급함</option>
              <option value="원만">원만</option>
              <option value="느긋">느긋</option>
              <option value="매우 느긋">매우 느긋</option>
            </select>
          </div>
        </div>
        {/* 신장, 체중, BMI */}
        <div className="input-row">
          <div className="input-group vertical">
            <label className="form-label">신장</label>
            <input
              type="number"
              name="height"
              value={formData.height}
              onChange={handleInputChange}
              placeholder="cm"
            />
          </div>
          <div className="input-group vertical">
            <label className="form-label">체중</label>
            <input
              type="number"
              name="weight"
              value={formData.weight}
              onChange={handleInputChange}
              placeholder="kg"
            />
          </div>
          <div className="input-group vertical">
            <label className="form-label">BMI 지수</label>
            <input
              type="text"
              name="bmi"
              value={formData.bmi}
              readOnly
              placeholder="BMI"
            />
          </div>
        </div>
        {/* 스트레스, 노동강도 */}
        <div className="input-row">
          <div className="input-group vertical">
            <label className="form-label">스트레스</label>
            <select
              name="stress"
              value={formData.stress}
              onChange={handleInputChange}
            >
              <option value="">선택하세요</option>
              <option value="매우 높음">매우 높음</option>
              <option value="높음">높음</option>
              <option value="보통">보통</option>
              <option value="낮음">낮음</option>
              <option value="매우 낮음">매우 낮음</option>
            </select>
          </div>
          <div className="input-group vertical">
            <label className="form-label">노동강도</label>
            <select
              name="workIntensity"
              value={formData.workIntensity}
              onChange={handleInputChange}
            >
              <option value="">선택하세요</option>
              <option value="매우 높음">매우 높음</option>
              <option value="높음">높음</option>
              <option value="보통">보통</option>
              <option value="낮음">낮음</option>
              <option value="매우 낮음">매우 낮음</option>
            </select>
          </div>
        </div>
      </div>
      {/* 맥박 분석 섹션 */}
      <div className="form-section pulse-section">
        <h3 className="section-title">맥박 분석</h3>
        <div className="input-row">
          <div className="input-group">
            <label className="form-label">맥박</label>
            <input
              type="text"
              name="pulse"
              value={formData.pulse}
              onChange={handleInputChange}
              placeholder="회/분"
            />
          </div>
          <div className="input-group">
            <label className="form-label">수축기 혈압</label>
            <input
              type="text"
              name="systolicBP"
              value={formData.systolicBP}
              onChange={handleInputChange}
              placeholder="mmHg"
            />
          </div>
          <div className="input-group">
            <label className="form-label">이완기 혈압</label>
            <input
              type="text"
              name="diastolicBP"
              value={formData.diastolicBP}
              onChange={handleInputChange}
              placeholder="mmHg"
            />
          </div>
        </div>
      </div>
      {/* 맥파 분석 섹션 */}
      <div className="form-section pulse-section">
        <h3 className="section-title">맥파분석</h3>
        <div className="file-upload">
          <input
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileUpload}
            style={{ marginBottom: '10px' }}
          />
        </div>
        <button 
          type="button" 
          onClick={loadUbioData}
          className="button secondary"
        >
          맥파 데이터 가져오기
        </button>
        <div className="input-row">
          <div className="input-group">
            <label className="form-label">a-b</label>
            <input
              type="text"
              name="ab_ms"
              value={formData.ab_ms}
              onChange={handleInputChange}
            />
          </div>
          <div className="input-group">
            <label className="form-label">a-c</label>
            <input
              type="text"
              name="ac_ms"
              value={formData.ac_ms}
              onChange={handleInputChange}
            />
          </div>
          <div className="input-group">
            <label className="form-label">a-d</label>
            <input
              type="text"
              name="ad_ms"
              value={formData.ad_ms}
              onChange={handleInputChange}
            />
          </div>
          <div className="input-group">
            <label className="form-label">a-e</label>
            <input
              type="text"
              name="ae_ms"
              value={formData.ae_ms}
              onChange={handleInputChange}
            />
          </div>
        </div>
        <div className="input-row">
          <div className="input-group">
            <label className="form-label">b/a</label>
            <input
              type="text"
              name="ba_ratio"
              value={formData.ba_ratio}
              onChange={handleInputChange}
            />
          </div>
          <div className="input-group">
            <label className="form-label">c/a</label>
            <input
              type="text"
              name="ca_ratio"
              value={formData.ca_ratio}
              onChange={handleInputChange}
            />
          </div>
          <div className="input-group">
            <label className="form-label">d/a</label>
            <input
              type="text"
              name="da_ratio"
              value={formData.da_ratio}
              onChange={handleInputChange}
            />
          </div>
          <div className="input-group">
            <label className="form-label">e/a</label>
            <input
              type="text"
              name="ea_ratio"
              value={formData.ea_ratio}
              onChange={handleInputChange}
            />
          </div>
        </div>
      </div>
      {/* 증상 선택 섹션 */}
      <div className="form-section symptoms-section">
        <h3 className="section-title">증상 선택</h3>
        <div className="input-row">
          <div className="input-group">
            <label className="form-label">대분류</label>
            <select value={formData.selectedCategory} onChange={handleCategoryChange}>
              <option key="default-category" value="">선택하세요</option>
              {Object.keys(증상카테고리).map((category, index) => (
                <option key={`category-${index}-${category}`} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
          <div className="input-group">
            <label className="form-label">중분류</label>
            <select value={formData.selectedSubCategory} onChange={handleSubCategoryChange}>
              <option key="default" value="">선택하세요</option>
              {formData.selectedCategory && Object.keys(증상카테고리[formData.selectedCategory]).map(subCategory => (
                <option key={`subcategory-${subCategory}`} value={subCategory}>{subCategory}</option>
              ))}
            </select>
          </div>
          <div className="input-group">
            <label className="form-label">소분류</label>
            <select value={formData.selectedSymptom} onChange={handleSymptomChange}>
              <option key="default" value="">선택하세요</option>
              {formData.selectedSubCategory && 증상카테고리[formData.selectedCategory][formData.selectedSubCategory].map(symptom => (
                <option key={`symptom-${symptom.code}`} value={symptom.name}>{symptom.name}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="selected-symptoms">
          {formData.selectedSymptoms.map(symptom => (
            <span key={`selected-${symptom}`} className="symptom-tag">
              {symptom}
              <button type="button" onClick={() => removeSymptom(symptom)}>×</button>
            </span>
          ))}
        </div>
      </div>
      {/* 복용약물 섹션 */}
      <div className="form-section medication-section">
        <h3 className="section-title">복용약물</h3>
        <div className="input-row">
          <div className="input-group">
            <label className="form-label">복용 중인 약물</label>
            <select
              name="medication"
              value={formData.medication}
              onChange={handleInputChange}
            >
              <option key="default-medication" value="">약물을 선택하세요</option>
              {약물카테고리.map((약물, index) => (
                <option key={`medication-${index}-${약물}`} value={약물}>
                  {약물}
                </option>
              ))}
            </select>
          </div>
          <div className="input-group">
            <label className="form-label">기호식품</label>
            <select
              name="preference"
              value={formData.preference}
              onChange={handleInputChange}
            >
              <option key="default" value="">기호식품을 선택하세요</option>
              {기호식품카테고리.map((기호품, index) => (
                <option key={`preference-${index}`} value={기호품}>{기호품}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
      {/* 메모 섹션 */}
      <div className="form-section memo-section">
        <h3 className="section-title">메모</h3>
        <div className="input-row">
          <div className="input-group">
            <label className="form-label">메모</label>
            <textarea
              name="memo"
              value={formData.memo}
              onChange={handleInputChange}
              placeholder="추가할 메모사항을 입력하세요"
            />
          </div>
        </div>
      </div>
      {/* 버튼 그룹 */}
      <div className="button-group">
        <button 
          type="button"
          onClick={handleExportExcel}
          className="button secondary"
        >
          엑셀 다운로드
        </button>
        <button 
          type="submit" 
          className="button primary"
        >
          저장하기
        </button>
      </div>
    </form>
  );
}
// 컴포넌트 내보내기
export default UserInfoForm;
