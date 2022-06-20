import React from 'react';
import { types, getRoot } from "mobx-state-tree";
import { observer } from "mobx-react-lite";
import clsx from 'clsx';

import {
	getFromStorage,
	setToStorage
} from 'nexus/utils/Storage';


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
	.actions(self => ({

		setField: (field, value) => {
			self[field] = value;
		},

		// -

		update: (raw) => {
			self.folder_path = raw.folder_path;
		},

	}))

// ***** LibraryStore *****
// ************************

const TAG_LibraryStore = () => {}
export const LibraryStore = types
	.model({
		source_folder: types.optional(LibraryFolderStore, {}),
		local_folder: types.optional(LibraryFolderStore, {}),

		auto_scan_enabled: true,

		last_full_scan: types.maybeNull(types.string),
		last_quick_scan: types.maybeNull(types.string),

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

			self.source_folder = LibraryFolderStore.create({});
			self.source_folder.update(raw.source_folder);
			self.local_folder = LibraryFolderStore.create({});
			self.local_folder.update(raw.local_folder);

			self.auto_scan_enabled = raw.auto_scan_enabled;

			self.last_full_scan = raw.last_full_scan;
			self.last_quick_scan = raw.last_quick_scan;

			self.shuffle_ignore_soudtracks = raw.shuffle_ignore_soudtracks;

			self.loaded = true;
		},

		load: () => {

			// Chargement des paramètres de la bibliothèque
			// ---

			const params = getFromStorage('params', null, 'json');
			if (!params) {
				self.save();
			} else {
				self.update(params);
			}

			ipc.sendSync('mkdirsSync', self.collectionPath);
			ipc.sendSync('mkdirsSync', self.collectionCoversPath);

			self.refreshAvailability();
		},

		save: () => {

			// Sauvegarde des paramètres de la bibliothèque
			// ---

			const params = self.toJSON();
			setToStorage('params', params, 'json');
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

		setFolder: (folder) => {

			// Défini le dossier
			// ---


		},

	}))
