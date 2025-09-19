import { app, BrowserWindow, clipboard } from 'electron';
import * as fs from 'fs';
import * as path from 'path';

let mainWindow: BrowserWindow | null = null;
type ClipCategory = 'Links' | 'Text' | 'Others';
type LinkSubCategory = 'Study' | 'Sports' | 'News' | 'OtherLink';
interface CategorizedClip {
  category: ClipCategory;
  subCategory?: LinkSubCategory;
  content: string;
}
const clipboardHistory: CategorizedClip[] = [];
const dataFile = path.join(app.getPath('userData'), 'clipboard.json');

function classifyLinkSubCategory(url: string): LinkSubCategory {
  const lower = url.toLowerCase();
  if (/\b(wikipedia|khanacademy|coursera|edx|udemy|github|docs|tutorial|learn|study)\b/.test(lower)) return 'Study';
  if (/\b(espn|cricinfo|nba|fifa|football|cricket|tennis|sports)\b/.test(lower)) return 'Sports';
  if (/\b(news|bbc|cnn|nytimes|guardian|reuters|timesofindia|hindustantimes)\b/.test(lower)) return 'News';
  return 'OtherLink';
}

function classifyClip(text: string): { category: ClipCategory; subCategory?: LinkSubCategory } {
  if (/https?:\/\/.+/.test(text)) {
    return { category: 'Links', subCategory: classifyLinkSubCategory(text) };
  }
  if (text.length < 200) return { category: 'Text' };
  return { category: 'Others' };
}

function saveClipboardHistory() {
  fs.writeFileSync(dataFile, JSON.stringify(clipboardHistory, null, 2));
}

function monitorClipboard() {
  let lastText = clipboard.readText();
  setInterval(() => {
    const text = clipboard.readText();
    if (text && text !== lastText) {
      const { category, subCategory } = classifyClip(text);
      clipboardHistory.push({ category, subCategory, content: text });
      saveClipboardHistory();
      lastText = text;
    }
  }, 1000);
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
    },
    autoHideMenuBar: true
  });
  mainWindow.setMenuBarVisibility(false);
  mainWindow.loadFile('index.html');
}

import { ipcMain } from 'electron';

app.on('ready', () => {
  createWindow();
  monitorClipboard();
});

ipcMain.handle('get-clipboard-history', async () => {
  // Group by category and subcategory for links
  const grouped: Record<string, any> = {
    Links: {
      Study: [],
      Sports: [],
      News: [],
      OtherLink: []
    },
    Text: [],
    Others: []
  };
  clipboardHistory.forEach(clip => {
    if (clip.category === 'Links' && clip.subCategory) {
      grouped.Links[clip.subCategory].push(clip.content);
    } else if (clip.category === 'Text') {
      grouped.Text.push(clip.content);
    } else if (clip.category === 'Others') {
      grouped.Others.push(clip.content);
    }
  });
  return grouped;
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});
