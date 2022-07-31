import React from 'react';
import { types, getRoot } from "mobx-state-tree";
import { observer } from "mobx-react-lite";
import clsx from 'clsx';

import {
	getFromStorage,
	setToStorage
} from 'nexus/utils/Storage';
import { dateTools } from 'nexus/utils/DateTools';
import { copyObj } from 'nexus/utils/Datas';


// Models
// ======================================================================================================

// ***** LibraryIgnoredFileStore *****
// ***********************************

const TAG_LibraryIgnoredFileStore = () => {}
export const LibraryIgnoredFileStore = types
	.model({
		file_path: types.maybeNull(types.string),
		reason: types.maybeNull(types.string),
	})
	.views(self => ({

		get label() {
			if (self.file_path) {
				const filePathParts = self.file_path.split('/');
				if (filePathParts.length > 0) {
					return filePathParts[filePathParts.length - 1];
				}
			}
			return "";
		},

	}))
	.actions(self => ({

		setField: (field, value) => {
			self[field] = value;
		},

		// -

		update: (raw) => {
			self.file_path = raw.file_path;
			self.reason = raw.reason;
		},

	}))

// ***** LibraryFolderStore *****
// ******************************

const TAG_LibraryFolderStore = () => {}
export const LibraryFolderStore = types
	.model({
		folder_path: types.maybeNull(types.string),
		folder_available: false,

		nb_files: types.maybeNull(types.integer, 0),
		nb_files_ignored: types.maybeNull(types.integer, 0),

		ignored_files: types.optional(types.array(LibraryIgnoredFileStore), []),
	})
	.views(self => ({

		get label() {
			if (self.folder_path) {
				const folderPathParts = self.folder_path.split('/');
				if (folderPathParts.length > 0) {
					return folderPathParts[folderPathParts.length - 1];
				}
			}
			return "";
		},

		// Bools
		// -

		get isSet() {
			if (self.folder_path) {
				return true;
			}
			return false;
		},

		// -

		hasIgnoredFile(filePath) {
			for (const ignoredFile of self.ignored_files) {
				if (ignoredFile.file_path == filePath) {
					return ignoredFile;
				}
			}
			return false;
		},

	}))
	.actions(self => ({

		setField: (field, value) => {
			self[field] = value;
		},

		// -

		update: (raw) => {
			self.folder_path = raw.folder_path;

			self.nb_files = (raw.nb_files) ? raw.nb_files : 0;
			self.nb_files_ignored = (raw.nb_files_ignored) ? raw.nb_files_ignored : 0;

			self.ignored_files = [];
			for (const ignoredFileRaw of raw.ignored_files) {
				const ignoredFile = LibraryIgnoredFileStore.create({});
				ignoredFile.update(ignoredFileRaw);
				self.ignored_files.push(ignoredFile);
			}
		},

		unset: () => {
			self.folder_path = "";
			self.resetCounters();
		},

		resetCounters: () => {
			self.nb_files = 0;
			self.nb_files_ignored = 0;
			self.ignored_files = [];
		},

		// -

		addIgnoredFile: (filePath, reason) => {

			// Ajoute un fichié ignoré
			// ---

			if (!self.hasIgnoredFile(filePath)) {
				const newIgnoredFile = LibraryIgnoredFileStore.create({});
				newIgnoredFile.setField('file_path', filePath);
				newIgnoredFile.setField('reason', reason);
				self.ignored_files.push(newIgnoredFile);
			}
		},

	}))

// ***** LibraryStore *****
// ************************

