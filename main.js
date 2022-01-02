
const { app, BrowserWindow } = require('electron');
const path = require('path');


// Functions
// ======================================================================================================

const createWindow = () => {
	const win = new BrowserWindow({
		titleBarStyle: 'hidden',
		trafficLightPosition: { x: 10, y: 20 },
		defaultWidth: 1000,
		defaultHeight: 800,
		webPreferences: {
			nodeIntegration: true,
			preload: path.join(__dirname, 'preload.js'),
		},
	})
	win.loadFile('main.html');
}


// Events
// ======================================================================================================

app.on('window-all-closed', () => {

	// Toutes les fenêtres fermées ? -> on quitte l'application sur Windows et Linux
	if (process.platform !== 'darwin') {
		app.quit();
	}
})

app.whenReady().then(() => {
	createWindow();

	// Re-création de la fenêtre sur macOS
	app.on('activate', () => {
		if (BrowserWindow.getAllWindows().length === 0){
			createWindow();
		}
	})

})
