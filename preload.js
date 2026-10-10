'use strict';
const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('api', {
  fetchReport: id => ipcRenderer.invoke('report:fetch', id),
  lookupItems: (ids, lang) => ipcRenderer.invoke('items:lookup', ids, lang),
  iconData: href => ipcRenderer.invoke('icon:data', href),
  checkUpdate: () => ipcRenderer.invoke('update:check'),
  installUpdate: asset => ipcRenderer.invoke('update:install', asset),
  appInfo: () => ipcRenderer.invoke('app:info'),
  openExternal: url => ipcRenderer.invoke('app:open', url),
});
