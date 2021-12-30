
const { app, BrowserWindow } = require('electron');


// Functions
// ======================================================================================================

const createWindow = () => {
	const win = new BrowserWindow({
		width: 800,
		height: 600
	})
	win.loadFile('index.html');
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
