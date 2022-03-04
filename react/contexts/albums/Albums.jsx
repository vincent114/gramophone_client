import React from 'react';
import { types, getRoot } from "mobx-state-tree";
import { observer } from "mobx-react-lite";
import clsx from 'clsx';

import { Helper } from 'nexus/ui/helper/Helper';
import { HeaderTitle } from 'nexus/layout/header/Header';
import { MenuItem } from 'nexus/layout/menu/Menu';
import { Icon } from 'nexus/ui/icon/Icon';

import './Albums.css';


// Models
// ======================================================================================================

// ***** AlbumStore *****
// **********************

const TAG_AlbumStore = () => {}
export const AlbumStore = types
	.model({
		id: types.maybeNull(types.string),
		name: types.maybeNull(types.string),
		cover: types.maybeNull(types.string),
		folder: types.maybeNull(types.string),
		year: types.maybeNull(types.string),

		artist_id: types.maybeNull(types.string),
		year_id: types.maybeNull(types.string),
		genre_id: types.maybeNull(types.string),
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
			self.cover = raw.cover;
			self.folder = raw.folder;
			self.year = raw.year;

			self.artist_id = raw.artist_id;
			self.year_id = raw.year_id;
			self.genre_id = raw.genre_id;
			self.tracks_ids = [];
			for (const trackId of raw.tracks_ids) {
				self.tracks_ids.push(trackId);
			}
		},

	}))

// ***** AlbumsStore *****
// ***********************

const TAG_AlbumsStore = () => {}
export const AlbumsStore = types
	.model({
		by_id: types.map(AlbumStore),

		loaded: false,
	})
	.views(self => ({

		get albumsCollectionFilePath() {
			const store = getRoot(self);
			const library = store.library;
			const path = ipc.sendSync('pathJoin', [library.collectionPath, 'albums.json']);
			return path;
		},

		get nbAlbums() {
			return Object.entries(self.by_id).length;
		},

	}))
	.actions(self => ({

		setField: (field, value) => {
			self[field] = value;
		},

		// -

		update: (raw) => {
			self.by_id = {};
			for (let [albumId, albumRaw] of Object.entries(raw.by_id)) {
				const album = AlbumStore.create({});
				album.update(albumRaw);
				self.by_id.set(albumId, album);
			}
			self.loaded = true;
		},

		load: (callback) => {

			// Chargement des albums
			// ---

			const store = getRoot(self);

			const raw = store._readJsonFile(self.albumsCollectionFilePath, {
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

// ***** AlbumsHeaderLeft *****
// *****************************

const TAG_AlbumsHeaderLeft = () => {}
export const AlbumsHeaderLeft = observer((props) => {

	const store = React.useContext(window.storeContext);
	const app = store.app;

	// ...

	// Render
	// ==================================================================================================

	return (
		<HeaderTitle
			title="Albums"
			titleStyle={{
				marginLeft: '10px',
			}}
		/>
	)
})

// ***** AlbumsMenuItem *****
// **************************

const TAG_AlbumsMenuItem = () => {}
export const AlbumsMenuItem = observer((props) => {

	const store = React.useContext(window.storeContext);
	const app = store.app;
	const menu = app.menu;

	// ...

	const albumsContext = 'albums';

	// Evènements
	// ==================================================================================================

	const handleMenuItemClick = () => {
		store.navigateTo(albumsContext);
		app.menu.close();
	}

	// Render
	// ==================================================================================================

	return (
		<MenuItem
			icon={<Icon name="album" width="120px" />}
			label="Albums"
			activeContexts={[albumsContext]}
			callbackClick={handleMenuItemClick}
		/>
	)
})

// ***** AlbumsPage *****
// **********************

const TAG_AlbumsPage = () => {}
export const AlbumsPage = observer((props) => {

	const store = React.useContext(window.storeContext);
	const app = store.app;

	// Renderers
	// ==================================================================================================

	const renderHelper = () => {

		// Render :: Helper
		// ---

		return (
			<Helper
				iconName="album"
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
