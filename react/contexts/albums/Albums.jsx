import React from 'react';
import { types, getRoot } from "mobx-state-tree";
import { observer } from "mobx-react-lite";
import clsx from 'clsx';

import { Helper } from 'nexus/ui/helper/Helper';
import { HeaderTitle } from 'nexus/layout/header/Header';
import { MenuItem } from 'nexus/layout/menu/Menu';

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
		year: types.maybeNull(types.integer),

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

		addTrackId: (trackId) => {
			if (self.tracks_ids.indexOf(trackId) == -1) {
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

		save: (callback) => {

			// Sauvegarde des albums
			// ---

			const store = getRoot(self);
			store._writeJsonFile(self.albumsCollectionFilePath, self.toJSON());

			if (callback) {
				callback();
			}
		},

		index: (metas) => {

			// Indexation d'un album
			// ---

			let added = false;

			let albumId = metas.albumID;
			let album = self.by_id.get(albumId);

			if (!album) {
				album = AlbumStore.create({});
				album.setField('id', albumId);
				added = true;
			}

			const tags = metas.fileTags;

			album.setField('name', tags.album);
			album.setField('cover', metas.coverFile);
			album.setField('folder', metas.fileFolder);
			album.setField('year', tags.year);

			album.setField('artist_id', metas.artistID);
			album.setField('year_id', metas.yearID);
			album.setField('genre_id', metas.genreID);
			album.addTrackId(metas.trackID);

			self.by_id.set(albumId, album);
			return added;
		}

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

	// Events
	// ==================================================================================================

	const handleMenuItemClick = () => {
		store.navigateTo(albumsContext);
		app.menu.close();
	}

	// Render
	// ==================================================================================================

	return (
		<MenuItem
			iconName="album"
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
