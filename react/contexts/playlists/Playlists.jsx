import React from 'react';
import { types, getRoot } from "mobx-state-tree";
import { observer } from "mobx-react-lite";
import clsx from 'clsx';

import { Helper } from 'nexus/ui/helper/Helper';
import { HeaderTitle } from 'nexus/layout/header/Header';
import { MenuItem } from 'nexus/layout/menu/Menu';

import './Playlists.css';


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

		tracks_ids: types.optional(types.array(types.string), []),
	})
	.actions(self => ({

		setField: (field, value) => {
			self[field] = value;
		},

		// -

		update: (raw) => {
			self.id = raw.id;
			self.name = raw.name;

			self.ts_playlist = raw.ts_playlist;

			self.permanent = raw.permanent;

			self.tracks_ids = [];
			for (const trackId of raw.tracks_ids) {
				self.tracks_ids.push(trackId);
			}
		},

	}))

// ***** PlaylistsStore *****
// **************************

const TAG_PlaylistsStore = () => {}
export const PlaylistsStore = types
	.model({
		by_id: types.map(PlaylistStore),

		loaded: false,
	})
	.views(self => ({

		get playlistsCollectionFilePath() {
			const store = getRoot(self);
			const library = store.library;
			const path = ipc.sendSync('pathJoin', [library.collectionPath, 'playlists.json']);
			return path;
		},

		get nbPlaylists() {
			return Object.entries(self.by_id.toJSON()).length;
		},

	}))
	.actions(self => ({

		setField: (field, value) => {
			self[field] = value;
		},

		// -

		update: (raw) => {
			self.by_id = {};
			for (const [playlistId, playlistRaw] of Object.entries(raw.by_id)) {
				const playlist = PlaylistStore.create({});
				playlist.update(playlistRaw);
				self.by_id.set(playlistId, playlist);
			}
			self.loaded = true;
		},

		load: (callback) => {

			// Chargement des playlists
			// ---

			const store = getRoot(self);

			const raw = store._readJsonFile(self.playlistsCollectionFilePath, {
				by_id: {},
			});
			self.update(raw);

			if (callback) {
				callback();
			}
		},

	}))


// Functions Components ReactJS
// ======================================================================================================

// ***** PlaylistsHeaderLeft *****
// *******************************

const TAG_PlaylistsHeaderLeft = () => {}
export const PlaylistsHeaderLeft = observer((props) => {

	const store = React.useContext(window.storeContext);
	const app = store.app;

	// ...

	// Render
	// ==================================================================================================

	return (
		<HeaderTitle
			title="Playlists"
			titleStyle={{
				marginLeft: '10px',
			}}
		/>
	)
})

// ***** PlaylistsMenuItem *****
// *****************************

const TAG_PlaylistsMenuItem = () => {}
export const PlaylistsMenuItem = observer((props) => {

	const store = React.useContext(window.storeContext);
	const app = store.app;
	const menu = app.menu;

	// ...

	const playlistsContext = 'playlists';

	// Events
	// ==================================================================================================

	const handleMenuItemClick = () => {
		store.navigateTo(playlistsContext);
		app.menu.close();
	}

	// Render
	// ==================================================================================================

	return (
		<MenuItem
			iconName="playlist_play"
			label="Playlists"
			activeContexts={[playlistsContext]}
			callbackClick={handleMenuItemClick}
		/>
	)
})

// ***** PlaylistsPage *****
// *************************

const TAG_PlaylistsPage = () => {}
export const PlaylistsPage = observer((props) => {

	const store = React.useContext(window.storeContext);
	const app = store.app;

	// Renderers
	// ==================================================================================================

	const renderHelper = () => {

		// Render :: Helper
		// ---

		return (
			<Helper
				iconName="playlist_play"
				show={true}
			/>
		)
	}

	return (
		<div className="nx-page">
			{renderHelper()}
		</div>
	)
})