const TAG_LibraryStore = () => {}
export const LibraryStore = types
	.model({
		path_to_use: types.maybeNull(types.string), // default, custom
		custom_path: types.maybeNull(types.string),
		custom_path_available: true,

		source_folders: types.optional(types.array(LibraryFolderStore), []),
		copy_folder: types.optional(LibraryFolderStore, {}),
		copy_enabled: false,

		auto_scan_enabled: true,

		last_full_scan: types.maybeNull(types.string),
		last_full_scan_duration: types.maybeNull(types.integer),
		last_full_scan_error: false,

		last_quick_scan: types.maybeNull(types.string),
		last_quick_scan_duration: types.maybeNull(types.integer),
		last_quick_scan_error: false,

		shuffle_only_favorites: false,
		shuffle_ignore_soudtracks: true,

		loaded: false,
	})
	.views(self => ({

		get defaultCollectionPath() {
			const cwd = ipc.sendSync('getCwd');
			return ipc.sendSync('pathJoin', [cwd, 'collection']);
		},

		get defaultCollectionCoversPath() {
			const path = ipc.sendSync('pathJoin', [self.defaultCollectionPath, 'covers']);
			return path;
		},

		// -

		get collectionPath() {
			if (self.custom_path && self.custom_path_available) {
				return self.custom_path;
			} else {
				return self.defaultCollectionPath;
			}
		},

		get collectionCoversPath() {
			const path = ipc.sendSync('pathJoin', [self.collectionPath, 'covers']);
			return path;
		},

		// -

		get collectionFiles() {

			// Compilation des dates de modifications des fichiers pour le scan rapide
			// ---

			const store = getRoot(self);
			const tracks = store.tracks;

			let files = {};
			for (let [trackId, track] of tracks.by_id.entries()) {
				files[track.track_path] = track.ts_file;
			}
			return files;
		},

		get folders() {

			// Compatibilité avec indexer.js
			// ---

			let folders = {};
			for (const sourceFolder of self.source_folders) {
				folders[sourceFolder.folder_path] = {
					'path': sourceFolder.folder_path,
				};
			}
			return folders;
		},

		// -

		get nbFolders() {
			return self.source_folders.length;
		},

		// -

		get fullScanInfos() {

			const store = getRoot(self);
			const app = store.app;

			let title = "Complet";
			let subtitle = "Aucun scan effectué.";
			let severity = "default";

			if (self.last_full_scan) {
				subtitle = `Dernier scan ${dateTools.calendarTime(self.last_full_scan).toLowerCase()}`;
				if (self.last_full_scan_duration) {
					subtitle = `${subtitle} en ${dateTools.fromDurationToFrench(self.last_full_scan_duration)}`;
				}
				severity = (self.last_full_scan_error) ? "error" : "success";
			}
			if (app.tasks.indexOf('scan_full') > -1) {
				subtitle = "Scan en cours...";
				severity = "warning";
			}

			return {
				"title": title,
				"subtitle": subtitle,
				"severity": severity,
			}
		},

		get quickScanInfos() {

			const store = getRoot(self);
			const app = store.app;

			let title = "Rapide";
			let subtitle = "Aucun scan effectué.";
			let severity = "default";

			if (self.last_quick_scan) {
				subtitle = `Dernier scan ${dateTools.calendarTime(self.last_quick_scan).toLowerCase()}`;
				if (self.last_quick_scan_duration) {
					subtitle = `${subtitle} en ${dateTools.fromDurationToFrench(self.last_quick_scan_duration)}`;
				}
				severity = (self.last_quick_scan_error) ? "error" : "success";
			}
			if (app.tasks.indexOf('scan_quick') > -1) {
				subtitle = "Scan en cours...";
				severity = "warning";
			}

			return {
				"title": title,
				"subtitle": subtitle,
				"severity": severity,
			}
		},

		// Getters
		// -

		getFolderIdx(folderPath) {
			for (const folderIdx in self.source_folders) {
				const folder = self.source_folders[folderIdx];
				if (folder.folder_path == folderPath) {
					return parseInt(folderIdx);
				}
			}
			return -1;
		},

		getFolder(folderPath) {
			for (const sourceFolder of self.source_folders) {
				if (sourceFolder.folder_path == folderPath) {
					return sourceFolder;
				}
			}
			return LibraryFolderStore.create({});
		},

		// Bools
		// -

		get isSourceAvailable() {
			for (const sourceFolder of self.source_folders) {
				if (sourceFolder.folder_available) {
					return true;
				}
			}
			return false;
		},

		get isLocalAvailable() {
			return self.copy_folder.folder_available;
		},

		// -

		hasFolder(folderPath) {
			for (const sourceFolder of self.source_folders) {
				if (sourceFolder.folder_path == folderPath) {
					return true;
				}
			}
			if (self.copy_folder.folder_path == folderPath) {
				return true;
			}
			return false;
		},

	}))
	.actions(self => ({

		setField: (field, value) => {
			self[field] = value;
		},

		// -

		refreshAvailability: () => {

			// Les dossiers sont-ils toujours accessibles ?
			// ---

			if (self.custom_path) {
				if (ipc.sendSync('existsSync', self.custom_path)) {
					self.custom_path_available = true;
				} else {
					self.custom_path_available = false;
				}
			}

			for (const sourceFolder of self.source_folders) {
				if (ipc.sendSync('existsSync', sourceFolder.folder_path)) {
					sourceFolder.folder_available = true;
				} else {
					sourceFolder.folder_available = false;
				}
			}

			if (self.copy_folder.isSet) {
				if (ipc.sendSync('existsSync', self.copy_folder.folder_path)) {
					self.copy_folder.folder_available = true;
				} else {
					self.copy_folder.folder_available = false;
				}
			}
		},

		update: (raw) => {
			if (raw) {
				self.path_to_use = (raw.path_to_use) ? raw.path_to_use : "default";
				self.custom_path = (raw.custom_path) ? raw.custom_path : "";
				self.custom_path_available = (raw.custom_path_available) ? raw.custom_path_available : true;

				self.source_folders = [];
				for (const sourceFolderRaw of raw.source_folders) {
					const sourceFolder = LibraryFolderStore.create({});
					sourceFolder.update(sourceFolderRaw);
					self.source_folders.push(sourceFolder);
				}
				self.copy_folder = LibraryFolderStore.create({});
				self.copy_folder.update(raw.copy_folder);
				self.copy_enabled = raw.copy_enabled;

				self.auto_scan_enabled = raw.auto_scan_enabled;

				self.last_full_scan = raw.last_full_scan;
				self.last_full_scan_duration = raw.last_full_scan_duration;
				self.last_full_scan_error = raw.last_full_scan_error;

				self.last_quick_scan = raw.last_quick_scan;
				self.last_quick_scan_duration = raw.last_quick_scan_duration;
				self.last_quick_scan_error = raw.last_quick_scan_error;

				self.shuffle_only_favorites = raw.shuffle_only_favorites;
				self.shuffle_ignore_soudtracks = raw.shuffle_ignore_soudtracks;
			}
			self.loaded = true;
		},

		load: () => {

			// Chargement des paramètres de la bibliothèque
			// ---

			const store = getRoot(self);
			const app = store.app;

			const params = getFromStorage('params', null, 'json');
			if (!params) {
				self.save();
			}
			self.update(params);
			// app.saveValue(['library'], raw.by_id, () => {
			// 	self.setField('loaded', true);
			// 	if (callback) {
			// 		callback();
			// 	}
			// });

			ipc.sendSync('mkdirsSync', self.collectionPath);
			ipc.sendSync('mkdirsSync', self.collectionCoversPath);

			self.refreshAvailability();
		},

		save: (callback) => {

			// Sauvegarde des paramètres de la bibliothèque
			// ---

			const params = self.toJSON();
			setToStorage('params', params, 'json');

			if (callback) {
				callback();
			}
		},

		// -

		addFolder: (folderKey, folderPath) => {

			// Ajoute un dossier
			// ---

			if (!self.hasFolder(folderPath)) {

				// Nouveau dossier source
				if (folderKey == "source") {
					const newSourceFolder = LibraryFolderStore.create({});
					newSourceFolder.setField("folder_path", folderPath);
					newSourceFolder.resetCounters();
					self.source_folders.push(newSourceFolder);
				}

				// Remplacement dossier de recopie
				if (folderKey == "copy") {
					self.copy_folder = LibraryFolderStore.create({});
					self.copy_folder.setField("folder_path", folderPath);
					self.copy_folder.resetCounters();
				}
			}
		},

		removeFolder: (folderPath) => {

			// Retire un dossier
			// ---

			const folderIdx = self.getFolderIdx(folderPath);
			if (folderIdx > -1) {
				self.source_folders.splice(folderIdx, 1);
			}
			if (self.copy_folder.folder_path == folderPath) {
				self.copy_folder.unset();
			}
		},

		// -

		startScan: (quickScan) => {

			// Scan des fichiers dans les dossiers surveillés, pour les indexer
			// ---

			const store = getRoot(self);
			const app = store.app;
			const snackbar = app.snackbar;
			const tracks = store.tracks;
			const albums = store.albums;

			const scope = (quickScan == true && self.last_full_scan) ? "quick" : "full";
			const taskId = `scan_${scope}`;

			app.addTask(taskId);

			window.scanScope = scope;
			window.scanStartTime = new Date();

			// Réinitialisation des compteurs sur les dossiers
			if (scope == 'full') {
				albums.setField('last_added_ids', []);
			}
			for (const sourceFolder of self.source_folders) {
				sourceFolder.resetCounters();
			}

			if (!window.scanStopTime) {
				ipc.on('indexTrack', (datas) => {
					self.processMetadatas(datas);

					// Timeout pour éviter les scans infinis
					clearTimeout(window.timeoutScan);
					window.timeoutScan = setTimeout(function() {
						self.stopScan();
					}, 5000);
				});
			}
			// ipc.once('scanDone', () => {
			// 	self.stopScan();
			// });
			ipc.once('scanError', (code) => {
				snackbar.update(true, `Une erreur est survenue (code ${code}).`, "error");
				self.stopScan(true);
			});
			ipc.send('startIndexer', [
				scope,
				self.folders,
				self.collectionFiles,
				self.collectionCoversPath,
			]);
		},

		stopScan: (isInError=false) => {

			// Arrêt de l'indexation
			// ---

			const store = getRoot(self);
			const app = store.app;
			const debugMode = app.debugMode;

			if (debugMode) {
				console.log("Calling :: stopScan()");
			}

			const taskId = `scan_${window.scanScope}`;

			window.scanStopTime = new Date();

			// Temps de scan
			const scanDuration = window.scanStopTime - window.scanStartTime;
			if (window.scanScope == 'full') {
				self.last_full_scan = window.scanStartTime.toISOString();
				self.last_full_scan_duration = scanDuration;
				self.last_full_scan_error = isInError;
			}
			if (window.scanScope == 'quick') {
				self.last_quick_scan = window.scanStartTime.toISOString();
				self.last_quick_scan_duration = scanDuration;
				self.last_quick_scan_error = isInError;
			}

			store.save(() => {
				app.removeTask(taskId);
			});
		},

		processMetadatas: (metas) => {

			// Indexation des données passées en paramètres
			// ---

			const store = getRoot(self);
			const app = store.app;
			const debugMode = app.debugMode;

			const tracks = store.tracks;
			const albums = store.albums;
			const artists = store.artists;
			const years = store.years;
			const genre = store.genres;

			if (debugMode) {
				console.log('### index datas ###');
				console.log(metas);
			}

			const scope = window.scanScope;
			const sourceFolder = self.getFolder(metas.folderRoot);

			if (metas.fileOk) {

				// Fichier OK
				// -

				// Indexing :: TRACK
				// ----------------------------------------------------------------------

				const trackAdded = tracks.index(metas);
				if (trackAdded || scope == 'full') {
					sourceFolder.nb_files += 1;
				}

				// Indexing :: ALBUM
				// ----------------------------------------------------------------------

				albums.index(metas)

				// Indexing :: ARTIST
				// ----------------------------------------------------------------------

				artists.index(metas);

				// Indexing :: YEAR
				// ----------------------------------------------------------------------

				years.index(metas);

				// Indexing :: GENRE
				// ----------------------------------------------------------------------

				genre.index(metas);

			} else {

				// Fichier en erreur
				// -

				sourceFolder.addIgnoredFile(metas.filePath, metas.fileError);
				sourceFolder.nb_files_ignored = sourceFolder.ignored_files.length;
			}
		},

	}))
