import React from 'react';
import { types, getRoot } from "mobx-state-tree";
import { observer } from "mobx-react-lite";
import clsx from 'clsx';

import { Popup } from 'nexus/ui/popup/Popup';
import {
	List,
	ListItem,
	ListText,
	ListIcon
} from 'nexus/ui/list/List';

import './PopupIgnoredFiles.css';


// Models
// ======================================================================================================

// ***** PopupIgnoredFilesStore *****
// **********************************

const TAG_PopupIgnoredFilesStore = () => {}
export const PopupIgnoredFilesStore = types
	.model({
		folderPath: types.maybeNull(types.string),
	})
	.views(self => ({

		// Bools
		// -

		get isOpen() {
			const store = getRoot(self);
			const app = store.app;
			const popup = app.popup;

			return popup.isOpen(popupIgnoredFilesKey);
		},

	}))
	.actions(self => ({

		setField: (field, value) => {
			self[field] = value;
		},

		// -

		open: () => {
			const store = getRoot(self);
			const app = store.app;
			const popup = app.popup;

			popup.open(popupIgnoredFilesKey);
		},

	}))


// Functions Components ReactJS
// ======================================================================================================

// ***** PopupIgnoredFiles *****
// *****************************

const TAG_PopupIgnoredFiles = () => {}
export const popupIgnoredFilesKey = 'popupPopupIgnoredFiles';
export const PopupIgnoredFiles = observer((props) => {

	const store = React.useContext(window.storeContext);
	const app = store.app;
	const popup = app.popup;
	const popupIgnoredFiles = store.popupIgnoredFiles;
	const library = store.library;

	// From ... store

	const isLoading = app.isLoading;
	const isOpen = popupIgnoredFiles.isOpen;

	const folderPath = popupIgnoredFiles.folderPath;
	const folder = library.getFolder(folderPath);
	const ignoredFiles = folder.ignored_files;
	const nbIgnoredFiles = ignoredFiles.length;

	// ...

	// Events
	// ==================================================================================================

	const handleFileClick = (filePath) => {
		ipc.send('showItemInFolder', [filePath]);
	}

	// Render
	// ==================================================================================================

	// Popup --> Title
	// -----------------------------------------------

	const popupTitle = `${nbIgnoredFiles} ${(nbIgnoredFiles > 1) ? "Fichiers ignorés" : "Fichier ignoré"}`;

	// Popup --> Content
	// -----------------------------------------------

	let popupContent = null;
	if (isOpen) {
		popupContent = (
			<div>
				<List>
					{ignoredFiles.map((ignoredFile, ignoredFileIdx) => (
						<ListItem
							key={`ignored-file-${ignoredFileIdx}`}
							hoverable={true}
							style={{
								marginBottom: '5px',
							}}
							onClick={() => handleFileClick(ignoredFile.file_path)}
						>
							<ListIcon name="insert_drive_file" />
							<ListText
								primary={ignoredFile.reason}
								secondary={ignoredFile.file_path}
							/>
						</ListItem>
					))}
				</List>
			</div>
		)
	}

	// -----------------------------------------------

	return (
		<Popup
			id={popupIgnoredFilesKey}
			title={popupTitle}
			maxWidth="md"
			// style={{
			// 	minWidth: '600px',
			// 	maxWidth: '600px',
			// }}
			// contentStyle={{
			// 	padding: '0px',
			// 	minHeight: '600px',
			// 	maxHeight: '600px',
			// }}
		>
			{popupContent}
		</Popup>
	)
})
