import React from 'react';
import { types, getRoot } from "mobx-state-tree";
import { observer } from "mobx-react-lite";
import clsx from 'clsx';

import { PlaylistFolderStore } from 'gramophone_client/contexts/playlist_folder/PlaylistFolder';

import { Helper } from 'nexus/ui/helper/Helper';

import './Playlist.css';


// Models
// ======================================================================================================

// ***** PlaylistStore *****
// *************************

const TAG_PlaylistStore = () => {}
export const PlaylistStore = types
	.model({
		id: types.maybeNull(types.string),
		name: types.maybeNull(types.string),

		ts_playlist: types.maybeNull(types.string),

		permanent: false,

		folder_id: types.maybeNull(types.string),
		tracks_ids: types.optional(types.array(types.string), []),
	})
	.views(self => ({

		get linkedFolder() {
			const store = getRoot(self);
			const playlists = store.playlists;
			if (self.folder_id) {
				const folder = playlists.folders.get(self.folder_id);
				if (folder) {
					return folder;
				}
			}
			return PlaylistFolderStore.create({});
		},

	}))
	.actions(self => ({

		setField: (field, value) => {
			self[field] = value;
		},

		// -

		// update: (raw) => {
		// 	self.id = raw.id;
		// 	self.name = raw.name;

		// 	self.ts_playlist = raw.ts_playlist;

		// 	self.permanent = raw.permanent;

		// 	self.folder_id = raw.folder_id;
		// 	self.tracks_ids = [];
		// 	for (const trackId of raw.tracks_ids) {
		// 		self.tracks_ids.push(trackId);
		// 	}
		// },

	}))


// Functions Components ReactJS
// ======================================================================================================

// ***** RenderPlaylist *****
// **************************

const TAG_RenderPlaylist = () => {}
export const RenderPlaylist = observer((props) => {

	const store = React.useContext(window.storeContext);
	const app = store.app;
	const playlists = store.playlists;

	// From ... store

	const isLoading = app.isLoading;

	const playlistId = store.playlistId;
	const playlist = playlists.by_id.get(playlistId);

	// ...

	console.log(playlist.toJSON());

	// Render
	// ==================================================================================================

	return (
		<div>

		</div>
	)
})

// ***** PlaylistPage *****
// ************************

const TAG_PlaylistPage = () => {}
export const PlaylistPage = observer((props) => {

	const store = React.useContext(window.storeContext);
	const app = store.app;

	// From ... store

	const loaded = store.loaded;
	const playlistId = app.playlistId;

	// ...

	const showHelper = (!loaded && !playlistId) ? true : false;

	// Render
	// ==================================================================================================

	const renderPage = () => {

		// Render :: Page
		// ---

		let pageContent = null;
		if (loaded) {
			pageContent = <RenderPlaylist />
		}
		return pageContent;
	}

	const renderHelper = () => {

		// Render :: Helper
		// ---

		return (
			<Helper
				iconName="playlist_play"
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
