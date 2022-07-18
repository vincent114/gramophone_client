import React from 'react';
import { types, getRoot } from "mobx-state-tree";
import { observer } from "mobx-react-lite";
import clsx from 'clsx';

import {
	getFromStorage,
	setToStorage
} from 'nexus/utils/Storage';
import { dateTools } from 'nexus/utils/DateTools';


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
	.actions(self => ({

		setField: (field, value) => {
			self[field] = value;
		},

		// -

		update: (raw) => {

		},

	}))

// ***** LibraryFolderStore *****
// ******************************

const TAG_LibraryFolderStore = () => {}
export const LibraryFolderStore = types
	.model({
		folder_path: types.maybeNull(types.string),
		folder_available: false,

		nb_files: types.maybeNull(types.integer),
		nb_files_ignored: types.maybeNull(types.integer),

		ignored_files: types.optional(types.array(types.string), []),
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

	}))
	.actions(self => ({

		setField: (field, value) => {
			self[field] = value;
		},

		// -

		update: (raw) => {
			self.folder_path = raw.folder_path;

			self.nb_files = raw.nb_files;
			self.nb_files_ignored = raw.nb_files_ignored;

			self.ignored_files = [];
			for (const ignoredFileRaw of raw.ignored_files) {
				const ignoredFile = LibraryIgnoredFileStore.create({});

			}
		},

	}))

// ***** LibraryStore *****
// ************************

const TAG_LibraryStore = () => {}
export const LibraryStore = types
	.model({
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

		shuffle_ignore_soudtracks: true,
		shuffle_ignore_hidden: true,

		loaded: false,
	})
	.views(self => ({

		get collectionPath() {
			const cwd = ipc.sendSync('getCwd');
			const path = ipc.sendSync('pathJoin', [cwd, 'collection']);
			return path;
		},

		get collectionCoversPath() {
			const path = ipc.sendSync('pathJoin', [self.collectionPath, 'covers']);
			return path;
		},

		// -

		get nbFolders() {
			return self.source_folders.length;
		},

		// -

		get fullScanInfos() {

			let title = "Complet";
			let subtitle = "Aucun scan effectué.";
			let severity = "default";

			if (self.last_full_scan) {
				subtitle = `Dernier scan ${dateTools.calendarTime(self.last_full_scan)}`;
				// TODO : duration
				severity = (self.last_full_scan_error) ? "error" : "success";
			}

			return {
				"title": title,
				"subtitle": subtitle,
				"severity": severity,
			}
		},

		get quickScanInfos() {

			let title = "Rapide";
			let subtitle = "Aucun scan effectué.";
			let severity = "default";

			if (self.last_quick_scan) {
				subtitle = `Dernier scan ${dateTools.calendarTime(self.last_quick_scan)}`;
				// TODO : duration
				severity = (self.last_quick_scan_error) ? "error" : "success";
			}

			return {
				"title": title,
				"subtitle": subtitle,
				"severity": severity,
			}
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

		hasFolder(folder) {
			for (const sourceFolder of self.source_folders) {
				if (sourceFolder.folder_path == folder) {
					return true;
				}
			}
			if (self.copy_folder.folder_path == folder) {
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

			// TODO (folder_available)
		},

		update: (raw) => {
			if (raw) {
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

				self.shuffle_ignore_soudtracks = raw.shuffle_ignore_soudtracks;
				self.shuffle_ignore_hidden = raw.shuffle_ignore_hidden;
			}
			self.loaded = true;
		},

		load: () => {

			// Chargement des paramètres de la bibliothèque
			// ---

			const params = getFromStorage('params', null, 'json');
			if (!params) {
				self.save();
			}
			self.update(params);

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

		scan: (quickScan) => {

			// Scan des fichiers dans les dossiers
			// ---

			quickScan = (quickScan == true && self.last_full_scan) ? true : false;

			console.log('scan');
			console.log(quickScan);

			// TODO
		},

		// -

		addFolder: (folderKey, folder) => {

			// Ajoute un dossier
			// ---

			if (!self.hasFolder(folder)) {

				// Nouveau dossier source
				if (folderKey == "source") {
					const newSourceFolder = LibraryFolderStore.create({});
					newSourceFolder.setField("folder_path", folder);
					self.source_folders.push(newSourceFolder);
				}

				// Remplacement dossier de recopie
				if (folderKey == "copy") {
					self.copy_folder = LibraryFolderStore.create({});
					self.copy_folder.setField("folder_path", folder);
				}
			}
		},

	}))
