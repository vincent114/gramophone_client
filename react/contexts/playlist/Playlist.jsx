import React from 'react';
import { types, getRoot } from "mobx-state-tree";
import { observer } from "mobx-react-lite";
import clsx from 'clsx';

import { PlaylistFolderStore } from 'gramophone_client/contexts/playlist_folder/PlaylistFolder';
import { TrackRow } from 'gramophone_client/contexts/track/Track';

import {
	TableContainer,
	Table,
	TableHead,
	TableBody,
	TableRow,
	TableCell
} from 'nexus/forms/table/Table';

import { Ribbon } from 'nexus/layout/ribbon/Ribbon';
import { Row } from 'nexus/layout/row/Row';

import { Helper } from 'nexus/ui/helper/Helper';
import { IconButton } from 'nexus/ui/button/Button';
import { Popover } from 'nexus/ui/popover/Popover';
import {
	List,
	ListItem,
	ListIcon,
	ListText
} from 'nexus/ui/list/List';
import { Divider } from 'nexus/ui/divider/Divider';
import { Typography } from 'nexus/ui/typography/Typography';
import { Paper } from 'nexus/ui/paper/Paper';

import './Playlist.css';


// Models
// ======================================================================================================

// ***** PlaylistStore *****
// *************************

const TAG_PlaylistStore = () => {}
export const PlaylistStore = types
	.model({
		id: types.maybeNull(types.string),
		name: types.maybeNull(types.string),

		ts_playlist: types.maybeNull(types.string),

		permanent: false,

		folder_id: types.maybeNull(types.string),
		tracks_ids: types.optional(types.array(types.string), []),
	})
	.views(self => ({

		get nbTracks() {
			return self.tracks_ids.length;
		},

		get description() {
			const nbTracks = self.nbTracks;
			const description = `${nbTracks} ${(nbTracks > 1) ? "titres" : "titre"}`;
			return description;
		},

		// -

		get linkedFolder() {
			const store = getRoot(self);
			const playlists = store.playlists;
			if (self.folder_id) {
				const folder = playlists.folders.get(self.folder_id);
				if (folder) {
					return folder;
				}
			}
			return PlaylistFolderStore.create({});
		},

		// Getters
		// -

		getTracks() {
			const store = getRoot(self);
			const tracks = store.tracks;

			let tracksList = [];

			if (self.permanent) {

				// From tracks favorite
				if (self.id == 'favorites') {
					tracksList = tracks.getFavorites();
				}

				// From tracks starred
				if (self.id == 'mix') {
					tracksList = tracks.getStarred();
				}

			} else {

				// From local tracks_ids
				for (const trackId of self.tracks_ids) {
					const track = tracks.by_id.get(trackId);
					if (track) {
						tracksList.push(track);
					}
				}
			}
			return tracksList;
		},

		getPlayable(load=true, trackIdOrigin=null) {
			let tracksList = [];
			const tracks = self.getTracks();

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

	}))
	.actions(self => ({

		setField: (field, value) => {
			self[field] = value;
		},

		// -

		// update: (raw) => {
		// 	self.id = raw.id;
		// 	self.name = raw.name;

		// 	self.ts_playlist = raw.ts_playlist;

		// 	self.permanent = raw.permanent;

		// 	self.folder_id = raw.folder_id;
		// 	self.tracks_ids = [];
		// 	for (const trackId of raw.tracks_ids) {
		// 		self.tracks_ids.push(trackId);
		// 	}
		// },

		clear: () => {

			// Nettoyage des morceaux de la playlist
			// ---

			const store = getRoot(self);
			const tracks = store.tracks;

			self.tracks_ids = [];

			if (self.permanent) {
				for (const [trackId, track] of tracks.by_id.entries()) {

					// Nettoyage des favoris
					if (self.id == 'favorites' && track.favorite) {
						track.setField('favorite', false);
					}

					// Nettoyage des étoilées
					if (self.id == 'mix' && track.starred) {
						track.setField('starred', false);
					}
				}
			}
		},

		// -

		addTrack: (trackId) => {
			if (self.tracks_ids.indexOf(trackId) == -1) {
				self.tracks_ids.push(trackId);
			}
		},

		removeTrack: (trackId) => {
			const trackIdx = self.tracks_ids.indexOf(trackId);
			if (trackIdx > -1) {
				self.tracks_ids.splice(trackIdx, 1);
			}
		},

		populateWith: (sourceKind, sourceId) => {

			// Ajoute un ou plusieurs morceaux à la playlist
			// ---

			const store = getRoot(self);
			const albums = store.albums;
			const tracks = store.tracks;

			if (sourceKind == 'track') {
				self.addTrack(sourceId);
			}
			if (sourceKind == 'album') {
				const album = albums.by_id.get(sourceId);
				if (album) {
					const trackIds = album.getPlayable(false);
					for (const trackId of trackIds) {
						self.addTrack(trackId);
					}
				}
			}
		},

		// -

		play: (trackId) => {

			// Lecture de tous les morceaux de la playlist dans l'ordre
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

			// Lecture aléatoire de tous les morceaux de la playlist
			// ---

			const store = getRoot(self);
			const player = store.player;

			const playbackIds = self.getTracksRandomly(false);
			player.audioStop();
			player.clear();
			player.populate(playbackIds);
			player.read();
		},

		// -

		export: () => {

			// Exportation des titres la playlist vers un dossier
			// ---

			const store = getRoot(self);
			const app = store.app;
			const snackbar = app.snackbar;
			const slashPath = app.slashPath;
			const tracks = self.getPlayable();

			let nbCopied = 0;

			ipc.once('folderChoosed', (folders) => {
				for (const folder of folders) {
					for (const track of tracks) {
						const exportSource = track.track_path;
						const exportSourceParts = exportSource.split(slashPath);
						const exportTarget = `${folder}${slashPath}${exportSourceParts[exportSourceParts.length - 1]}`;

						ipc.invoke('copy', [
							exportSource,
							exportTarget,
						])
						.then((result) => {
							nbCopied += 1;
							if (nbCopied == tracks.length) {
								snackbar.update(true, "Copie terminée.", "success");
							}
						});
					}
					break;
				}
			});
			ipc.send('chooseFolder');
		},

	}))


// Functions Components ReactJS
// ======================================================================================================

// ***** PlaylistContextualMenu *****
// **********************************

const TAG_PlaylistContextualMenu = () => {}
export const PlaylistContextualMenu = observer((props) => {

	const store = React.useContext(window.storeContext);
	const app = store.app;
	const snackbar = app.snackbar;
	const tracks = store.tracks;
	const playlists = store.playlists;
	const popupManagePlaylist = store.popupManagePlaylist;

	// From ... states

	const [anchorMenu, setAnchorMenu] = React.useState(null);

	// From ... props

	const playlist = props.playlist;
	const size = (props.size) ? props.size : null;
	const color = (props.color) ? props.color : null;

	const callbackClick = props.callbackClick;
	const callbackClose = props.callbackClose;

	let className = (props.className) ? props.className : "";
	let style = (props.style) ? props.style : {};

	// ...

	// Events
	// ==================================================================================================

	const handleOpenMenu = (evt) => {
		evt.preventDefault();
		evt.stopPropagation();
		setAnchorMenu(evt.currentTarget);
	}

	const handleCloseMenu = () => {
		setAnchorMenu(null);
		if (callbackClose) {
			callbackClose();
		}
	}

	// -

	const handleExport = () => {
		playlist.export();
		handleCloseMenu();
	}

	const handleAddToQueue = () => {
		playlist.queue();
		handleCloseMenu();
	}

	// -

	const handleClear = () => {
		const CONFIRM_CLEAR_MSG = `Êtes-vous sûr de vouloir vider la playlist ${playlist.name} ?`;
		if (confirm(CONFIRM_CLEAR_MSG)) {
			playlist.clear();
			if (playlist.permanent) {
				tracks.save();
			} else {
				playlists.save();
			}
		}
		handleCloseMenu();
	}

	// -

	const handleMove = () => {
		popupManagePlaylist.init("move", "playlist", playlist.id);
		popupManagePlaylist.open();
		handleCloseMenu();
	}

	// -

	const handleEdit = () => {
		popupManagePlaylist.init("edit", "playlist", playlist.id);
		popupManagePlaylist.open();
		handleCloseMenu();
	}

	const handleDelete = () => {
		const CONFIRM_DELETE_MSG = `Êtes-vous sûr de vouloir supprimer la playlist ${playlist.name} ?`;
		if (confirm(CONFIRM_DELETE_MSG)) {
			store.navigateTo('playlists', null, null, null, () => {
				playlists.remove(playlist.id);
				playlists.save();
				snackbar.update(true, "Playlist supprimée.", "success");
			})
		}
		handleCloseMenu();
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
				e.preventDefault();
				e.stopPropagation();
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
				id={`pop-playlist-${playlist.id}`}
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
				{playlist && (
					<List
						style={{
							paddingTop: '10px',
							paddingBottom: '10px',
						}}
					>

						<ListItem
							size="small"
							onClick={() => handleExport()}
						>
							<ListIcon
								name="usb"
							/>
							<ListText withIcon={true}>
								Exporter la playlist
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
							onClick={() => handleClear()}
						>
							<ListIcon
								name="cleaning_services"
							/>
							<ListText withIcon={true}>
								Vider la playlist
							</ListText>
						</ListItem>


						{!playlist.permanent && (
							<React.Fragment>
								<Divider spacing="medium" />

								<ListItem
									size="small"
									onClick={() => handleMove()}
								>
									<ListIcon
										name="move_down"
									/>
									<ListText withIcon={true}>
										Déplacer la playlist
									</ListText>
								</ListItem>

								<Divider spacing="medium" />

								<ListItem
									size="small"
									onClick={() => handleEdit()}
								>
									<ListIcon
										name="mode_edit"
									/>
									<ListText withIcon={true}>
										Renommer la playlist
									</ListText>
								</ListItem>
								<ListItem
									size="small"
									onClick={() => handleDelete()}
								>
									<ListIcon
										name="delete"
									/>
									<ListText withIcon={true}>
										Supprimer la playlist
									</ListText>
								</ListItem>
							</React.Fragment>
						)}

					</List>
				)}
			</Popover>
		</div>
	)
})

// ***** PlaylistRow *****
// ***********************

const TAG_PlaylistRow = () => {}
export const PlaylistRow = observer((props) => {

	const store = React.useContext(window.storeContext);
	const app = store.app;

	// From ... state

	let [hover, setHover] = React.useState(false);

	// From ... props

	const playlist = props.playlist;

	// From ... store

	const isLoading = app.isLoading;

	// ...

	// Events
	// ==================================================================================================

	const handleEnter = (evt) => {
		setHover(true);
	}

	const handleLeave = (evt) => {
		setHover(false);
	}

	// -

	const handlePlaylistClick = (playlistId) => {
		store.navigateTo('playlist', playlistId);
	}

	const handleShuffleClick = (playlistId) => {
		playlist.shuffle();
	}

	const handlePlayClick = (playlistId) => {
		playlist.play();
	}

	// Render
	// ==================================================================================================

	return (
		<TableRow
			hoverable={true}
			callbackEnter={handleEnter}
			callbackLeave={handleLeave}
			forceHover={hover}
			callbackClick={() => handlePlaylistClick(playlist.id)}
		>
			<TableCell
				size="small"
			>
				{playlist.name}
			</TableCell>
			<TableCell
				size="small"
				width="100px"
			>
				{!playlist.permanent && (
					<Typography
						size="small"
						variant="description"
					>
						{`${playlist.nbTracks} ${(playlist.nbTracks > 1) ? "titres" : "titre"}`}
					</Typography>
				)}
			</TableCell>
			<TableCell
				size="small"
				width="48px"
			>
				<IconButton
					size="small"
					iconName="shuffle"
					color="info"
					className="flex-0"
					onClick={(e) => {
						e.preventDefault();
						e.stopPropagation();
						handleShuffleClick(playlist.id);
					}}
				/>
			</TableCell>
			<TableCell
				size="small"
				width="48px"
			>
				<IconButton
					size="small"
					iconName="play_arrow"
					color="hot"
					className="flex-0"
					onClick={(e) => {
						e.preventDefault();
						e.stopPropagation();
						handlePlayClick(playlist.id);
					}}
				/>
			</TableCell>
			<TableCell
				width={56}
				align="right"
				size="tiny"
			>
				<PlaylistContextualMenu
					playlist={playlist}
					size="small"
					style={{
						marginRight: '-4px',
					}}
					callbackClose={() => {
						handleLeave();
					}}
				/>
			</TableCell>
		</TableRow>
	)
})

// ***** RenderPlaylist *****
// **************************

const TAG_RenderPlaylist = () => {}
export const RenderPlaylist = observer((props) => {

	const store = React.useContext(window.storeContext);
	const app = store.app;
	const playlists = store.playlists;

	// From ... store

	const isLoading = app.isLoading;

	const playlistId = store.playlistId;
	const playlist = playlists.by_id.get(playlistId);

	// ...

	const playListTracks = playlist.getTracks();
	const nbTracks = playListTracks.length;

	// ...

	// Events
	// ==================================================================================================

	const handlePlayClick = () => {
		playlist.play();
	}

	const handleThrowDiceClick = () => {
		playlist.shuffle();
	}

	// Render
	// ==================================================================================================

	return (
		<div>

			<Ribbon
				avatarIconName={(playlist.permanent) ? "auto_awesome" : "playlist_play"}
				avatarIconColor="typography"
				title={playlist.name}
				right={(
					<div className="h-col">
						<IconButton
							iconName="play_arrow"
							color="hot"
							onClick={() => handlePlayClick()}
						/>
						<IconButton
							iconName="casino"
							color="hot"
							disabled={isLoading}
							onClick={() => handleThrowDiceClick()}
						/>
						<PlaylistContextualMenu
							playlist={playlist}
							color="typography"
						/>
					</div>
				)}
			>
				<Row>
					<Typography
						variant="description"
						className="flex-0"
						style={{
							marginLeft: '10px'
						}}
					>
						•
					</Typography>
					<Typography
						variant="description"
						className="flex-0"
					>
						{nbTracks} {(nbTracks > 1) ? "titres" : "titre"}
					</Typography>
				</Row>
			</Ribbon>

			<TableContainer
				component={Paper}
				style={{
					marginTop: '40px',
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
							<TableCell header={true}>
								Titre
							</TableCell>
							<TableCell header={true} style={{maxWidth: '200px'}}>
								Artiste
							</TableCell>
							<TableCell header={true} style={{maxWidth: '200px'}}>
								Album
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
						{playListTracks.map((track, trackIdx) => (
							<TrackRow
								key={`track-${trackIdx}`}
								track={track}
								playlist={playlist}
								origin="playlist"
							/>
						))}
					</TableBody>

				</Table>
			</TableContainer>

		</div>
	)
})

// ***** PlaylistPage *****
// ************************

const TAG_PlaylistPage = () => {}
export const PlaylistPage = observer((props) => {

	const store = React.useContext(window.storeContext);
	const app = store.app;

	// From ... store

	const loaded = store.loaded;
	const playlistId = app.playlistId;

	// ...

	const showHelper = (!loaded && !playlistId) ? true : false;

	// Render
	// ==================================================================================================

	const renderPage = () => {

		// Render :: Page
		// ---

		let pageContent = null;
		if (loaded) {
			pageContent = <RenderPlaylist />
		}
		return pageContent;
	}

	const renderHelper = () => {

		// Render :: Helper
		// ---

		return (
			<Helper
				iconName="playlist_play"
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
