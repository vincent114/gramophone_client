import React from 'react';
import { types, getRoot } from "mobx-state-tree";
import { observer } from "mobx-react-lite";
import clsx from 'clsx';

import { PlaylistStore } from 'gramophone_client/contexts/playlist/Playlist';

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
import {
	GroupDivider,
	Group,
} from 'nexus/layout/group/Group';

import { Helper } from 'nexus/ui/helper/Helper';
import { IconButton } from 'nexus/ui/button/Button';
import { Avatar } from 'nexus/ui/avatar/Avatar';
import { Paper } from 'nexus/ui/paper/Paper';
import { Typography } from 'nexus/ui/typography/Typography';
import { Popover } from 'nexus/ui/popover/Popover';
import {
	List,
	ListItem,
	ListIcon,
	ListText
} from 'nexus/ui/list/List';

import { dateTools } from 'nexus/utils/DateTools';

import './Playlists.css';


// Models
// ======================================================================================================

// ***** PlaylistFolderStore *****
// *******************************

const TAG_PlaylistFolderStore = () => {}
export const PlaylistFolderStore = types
	.model({
		id: types.maybeNull(types.string),
		name: types.maybeNull(types.string),
	})
	.actions(self => ({

		setField: (field, value) => {
			self[field] = value;
		},

	}))

// ***** PlaylistsStore *****
// **************************

const TAG_PlaylistsStore = () => {}
export const PlaylistsStore = types
	.model({
		by_id: types.map(PlaylistStore),

		folders: types.map(PlaylistFolderStore),

		loaded: false,
	})
	.views(self => ({

		get playlistsCollectionFilePath() {
			const store = getRoot(self);
			const library = store.library;
			const path = ipc.sendSync('pathJoin', [library.collectionPath, 'playlists.json']);
			return path;
		},

		get nbPlaylists() {
			return Object.entries(self.by_id.toJSON()).length;
		},

		get nbFolders() {
			return Object.entries(self.folders.toJSON()).length;
		},

		// Getters
		// -

		getPermanent() {
			let permanent = [];
			const playlistFavorites = self.by_id.get('favorites');
			if (playlistFavorites) {
				permanent.push(playlistFavorites);
			}
			const playlistMix = self.by_id.get('mix');
			if (playlistMix) {
				permanent.push(playlistMix);
			}
			return permanent;
		},

		getGrouped() {
			let byGroup = {};
			for (const [playlistId, playlist] of self.by_id.entries()) {
				if (playlist.permanent) {
					continue;
				}
				const group = playlist.group;
				if (!byGroup.hasOwnProperty(group)) {
					byGroup[group] = [];
				}
				byGroup[group].push(playlist);
			}
			return byGroup;
		},

		getById(playlistId) {
			let playlist = self.by_id.get(playlistId);
			if (!playlist) {
				playlist = PlaylistStore.create({});
			}
			return playlist;
		},

	}))
	.actions(self => ({

		setField: (field, value) => {
			self[field] = value;
		},

		// -

		update: (raw) => {
			self.by_id = {};
			for (const [playlistId, playlistRaw] of Object.entries(raw.by_id)) {
				const playlist = PlaylistStore.create({});
				playlist.update(playlistRaw);
				self.by_id.set(playlistId, playlist);
			}
			self.loaded = true;
		},

		load: (callback) => {

			// Chargement des playlists
			// ---

			const store = getRoot(self);
			const app = store.app;

			store._readJsonFile(
				self.playlistsCollectionFilePath,
				{
					by_id: {},
					folders: {},
				},
				(raw) => {
					// self.update(raw);
					app.saveValue(['playlists', 'by_id'], raw.by_id, () => {
						const permanentAdded = self.ensurePermanent();
						if (permanentAdded) {
							self.save();
						}
						self.setField('loaded', true);
						if (callback) {
							callback();
						}
					});
				}
			);
		},

		save: (callback) => {

			// Sauvegarde des playlists
			// ---

			const store = getRoot(self);
			store._writeJsonFile(self.playlistsCollectionFilePath, self.toJSON());

			if (callback) {
				callback();
			}
		},

		// -

		ensurePermanent: () => {

			// On s'assure de la présence des playlist permanentes
			// -

			let atLeastOneAdded = false;

			// Playlist de favoris ?
			// ---------------------------------------------------

			const playlistFavoritesId = "favorites";

			let playlistFavorites = self.by_id.get(playlistFavoritesId);
			if (!playlistFavorites) {
				playlistFavorites = PlaylistStore.create({
					"id": playlistFavoritesId,
					"name": "Titres favoris",
					"ts_playlist": dateTools.getNowIso(),
					"permanent": true,
					"tracks_ids": [],
				});
				self.by_id.set(playlistFavoritesId, playlistFavorites);
				atLeastOneAdded = true;
			}

			// Playlist du mix courant ?
			// ---------------------------------------------------

			const playlistMixId = "mix";

			let playlistMix = self.by_id.get(playlistMixId);
			if (!playlistMix) {
				playlistMix = PlaylistStore.create({
					"id": playlistMixId,
					"name": "Mix du moment",
					"ts_playlist": dateTools.getNowIso(),
					"permanent": true,
					"tracks_ids": [],
				});
				self.by_id.set(playlistMixId, playlistMix);
				atLeastOneAdded = true;
			}

			// ---------------------------------------------------

			return atLeastOneAdded;
		},

	}))


