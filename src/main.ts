import { app, BrowserWindow, clipboard, Tray, Menu } from 'electron';
import * as fs from 'fs';
import * as path from 'path';

let mainWindow: BrowserWindow | null = null;
let tray: Tray | null = null;
let isQuiting = false;
type ClipCategory = 'Links' | 'Text' | 'Others';
type LinkSubCategory = 'Study' | 'Sports' | 'News' | 'OtherLink';
interface CategorizedClip {
  category: ClipCategory;
  subCategory?: LinkSubCategory;
  content: string;
}
let clipboardHistory: CategorizedClip[] = [];
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

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    icon: path.resolve(process.cwd(), 'icon.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
    },
    autoHideMenuBar: true
  });
  mainWindow.setMenuBarVisibility(false);
  mainWindow.loadFile('index.html');

  mainWindow.on('minimize', (event: Electron.Event) => {
    event.preventDefault();
    mainWindow?.hide();
  });

  mainWindow.on('close', (event: Electron.Event) => {
    if (!isQuiting) {
      event.preventDefault();
      mainWindow?.hide();
    }
  });
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

import { ipcMain } from 'electron';

function restoreClipboardHistory() {
  if (fs.existsSync(dataFile)) {
    try {
      const data = fs.readFileSync(dataFile, 'utf-8');
      clipboardHistory = JSON.parse(data);
    } catch (err) {
      clipboardHistory = [];
    }
  }
}

app.on('ready', () => {
  restoreClipboardHistory();
  createWindow();
  monitorClipboard();

  // Tray icon setup
  tray = new Tray(path.resolve(process.cwd(), 'icon.png'));
  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Show MemoClip',
      click: function () {
        mainWindow?.show();
      }
    },
    {
      label: 'Quit',
      click: function () {
        isQuiting = true;
        app.quit();
      }
    }
  ]);
  tray.setToolTip('MemoClip is running');
  tray.setContextMenu(contextMenu);
  tray.on('click', () => {
    mainWindow?.show();
  });
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

// Prevent app from quitting when all windows are closed
app.on('window-all-closed', () => {
  // Do nothing, keep app running in tray
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});
