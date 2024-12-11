import React, { useState } from 'react';
import { saveUserInfo, getAllUserInfo } from '../../api/userInfo';
import { 증상카테고리 } from '../../data/symptoms';
import { 약물카테고리 } from '../../data/medications';
import { 기호식품카테고리 } from '../../data/preferences';
import * as XLSX from 'xlsx';
import '../../styles/UserInfoForm.css';

const UserInfoForm = () => {
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

  return (
    <form onSubmit={handleSubmit} className="form-container">
      {/* 기본 정보 섹션 */}
      <div className="form-section basic-info-section">
        <h3 className="section-title">기본 정보</h3>
        
        {/* 이름, 주민등록번호, 성별을 한 줄로 배치 */}
        <div className="input-row">
          <div className="input-group" style={{ flex: '0.8' }}>  {/* 이름 필드는 좀 더 좁게 */}
            <label className="form-label required">이름</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="이름을 입력하세요"
            />
          </div>
          <div className="input-group" style={{ flex: '1.2' }}>  {/* 주민번호 필드는 좀 더 넓게 */}
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
          <div className="input-group" style={{ flex: '0.8' }}>  {/* 성별 필드는 좀 더 좁게 */}
            <label className="form-label">성별</label>
            <div className="radio-group">
              <label className="radio-label">
                <input
                  type="radio"
                  name="gender"
                  value="male"
                  checked={formData.gender === 'male'}
                  onChange={handleInputChange}
                  disabled
                />
                남성
              </label>
              <label className="radio-label">
                <input
                  type="radio"
                  name="gender"
                  value="female"
                  checked={formData.gender === 'female'}
                  onChange={handleInputChange}
                  disabled
                />
                여성
              </label>
            </div>
          </div>
        </div>

        {/* 연락처 입력 필드 */}
        <div className="input-row">
          <div className="input-group">
            <label className="form-label">연락처</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              placeholder="연락처를 입력하세요"
              maxLength="13"
            />
          </div>
        </div>

        {/* 성격 입력 필드 */}
        <div className="input-row">
          <div className="input-group">
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

        {/* 신장, 체중, BMI 입력 필드 */}
        <div className="input-row">
          <div className="input-group">
            <label className="form-label">신장</label>
            <input
              type="number"
              name="height"
              value={formData.height}
              onChange={handleInputChange}
              placeholder="cm"
            />
          </div>
          <div className="input-group">
            <label className="form-label">체중</label>
            <input
              type="number"
              name="weight"
              value={formData.weight}
              onChange={handleInputChange}
              placeholder="kg"
            />
          </div>
          <div className="input-group">
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

        {/* 스트레스 수준과 노동강도 */}
        <div className="input-row">
          <div className="input-group">
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
          <div className="input-group">
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

      {/* 증상 선택 섹션 */}
      <div className="form-section symptoms-section">
        <h3 className="section-title">증상 선택</h3>
        <div className="input-row">
          <div className="input-group">
            <label className="form-label">대분류</label>
            <select value={formData.selectedCategory} onChange={handleCategoryChange}>
              <option value="">선택하세요</option>
              {Object.keys(증상카테고리).map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
          <div className="input-group">
            <label className="form-label">중분류</label>
            <select value={formData.selectedSubCategory} onChange={handleSubCategoryChange}>
              <option value="">선택하세요</option>
              {formData.selectedCategory && Object.keys(증상카테고리[formData.selectedCategory]).map(subCategory => (
                <option key={subCategory} value={subCategory}>{subCategory}</option>
              ))}
            </select>
          </div>
          <div className="input-group">
            <label className="form-label">소분류</label>
            <select value={formData.selectedSymptom} onChange={handleSymptomChange}>
              <option value="">선택하세요</option>
              {formData.selectedSubCategory && 증상카테고리[formData.selectedCategory][formData.selectedSubCategory].map(symptom => (
                <option key={symptom.code} value={symptom.name}>{symptom.name}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="selected-symptoms">
          {formData.selectedSymptoms.map(symptom => (
            <span key={symptom} className="symptom-tag">
              {symptom}
              <button onClick={() => removeSymptom(symptom)}>×</button>
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
              <option value="">약물을 선택하세요</option>
              {약물카테고리.map((약물, index) => (
                <option key={index} value={약물}>{약물}</option>
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
              <option value="">기호식품을 선택하세요</option>
              {기호식품카테고리.map((기호품, index) => (
                <option key={index} value={기호품}>{기호품}</option>
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
              placeholder="추가적인 메모사항을 입력하세요"
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
};

export default UserInfoForm;