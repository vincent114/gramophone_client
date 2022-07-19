import React from 'react';
import { types, getRoot } from "mobx-state-tree";
import { observer } from "mobx-react-lite";
import clsx from 'clsx';

import { Helper } from 'nexus/ui/helper/Helper';

import './Artist.css';


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
	.views(self => ({

		get letter() {
			if (self.name) {
				return self.name[0].toLowerCase();
			}
			return "";
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


// Functions Components ReactJS
// ======================================================================================================

// ***** RenderArtist *****
// ************************

const TAG_RenderArtist = () => {}
export const RenderArtist = observer((props) => {

	const store = React.useContext(window.storeContext);
	const app = store.app;
	const artists = store.artists;

	// From ... store

	const isLoading = app.isLoading;

	const artistId = store.artistId;
	const artist = artists.by_id.get(artistId);

	// ...

	console.log(artist.toJSON());

	// Render
	// ==================================================================================================

	return (
		<div>

		</div>
	)
})

// ***** ArtistPage *****
// **********************

const TAG_ArtistPage = () => {}
export const ArtistPage = observer((props) => {

	const store = React.useContext(window.storeContext);
	const app = store.app;

	// From ... store

	const loaded = store.loaded;
	const artistId = app.artistId;

	// ...

	const showHelper = (!loaded && !artistId) ? true : false;

	// Render
	// ==================================================================================================

	const renderPage = () => {

		// Render :: Page
		// ---

		let pageContent = null;
		if (loaded) {
			pageContent = <RenderArtist />
		}
		return pageContent;
	}

	const renderHelper = () => {

		// Render :: Helper
		// ---

		return (
			<Helper
				iconName="face"
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
