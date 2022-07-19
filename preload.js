const { contextBridge, ipcRenderer } = require('electron');


// Exports
// ======================================================================================================

contextBridge.exposeInMainWorld('ipc', {

	send: (apiKey, params) => {
		ipcRenderer.send(apiKey, params);
	},

	invoke: (apiKey, params) => {
		return ipcRenderer.invoke(apiKey, params);
	},

	sendSync: (apiKey, ...args) => {
		return ipcRenderer.sendSync(apiKey, args);
	},

	once: (apiKey, callback) => {
		ipcRenderer.once(apiKey, (event, ...args) => callback(...args));
	},

	on: (apiKey, callback) => {
		ipcRenderer.on(apiKey, (event, ...args) => callback(...args));
	},

});
