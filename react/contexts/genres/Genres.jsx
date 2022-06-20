import React from 'react';
import { types, getRoot } from "mobx-state-tree";
import { observer } from "mobx-react-lite";
import clsx from 'clsx';

import { Helper } from 'nexus/ui/helper/Helper';
import { HeaderTitle } from 'nexus/layout/header/Header';
import { MenuItem } from 'nexus/layout/menu/Menu';

import './Genres.css';


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

	}))

// ***** GenresStore *****
// ***********************

const TAG_GenresStore = () => {}
export const GenresStore = types
	.model({
		by_id: types.map(GenreStore),

		loaded: false,
	})
	.views(self => ({

		get genresCollectionFilePath() {
			const store = getRoot(self);
			const library = store.library;
			const path = ipc.sendSync('pathJoin', [library.collectionPath, 'genres.json']);
			return path;
		},

		get nbGenres() {
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
			for (const [genreId, genreRaw] of Object.entries(raw.by_id)) {
				const genre = GenreStore.create({});
				genre.update(genreRaw);
				self.by_id.set(genreId, genre);
			}
			self.loaded = true;
		},

		load: (callback) => {

			// Chargement des morceaux
			// ---

			const store = getRoot(self);

			const raw = store._readJsonFile(self.genresCollectionFilePath, {
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

// ***** GenresHeaderLeft *****
// ****************************

const TAG_GenresHeaderLeft = () => {}
export const GenresHeaderLeft = observer((props) => {

	const store = React.useContext(window.storeContext);
	const app = store.app;

	// ...

	// Render
	// ==================================================================================================

	return (
		<HeaderTitle
			title="Genres"
			titleStyle={{
				marginLeft: '10px',
			}}
		/>
	)
})

// ***** GenresMenuItem *****
// **************************

const TAG_GenresMenuItem = () => {}
export const GenresMenuItem = observer((props) => {

	const store = React.useContext(window.storeContext);
	const app = store.app;
	const menu = app.menu;

	// ...

	const genresContext = 'genres';

	// Events
	// ==================================================================================================

	const handleMenuItemClick = () => {
		store.navigateTo(genresContext);
		app.menu.close();
	}

	// Render
	// ==================================================================================================

	return (
		<MenuItem
			iconName="local_bar"
			label="Genres"
			activeContexts={[genresContext]}
			callbackClick={handleMenuItemClick}
		/>
	)
})

// ***** GenresPage *****
// **********************

const TAG_GenresPage = () => {}
export const GenresPage = observer((props) => {

	const store = React.useContext(window.storeContext);
	const app = store.app;

	// Renderers
	// ==================================================================================================

	const renderHelper = () => {

		// Render :: Helper
		// ---

		return (
			<Helper
				iconName="local_bar"
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
