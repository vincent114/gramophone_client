import React from 'react';
import { types, getRoot } from "mobx-state-tree";
import { observer } from "mobx-react-lite";
import clsx from 'clsx';

import { TrackRow } from 'gramophone_client/contexts/track/Track';

import { Indicator } from 'nexus/forms/indicator/Indicator';
import {
	TableContainer,
	Table,
	TableHead,
	TableBody,
	TableRow,
	TableCell
} from 'nexus/forms/table/Table';

import { Row } from 'nexus/layout/row/Row';
import { Column } from 'nexus/layout/column/Column';
import { Ribbon } from 'nexus/layout/ribbon/Ribbon';
import {
	GroupDivider,
	Group,
} from 'nexus/layout/group/Group';

import { Helper } from 'nexus/ui/helper/Helper';
import { Typography } from 'nexus/ui/typography/Typography';
import { IconButton } from 'nexus/ui/button/Button';
import { Avatar } from 'nexus/ui/avatar/Avatar';
import { Paper } from 'nexus/ui/paper/Paper';
import { Icon } from 'nexus/ui/icon/Icon';

import { uuid, getLetter } from 'nexus/utils/Datas';

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

		ts_added: types.maybeNull(types.string),

		artist_id: types.maybeNull(types.string),
		year_id: types.maybeNull(types.string),
		genre_id: types.maybeNull(types.string),
		tracks_ids: types.optional(types.array(types.string), []),
	})
	.views(self => ({

		get letter() {
			if (self.name) {
				return getLetter(self.name);
			}
			return "";
		},

		get nbTracks() {
			return self.tracks_ids.length;
		},

		// -

		get coverUrl() {
			return self.cover;
		},

		// get coverUrlUncached() {
		// 	const coverUrl = self.coverUrl;
		// 	if (coverUrl) {
		// 		return `${coverUrl}?cburst=${uuid()}`;
		// 	}
		// 	return "";
		// },

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

		// -

		// get firstTrack() {
		// 	const store = getRoot(self);
		// 	const tracks = store.tracks;

		// 	let firstTrackId = "";
		// 	const sortedTracks = self.getSortedByNumber();
		// 	if (sortedTracks.length > 0) {
		// 		firstTrackId = sortedTracks[0].id;
		// 	}
		// 	return tracks.getById(firstTrackId);
		// },

		// Getters
		// -

		getSortedByNumber() {

			const store = getRoot(self);
			const tracks = store.tracks;

			let tracksList = [];
			for (const trackId of self.tracks_ids) {
				const track = tracks.by_id.get(trackId);
				if (track) {
					tracksList.push(track);
				}
			}
			tracksList.sort(function (a, b) {
				if (a.sortNumber > b.sortNumber)
					return 1;
				if (a.sortNumber < b.sortNumber)
					return -1;
				return 0;
			});
			return tracksList;
		},

		getTracks(load=true, filter="all") {
			const store = getRoot(self);
			const tracks = store.tracks;

			let tracksList = [];
			let tracksIds = [];

			for (const trackId of self.tracks_ids) {
				const track = tracks.by_id.get(trackId);
				if (track) {
					if (filter == "playable" && track.isPlayerCandidate) {
						tracksList.push(track);
						tracksIds.push(track.id);
					}
					if (filter == "shuffle" && track.isShuffleCandidate) {
						tracksList.push(track);
						tracksIds.push(track.id);
					}
					if (filter == "all") {
						tracksList.push(track);
						tracksIds.push(track.id);
					}
				}
			}
			return (load) ? tracksList : tracksIds;
		},

		getPlayable(load=true, trackIdOrigin=null) {
			let tracksList = [];
			const tracks = self.getSortedByNumber();

			// A partir d'un certain titre ou depuis le début ?
			let startIdx = 0;
			if (trackIdOrigin != null) {
				for (const trackIdx in tracks) {
					const track = tracks[trackIdx];
					if (track.id == trackIdOrigin) {
						startIdx = parseInt(trackIdx);
						break;
					}
				}
			}

			// Récupération des titres
			for (const trackIdx in tracks) {
				const track = tracks[trackIdx];
				if (parseInt(trackIdx) < startIdx) {
					continue;
				}
				if (track.isPlayerCandidate) {
					if (load) {
						tracksList.push(track);
					} else {
						tracksList.push(track.id);
					}
				}
			}

			return tracksList;
		},

		getTracksRandomly(load=true) {

			const store = getRoot(self);
			const app = store.app;
			const helpers = app.helpers;
			const tracks = store.tracks;

			const playableIds = self.getPlayable(false);
			// const tracksIds = self.tracks_ids.toJSON();
			const howMany = playableIds.length;

			let randomTracks = [];
			let randomTracksIdxs = [];
			let randomTracksIds = [];

			while (randomTracksIdxs.length < howMany) {
				const randomIdx = helpers.getRandomNumber(howMany) - 1;
				if (randomTracksIdxs.indexOf(randomIdx) == -1) {
					randomTracksIdxs.push(randomIdx);
					const trackId = playableIds[randomIdx];
					const track = tracks.by_id.get(trackId);
					if (track && track.isShuffleCandidate) {
						randomTracksIds.push(trackId);
						randomTracks.push(track);
					}
				}
			}
			return (load) ? randomTracks : randomTracksIds;
		},

		// -

		groupedByDisc() {
			let byDisc = {};
			const tracks = self.getSortedByNumber();
			for (const track of tracks) {
				const discNumber = track.discNumber;
				if (!byDisc.hasOwnProperty(discNumber)) {
					byDisc[discNumber] = [];
				}
				byDisc[discNumber].push(track);
			}
			return byDisc;
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

			self.ts_added = raw.ts_added;

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

		// -

		play: (trackId) => {

			// Lecture de tous les morceaux de l'album dans l'ordre
			// ---

			const store = getRoot(self);
			const player = store.player;

			const playbackIds = self.getPlayable(false);
			player.audioStop();
			player.clear();
			player.populate(playbackIds);

			player.read(trackId);
		},

		queue: () => {

			// Ajout des morceau dans l'ordre dans la liste de lecture
			// ---

			const store = getRoot(self);
			const player = store.player;

			const playbackIds = self.getPlayable(false);
			player.populate(playbackIds);
			if (playbackIds.length > 0 && player.playIdx == -1) {
				player.setField("playIdx", 0);
			}
		},

		shuffle: () => {

			// Lecture aléatoire de tous les morceaux de l'album
			// ---

			const store = getRoot(self);
			const player = store.player;

			const playbackIds = self.getTracksRandomly(false);
			player.audioStop();
			player.clear();
			player.populate(playbackIds);
			player.read();
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
	const popup = app.popup;
	const albums = store.albums;
	const popupZoomCover = store.popupZoomCover;

	// From ... store

	const isLoading = app.isLoading;

	const albumId = store.albumId;
	const album = albums.by_id.get(albumId);

	const albumCover = album.cover;
	const albumName = album.name;

	const albumArtist = album.linkedArtist;
	const artistName = albumArtist.name;

	const albumGenre = album.linkedGenre;
	const genreName = albumGenre.upperName;

	const albumYear = album.linkedYear;
	const yearName = albumYear.name;

	const tracksByDiscs = album.groupedByDisc();
	const nbAlbumTracks = album.nbTracks;

	// ...

	const discs = Object.keys(tracksByDiscs);
	const nbDiscs = discs.length;
	discs.sort();

	// Events
	// ==================================================================================================

	const handleCoverClick = () => {
		popupZoomCover.setField("albumId", albumId);
		popupZoomCover.open();
	}

	const handleArtistClick = () => {
		store.navigateTo('artist', albumArtist.id);
	}

	const handleGenreClick = () => {
		store.navigateTo('genre', albumGenre.id);
	}

	const handleYearClick = () => {
		store.navigateTo('year', albumYear.id);
	}

	// -

	const handlePlayAlbumClick = () => {
		album.play();
	}

	const handleQueueAlbumClick = () => {
		album.queue();
	}

	const handleThrowDiceClick = () => {
		album.shuffle();
	}

	// -

	const handleDiscClick = (disc) => {
		// TODO
	}

	const handleFocusDisc = (disc) => {
		// TODO
	}

	// Render
	// ==================================================================================================

	return (
		<div>

			<Row
				align="stretch"
				spacing="large"
				style={{
					marginBottom: '40px',
				}}
			>
				<div className="g-album-cover">
					{!albumCover && (
						<Icon
							name="album"
							color="default"
							style={{
								width: '100px',
							}}
						/>
					)}
					{albumCover && (
						<img
							src={albumCover}
							onClick={() => handleCoverClick()}
						/>
					)}
				</div>
				<Column align="stretch">
					<div></div>
					<div className="flex-1">
						{albumName && (
							<Typography
								className="g-album-name"
								size="x-big"
							>
								{albumName}
							</Typography>
						)}
						{artistName && (
							<Typography
								className="g-album-artist"
								size="x-big"
								color="hot"
								style={{
									marginTop: '4px',
									display: 'inline-block',
								}}
								onClick={() => handleArtistClick()}
							>
								{artistName}
							</Typography>
						)}
						{(genreName || yearName) && (
							<Row
								align="center"
								style={{
									marginTop: '10px',
								}}
							>
								{genreName && (
									<Typography
										variant="description"
										size="small"
										className="flex-0"
										onClick={() => handleGenreClick()}
									>
										{genreName}
									</Typography>
								)}
								{(genreName && yearName) && (
									<Typography
										variant="description"
										size="small"
										className="flex-0"
									>
										•
									</Typography>
								)}
								{yearName && (
									<Typography
										variant="description"
										size="small"
										className="flex-0"
										onClick={() => handleYearClick()}
									>
										{yearName}
									</Typography>
								)}
							</Row>
						)}
					</div>
					<div></div>
					<div className="flex-0">
						<Ribbon
							title={`${nbAlbumTracks} ${(nbAlbumTracks > 1) ? "Titres" : "Titre"}`}
							left={(
								<div className="h-col">
									<IconButton
										iconName="play_arrow"
										color="hot"
										onClick={() => handlePlayAlbumClick()}
									/>
									<IconButton
										iconName="playlist_add"
										color="hot"
										onClick={() => handleQueueAlbumClick()}
									/>
									<IconButton
										iconName="casino"
										color="hot"
										style={{
											marginRight: '20px',
										}}
										onClick={() => handleThrowDiceClick()}
									/>
								</div>
							)}
							right={(
								<div className="h-col">
									<IconButton
										iconName="more_horiz"
										color="typography"
										disabled={isLoading}
										// onClick={() => handleThrowDiceClick()}
									/>
								</div>
							)}
						/>
					</div>
				</Column>
			</Row>

			{discs.map((disc, discIdx) => {

				const discTracks = tracksByDiscs[disc];

				return (
					<Group
						id={`group-${disc}-${discIdx}`}
						key={`group-${disc}-${discIdx}`}
						style={{
							marginTop: '40px',
						}}
					>

						{nbDiscs > 1 && (
							<GroupDivider
								spacing="big"
								// left={(
								// 	<IconButton
								// 		iconName="album"
								// 		onClick={() => handleDiscClick(disc)}
								// 	/>
								// )}
								center={(
									<Avatar
										size="small"
										color="rgba(111, 126, 140, 0.1)"
										textColor="typography"
										style={{
											fontSize: '14px',
											color: 'gray',
										}}
									>
										{disc}
									</Avatar>
								)}
								// right={(
								// 	<IconButton
								// 		iconName="arrow_forward"
								// 		onClick={() => handleFocusDisc(disc)}
								// 	/>
								// )}
							/>
						)}

						<TableContainer
							component={Paper}
							style={{
								marginTop: (nbDiscs == 1) ? '60px' : '20px',
								marginLeft: (nbDiscs == 1) ? '0px' : '16px',
								marginRight: (nbDiscs == 1) ? '0px' : '16px',
								padding: '0px',
							}}
						>
							<Table>

								<TableHead>
									<TableRow>
										<TableCell
											header={true}
											width={56}
											align="center"
										>
										</TableCell>
										<TableCell
											header={true}
											width={56}
											align="center"
										>
										</TableCell>
										<TableCell
											header={true}
											width={56}
											align="center"
										>
											Mix
										</TableCell>
										<TableCell
											header={true}
											width={56}
											align="center"
										>
											N°
										</TableCell>
										<TableCell header={true}>
											Titre
										</TableCell>
										<TableCell
											header={true}
											width={56}
											align="right"
										>
										</TableCell>
									</TableRow>
								</TableHead>

								<TableBody>
									{discTracks.map((track, trackIdx) => (
										<TrackRow
											key={`track-${disc}-${trackIdx}`}
											track={track}
										/>
									))}
								</TableBody>

							</Table>
						</TableContainer>

					</Group>
				)
			})}

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
		<div className="nx-page medium">
			{renderPage()}
			{renderHelper()}
		</div>
	)
})
