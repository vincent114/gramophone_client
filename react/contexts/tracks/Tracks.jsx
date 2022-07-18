import React from 'react';
import { types, getRoot } from "mobx-state-tree";
import { observer } from "mobx-react-lite";
import clsx from 'clsx';

import { HeaderTitle } from 'nexus/layout/header/Header';
import { MenuItem } from 'nexus/layout/menu/Menu';

import { Helper } from 'nexus/ui/helper/Helper';

import { dateTools } from 'nexus/utils/DateTools';

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
			for (const [trackId, trackRaw] of Object.entries(raw.by_id)) {
				const track = TrackStore.create({});
				track.update(trackRaw);
				self.by_id.set(trackId, track);
			}
			self.loaded = true;
		},

		load: (callback) => {

			// Chargement des morceaux
			// ---

			const store = getRoot(self);

			const raw = store._readJsonFile(self.tracksCollectionFilePath, {
				by_id: {},
			});
			self.update(raw);

			if (callback) {
				callback();
			}
		},

		save: (callback) => {

			// Sauvegarde des morceaux
			// ---

			const store = getRoot(self);
			store._writeJsonFile(self.tracksCollectionFilePath, self.toJSON());

			if (callback) {
				callback();
			}
		},

		index: (metas) => {

			// Indexation d'un morceau
			// ---

			let added = false;

			let trackId = metas.trackID;
			let track = self.by_id.get(trackId);

			if (!track) {
				track = TrackStore.create({});
				track.setField('id', trackId);
				track.setField('ts_added', dateTools.getNowIso());
				added = true;
			}

			const tags = metas.fileTags;
			const filePathParts = (metas.filePath) ? metas.filePath.split('.') : [];

			track.setField('name', tags.title);
			track.setField('disk', tags.disk.no);
			track.setField('track', tags.track.no);

			track.setField('track_path', metas.filePath);
			track.setField('track_type', (filePathParts.length > 0) ? filePathParts[filePathParts.length - 1] : '');

			track.setField('ts_file', metas.fileMtime);

			track.setField('artist', tags.artist);
			track.setField('album', tags.album);

			track.setField('album_id', metas.albumID);
			track.setField('artist_id', metas.artistID);
			track.setField('year_id', metas.yearID);
			track.setField('genre_id', metas.genreID);

			self.by_id.set(trackId, track);
			return added;
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

	// Events
	// ==================================================================================================

	const handleMenuItemClick = () => {
		store.navigateTo(tracksContext);
		app.menu.close();
	}

	// Render
	// ==================================================================================================

	return (
		<MenuItem
			iconName="audiotrack"
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
