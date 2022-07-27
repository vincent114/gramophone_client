import React from 'react';
import { types, getRoot } from "mobx-state-tree";
import { observer } from "mobx-react-lite";
import clsx from 'clsx';

import {
	TableHead,
	TableRow,
	TableCell
} from 'nexus/forms/table/Table';
import { Field } from 'nexus/forms/field/Field';

import { IconButton } from 'nexus/ui/button/Button';
import { Avatar } from 'nexus/ui/avatar/Avatar';
import { Popover } from 'nexus/ui/popover/Popover';
import {
	List,
	ListItem,
	ListIcon,
	ListText
} from 'nexus/ui/list/List';
import { Divider } from 'nexus/ui/divider/Divider';
import { Typography } from 'nexus/ui/typography/Typography';

import './Track.css';


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
	.views(self => ({

		get discNumber() {
			return (self.disk) ? self.disk : 0;
		},

		get discNumberLabel() {
			const discNumber = `${self.discNumber}`;
			if (discNumber.length < 2) {
				return `0${discNumber}`;
			}
			return discNumber;
		},

		get trackNumber() {
			return (self.track) ? self.track : 0;
		},

		get trackNumberLabel() {
			const trackNumber = `${self.trackNumber}`;
			if (trackNumber.length < 2) {
				return `0${trackNumber}`;
			}
			return trackNumber;
		},

		get sortNumber() {
			return `${self.discNumberLabel}-${self.trackNumberLabel}`;
		},

		get subtitle() {
			let subtitle = "";
			if (self.artist) {
				subtitle = self.artist;
			}
			if (self.album) {
				if (subtitle && subtitle != self.album) {
					subtitle = `${subtitle} - ${self.album}`;
				} else {
					subtitle = self.album;
				}
			}
			return subtitle;
		},

		// -

		get linkedAlbum() {
			const store = getRoot(self);
			const albums = store.albums;
			return albums.getById(self.album_id);
		},

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

		// Bools
		// -

		get isPlayerCandidate() {

			// Titre candidat à la lecture ordonnée ?
			// ---

			if (!self.checked) {
				return false;
			}
			return true;
		},

		get isShuffleCandidate() {

			// Titre candidat à la lecture aléatoire ?
			// ---

			const store = getRoot(self);
			const library = store.library;

			const shuffleOnlyFavorites = library.shuffle_only_favorites;
			const shuffleIgnoreSoudtracks = library.shuffle_ignore_soudtracks;

			// Que des favoris ?
			if (shuffleOnlyFavorites && !self.favorite) {
				return false;
			}

			// Pas de soundtrack ?
			if (shuffleIgnoreSoudtracks && ['soundtrack', 'soundtracks'].indexOf(self.genre_id) > -1) {
				return false;
			}

			return true;
		},

		get isPlaying() {

			// Le titre est-il en train d'être lu ?
			// ---

			const store = getRoot(self);
			const player = store.player;
			const playTrackId = player.playTrackId;

			if (self.id == playTrackId) {
				return true;
			}
			return false;
		},

	}))
	.actions(self => ({

		setField: (field, value) => {
			self[field] = value;
		},

		// -

		toggleChecked: () => {
			self.checked = !self.checked;
		},

		toggleFavorite: () => {
			self.favorite = !self.favorite;
		},

		toggleStarred: () => {
			self.starred = !self.starred;
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


// Functions Components ReactJS
// ======================================================================================================

// ***** TrackContextualMenu *****
// *******************************

const TAG_TrackContextualMenu = () => {}
export const TrackContextualMenu = observer((props) => {

	const store = React.useContext(window.storeContext);
	const app = store.app;
	const snackbar = app.snackbar;
	const tracks = store.tracks;
	const player = store.player;
	const playlists = store.playlists;
	const popupTrackMetadatas = store.popupTrackMetadatas;
	const popupManagePlaylist = store.popupManagePlaylist;

	// From ... states

	const [anchorMenu, setAnchorMenu] = React.useState(null);

	// From ... props

	const track = props.track;
	const playlist = props.playlist;
	const origin = (props.origin) ? props.origin : "album"; // album, player, playlist, header
	const size = (props.size) ? props.size : "small";
	const color = (props.color) ? props.color : null;

	const children = props.children;

	const callbackClick = props.callbackClick;
	const callbackClose = props.callbackClose;

	let className = (props.className) ? props.className : "";
	let style = (props.style) ? props.style : {};

	// From ... store

	const drawerView = player.drawerView;

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
		if (callbackClose) {
			callbackClose();
		}
	}

	// -

	const handleInfosClick = () => {
		popupTrackMetadatas.setField("trackId", track.id);
		popupTrackMetadatas.open();
		handleCloseMenu();
	}

	const handleShowInFinderClick = () => {
		ipc.send('showItemInFolder', [track.track_path]);
		handleCloseMenu();
	}

	// -

	const handleToggleCheck = () => {
		track.toggleChecked();
		tracks.save();
		handleCloseMenu();
	}

	const handleToggleFavorite = () => {
		track.toggleFavorite();
		tracks.save();
		handleCloseMenu();
	}

	const handleToggleStarred = () => {
		track.toggleStarred();
		tracks.save();
		handleCloseMenu();
	}

	// -

	const handleGoto = (gotoContext, gotoContextId) => {
		store.navigateTo(gotoContext, gotoContextId);
		handleCloseMenu();
	}

	// -

	const handleAddPlaylist = () => {
		popupManagePlaylist.init("add", "playlist");
		popupManagePlaylist.setField("sourceId", track.id);
		popupManagePlaylist.setField("sourceType", "track");
		popupManagePlaylist.open();
		handleCloseMenu();
	}

	const handleAddToQueue = () => {
		player.populate([track.id]);
		handleCloseMenu();
	}

	const handleRemoveFromPlaylist = () => {
		playlist.removeTrack(track.id);
		playlists.save();
	}

	const handleRemoveFromPlayer = () => {
		if (drawerView == "current") {
			player.remove(track.id);
		}
		if (drawerView == "history") {
			player.removeFromHistory(track.id);
			player.save();
		}
		handleCloseMenu();
	}

	// -

	const handleDelete = () => {
		const CONFIRM_UNINDEX = `Êtes-vous sûr de vouloir dé-indexer le titre ${track.name} ?`;
		if (confirm(CONFIRM_UNINDEX)) {
			const unindexed = tracks.unindex(track.id);
			if (unindexed) {
				store.save();
				snackbar.update(true, "Titre dé-indexé avec succès.", "success");
			} else {
				snackbar.update(true, "Dé-indexation du titre échouée.", "error");
			}
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
				id={`pop-track-${track.id}`}
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
				// style={{
				// 	width: '240px',
				// }}
			>
				{track && (
					<List
						style={{
							paddingTop: '10px',
							paddingBottom: '10px',
						}}
					>
						<ListItem
							size="small"
							onClick={() => handleInfosClick()}
						>
							<ListIcon
								name="info"
							/>
							<ListText withIcon={true}>
								Afficher les informations
							</ListText>
						</ListItem>

						<ListItem
							size="small"
							onClick={() => handleShowInFinderClick()}
						>
							<ListIcon
								name="insert_drive_file"
							/>
							<ListText withIcon={true}>
								Ouvrir l'emplacement
							</ListText>
						</ListItem>

						{origin != 'album' && (
							<React.Fragment>
								<Divider spacing="medium" />

								<ListItem
									size="small"
									onClick={() => handleToggleCheck()}
								>
									<ListIcon
										name={(track.checked) ? "check_box" : "check_box_outline_blank"}
										color={(track.checked) ? "primary" : null}
									/>
									<ListText withIcon={true}>
										{(track.checked) ? "Décocher le titre" : "Cocher le titre"}
									</ListText>
								</ListItem>

								<ListItem
									size="small"
									onClick={() => handleToggleFavorite()}
								>
									<ListIcon
										name={(track.favorite) ? "favorite" : "favorite_border"}
										color={(track.favorite) ? "error" : null}
									/>
									<ListText withIcon={true}>
										{(track.favorite) ? "Ne plus aimer le titre" : "Aimer le titre"}
									</ListText>
								</ListItem>

								<ListItem
									size="small"
									onClick={() => handleToggleStarred()}
								>
									<ListIcon
										name={(track.starred) ? "star" : "star_outline"}
										color={(track.starred) ? "warning" : null}
									/>
									<ListText withIcon={true}>
										{(track.starred) ? "Enlever du mix courant" : "Ajouter au mix courant"}
									</ListText>
								</ListItem>

								<Divider spacing="medium" />

								<ListItem
									size="small"
									onClick={() => handleGoto("album", track.linkedAlbum.id)}
								>
									<ListIcon
										name="album"
									/>
									<ListText withIcon={true}>
										Aller à l'album
									</ListText>
								</ListItem>

								<ListItem
									size="small"
									onClick={() => handleGoto("artist", track.linkedArtist.id)}
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
									onClick={() => handleGoto("genre", track.linkedGenre.id)}
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
									onClick={() => handleGoto("year", track.linkedYear.id)}
								>
									<ListIcon
										name="date_range"
									/>
									<ListText withIcon={true}>
										Aller à l'année
									</ListText>
								</ListItem>

							</React.Fragment>
						)}

						<Divider spacing="medium" />

						{origin != 'playlist' && (
							<React.Fragment>
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
							</React.Fragment>
						)}

						{(['player', 'header'].indexOf(origin) == -1) && (
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
						)}

						{origin == 'playlist' && (
							<React.Fragment>
								<ListItem
									size="small"
									onClick={() => handleRemoveFromPlaylist()}
								>
									<ListIcon
										name="playlist_remove"
									/>
									<ListText withIcon={true}>
										Supprimer de la playlist
									</ListText>
								</ListItem>
							</React.Fragment>
						)}

						{origin == 'player' && (
							<ListItem
								size="small"
								onClick={() => handleRemoveFromPlayer()}
							>
								<ListIcon
									name="playlist_remove"
								/>
								<ListText withIcon={true}>
									{drawerView == "current" && (
										<span>Supprimer de la liste de lecture</span>
									)}
									{drawerView == "history" && (
										<span>Supprimer de l'historique</span>
									)}
								</ListText>
							</ListItem>
						)}

						{origin == 'album' && (
							<React.Fragment>
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
							</React.Fragment>
						)}

						{children}

					</List>
				)}
			</Popover>
		</div>
	)
})

// ***** TrackRow *****
// ********************

const TAG_TrackRow = () => {}
export const TrackRow = observer((props) => {

	const store = React.useContext(window.storeContext);
	const app = store.app;
	const tracks = store.tracks;
	const player = store.player;

	// From ... state

	let [hover, setHover] = React.useState(false);

	// From ... props

	const track = props.track;
	const playlist = props.playlist;
	const origin = (props.origin) ? props.origin : "album"; // album, playlist, search

	// From ... store

	const isLoading = app.isLoading;

	// ...

	const favorite = track.favorite;
	const starred = track.starred;
	const isPlaying = track.isPlaying;

	const linkedAlbum = track.linkedAlbum;

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

	const handleCheckedChanged = () => {
		tracks.save();
	}

	const handleFavoriteClicked = (track) => {
		track.setField('favorite', !track.favorite);
		tracks.save();
	}

	const handleStarredClicked = (track) => {
		track.setField('starred', !track.starred);
		tracks.save();
	}

	const handlePlayClicked = (track) => {
		player.audioStop();
		player.clear();
		if (track.isPlayerCandidate && origin != 'search') {
			if (origin == 'album') {
				linkedAlbum.play(track.id);
			}
			if (origin == 'playlist') {
				playlist.play(track.id);
			}
		} else {
			player.audioStop();
			player.clear();
			player.populate([track.id]);
			player.read(track.id);
		}
	}

	const handleStopClicked = (track) => {
		player.audioStop();
		player.clear();
	}

	// Render
	// ==================================================================================================

	let rowCells = [];

	// Case à cocher
	if (origin == "album") {
		rowCells.push(
			<TableCell
				key={`track-${track.id}-checked`}
				width={56}
				align="center"
				size="tiny"
			>
				<Field
					component='checkbox'
					ghostLabel={false}
					savePath={['tracks', 'by_id', track.id, 'checked']}
					disabled={isLoading}
					callbackChange={() => handleCheckedChanged()}
				/>
			</TableCell>
		)
	}

	// Favori
	if (origin == "album") {
		rowCells.push(
			<TableCell
				key={`track-${track.id}-favorite`}
				width={56}
				align="center"
				size="tiny"
			>
				{(hover || favorite) && (
					<IconButton
						size="small"
						iconName={(track.favorite) ? "favorite" : "favorite_border"}
						color={(track.favorite) ? "error" : null}
						disabled={isLoading}
						onClick={() => handleFavoriteClicked(track)}
					/>
				)}
			</TableCell>
		)
	}

	// Mix
	if (origin == "album") {
		rowCells.push(
			<TableCell
				key={`track-${track.id}-starred`}
				width={56}
				align="center"
				size="tiny"
			>
				{(hover || starred) && (
					<IconButton
						size="small"
						iconName={(track.starred) ? "star" : "star_outline"}
						color={(track.starred) ? "warning" : null}
						disabled={isLoading}
						onClick={() => handleStarredClicked(track)}
					/>
				)}
			</TableCell>
		)
	}

	// Quick Play
	rowCells.push(
		<TableCell
			key={`track-${track.id}-quickplay`}
			width={56}
			size="tiny"
			fontSize="13px"
			align="center"
		>
			{(!isPlaying && !hover && origin == "album") && (
				<span>{track.track}</span>
			)}
			{(!isPlaying && hover) && (
				<IconButton
					size="small"
					iconName="play_circle_filled"
					color="hot"
					onClick={() => handlePlayClicked(track)}
				/>
			)}
			{(isPlaying && !hover) && (
				<Avatar
					size="small"
					color="transparent"
					iconName="equalizer"
					iconColor="hot"
				/>
			)}
			{(isPlaying && hover) && (
				<IconButton
					size="small"
					iconName="stop_circle"
					color="hot"
					onClick={() => handleStopClicked(track)}
				/>
			)}
		</TableCell>
	)

	// Track Name
	rowCells.push(
		<TableCell
			key={`track-${track.id}-name`}
			size="tiny"
			fontSize="13px"
		>
			{track.name}
		</TableCell>
	)

	// Artiste
	if (["playlist", "search"].indexOf(origin) > -1) {
		rowCells.push(
			<TableCell
				key={`track-${track.id}-artist`}
				style={{
					maxWidth: '200px',
				}}
			>
				<Typography
					color="description"
					size="small"
					ellipsis={true}
				>
					{track.artist}
				</Typography>
			</TableCell>
		)
	}

	// Album
	if (["playlist", "search"].indexOf(origin) > -1) {
		rowCells.push(
			<TableCell
				key={`track-${track.id}-album`}
				color="description"
				style={{
					maxWidth: '200px',
				}}
			>
				<Typography
					color="description"
					size="small"
					ellipsis={true}
				>
					{track.album}
				</Typography>
			</TableCell>
		)
	}

	// Menu
	rowCells.push(
		<TableCell
			key={`track-${track.id}-menu`}
			width={56}
			align="right"
			size="tiny"
		>
			<TrackContextualMenu
				track={track}
				playlist={playlist}
				origin={origin}
				style={{
					marginRight: '-4px',
				}}
				callbackClose={() => {
					handleLeave();
				}}
			/>
		</TableCell>
	)

	return (
		<TableRow
			hoverable={true}
			faded={!track.checked}
			callbackEnter={handleEnter}
			callbackLeave={handleLeave}
			forceHover={hover}
		>
			{rowCells}
		</TableRow>
	)
})
