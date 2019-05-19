const {app, BrowserWindow} = require('electron');
const fs = require('fs')
const path = require('path');
const launcher = require('launcher')

// Thjings for mc launch
const MCLauncher = require('minecraft-launcher')
const authenticator = require('minecraft-launcher/lib/authenticator/yggdrasil')
const core = new MCLauncher()

let mainWindow

function createWindow () {
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
  let d = app.getPath('userData')
  let f = path.join(d, "settings.json");
  let s = {
    "directory": d,
    "accounts": [],
    "lastAccount": ''
  };

  
  const Cryptr = require('cryptr');
  const cryptr = new Cryptr("this_is_a_development_test_encrypt_string");
  
  const encryptedString = cryptr.encrypt('exzistoken');
  const decryptedString = cryptr.decrypt(encryptedString);
  
  console.log(encryptedString); // 5590fd6409be2494de0226f5d7
  console.log(decryptedString); // bacon

  if (!fs.existsSync(f)) {
    fs.writeFile(f, JSON.stringify(s), function(e) {
      if (e) console.log("Error creating default configuration. Atom won't be able to run properly because of this.");
    }); 
  }
  
  createWindow()
  mainWindow.loadFile('html/home.html');

  /*let c;
  fs.readFile(f, 'utf8', function (e, data) {
    if (e) {
      console.log("Cannot access settings.");
      process.exit(1);
    }
    c = JSON.parse(data);
    c['accounts'].push(account)
    fs.writeFile(f, JSON.stringify(c), function(er) {
        if (er) {
          alert("Error updating configuration."); return;
        }
        
    }); 
  });*/


  

    //createWindow()
  
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


  //launcher(options)
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