// Functions Components ReactJS
// ======================================================================================================

// ***** RenderPlaylists *****
// ***************************

const TAG_RenderPlaylists = () => {}
export const RenderPlaylists = observer((props) => {

	const store = React.useContext(window.storeContext);
	const app = store.app;
	const playlists = store.playlists;
	const popupManagePlaylist = store.popupManagePlaylist;

	// From ... states

	const [anchorMenu, setAnchorMenu] = React.useState(null);

	// From ... store

	const isLoading = store.isLoading;
	const nbPlaylists = playlists.nbPlaylists;
	const nbFolders = playlists.nbFolders;

	const playlistsPermanent = playlists.getPermanent();
	const playlistsGrouped = playlists.getGrouped();

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

	const handleAddPlaylistClick = () => {
		popupManagePlaylist.init("create", "playlist");
		popupManagePlaylist.open();
		handleCloseMenu();
	}

	const handleAddFolderClick = () => {
		popupManagePlaylist.init("create", "folder");
		popupManagePlaylist.open();
		handleCloseMenu();
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

	// -

	const handleAddFolder = (evt) => {

	}

	// Renderers
	// ==================================================================================================

	return (
		<div>

			<Ribbon
				avatarIconName="playlist_play"
				avatarIconColor="typography"
				title={`${nbPlaylists} ${(nbPlaylists > 1) ? "Playlists" : "Playlist"}`}
				right={(
					<div className="flex-0">
						<IconButton
							iconName="more_horiz"
							color="typography"
							onClick={(e) => handleOpenMenu(e)}
						/>
						<Popover
							id="pop-playlists"
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
							<List
								style={{
									paddingTop: '10px',
									paddingBottom: '10px',
								}}
							>
								<ListItem
									size="small"
									onClick={() => handleAddPlaylistClick()}
								>
									<ListIcon
										name="playlist_add"
									/>
									<ListText withIcon={true}>
										Créer une nouvelle playlist
									</ListText>
								</ListItem>
								<ListItem
									size="small"
									onClick={() => handleAddFolderClick()}
								>
									<ListIcon
										name="snippet_folder"
									/>
									<ListText withIcon={true}>
										Créer un nouveau dossier de playlist
									</ListText>
								</ListItem>
							</List>
						</Popover>
					</div>
				)}
			/>

			<Group
				id="group-automatic"
				key="group-automatic"
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
							Automatiques
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
							{playlistsPermanent.length}
						</Avatar>
					)}
					right={(
						<Avatar
							// size="small"
							iconName="auto_awesome"
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
							{playlistsPermanent.map((playlist, playlistIdx) => (
								<TableRow
									key={`playlist-permanent-${playlistIdx}`}
									hoverable={true}
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
								</TableRow>
							))}
						</TableBody>
					</Table>
				</TableContainer>

			</Group>

			<Group
				id="group-manual"
				key="group-manual"
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
							Manuelles
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
							{nbPlaylists - playlistsPermanent.length}
						</Avatar>
					)}
					right={(
						<Avatar
							// size="small"
							iconName="playlist_add_check"
							iconColor="warning"
							color="transparent"
						/>
					)}
				/>

			</Group>

			<Group
				id="group-folders"
				key="group-folders"
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
							{nbFolders}
						</Avatar>
					)}
					right={(
						<Avatar
							// size="small"
							iconName="folder_special"
							iconColor="warning"
							color="transparent"
						/>
					)}
				/>

			</Group>

		</div>
	)
})

// ***** PlaylistsHeaderLeft *****
// *******************************

const TAG_PlaylistsHeaderLeft = () => {}
export const PlaylistsHeaderLeft = observer((props) => {

	const store = React.useContext(window.storeContext);
	const app = store.app;

	// ...

	// Render
	// ==================================================================================================

	return (
		<HeaderTitle
			title="Playlists"
			titleStyle={{
				marginLeft: '10px',
			}}
		/>
	)
})

// ***** PlaylistsMenuItem *****
// *****************************

const TAG_PlaylistsMenuItem = () => {}
export const PlaylistsMenuItem = observer((props) => {

	const store = React.useContext(window.storeContext);
	const app = store.app;
	const menu = app.menu;

	// From ... props

	const disabled = props.disabled;

	// ...

	const playlistsContext = 'playlists';

	// Events
	// ==================================================================================================

	const handleMenuItemClick = () => {
		store.navigateTo(playlistsContext);
		app.menu.close();
	}

	// Render
	// ==================================================================================================

	return (
		<MenuItem
			iconName="playlist_play"
			label="Playlists"
			disabled={disabled}
			activeContexts={[playlistsContext, "playlist"]}
			callbackClick={handleMenuItemClick}
		/>
	)
})

// ***** PlaylistsPage *****
// *************************

const TAG_PlaylistsPage = () => {}
export const PlaylistsPage = observer((props) => {

	const store = React.useContext(window.storeContext);
	const app = store.app;
	const playlists = store.playlists;

	// From ... store

	const loaded = store.loaded;

	// ...

	const showHelper = (!loaded) ? true : false;

	// Renderers
	// ==================================================================================================

	const renderPage = () => {

		// Render :: Page
		// ---

		let pageContent = null;
		if (!showHelper) {
			pageContent = <RenderPlaylists />
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

	return (
		<div className="nx-page">
			{renderPage()}
			{renderHelper()}
		</div>
	)
})
