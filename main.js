
const { app, dialog, shell, BrowserWindow, Menu, globalShortcut } = require('electron');
const windowStateKeeper = require('electron-window-state');
const path = require('path');

let mainWindow = null;


// Functions
// ======================================================================================================

const createWindow = () => {

	let winState = windowStateKeeper({
		defaultWidth: 1000,
		defaultHeight: 800
	});

	mainWindow = new BrowserWindow({
		titleBarStyle: 'hidden',
		trafficLightPosition: { x: 10, y: 20 },

		x: winState.x,
		y: winState.y,
		width: winState.width,
		height: winState.height,

		webPreferences: {
			nodeIntegration: true,
			preload: path.join(__dirname, 'preload.js'),
		},
	});

	winState.manage(mainWindow);
	if (process.platform == 'win32') {
		mainWindow.setMenuBarVisibility(false);
	}

	mainWindow.loadFile('main.html');
}


// Events
// ======================================================================================================

app.on('window-all-closed', () => {

	// Toutes les fenêtres fermées ? -> on quitte l'application sur Windows et Linux
	if (process.platform !== 'darwin') {
		app.quit();
	}
});

app.whenReady().then(() => {
	createWindow();

	// Re-création de la fenêtre sur macOS
	app.on('activate', () => {
		if (BrowserWindow.getAllWindows().length === 0){
			createWindow();
		}
	})
});

app.on('will-quit', () => {
	globalShortcut.unregisterAll()
});


// Exports
// ======================================================================================================

exports.app = app;
exports.dialog = dialog;
exports.shell = shell;
exports.mainWindow = mainWindow;
exports.menu = Menu;
exports.globalShortcut = globalShortcut;
