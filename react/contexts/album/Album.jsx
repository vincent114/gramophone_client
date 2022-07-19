import React from 'react';
import { types, getRoot } from "mobx-state-tree";
import { observer } from "mobx-react-lite";
import clsx from 'clsx';

import { Helper } from 'nexus/ui/helper/Helper';

import './Album.css';


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
	.views(self => ({

		get letter() {
			if (self.name) {
				return self.name[0].toLowerCase();
			}
			return "";
		},

		// -

		get linkedArtist() {
			const store = getRoot(self);
			const artists = store.artists;
			return artists.getById(self.artist_id);
		},

		get linkedYear() {
			const store = getRoot(self);
			const years = store.years;
			return years.getById(self.year_id);
		},

		get linkedGenre() {
			const store = getRoot(self);
			const genres = store.genres;
			return genres.getById(self.genre_id);
		},

	}))
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


// Functions Components ReactJS
// ======================================================================================================

// ***** RenderAlbum *****
// ***********************

const TAG_RenderAlbum = () => {}
export const RenderAlbum = observer((props) => {

	const store = React.useContext(window.storeContext);
	const app = store.app;
	const albums = store.albums;

	// From ... store

	const isLoading = app.isLoading;

	const albumId = store.albumId;
	const album = albums.by_id.get(albumId);

	// ...

	console.log(album.toJSON());

	// Render
	// ==================================================================================================

	return (
		<div>

		</div>
	)
})

// ***** AlbumPage *****
// *********************

const TAG_AlbumPage = () => {}
export const AlbumPage = observer((props) => {

	const store = React.useContext(window.storeContext);
	const app = store.app;

	// From ... store

	const loaded = store.loaded;
	const albumId = store.albumId;

	// ...

	const showHelper = (!loaded || !albumId) ? true : false;

	// Render
	// ==================================================================================================

	const renderPage = () => {

		// Render :: Page
		// ---

		let pageContent = null;
		if (loaded) {
			pageContent = <RenderAlbum />
		}
		return pageContent;
	}

	const renderHelper = () => {

		// Render :: Helper
		// ---

		return (
			<Helper
				iconName="album"
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
