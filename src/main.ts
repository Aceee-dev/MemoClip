import { app, BrowserWindow, Tray, Menu, shell } from 'electron';
import * as path from 'path';
import { ClipboardManager } from './core/ClipboardManager';
import { ClassificationService } from './core/ClassificationService';
import { PersistenceService } from './core/PersistenceService';
import { ipcMain } from 'electron';

let mainWindow: BrowserWindow | null = null;
let tray: Tray | null = null;
let isQuiting = false;

const dataFilePath = path.join(app.getPath('userData'), 'clipboard.json');
const persistenceService = new PersistenceService(dataFilePath);
const classificationService = new ClassificationService();
const clipboardManager = new ClipboardManager(classificationService, persistenceService, (clip) => {
  if (mainWindow) {
    mainWindow.webContents.send('clipboard-updated', clip);
  }
});

function getIconPath() {
  return path.resolve(process.cwd(), 'icon.ico');
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    icon: getIconPath(),
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

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });
}

app.on('ready', () => {
  createWindow();
  clipboardManager.startMonitoring();

  // Tray icon setup
  tray = new Tray(getIconPath());
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

app.on('before-quit', () => {
  clipboardManager.stopMonitoring();
});

ipcMain.handle('get-clipboard-history', async () => {
  // Group by type and subType for links
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
  persistenceService.getClips().forEach(clip => {
    if (clip.type === 'Link' && clip.subType) {
      grouped.Links[clip.subType].push(clip.content);
    } else if (clip.type === 'Text') {
      grouped.Text.push(clip.content);
    } else if (clip.type === 'Other') {
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
