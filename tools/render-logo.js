'use strict';
// electron tools/render-logo.js  ->  genera src/assets/logo.png y build/icon.png (512x512) a partir de logo.svg
const { app, BrowserWindow } = require('electron');
const fs = require('fs');
const path = require('path');
app.disableHardwareAcceleration();
app.whenReady().then(async () => {
  const root = path.resolve(__dirname, '..');
  const svg = fs.readFileSync(path.join(root, 'src/assets/logo.svg'), 'utf8');
  const win = new BrowserWindow({ width: 512, height: 512, show: false, transparent: true, frame: false, webPreferences: { offscreen: true } });
  await win.loadURL('data:text/html,' + encodeURIComponent(`<body style="margin:0;background:transparent">${svg.replace('<svg ', '<svg style="display:block" ')}</body>`));
  await new Promise(r => setTimeout(r, 500));
  const png = (await win.webContents.capturePage()).toPNG();
  fs.writeFileSync(path.join(root, 'src/assets/logo.png'), png);
  fs.writeFileSync(path.join(root, 'build/icon.png'), png);
  app.exit(0);
});
