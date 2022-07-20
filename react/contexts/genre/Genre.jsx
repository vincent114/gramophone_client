import React from 'react';
import { types, getRoot } from "mobx-state-tree";
import { observer } from "mobx-react-lite";
import clsx from 'clsx';

import { Helper } from 'nexus/ui/helper/Helper';

import './Genre.css';


// Models
// ======================================================================================================

// ***** GenreStore *****
// **********************

const TAG_GenreStore = () => {}
export const GenreStore = types
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

		get upperName() {
			if (self.name) {
				return self.name.toUpperCase();
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

// ***** RenderGenre *****
// ***********************

const TAG_RenderGenre = () => {}
export const RenderGenre = observer((props) => {

	const store = React.useContext(window.storeContext);
	const app = store.app;
	const genres = store.genres;

	// From ... store

	const isLoading = app.isLoading;

	const genreId = store.genreId;
	const genre = genres.by_id.get(genreId);

	// ...

	console.log(genre.toJSON());

	// Render
	// ==================================================================================================

	return (
		<div>

		</div>
	)
})

// ***** GenrePage *****
// *********************

const TAG_GenrePage = () => {}
export const GenrePage = observer((props) => {

	const store = React.useContext(window.storeContext);
	const app = store.app;

	// From ... store

	const loaded = store.loaded;
	const genreId = app.genreId;

	// ...

	const showHelper = (!loaded && !genreId) ? true : false;

	// Render
	// ==================================================================================================

	const renderPage = () => {

		// Render :: Page
		// ---

		let pageContent = null;
		if (loaded) {
			pageContent = <RenderGenre />
		}
		return pageContent;
	}

	const renderHelper = () => {

		// Render :: Helper
		// ---

		return (
			<Helper
				iconName="local_bar"
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
