import * as XLSX from 'xlsx';

export const exportToExcel = (data, filename = 'export.xlsx') => {
  try {
    // 데이터 가공
    const processedData = data.map(item => ({
      '등록일시': item.createdAt,
      '이름': item.name,
      '주민등록번호': item.residentNumber,
      '성별': item.gender,
      '신장(cm)': item.height,
      '체중(kg)': item.weight,
      'BMI': item.bmi,
      '스트레스': item.stress,
      '노후정도': item.aging,
      '맥박(회/분)': item.pulse,
      '수축기 혈압': item.systolicBP,
      '이완기 혈압': item.diastolicBP,
      '기저질환': item.underlying,
      '복용약물': item.medication,
      '중증도': item.severity,
      '기타': item.etc
    }));

    // 워크북 생성
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(processedData);

    // 열 너비 자동 조정
    const colWidths = Object.keys(processedData[0] || {}).map(key => ({
      wch: Math.max(
        key.length,
        ...processedData.map(row => String(row[key] || '').length)
      )
    }));
    ws['!cols'] = colWidths;

    // 워크시트 추가
    XLSX.utils.book_append_sheet(wb, ws, 'Data');

    // 파일 저장
    XLSX.writeFile(wb, filename);
    return true;
  } catch (error) {
    console.error('Export error:', error);
    return false;
  }
};

export const exportToCSV = (data, filename = 'export.csv') => {
  try {
    // CSV 문자열 생성
    const headers = [
      '등록일시', '이름', '주민등록번호', '성별', '신장(cm)', 
      '체중(kg)', 'BMI', '스트레스', '노후정도', '맥박(회/분)', 
      '수축기 혈압', '이완기 혈압', '기저질환', '복용약물', '중증도', '기타'
    ];
    
    const rows = data.map(item => [
      item.createdAt,
      item.name,
      item.residentNumber,
      item.gender,
      item.height,
      item.weight,
      item.bmi,
      item.stress,
      item.aging,
      item.pulse,
      item.systolicBP,
      item.diastolicBP,
      item.underlying,
      item.medication,
      item.severity,
      item.etc
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => 
        `"${String(cell || '').replace(/"/g, '""')}"`
      ).join(','))
    ].join('\n');

    // 파일 다운로드
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
    URL.revokeObjectURL(link.href);
    return true;
  } catch (error) {
    console.error('Export error:', error);
    return false;
  }
}; 