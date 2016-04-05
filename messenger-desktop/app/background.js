// This is main process of Electron, started as first thing when your
// app starts. This script is running through entire life of your application.
// It doesn't have any windows which you can see on screen, but we can open
// window from here.

import { app } from 'electron';
import createWindow from './helpers/window';

// Special module holding environment variables which you declared
// in config/env_xxx.json file.
import env from './env';

var Menu = require('menu');
var mainWindow;
var force_quit = false;
var quitReady = false;

app.on('ready', function () {

    var mainWindow = createWindow('main', {
        width: 1000,
        height: 600
    });

    mainWindow.loadURL('file://' + __dirname + '/index.html');

    if (env.name == 'production') {
        var menu = Menu.buildFromTemplate([{
            label: 'Magnet Messenger',
            submenu: [{
                label: 'Quit',
                accelerator: 'CmdOrCtrl+Q',
                click: function() {
                    force_quit = true;
                    app.quit();
                }
            }]
        }]);
        Menu.setApplicationMenu(menu);
    } else {
        var devMenu = Menu.buildFromTemplate([{
            label: 'Development',
            submenu: [{
                label: 'Reload',
                accelerator: 'CmdOrCtrl+R',
                click: function() {
                    BrowserWindow.getFocusedWindow().webContents.reloadIgnoringCache();
                }
            },{
                label: 'Toggle DevTools',
                accelerator: 'Alt+CmdOrCtrl+I',
                click: function() {
                    BrowserWindow.getFocusedWindow().toggleDevTools();
                }
            },{
                label: 'Quit',
                accelerator: 'CmdOrCtrl+Q',
                click: function() {
                    force_quit = true;
                    app.quit();
                }
            }]
        }]);
        Menu.setApplicationMenu(devMenu);

        mainWindow.openDevTools();
    }

    // Continue to handle mainWindow "close" event here
    mainWindow.on('close', function(e) {
        if (!force_quit) {
            e.preventDefault();
            mainWindow.hide();
        }
        force_quit = true;
    });

    // You can use 'before-quit' instead of (or with) the close event
    app.on('before-quit', function(e) {
        // Handle menu-item or keyboard shortcut quit here
        if (!force_quit) {
            e.preventDefault();
            mainWindow.hide();
        }
        force_quit = true;
    });

    app.on('activate-with-no-open-windows', function() {
        force_quit = false;
        mainWindow.show();
    });

    app.on('will-quit', function () {
        // This is a good place to add tests insuring the app is still
        // responsive and all windows are closed.
        mainWindow = null;
    });

    app.on('window-all-closed', function() {
        if (process.platform != 'darwin') {
            app.quit();
        }
    });

});