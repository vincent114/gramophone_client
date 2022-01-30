const { contextBridge, ipcRenderer } = require('electron');


// Exports
// ======================================================================================================

contextBridge.exposeInMainWorld('electron', {

	send: (apiKey, params) => {
		ipcRenderer.send(apiKey, params);
	},

	sendSync: (apiKey, ...arg) => {
		return ipcRenderer.sendSync(apiKey, arg);
	},

	once: (apiKey, callback) => {
		ipcRenderer.once(apiKey, (event, ...args) => callback(...args));
	},

	on: (apiKey, callback) => {
		ipcRenderer.on(apiKey, (event, ...args) => callback(...args));
	},

});
