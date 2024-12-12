const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const xlsx = require('xlsx');

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  // 개발 환경에서는 localhost:3000, 프로덕션에서는 build된 파일을 로드
  if (process.env.NODE_ENV === 'development') {
    win.loadURL('http://localhost:3000');
  } else {
    win.loadFile(path.join(__dirname, 'build/index.html'));
  }
}

app.whenReady().then(createWindow);

// Excel 파일 읽기 핸들러
ipcMain.handle('read-excel-file', async (event, { filePath, userName }) => {
  try {
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(worksheet);
    
    const userWaveData = data.find(row => row['이름'] === userName);
    
    if (!userWaveData) {
      throw new Error('해당 사용자의 맥파 데이터를 찾을 수 없습니다.');
    }

    return {
      ab_ms: userWaveData['a-b(ms)'],
      ac_ms: userWaveData['a-c(ms)'],
      ad_ms: userWaveData['a-d(ms)'],
      ae_ms: userWaveData['a-e(ms)'],
      ba_ratio: userWaveData['b/a'],
      ca_ratio: userWaveData['c/a'],
      da_ratio: userWaveData['d/a'],
      ea_ratio: userWaveData['e/a']
    };
  } catch (error) {
    throw error;
  }
}); 