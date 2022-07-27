import React from 'react';
import { types, getRoot } from "mobx-state-tree";
import { observer } from "mobx-react-lite";
import clsx from 'clsx';

import { PlaylistRow } from 'gramophone_client/contexts/playlist/Playlist';

import {
	TableContainer,
	Table,
	TableHead,
	TableBody,
	TableRow,
	TableCell
} from 'nexus/forms/table/Table';

import { Ribbon } from 'nexus/layout/ribbon/Ribbon';
import {
	GroupDivider,
	Group,
} from 'nexus/layout/group/Group';

import { Helper } from 'nexus/ui/helper/Helper';
import { IconButton } from 'nexus/ui/button/Button';
import { Popover } from 'nexus/ui/popover/Popover';
import {
	List,
	ListItem,
	ListIcon,
	ListText
} from 'nexus/ui/list/List';
import { Avatar } from 'nexus/ui/avatar/Avatar';
import { Paper } from 'nexus/ui/paper/Paper';
import { Typography } from 'nexus/ui/typography/Typography';
import { Divider } from 'nexus/ui/divider/Divider';

import './PlaylistFolder.css';


// Models
// ======================================================================================================

// ***** PlaylistFolderStore *****
// *******************************

const TAG_PlaylistFolderStore = () => {}
export const PlaylistFolderStore = types
	.model({
		id: types.maybeNull(types.string),
		name: types.maybeNull(types.string),
		parent: types.maybeNull(types.string),
	})
	.views(self => ({

		// Getters
		// -

		getFolders() {
			const store = getRoot(self);
			const playlists = store.playlists;

			let foldersList = [];
			for (const [folderId, folder] of playlists.folders.entries()) {
				if (folder.parent == self.id) {
					foldersList.push(folder);
				}
			}
			return foldersList;
		},

		getPlaylists() {
			const store = getRoot(self);
			const playlists = store.playlists;

			let playlistsList = [];
			for (const [playlistId, playlist] of playlists.by_id.entries()) {
				if (!playlist.permanent && playlist.folder_id == self.id) {
					playlistsList.push(playlist);
				}
			}
			return playlistsList;
		},

	}))
	.actions(self => ({

		setField: (field, value) => {
			self[field] = value;
		},

	}))


// Functions Components ReactJS
// ======================================================================================================

// ***** PlaylistFolderContextualMenu *****
// ****************************************

