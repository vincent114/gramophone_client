import React from 'react';
import { types, getRoot } from "mobx-state-tree";
import { observer } from "mobx-react-lite";
import clsx from 'clsx';

import { Helper } from 'nexus/ui/helper/Helper';
import { HeaderTitle } from 'nexus/layout/header/Header';
import { MenuItem } from 'nexus/layout/menu/Menu';

import './Artists.css';


// Models
// ======================================================================================================

// ***** ArtistStore *****
// ***********************

const TAG_ArtistStore = () => {}
export const ArtistStore = types
	.model({
		id: types.maybeNull(types.string),
		name: types.maybeNull(types.string),

		albums_ids: types.optional(types.array(types.string), []),
	})
	.actions(self => ({

		setField: (field, value) => {
			self[field] = value;
		},

		// -

		update: (raw) => {
			self.id = raw.id;
			self.name = raw.name;

			self.albums_ids = [];
			for (const albumId of raw.albums_ids) {
				self.albums_ids.push(albumId);
			}
		},

		addAlbumId: (albumId) => {
			if (self.albums_ids.indexOf(albumId) == -1) {
				self.albums_ids.push(albumId);
			}
		},

	}))

// ***** ArtistsStore *****
// ************************

const TAG_ArtistsStore = () => {}
export const ArtistsStore = types
	.model({
		by_id: types.map(ArtistStore),

		loaded: false,
	})
	.views(self => ({

		get artistsCollectionFilePath() {
			const store = getRoot(self);
			const library = store.library;
			const path = ipc.sendSync('pathJoin', [library.collectionPath, 'artists.json']);
			return path;
		},

		get nbArtists() {
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
			for (let [artistId, artistRaw] of Object.entries(raw.by_id)) {
				const artist = ArtistStore.create({});
				artist.update(artistRaw);
				self.by_id.set(artistId, artist);
			}
			self.loaded = true;
		},

		load: (callback) => {

			// Chargement des artistes
			// ---

			const store = getRoot(self);

			const raw = store._readJsonFile(self.artistsCollectionFilePath, {
				by_id: {},
			});
			self.update(raw);

			if (callback) {
				callback();
			}
		},

		save: (callback) => {

			// Sauvegarde des artistes
			// ---

			const store = getRoot(self);
			store._writeJsonFile(self.artistsCollectionFilePath, self.toJSON());

			if (callback) {
				callback();
			}
		},

		index: (metas) => {

			// Indexation d'un artiste
			// ---

			let added = false;

			let artistId = metas.artistID;
			let artist = self.by_id.get(artistId);

			if (!artist) {
				artist = ArtistStore.create({});
				artist.setField('id', artistId);
				added = true;
			}

			const tags = metas.fileTags;

			artist.setField('name', tags.albumartist);

			artist.addAlbumId(metas.albumID);

			self.by_id.set(artistId, artist);
			return added;
		}

	}))


// Functions Components ReactJS
// ======================================================================================================

// ***** ArtistsHeaderLeft *****
// *****************************

const TAG_ArtistsHeaderLeft = () => {}
export const ArtistsHeaderLeft = observer((props) => {

	const store = React.useContext(window.storeContext);
	const app = store.app;

	// ...

	// Render
	// ==================================================================================================

	return (
		<HeaderTitle
			title="Artistes"
			titleStyle={{
				marginLeft: '10px',
			}}
		/>
	)
})

// ***** ArtistsMenuItem *****
// ***************************

const TAG_ArtistsMenuItem = () => {}
export const ArtistsMenuItem = observer((props) => {

	const store = React.useContext(window.storeContext);
	const app = store.app;
	const menu = app.menu;

	// ...

	const artistsContext = 'artists';

	// Events
	// ==================================================================================================

	const handleMenuItemClick = () => {
		store.navigateTo(artistsContext);
		app.menu.close();
	}

	// Render
	// ==================================================================================================

	return (
		<MenuItem
			iconName="face"
			label="Artistes"
			activeContexts={[artistsContext]}
			callbackClick={handleMenuItemClick}
		/>
	)
})

// ***** ArtistsPage *****
// ***********************

const TAG_ArtistsPage = () => {}
export const ArtistsPage = observer((props) => {

	const store = React.useContext(window.storeContext);
	const app = store.app;

	// Renderers
	// ==================================================================================================

	const renderHelper = () => {

		// Render :: Helper
		// ---

		return (
			<Helper
				iconName="face"
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
