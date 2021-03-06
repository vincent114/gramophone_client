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

		getRandomly(howMany, load=true) {

			// Récupération aléatoire d'un certain nombre de titres
			// ---

			const store = getRoot(self);
			const app = store.app;
			const helpers = app.helpers;

			// Il y en a-t-il assez ?
			const nbTracks = self.nbTracks;
			if (howMany > nbTracks) {
				howMany = nbTracks;
			}

			const tracksIds = Array.from(self.by_id.keys());

			let randomTracks = [];
			let randomTracksIdxs = [];
			let randomTracksIds = [];

			while (randomTracksIdxs.length < howMany) {
				const randomIdx = helpers.getRandomNumber(tracksIds.length) - 1;
				if (randomTracksIdxs.indexOf(randomIdx) == -1) {
					const trackId = tracksIds[randomIdx];
					randomTracksIdxs.push(randomIdx);
					randomTracksIds.push(trackId);
					if (load) {
						const track = self.by_id.get(trackId);
						if (track) {
							randomTracks.push(track);
						}
					}
				}
			}
			return (load) ? randomTracks : randomTracksIds;
		},

		// -

		getFavorites() {
			const store = getRoot(self);
			const library = store.library;
			const shuffleIgnoreSoudtracks = library.shuffle_ignore_soudtracks;

			let favorites = [];
			for (const [trackId, track] of self.by_id.entries()) {
				if (shuffleIgnoreSoudtracks && ['soundtrack', 'soundtracks', 'bande_originale'].indexOf(track.genre_id) > -1) {
					continue;
				}
				if (track.favorite) {
					favorites.push(track);
				}
			}
			favorites.sort(function (a, b) {
				if (a.name > b.name)
					return 1;
				if (a.name < b.name)
					return -1;
				return 0;
			});
			return favorites;
		},

		getStarred() {
			let starred = [];
			for (const [trackId, track] of self.by_id.entries()) {
				if (track.starred) {
					starred.push(track);
				}
			}
			starred.sort(function (a, b) {
				if (a.name > b.name)
					return 1;
				if (a.name < b.name)
					return -1;
				return 0;
			});
			return starred;
		},

	}))
	.actions(self => ({

		setField: (field, value) => {
			self[field] = value;
		},

		// -

		// update: (raw) => {
		// 	self.by_id = {};
		// 	for (const [trackId, trackRaw] of Object.entries(raw.by_id)) {
		// 		const track = TrackStore.create({});
		// 		track.update(trackRaw);
		// 		self.by_id.set(trackId, track);
		// 	}
		// 	self.loaded = true;
		// },

		load: (callback) => {

			// Chargement des morceaux
			// ---

			const store = getRoot(self);
			const app = store.app;

			app.readJsonFile(
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
			const app = store.app;
			app.writeJsonFile(self.tracksCollectionFilePath, self.toJSON());

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

		unindex: (trackId, ignoreAlbums=false) => {

			// Dé-indexation d'un morceau
			// ---

			const store = getRoot(self);
			const playlists = store.playlists;

			let unindexed = true;
			let goAhead = true;

			const track = self.by_id.get(trackId);
			if (!track) {
				unindexed = false;
				goAhead = false;
			}

			// Déréférencement du titre dans l'album
			if (goAhead && !ignoreAlbums && track.album_id) {
				track.linkedAlbum.removeTrackId(trackId);
			}

			// Suppression du titre dans les playlists
			if (goAhead) {
				for (const [playlistId, playlist] of playlists.by_id.entries()) {
					if (playlist.permanent) {
						continue;
					}
					playlist.removeTrack(trackId);
				}
			}

			// Suppression du titre
			if (goAhead) {
				self.by_id.delete(trackId);
			}

			return unindexed;
		},

		// -

		shuffle: () => {

			// Lecture aléatoire de titres
			// ---

			const store = getRoot(self);
			const player = store.player;

			const playbackIds = self.getRandomly(100, false);
			player.audioStop();
			player.clear();
			player.populate(playbackIds);
			player.read();
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
