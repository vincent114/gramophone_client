import React from 'react';
import { types, getRoot } from "mobx-state-tree";
import { observer } from "mobx-react-lite";
import clsx from 'clsx';

import { Helper } from 'nexus/ui/helper/Helper';

import './PlaylistFolder.css';


// Models
// ======================================================================================================

// ***** PlaylistFolderStore *****
// *******************************

const TAG_PlaylistFolderStore = () => {}
export const PlaylistFolderStore = types
	.model({
		id: types.maybeNull(types.string),
		name: types.maybeNull(types.string),
		parent: types.maybeNull(types.string),
	})
	.actions(self => ({

		setField: (field, value) => {
			self[field] = value;
		},

	}))


// Functions Components ReactJS
// ======================================================================================================

// ***** RenderPlaylistFolder *****
// ********************************

const TAG_RenderPlaylistFolder = () => {}
export const RenderPlaylistFolder = observer((props) => {

	const store = React.useContext(window.storeContext);
	const app = store.app;
	const playlists = store.playlists;

	// From ... store

	const isLoading = app.isLoading;

	const playlistFolderId = store.playlistFolderId;
	const folder = playlists.folders.get(playlistFolderId);

	// ...

	console.log(folder.toJSON());

	// Render
	// ==================================================================================================

	return (
		<div>

		</div>
	)
})

// ***** PlaylistFolderPage *****
// ******************************

const TAG_PlaylistFolderPage = () => {}
export const PlaylistFolderPage = observer((props) => {

	const store = React.useContext(window.storeContext);
	const app = store.app;

	// From ... store

	const loaded = store.loaded;
	const playlistFolderId = app.playlistFolderId;

	// ...

	const showHelper = (!loaded && !playlistFolderId) ? true : false;

	// Render
	// ==================================================================================================

	const renderPage = () => {

		// Render :: Page
		// ---

		let pageContent = null;
		if (loaded) {
			pageContent = <RenderPlaylistFolder />
		}
		return pageContent;
	}

	const renderHelper = () => {

		// Render :: Helper
		// ---

		return (
			<Helper
				iconName="folder_special"
				show={showHelper}
			/>
		)
	}

	// -------------------------------------------------

	return (
		<div className="c-page">
			{renderPage()}
			{renderHelper()}
		</div>
	)
})