const TAG_PlaylistFolderContextualMenu = () => {}
export const PlaylistFolderContextualMenu = observer((props) => {

	const store = React.useContext(window.storeContext);
	const app = store.app;
	const snackbar = app.snackbar;
	const playlists = store.playlists;
	const popupManagePlaylist = store.popupManagePlaylist;

	// From ... states

	const [anchorMenu, setAnchorMenu] = React.useState(null);

	// From ... props

	const folder = props.folder;
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

	const handleMove = () => {
		popupManagePlaylist.init("move", "folder", folder.id);
		popupManagePlaylist.open();
		handleCloseMenu();
	}

	// -

	const handleEdit = () => {
		popupManagePlaylist.init("edit", "folder", folder.id);
		popupManagePlaylist.open();
		handleCloseMenu();
	}

	const handleDelete = () => {
		const CONFIRM_DELETE_MSG = `Êtes-vous sûr de vouloir supprimer le dossier ${folder.name} ?`;
		if (confirm(CONFIRM_DELETE_MSG)) {
			store.navigateTo('playlists', null, null, null, () => {
				playlists.removeFolder(folder.id);
				playlists.save();
				snackbar.update(true, "Dossier supprimée.", "success");
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
				id={`pop-folder-${folder.id}`}
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
				{folder && (
					<List
						style={{
							paddingTop: '10px',
							paddingBottom: '10px',
						}}
					>

						<ListItem
							size="small"
							onClick={() => handleMove()}
						>
							<ListIcon
								name="move_down"
							/>
							<ListText withIcon={true}>
								Déplacer le dossier
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
								Renommer le dossier
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
								Supprimer le dossier
							</ListText>
						</ListItem>

					</List>
				)}
			</Popover>
		</div>
	)
})

// ***** PlaylistFolderRow *****
// *****************************

const TAG_PlaylistFolderRow = () => {}
export const PlaylistFolderRow = observer((props) => {

	const store = React.useContext(window.storeContext);
	const app = store.app;

	// From ... state

	let [hover, setHover] = React.useState(false);

	// From ... props

	const folder = props.folder;

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

	const handleFolderClick = (folderId) => {
		store.navigateTo('playlist_folder', folderId);
	}

	// Render
	// ==================================================================================================

	return (
		<TableRow
			hoverable={true}
			callbackEnter={handleEnter}
			callbackLeave={handleLeave}
			forceHover={hover}
			callbackClick={() => handleFolderClick(folder.id)}
		>
			<TableCell
				size="small"
			>
				{folder.name}
			</TableCell>
			<TableCell
				width={56}
				align="right"
				size="tiny"
			>
				<PlaylistFolderContextualMenu
					folder={folder}
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

// ***** RenderPlaylistFolder *****
// ********************************

const TAG_RenderPlaylistFolder = () => {}
export const RenderPlaylistFolder = observer((props) => {

	const store = React.useContext(window.storeContext);
	const app = store.app;
	const playlists = store.playlists;

	// From ... store

	const isLoading = app.isLoading;

	const playlistFolderId = store.playlistFolderId;
	const folder = playlists.folders.get(playlistFolderId);

	const foldersList = folder.getFolders();
	const playlistsList = folder.getPlaylists();

	// ...

	// Render
	// ==================================================================================================

	return (
		<div>

			<Ribbon
				avatarIconName="folder_special"
				avatarIconColor="typography"
				title={folder.name}
				right={(
					<div className="h-col">
						<PlaylistFolderContextualMenu
							folder={folder}
							// size="small"
							color="typography"
						/>
					</div>
				)}
			/>

			{foldersList.length > 0 && (
				<Group
					id={`folder-${folder.id}-folder`}
					key={`folder-${folder.id}-folder`}
				>

					<GroupDivider
						spacing="big"
						left={(
							<Typography
								variant="title"
								color="secondary"
								style={{
									minWidth: '100px',
									marginRight: '20px',
								}}
							>
								Dossiers
							</Typography>
						)}
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
								{foldersList.length}
							</Avatar>
						)}
						right={(
							<Avatar
								iconName="folder_special"
								iconColor="warning"
								color="transparent"
							/>
						)}
					/>

					<TableContainer
						component={Paper}
						style={{
							marginLeft: '20px',
							marginRight: '20px',
							padding: '0px',
						}}
					>
						<Table>
							<TableBody>
								{foldersList.map((folder, folderIdx) => (
									<PlaylistFolderRow
										key={`playlist-folder-${folder.id}`}
										folder={folder}
									/>
								))}
							</TableBody>
						</Table>
					</TableContainer>

				</Group>
			)}

			{playlistsList.length > 0 && (
				<Group
					id={`folder-${folder.id}-playlists`}
					key={`folder-${folder.id}-playlists`}
				>

					<GroupDivider
						spacing="big"
						left={(
							<Typography
								variant="title"
								color="secondary"
								style={{
									minWidth: '100px',
									marginRight: '20px',
								}}
							>
								Playlists
							</Typography>
						)}
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
								{playlistsList.length}
							</Avatar>
						)}
						right={(
							<Avatar
								iconName="playlist_play"
								iconColor="warning"
								color="transparent"
							/>
						)}
					/>

					<TableContainer
						component={Paper}
						style={{
							marginLeft: '20px',
							marginRight: '20px',
							padding: '0px',
						}}
					>
						<Table>
							<TableBody>
								{playlistsList.map((playlist, playlistIdx) => (
									<PlaylistRow
										key={`playlist-${playlist.id}`}
										playlist={playlist}
									/>
								))}
							</TableBody>
						</Table>
					</TableContainer>

				</Group>
			)}

		</div>
	)
})

// ***** PlaylistFolderPage *****
// ******************************

const TAG_PlaylistFolderPage = () => {}
export const PlaylistFolderPage = observer((props) => {

	const store = React.useContext(window.storeContext);
	const app = store.app;

	// From ... store

	const loaded = store.loaded;
	const playlistFolderId = app.playlistFolderId;

	// ...

	const showHelper = (!loaded && !playlistFolderId) ? true : false;

	// Render
	// ==================================================================================================

	const renderPage = () => {

		// Render :: Page
		// ---

		let pageContent = null;
		if (loaded) {
			pageContent = <RenderPlaylistFolder />
		}
		return pageContent;
	}

	const renderHelper = () => {

		// Render :: Helper
		// ---

		return (
			<Helper
				iconName="folder_special"
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
