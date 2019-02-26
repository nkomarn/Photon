const remote = require('electron').remote;
const app = remote.app;
const shell = require('shelljs');
const fs = require('fs')

/* Titlebar controls */
function exit() {
    const remote = require('electron').remote;
    let w = remote.getCurrentWindow();
    w.close();
}
function minimize() {
    const remote = require('electron').remote;
    let w = remote.getCurrentWindow();
    w.minimize();
}

// Install script for modpack
function install(id) {
    let config;
    let packData;

    // Get modpack data
    $.ajax({
        type: 'GET',
        url: "http://localhost:5050/pack/" + id,
        dataType: "json",
        contentType: 'application/json',
        success: function (data) {
            packData = JSON.parse(JSON.stringify(data))
            console.log(packData)
            // Get config from file
            fs.readFile(app.getPath('userData') + "/settings.json", 'utf8', function (err, data) {
                if (err) {alert("Can't read the configuration. This means you won't be able to install."); return;};
                config = JSON.parse(data);
                console.log(data)

                // Create new folder in install directory
                let dir = config['directory'] + "/instances/" + packData[0]['name']
                if (!fs.existsSync(dir)){
                    shell.mkdir('-p', dir);
                }
            });
        },
        error: function(x, status, error) {
            console.log('Fetching data failed.')
            return;
        }
    });
}

// Check for updates
function checkUpdates() {
    
}