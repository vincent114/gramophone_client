import React from 'react';
import { types, getRoot } from "mobx-state-tree";
import { observer } from "mobx-react-lite";
import clsx from 'clsx';

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

	// ...

	console.log(folder.toJSON());

	// Render
	// ==================================================================================================

	return (
		<div>

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
		<div className="c-page">
			{renderPage()}
			{renderHelper()}
		</div>
	)
})
