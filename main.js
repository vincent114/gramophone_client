
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
const { fork } = require('child_process');
const os = require('os');
const package = require('./package.json');


// Datas
// ======================================================================================================

let mainWindow = null;
let indexer = null;

const platform = os.platform();


// Functions
// ======================================================================================================

const createWindow = () => {

	// Fenêtre de l'application
	// ---

	let winState = windowStateKeeper({
		defaultWidth: 1000,
		defaultHeight: 800
	});

	mainWindow = new BrowserWindow({
		titleBarStyle: 'hidden',
		titleBarOverlay: (platform == 'win32') ? {
			color: '#216464',
			symbolColor: '#FFFFFF'
		} : false,
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
	if (platform == 'win32') {
		mainWindow.setMenuBarVisibility(false);
	}

	mainWindow.loadFile('main.html');
}

const initOsMenus = () => {

	// Menu système de l'application (macOS)
	// ---

	if (platform != 'darwin') { return; }

	let template = [];

	template.push({
		label: 'Gramophone',
		submenu: [
			{
				label: 'A propos de Gramophone',
				click () {
					mainWindow.webContents.send("about");
				}
			},
			{type: 'separator'},
			{
				label: 'Préférences',
				accelerator: 'CmdOrCtrl+,',
				click () {
					mainWindow.webContents.send("admin");
				}
			},
			{type: 'separator'},
			{role: 'services', submenu: []},
			{type: 'separator'},
			{
				role: 'hide',
				label: 'Masquer Gramophone',
			},
			{
				role: 'hideothers',
				label: 'Masquer les autress',
			},
			{
				role: 'unhide',
				label: 'Tout afficher',
			},
			{type: 'separator'},
			{
				role: 'quit',
				label: 'Quitter Gramophone',
			}
		]
	});

	template.push({
		label: 'Edition',
		submenu: [
			{
				role: 'undo',
				label: 'Annuler',
			},
			{
				role: 'redo',
				label: 'Rétablir',
			},
			{type: 'separator'},
			{
				role: 'cut',
				label: 'Couper',
			},
			{
				role: 'copy',
				label: 'Copier',
			},
			{
				role: 'paste',
				label: 'Coller',
			},
			{
				role: 'selectall',
				label: 'Tout sélectionner',
			}
		]
	});

	template.push({
		label: 'Commandes',
		submenu: [
			{
				label: 'Lecture',
				click () {
					mainWindow.webContents.send("audioPlay");
				}
			},
			{
				label: 'Pause',
				click () {
					mainWindow.webContents.send("audioPause");
				}
			},
			{
				label: 'Suivant',
				click () {
					mainWindow.webContents.send("readNext");
				}
			},
			{
				label: 'Précédent',
				click () {
					mainWindow.webContents.send("readPrevious");
				}
			},
		]
	});

	if (!package.isProd) {
		template.push({
			label: 'Debug',
			submenu: [
				{
					label: 'Recharger',
					accelerator: 'Cmd+R',
					click () {
						mainWindow.reload()
					}
				},
				{
					label: 'Outils de développement',
					accelerator: 'Alt+Cmd+I',
					click () {
						const win = BrowserWindow.getFocusedWindow();
						win.webContents.openDevTools();
					}
				}
			]
		});
	}

	template.push({
		role: 'window',
		label: 'Fenêtre',
		submenu: [
			{
				role: 'close',
				label: 'Fermer',
			},
			{
				role: 'minimize',
				label: 'Réduire',
			},
			{role: 'zoom'},
			{type: 'separator'},
			{
				role: 'front',
				label: 'Tout ramener au premier plan',
			}
		]
	});

	const appMenu = Menu.buildFromTemplate(template);
	Menu.setApplicationMenu(appMenu);
}

const initOsJumplist = () => {

	// Fonctions contextuelles (barre des tâches sous Windows & dock sous macOS)
	// ---

	// if (osName != 'darwin') { return; }

	let contextualItems = []

	contextualItems.push({
		label: 'Lecture',
		click () {
			mainWindow.webContents.send("audioPlay");
		}
	})
	contextualItems.push({
		label: 'Pause',
		click () {
			mainWindow.webContents.send("audioPause");
		}
	})
	contextualItems.push({
		label: 'Suivant',
		click () {
			mainWindow.webContents.send("readNext");
		}
	})
	contextualItems.push({
		label: 'Précédent',
		click () {
			mainWindow.webContents.send("readPrevious");
		}
	})

	const dockMenu = Menu.buildFromTemplate(contextualItems);
	app.dock.setMenu(dockMenu);
}

const initOSglobalHotkeys = () => {

	// Initialisation des raccourci globaux système (pour les contrôles de lecture)
	// ---

	// 119 : MediaPlayPause | F8 : Play / Pause
	// 177 : MediaPrevTrack | F7 : Previous
	// 176 : MediaNextTrack | F9 : Next
	// 178 : MediaStop : Stop

	globalShortcut.unregisterAll();

	// Hotkey Play / Pause
	var ret = globalShortcut.register('MediaPlayPause', () => {
		console.log('MediaPlayPause');
		mainWindow.webContents.send("audioToggle");
	});
	var ret = globalShortcut.register('F8', () => {
		mainWindow.webContents.send("audioToggle");
	});

	// Hotkey Stop
	var ret = globalShortcut.register('MediaStop', () => {
		mainWindow.webContents.send("audioStop");
	});

	// Hotkey Previous
	var ret = globalShortcut.register('MediaPreviousTrack', () => {
		mainWindow.webContents.send("readPrevious");
	});
	var ret = globalShortcut.register('F7', () => {
		mainWindow.webContents.send("readPrevious");
	});

	// Hotkey Next
	var ret = globalShortcut.register('MediaNextTrack', () => {
		mainWindow.webContents.send("readNext");
	});
	var ret = globalShortcut.register('F9', () => {
		mainWindow.webContents.send("readNext");
	});
}


// Events
// ======================================================================================================

// app events
// -------------------------------------------------------------------

app.on('window-all-closed', () => {

	// Toutes les fenêtres fermées ? -> on quitte l'application sur Windows et Linux
	if (platform !== 'darwin') {
		app.quit();
	}
});

app.whenReady().then(() => {

	createWindow();

	initOsMenus();
	initOsJumplist();
	initOSglobalHotkeys();

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

ipcMain.on("startIndexer", (event, [scope, folders, collectionFiles, collectionCoversPath]) => {

	// Démarrage du processus d'indexation
	// ---

	indexer = fork('indexer.js', {
		cwd: __dirname,
	});

	// On a un retour du processus de scan
	indexer.on('message', (datas) => {

		// Scan en cours ?
		if (datas.status == 'working') {
			mainWindow.webContents.send("indexTrack", datas.processResults);
		}

		// Scan terminé ?
		if (datas.status == 'done') {
			mainWindow.webContents.send("scanDone");
		}
	});

	// Scan en erreur ?
	indexer.on('exit', (code) => {
		if (code) {
			mainWindow.webContents.send("scanError", code);
		}
	});

	indexer.send({
		"scope": scope,
		"folders": folders,
		"collectionFiles": collectionFiles,
		"collectionCoversPath": collectionCoversPath,
	});
});

ipcMain.handle("readJson", async (event, [filePath]) => {

	// Lit et parse le fichier json passé en paramètres
	// ---

	const result = await fs.readJson(filePath);
	return result;
});

ipcMain.on("writeJSON", async (event, [filePath, datas, options]) => {

	// Ecrit des données dans le fichier passé en paramètres
	// ---

	options = (options) ? options : {};

	const result = await fs.writeJson(filePath, datas, options);
	mainWindow.webContents.send("JSONwritten", result);
});

ipcMain.handle("copy", async (event, [sourcePath, targetPath]) => {

	// Copie de fichier
	// ---

	const result = await fs.copy(sourcePath, targetPath);
	return result;
});

ipcMain.on("remove", async (event, [removePath]) => {

	// Suppression du fichier
	// ---

	if (!removePath) { return null; }

	const result = await fs.remove(removePath);
	mainWindow.webContents.send("removed", result);
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

// ***** shell *****
// *****************

ipcMain.on("showItemInFolder", (event, [fullPath]) => {

	// Met en évidence le fichier ou le dossier passé en paramètres dans le Finder / Explorateur
	// ---

	event.returnValue = shell.showItemInFolder(fullPath);
});

ipcMain.on("openExternal", (event, [url]) => {

	// Ouvre l'URL passée en paramètres dans le navigateur par défaut
	// ---

	event.returnValue = shell.openExternal(url);
});

// ***** os *****
// **************

ipcMain.on("platform", (event, []) => {

	// Met en évidence le fichier ou le dossier passé en paramètres dans le Finder / Explorateur
	// ---

	event.returnValue = platform;
});
