import React from 'react';
import { types, getRoot } from "mobx-state-tree";
import { observer } from "mobx-react-lite";
import clsx from 'clsx';

import { Helper } from 'nexus/ui/helper/Helper';
import { HeaderTitle } from 'nexus/layout/header/Header';
import { MenuItem } from 'nexus/layout/menu/Menu';
import { Icon } from 'nexus/ui/icon/Icon';

import './Tracks.css';


// Models
// ======================================================================================================

// ***** TrackStore *****
// **********************

const TAG_TrackStore = () => {}
export const TrackStore = types
	.model({
		id: types.maybeNull(types.string),
		name: types.maybeNull(types.string),
		disk: types.frozen(null),
		track: types.frozen(null),

		track_path: types.maybeNull(types.string),
		track_type: types.maybeNull(types.string),
		track_available: true,

		ts_file: types.maybeNull(types.string),
		ts_added: types.maybeNull(types.string),

		artist: types.maybeNull(types.string),
		album: types.maybeNull(types.string),

		checked: true,
		favorite: false,
		starred: false,

		album_id: types.maybeNull(types.string),
		artist_id: types.maybeNull(types.string),
		year_id: types.maybeNull(types.string),
		genre_id: types.maybeNull(types.string),
	})
	.actions(self => ({

		setField: (field, value) => {
			self[field] = value;
		},

		// -

		update: (raw) => {
			self.id = raw.id;
			self.name = raw.name;
			self.disk = raw.disk;
			self.track = raw.track;

			self.track_path = raw.track_path;
			self.track_type = raw.track_type;
			self.track_available = raw.track_available;

			self.ts_file = raw.ts_file;
			self.ts_added = raw.ts_added;

			self.artist = raw.artist;
			self.album = raw.album;

			self.checked = raw.checked;
			self.favorite = raw.favorite;
			self.starred = raw.starred;

			self.album_id = raw.album_id;
			self.artist_id = raw.artist_id;
			self.year_id = raw.year_id;
			self.genre_id = raw.genre_id;
		},

	}))

// ***** TracksStore *****
// ***********************

const TAG_TracksStore = () => {}
export const TracksStore = types
	.model({
		by_id: types.map(TrackStore),

		loaded: false,
	})
	.views(self => ({

		get tracksCollectionFilePath() {
			const store = getRoot(self);
			const library = store.library;
			const path = ipc.sendSync('pathJoin', [library.collectionPath, 'tracks.json']);
			return path;
		},

		get nbTracks() {
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
			for (const [trackId, trackRaw] of Object.entries(self.by_id)) {
				const track = TrackStore.create({});
				track.update(trackRaw);
				self.by_id.set(trackId, track);
			}
			self.loaded = true;
		},

		load: (callback) => {

			// Chargement des morceaux
			// ---

			const raw = store._readJsonFile(self.tracksCollectionFilePath, {
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

// ***** TracksHeaderLeft *****
// ****************************

const TAG_TracksHeaderLeft = () => {}
export const TracksHeaderLeft = observer((props) => {

	const store = React.useContext(window.storeContext);
	const app = store.app;

	// ...

	// Render
	// ==================================================================================================

	return (
		<HeaderTitle
			title="Titres"
			titleStyle={{
				marginLeft: '10px',
			}}
		/>
	)
})

// ***** TracksMenuItem *****
// **************************

const TAG_TracksMenuItem = () => {}
export const TracksMenuItem = observer((props) => {

	const store = React.useContext(window.storeContext);
	const app = store.app;
	const menu = app.menu;

	// ...

	const tracksContext = 'tracks';

	// Evènements
	// ==================================================================================================

	const handleMenuItemClick = () => {
		store.navigateTo(tracksContext);
		app.menu.close();
	}

	// Render
	// ==================================================================================================

	return (
		<MenuItem
			icon={<Icon name="audiotrack" width="120px" />}
			label="Titres"
			activeContexts={[tracksContext]}
			callbackClick={handleMenuItemClick}
		/>
	)
})

// ***** TracksPage *****
// **********************

const TAG_TracksPage = () => {}
export const TracksPage = observer((props) => {

	const store = React.useContext(window.storeContext);
	const app = store.app;

	// Renderers
	// ==================================================================================================

	const renderHelper = () => {

		// Render :: Helper
		// ---

		return (
			<Helper
				iconName="audiotrack"
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
