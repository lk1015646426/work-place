import { AppData } from './types';
import { INITIAL_DEMO_DATA } from './constants';

const STORAGE_KEY = 'android16_livingdesk_v2';

export function loadAppData(): AppData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      saveAppData(INITIAL_DEMO_DATA);
      return INITIAL_DEMO_DATA;
    }
    const parsed = JSON.parse(raw);
    return {
      habits: Array.isArray(parsed.habits) ? parsed.habits : INITIAL_DEMO_DATA.habits,
      days: Array.isArray(parsed.days) ? parsed.days : INITIAL_DEMO_DATA.days,
      treeholes: Array.isArray(parsed.treeholes) ? parsed.treeholes : INITIAL_DEMO_DATA.treeholes,
      memos: Array.isArray(parsed.memos) ? parsed.memos : INITIAL_DEMO_DATA.memos,
    };
  } catch (err) {
    console.error('Failed to parse storage data:', err);
    return INITIAL_DEMO_DATA;
  }
}

export function saveAppData(data: AppData): boolean {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    return true;
  } catch (err) {
    console.error('Failed to save storage data:', err);
    return false;
  }
}

export function exportBackupJSON(data: AppData): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const d = new Date();
  const dateStr = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
  a.href = url;
  a.download = `livingdesk_android16_backup_${dateStr}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export async function importBackupJSON(file: File): Promise<AppData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const parsed = JSON.parse(text);
        if (!parsed || typeof parsed !== 'object') {
          throw new Error('无效的备份文件');
        }
        const validated: AppData = {
          habits: Array.isArray(parsed.habits) ? parsed.habits : [],
          days: Array.isArray(parsed.days) ? parsed.days : [],
          treeholes: Array.isArray(parsed.treeholes) ? parsed.treeholes : [],
          memos: Array.isArray(parsed.memos) ? parsed.memos : [],
        };
        saveAppData(validated);
        resolve(validated);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(new Error('文件读取失败'));
    reader.readAsText(file);
  });
}
