
const {
	app,
	dialog,
	shell,
	BrowserWindow,
	Menu,
	globalShortcut,
	ipcMain,
} = require('electron');
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
			// nodeIntegration: false,
			// contextIsolation: true,
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

// app events
// -------------------------------------------------------------------

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

// ipc events
// -------------------------------------------------------------------

ipcMain.on("chooseFolder", (event) => {

	// Sélection d'un dossier
	// ---

	dialog.showOpenDialog(mainWindow, {
		properties: ['openDirectory']
	}).then(result => {
		mainWindow.webContents.send("folderChoosed", result.filePaths);
	}).catch(err => {
		console.log(err)
	});
});
