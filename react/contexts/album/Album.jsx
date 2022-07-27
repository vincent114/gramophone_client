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
import { Popover } from 'nexus/ui/popover/Popover';
import {
	List,
	ListItem,
	ListIcon,
	ListText
} from 'nexus/ui/list/List';
import { Divider } from 'nexus/ui/divider/Divider';

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

		removeTrackId: (trackId) => {
			const trackIdx = self.tracks_ids.indexOf(trackId)
			if (trackIdx > -1) {
				self.tracks_ids.splice(trackIdx, 1);
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

			// Ajout des morceaux dans l'ordre dans la liste de lecture
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

// ***** AlbumContextualMenu *****
// *******************************

const TAG_AlbumContextualMenu = () => {}
export const AlbumContextualMenu = observer((props) => {

	const store = React.useContext(window.storeContext);
	const app = store.app;
	const snackbar = app.snackbar;
	const search = store.search;
	const tracks = store.tracks;
	const albums = store.albums;
	const player = store.player;
	const popupTrackMetadatas = store.popupTrackMetadatas;
	const popupManagePlaylist = store.popupManagePlaylist;

	// From ... states

	const [anchorMenu, setAnchorMenu] = React.useState(null);

	// From ... props

	const album = props.album;
	const origin = (props.origin) ? props.origin : "album"; // album
	const size = (props.size) ? props.size : null;
	const color = (props.color) ? props.color : null;

	const children = props.children;

	const callbackClick = props.callbackClick;

	let className = (props.className) ? props.className : "";
	let style = (props.style) ? props.style : {};

	// ...

	// Events
	// ==================================================================================================

	const handleOpenMenu = (event) => {
		event.preventDefault();
		event.stopPropagation();
		setAnchorMenu(event.currentTarget);
	}

	const handleCloseMenu = () => {
		setAnchorMenu(null);
	}

	// -

	const handleGoto = (gotoContext, gotoContextId) => {
		store.navigateTo(gotoContext, gotoContextId);
		handleCloseMenu();
	}

	// -

	const handleAddPlaylist = () => {
		popupManagePlaylist.init("add", "playlist");
		popupManagePlaylist.setField("sourceId", album.id);
		popupManagePlaylist.setField("sourceType", "album");
		popupManagePlaylist.open();
		handleCloseMenu();
	}

	const handleAddToQueue = () => {
		album.queue();
		handleCloseMenu();
	}

	// -

	const handleDelete = () => {
		const CONFIRM_UNINDEX = `Êtes-vous sûr de vouloir dé-indexer l'album ${album.name} ?`;
		if (confirm(CONFIRM_UNINDEX)) {

			player.audioStop();
			player.clear();

			search.clear();

			app.clearHistory();

			if (app.context == 'album' && store.albumId == album.id) {
				app.navigateTo('home');
			}
			if (app.context == 'artist' && store.artistId == album.artist_id) {
				app.navigateTo('home');
			}
			if (app.context == 'year' && store.yearId == album.year_id) {
				app.navigateTo('home');
			}
			if (app.context == 'genre' && store.yearId == album.genre_id) {
				app.navigateTo('home');
			}

			setTimeout(() => {
				const unindexed = albums.unindex(album.id);
				if (unindexed) {
					setTimeout(() => {
						store.save();
					}, 1000)
					snackbar.update(true, "Album dé-indexé avec succès.", "success");
				} else {
					snackbar.update(true, "Dé-indexation de l'album échouée.", "error");
				}
			}, 500);
		}
	}

	// Render
	// ==================================================================================================

	return (
		<div
			className={clsx(
				className,
			)}
			style={style}
			onClick={(e) => {
				if (callbackClick) {
					callbackClick(e);
				}
			}}
		>
			<IconButton
				size={size}
				iconName="more_horiz"
				color={color}
				onClick={(e) => handleOpenMenu(e)}
			/>
			<Popover
				id={`pop-album-${album.id}`}
				open={Boolean(anchorMenu)}
				anchorEl={anchorMenu}
				onClose={handleCloseMenu}
				anchorOrigin={{
					vertical: 'bottom',
					horizontal: 'center',
				}}
				transformOrigin={{
					vertical: 'top',
					horizontal: 'center',
				}}
			>
				{album && (
					<List
						style={{
							paddingTop: '10px',
							paddingBottom: '10px',
						}}
					>

						<ListItem
							size="small"
							onClick={() => handleGoto("artist", album.linkedArtist.id)}
						>
							<ListIcon
								name="face"
							/>
							<ListText withIcon={true}>
								Aller à l'artiste
							</ListText>
						</ListItem>

						<ListItem
							size="small"
							onClick={() => handleGoto("genre", album.linkedGenre.id)}
						>
							<ListIcon
								name="local_bar"
							/>
							<ListText withIcon={true}>
								Aller au genre
							</ListText>
						</ListItem>

						<ListItem
							size="small"
							onClick={() => handleGoto("year", album.linkedYear.id)}
						>
							<ListIcon
								name="date_range"
							/>
							<ListText withIcon={true}>
								Aller à l'année
							</ListText>
						</ListItem>

						<Divider spacing="medium" />

						<ListItem
							size="small"
							onClick={() => handleAddPlaylist()}
						>
							<ListIcon
								name="playlist_add"
							/>
							<ListText withIcon={true}>
								Ajouter à une playlist
							</ListText>
						</ListItem>

						<ListItem
							size="small"
							onClick={() => handleAddToQueue()}
						>
							<ListIcon
								name="queue_music"
							/>
							<ListText withIcon={true}>
								Ajouter à la liste de lecture
							</ListText>
						</ListItem>

						<Divider spacing="medium" />

						<ListItem
							size="small"
							onClick={() => handleDelete()}
						>
							<ListIcon
								name="delete"
							/>
							<ListText withIcon={true}>
								Supprimer l'indexation
							</ListText>
						</ListItem>

						{children}

					</List>
				)}
			</Popover>
		</div>
	)
})

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
									<AlbumContextualMenu
										album={album}
										origin="album"
										color="typography"
										className="flex-0"
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
