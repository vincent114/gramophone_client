import React from 'react';
import { types, getRoot } from "mobx-state-tree";
import { observer } from "mobx-react-lite";
import clsx from 'clsx';

import { PlaylistStore } from 'gramophone_client/contexts/playlist/Playlist';

import { HeaderTitle } from 'nexus/layout/header/Header';
import { MenuItem } from 'nexus/layout/menu/Menu';
import { Ribbon } from 'nexus/layout/ribbon/Ribbon';

import { Helper } from 'nexus/ui/helper/Helper';
import { IconButton } from 'nexus/ui/button/Button';

import './Playlists.css';


// Models
// ======================================================================================================

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

		// Getters
		// -

		getById(playlistId) {
			let playlist = self.by_id.get(playlistId);
			if (!playlist) {
				playlist = PlaylistStore.create({});
			}
			return playlist;
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
			const app = store.app;

			store._readJsonFile(
				self.playlistsCollectionFilePath,
				{
					by_id: {},
				},
				(raw) => {
					// self.update(raw);
					app.saveValue(['playlists', 'by_id'], raw.by_id, () => {
						self.setField('loaded', true);
						if (callback) {
							callback();
						}
					});
				}
			);
		},

		save: (callback) => {

			// Sauvegarde des playlists
			// ---

			const store = getRoot(self);
			store._writeJsonFile(self.playlistsCollectionFilePath, self.toJSON());

			if (callback) {
				callback();
			}
		},

	}))


// Functions Components ReactJS
// ======================================================================================================

// ***** RenderPlaylists *****
// ***************************

const TAG_RenderPlaylists = () => {}
export const RenderPlaylists = observer((props) => {

	const store = React.useContext(window.storeContext);
	const app = store.app;
	const playlists = store.playlists;

	// From ... store

	const isLoading = store.isLoading;
	const nbPlaylists = playlists.nbPlaylists;

	// ...

	// Events
	// ==================================================================================================

	const handleThrowDiceClick = () => {
		// TODO
	}

	// Renderers
	// ==================================================================================================

	return (
		<div>

			<Ribbon
				avatarIconName="playlist_play"
				avatarIconColor="typography"
				title={`${nbPlaylists} ${(nbPlaylists > 1) ? "Playlists" : "Playlist"}`}
				right={(
					<div className="h-col">
						<IconButton
							iconName="casino"
							color="hot"
							disabled={isLoading}
							onClick={() => handleThrowDiceClick()}
						/>
					</div>
				)}
			/>

		</div>
	)
})

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

	// From ... props

	const disabled = props.disabled;

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
			disabled={disabled}
			activeContexts={[playlistsContext, "playlist"]}
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
	const playlists = store.playlists;

	// From ... store

	const loaded = store.loaded;
	const nbPlaylists = playlists.nbPlaylists;

	// ...

	const showHelper = (!loaded || nbPlaylists == 0) ? true : false;

	// Renderers
	// ==================================================================================================

	const renderPage = () => {

		// Render :: Page
		// ---

		let pageContent = null;
		if (!showHelper) {
			pageContent = <RenderPlaylists />
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

	return (
		<div className="nx-page">
			{renderPage()}
			{renderHelper()}
		</div>
	)
})
