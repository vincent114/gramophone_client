import React from 'react';
import { types, getRoot } from "mobx-state-tree";
import { observer } from "mobx-react-lite";
import clsx from 'clsx';

import { TrackStore } from 'gramophone_client/contexts/track/Track';

import {
	TableContainer,
	Table,
	TableHead,
	TableBody,
	TableRow,
	TableCell
} from 'nexus/forms/table/Table';

import { HeaderTitle } from 'nexus/layout/header/Header';
import { MenuItem } from 'nexus/layout/menu/Menu';
import { Ribbon } from 'nexus/layout/ribbon/Ribbon';

import { Helper } from 'nexus/ui/helper/Helper';
import { IconButton } from 'nexus/ui/button/Button';
import { Paper } from 'nexus/ui/paper/Paper';

import { dateTools } from 'nexus/utils/DateTools';

import './Tracks.css';


// Models
// ======================================================================================================

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

		// Getters
		// -

		getSortedByField(field) {
			let tracks = [];
			for (const [trackId, track] of self.by_id.entries()) {
				tracks.push(track);
			}
			tracks.sort((a, b) => a[field] - a[field]);
			return tracks;
		},

		getById(trackId) {
			let track = self.by_id.get(trackId);
			if (!track) {
				track = TrackStore.create({});
			}
			return track;
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
			const app = store.app;

			store._readJsonFile(
				self.tracksCollectionFilePath,
				{
					by_id: {},
				},
				(raw) => {
					// self.update(raw);
					app.saveValue(['tracks', 'by_id'], raw.by_id, () => {
						self.setField('loaded', true);
						if (callback) {
							callback();
						}
					});
				}
			);
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

// ***** RenderTracks *****
// ************************

const TAG_RenderTracks = () => {}
export const RenderTracks = observer((props) => {

	const store = React.useContext(window.storeContext);
	const app = store.app;
	const tracks = store.tracks;

	// From ... store

	const isLoading = store.isLoading;

	const nbTracks = tracks.nbTracks;
	const tracksSorted = tracks.getSortedByField("name");

	// ...

	// Events
	// ==================================================================================================

	const handleThrowDiceClick = () => {
		// TODO
	}

	// -

	const handleTrackClick = (trackId) => {
		// TODO
	}

	// Render
	// ==================================================================================================

	return (
		<div>

			<Ribbon
				avatarIconName="audiotrack"
				avatarIconColor="typography"
				title={`${nbTracks} ${(nbTracks > 1) ? "Titres" : "Titre"}`}
				right={(
					<div className="h-col">
						<IconButton
							iconName="casino"
							color="hot"
							disabled={isLoading}
							onClick={() => handleThrowDiceClick()}
						/>
					</div>
				)}
			/>

			<br/>

			<TableContainer
				component={Paper}
				style={{
					marginTop: '10px',
					marginLeft: '20px',
					marginRight: '20px',
					padding: '0px',
				}}
			>
				<Table>

					<TableHead>
						<TableRow>
							<TableCell header={true}>
								Title
							</TableCell>
							<TableCell header={true}>
								Artiste
							</TableCell>
							<TableCell header={true}>
								Album
							</TableCell>
							<TableCell header={true}>
								Genre
							</TableCell>
							<TableCell header={true}>
								Année
							</TableCell>
						</TableRow>
					</TableHead>

					<TableBody>
						{tracksSorted.map((track, trackIdx) => (
							<TableRow
								key={`track-${trackIdx}`}
								hoverable={true}
								callbackClick={() => handleTrackClick(track.id)}
							>
								<TableCell style={{maxWidth: '200px'}}>
									{track.name}
								</TableCell>
								<TableCell>
									{track.artist}
								</TableCell>
								<TableCell>
									{track.album}
								</TableCell>
								<TableCell>
									{track.linkedGenre.name}
								</TableCell>
								<TableCell>
									{track.linkedYear.name}
								</TableCell>
							</TableRow>
						))}
					</TableBody>

				</Table>
			</TableContainer>

		</div>
	)
})

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

	// From ... props

	const disabled = props.disabled;

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
			disabled={disabled}
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
	const tracks = store.tracks;

	// From ... store

	const loaded = store.loaded;
	const nbTracks = tracks.nbTracks;

	// ...

	const showHelper = (!loaded || nbTracks == 0) ? true : false;

	// Renderers
	// ==================================================================================================

	const renderPage = () => {

		// Render :: Page
		// ---

		let pageContent = null;
		if (!showHelper) {
			pageContent = <RenderTracks />
		}
		return pageContent;
	}

	const renderHelper = () => {

		// Render :: Helper
		// ---

		return (
			<Helper
				iconName="audiotrack"
				show={showHelper}
			/>
		)
	}

	return (
		<div className="nx-page even large">
			{renderPage()}
			{renderHelper()}
		</div>
	)
})
