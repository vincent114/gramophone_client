import React from 'react';
import { types, getRoot } from "mobx-state-tree";
import { observer } from "mobx-react-lite";
import clsx from 'clsx';

import { PlaylistFolderStore } from 'gramophone_client/contexts/playlist_folder/PlaylistFolder';

import { Helper } from 'nexus/ui/helper/Helper';
import { IconButton } from 'nexus/ui/button/Button';
import { Popover } from 'nexus/ui/popover/Popover';
import {
	List,
	ListItem,
	ListIcon,
	ListText
} from 'nexus/ui/list/List';
import {
	TableRow,
	TableCell
} from 'nexus/forms/table/Table';
import { Divider } from 'nexus/ui/divider/Divider';

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

	}))


// Functions Components ReactJS
// ======================================================================================================

// ***** PlaylistContextualMenu *****
// **********************************

const TAG_PlaylistContextualMenu = () => {}
export const PlaylistContextualMenu = observer((props) => {

	const store = React.useContext(window.storeContext);
	const app = store.app;

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
		// TODO
		handleCloseMenu();
	}

	// -

	const handleMove = () => {
		// TODO
		handleCloseMenu();
	}

	// -

	const handleEdit = () => {
		// TODO
		handleCloseMenu();
	}

	const handleDelete = () => {
		// TODO
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
		// TODO
	}

	const handlePlayClick = (playlistId) => {
		// TODO
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

	console.log(playlist.toJSON());

	// Render
	// ==================================================================================================

	return (
		<div>

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
		<div className="c-page">
			{renderPage()}
			{renderHelper()}
		</div>
	)
})
