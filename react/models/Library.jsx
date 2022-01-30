import React from 'react';
import { types, getRoot } from "mobx-state-tree";
import { observer } from "mobx-react-lite";
import clsx from 'clsx';


// Datas
// ======================================================================================================

export const MODEL_IGNORED_FILE = {
	'file_name': '',
	'file_path': '',
	'reason': '',
}

export const MODEL_FOLDER = {
	'path': '',
	'nb_files': 0,
	'nb_files_ignored': 0,
	'ignored_files': {},
}


// Models
// ======================================================================================================

// ***** LibraryFolderStore *****
// ******************************

const TAG_LibraryFolderStore = () => {}
export const LibraryFolderStore = types
	.model({

	})
	.actions(self => ({

		setField: (field, value) => {
			self[field] = value;
		},

		// -

		update: (raw) => {

		},

	}))


// ***** LibraryStore *****
// ************************

const TAG_LibraryStore = () => {}
export const LibraryStore = types
	.model({
		loaded: false,

		folders: types.optional(types.array(LibraryFolderStore), []),
	})
	.actions(self => ({

		setField: (field, value) => {
			self[field] = value;
		},

		// -

		update: (raw) => {
			self.folders = [];
			for (const folderRaw of raw.folders) {
				const libraryFolder = LibraryFolderStore.create({});
				libraryFolder.update(folderRaw);
				self.folders.push(libraryFolder);
			}
		},

		load: () => {

		},

	}))
