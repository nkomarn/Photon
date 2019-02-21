const {app, BrowserWindow} = require('electron');
const Store = require('electron-store');

// Thjings for mc launch
const MCLauncher = require('minecraft-launcher')
const authenticator = require('minecraft-launcher/lib/authenticator/yggdrasil')
const core = new MCLauncher()

const opts = {
  version: '19w04b',
  authenticator: authenticator("nkomarn@hotmail.com", "#"),
  versionType: 'Atom', 
  maxMemory: 4000,
  minMemory: 512,
  launcherName: 'Atom',
  launcherVersion: '1.0',
  advencedArguments: [],
  cgcEnabled: true 
}


let mainWindow
const store = new Store();

function createWindow () {
  mainWindow = new BrowserWindow({
    width: 600,
    height: 300,
    transparent: false,
    resizable: false,
    frame: false,
    backgroundColor: '#252630',
    show: false
  })

  mainWindow.webContents.on('did-finish-load', function() {
    mainWindow.show();
  });

  mainWindow.on('closed', function () {
    mainWindow = null
  })
}

app.on('ready', function() {
  createWindow()
  mainWindow.loadFile('html/login.html');
  core.launch(opts)
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function () {
  if (mainWindow === null) {
    createWindow()
  }
})