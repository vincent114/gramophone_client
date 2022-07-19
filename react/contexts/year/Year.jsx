import React from 'react';
import { types, getRoot } from "mobx-state-tree";
import { observer } from "mobx-react-lite";
import clsx from 'clsx';

import { Helper } from 'nexus/ui/helper/Helper';

import './Year.css';


// Models
// ======================================================================================================

// ***** YearStore *****
// **********************

const TAG_YearStore = () => {}
export const YearStore = types
	.model({
		id: types.maybeNull(types.string),
		name: types.maybeNull(types.string),

		albums_ids: types.optional(types.array(types.string), []),
	})
	.views(self => ({

		get decade() {
			if (self.name && self.name.length >= 2) {
				return `${self.name.substring(0, self.name.length - 1)}0`;
			}
			return "";
		},

		get nbAlbums() {
			return self.albums_ids.length;
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

// ***** RenderYear *****
// **********************

const TAG_RenderYear = () => {}
export const RenderYear = observer((props) => {

	const store = React.useContext(window.storeContext);
	const app = store.app;
	const years = store.years;

	// From ... store

	const isLoading = app.isLoading;

	const yearId = store.yearId;
	const year = years.by_id.get(yearId);

	// ...

	console.log(year.toJSON());

	// Render
	// ==================================================================================================

	return (
		<div>

		</div>
	)
})

// ***** YearPage *****
// ********************

const TAG_YearPage = () => {}
export const YearPage = observer((props) => {

	const store = React.useContext(window.storeContext);
	const app = store.app;

	// From ... store

	const loaded = store.loaded;
	const yearId = app.yearId;

	// ...

	const showHelper = (!loaded && !yearId) ? true : false;

	// Render
	// ==================================================================================================

	const renderPage = () => {

		// Render :: Page
		// ---

		let pageContent = null;
		if (loaded) {
			pageContent = <RenderYear />
		}
		return pageContent;
	}

	const renderHelper = () => {

		// Render :: Helper
		// ---

		return (
			<Helper
				iconName="date_range"
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
