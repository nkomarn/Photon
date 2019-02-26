const {app, BrowserWindow} = require('electron');
const Store = require('electron-store');
const fs = require('fs')
const launcher = require('launcher')

// Thjings for mc launch
const MCLauncher = require('minecraft-launcher')
const authenticator = require('minecraft-launcher/lib/authenticator/yggdrasil')
const core = new MCLauncher()

let mainWindow
const store = new Store();
let defaultSettings = {
  "directory": app.getPath('userData'),
  "accounts": []
};

function createWindow () {
  // Create settings file in user data
  if (!fs.existsSync(app.getPath('userData') + "/settings.json")) {
    fs.writeFile(app.getPath('userData') + "/settings.json", JSON.stringify(defaultSettings), function(e) {
      if (e) {
        alert("Error creating default configuration. Atom won't be able to run properly because of this.")
        console.log(e);
      }
    }); 
  }

  mainWindow = new BrowserWindow({
    width: 1000,
    height: 600,
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
  //createWindow()

  let c;
  
  /*fs.readFile(app.getPath('userData') + "/settings.json", 'utf8', function (err, data) {
    if (err) {alert("Can't read the configuration."); return;}
    c = JSON.parse(data);
    let accounts = c['accounts']
  
    if (!Array.isArray(accounts) || !accounts.length) {
      mainWindow.loadFile('html/login.html');
    }
    else {
      mainWindow.loadFile('html/home.html');
    }
  });*/

  // TODO LAUNCHER
  const options = {
    version: '1.7.10',
    instance: app.getPath('userData') + "/instances/Boson",
    data: app.getPath('userData'),
    email: '',
    password: "",
    memory: {
      minimum: "1G",
      maximum: "8G"
    },
    forge: false,
    arguments: []
  }


  launcher(options)
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

exports.home = () => {
  mainWindow.loadFile('html/home.html');
}