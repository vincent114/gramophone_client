
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
const fs = require('fs-extra');

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

// ipc async events
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

// ipc sync events
// -------------------------------------------------------------------

ipcMain.on("getCwd", (event, [returnFormat]) => {

	// Quel est le current working directory ?
	// ---

	// const cwd = process.cwd();
	let cwd = __dirname;
	if (returnFormat == "parsed") {
		cwd = cwd.split(path.sep);
	}
	event.returnValue = cwd;
});

// ***** fs *****
// **************

ipcMain.on("pathJoin", (event, [pathParts]) => {

	// Join path parts
	// ---

	let joined = "";
	for (const pathPart of pathParts) {
		if (!joined) {
			joined = pathPart;
		} else {
			joined = `${joined}${path.sep}${pathPart}`
		}
	}
	event.returnValue = joined;
});

ipcMain.on("mkdirsSync", (event, [folderPath]) => {

	// Création du dossier passé en paramètres
	// ---

	event.returnValue = fs.mkdirsSync(folderPath);
});

ipcMain.on("existsSync", (event, [fileOrFolderPath]) => {

	// Le dossier / fichier passé en paramètres existe-t-il ?
	// ---

	event.returnValue = fs.existsSync(fileOrFolderPath);
});

// ***** json *****
// ****************

ipcMain.on("readJsonSync", (event, [filePath]) => {

	// Lit et parse le fichier json passé en paramètres
	// ---

	event.returnValue = fs.readJsonSync(filePath);
});


ipcMain.on("writeJSONSync", (event, [filePath, datas, options]) => {

	// Ecrit des données dans le fichier passé en paramètres
	// ---

	options = (options) ? options : {};

	event.returnValue = fs.writeJSONSync(filePath, datas, options);
});
