import React from 'react';
import { types, getRoot } from "mobx-state-tree";
import { observer } from "mobx-react-lite";
import clsx from 'clsx';

import { PlaylistStore } from 'gramophone_client/contexts/playlist/Playlist';
import { PlaylistFolderStore } from 'gramophone_client/contexts/playlist_folder/PlaylistFolder';

import { Field } from 'nexus/forms/field/Field';

import { Popup } from 'nexus/ui/popup/Popup';
import { Button } from 'nexus/ui/button/Button';

import { uuid } from 'nexus/utils/Datas';
import { dateTools } from 'nexus/utils/DateTools';

import './PopupManagePlaylist.css';


// Models
// ======================================================================================================

// ***** PopupManagePlaylistStore *****
// ************************************

const TAG_PopupManagePlaylistStore = () => {}
export const PopupManagePlaylistStore = types
	.model({
		mode: types.maybeNull(types.string), // create, edit, add, move

		// create + edit
		// -

		draftKind: 'playlist', // playlist, folder
		draftId: types.maybeNull(types.string),
		draftPlaylist: types.optional(PlaylistStore, {}),
		draftFolder: types.optional(PlaylistFolderStore, {}),

		// add
		// -

		sourceId: types.maybeNull(types.string),
		sourceType: types.maybeNull(types.string), // track, album, playlist

		// move
		// -

		destinationId: types.maybeNull(types.string),
	})
	.views(self => ({

		// Bools
		// -

		get isOpen() {
			const store = getRoot(self);
			const app = store.app;
			const popup = app.popup;

			return popup.isOpen(popupManagePlaylistKey);
		},

	}))
	.actions(self => ({

		setField: (field, value) => {
			self[field] = value;
		},

		// -

		init: (mode, kind, id="") => {

			const store = getRoot(self);
			const playlists = store.playlists;

			self.mode = mode;
			self.draftKind = kind;
			self.draftId = id

			self.draftPlaylist = PlaylistStore.create({});
			self.draftFolder = PlaylistFolderStore.create({});

			// create
			// -

			if (mode == 'create' && kind == 'playlist') {
				self.draftPlaylist = PlaylistStore.create({
					"id": uuid(),
					"name": `Du ${dateTools.dateToFrench()} ${dateTools.getHourIso()}`,
					"ts_playlist": dateTools.getNowIso(),
					"permanent": false,
					"group": "",
					"tracks_ids": [],
				});
			}
			if (mode == 'create' && kind == 'folder') {
				self.draftFolder = PlaylistFolderStore.create({
					"id": uuid(),
					"name": "Nouveau dossier",
				});
			}

			// edit
			// -

			if (mode == 'edit' && kind == 'playlist') {
				const playlist = playlists.by_id.get(id);
				if (playlist) {
					self.draftPlaylist = PlaylistStore.create(playlist.toJSON());
				}
			}
			if (mode == 'edit' && kind == 'folder') {
				const folder = playlists.folders.get(id);
				if (folder) {
					self.draftFolder = PlaylistFolderStore.create(folder.toJSON());
				}
			}

			// add
			// -

			// TODO

		},

		validate: (callback) => {

			const store = getRoot(self);
			const app = store.app;

			const mode = self.mode;
			const draftKind = self.draftKind;
			const draftPlaylist = self.draftPlaylist;
			const draftFolder = self.draftFolder;

			let errors = [];

			if (['create', 'edit'].includes(mode)) {

				// Pas de nom de playlist ?
				if (draftKind == 'playlist' && !draftPlaylist.name) {
					errors.push(app.addError(
						['popupManagePlaylist', 'draftPlaylist', 'name'],
						"Nom de la playlist manquant",
					));
				}

				// Pas de nom de dossier ?
				if (draftKind == 'folder' && !draftFolder.name) {
					errors.push(app.addError(
						['popupManagePlaylist', 'draftFolder', 'name'],
						"Nom de du dossier manquant",
					));
				}
			}

			if (mode == 'add') {

				// Pas de destination ?
				if (!self.destinationId) {
					errors.push(app.addError(
						['popupManagePlaylist', 'destinationId'],
						"Playlist de destination manquante",
					));
				}
			}

			if (mode == 'move') {

				// Pas de destination ?
				if (!self.destinationId) {
					errors.push(app.addError(
						['popupManagePlaylist', 'destinationId'],
						"Dossier de destination manquant",
					));
				}
			}

			if (callback) {
				callback(errors);
			}
			return errors;
		},

		// -

		open: () => {
			const store = getRoot(self);
			const app = store.app;
			const popup = app.popup;

			app.clearErrors();
			popup.open(popupManagePlaylistKey);
		},

		close: (callback) => {
			const store = getRoot(self);
			const app = store.app;
			const popup = app.popup;

			popup.close(popupManagePlaylistKey);
			if (callback) {
				callback();
			}
		},

	}))


// Functions Components ReactJS
// ======================================================================================================

// ***** PopupManagePlaylist *****
// *******************************

const TAG_PopupManagePlaylist = () => {}
export const popupManagePlaylistKey = 'popupManagePlaylist';
export const PopupManagePlaylist = observer((props) => {

	const store = React.useContext(window.storeContext);
	const app = store.app;
	const snackbar = app.snackbar;
	const popup = app.popup;
	const popupManagePlaylist = store.popupManagePlaylist;
	const playlists = store.playlists;

	// From ... store

	const isLoading = app.isLoading;
	const isOpen = popupManagePlaylist.isOpen;

	const mode = popupManagePlaylist.mode;
	const draftKind = popupManagePlaylist.draftKind;
	const draftId = popupManagePlaylist.draftId;
	const draftPlaylist = popupManagePlaylist.draftPlaylist;
	const draftFolder = popupManagePlaylist.draftFolder;

	const sourceId = popupManagePlaylist.sourceId;
	const sourceType = popupManagePlaylist.sourceType;

	const destinationId = popupManagePlaylist.destinationId;

	// ...

	React.useEffect(() => {
		if (draftKind == "playlist" && ['create', 'edit'].includes(mode)) {
			const fieldName = document.getElementById("txt-playlist-name");
			if (fieldName) {
				fieldName.focus();
			}
		}
		if (draftKind == "folder" && ['create', 'edit'].includes(mode)) {
			const fieldName = document.getElementById("txt-folder-name");
			if (fieldName) {
				fieldName.focus();
			}
		}
	}, [isOpen]);

	// ...

	// Events
	// ==================================================================================================

	const handleClose = () => {
		popup.clearMessage(popupManagePlaylistKey);
	}

	// -

	const handleBtnClose = () => {
		popupManagePlaylist.close(handleClose);
	}

	const handleBtnValidate = () => {
		popup.clearMessage(popupManagePlaylistKey);
		popupManagePlaylist.validate((errors) => {
			if (errors.length == 0) {

				if (draftKind == "playlist" && ['create', 'edit'].includes(mode)) {
					playlists.setPlaylist(draftPlaylist.id, draftPlaylist.toJSON());
				}

				if (draftKind == "folder" && ['create', 'edit'].includes(mode)) {
					playlists.setFolder(draftFolder.id, draftFolder.toJSON());
				}

				if (mode == 'add') {
					const playlist = playlists.by_id.get(destinationId);
					if (playlist) {
						playlist.populateWith(sourceType, sourceId);
						snackbar.update(true, "Ajout effectué.", "success");
					}
				}

				if (mode == 'move') {
					const playlist = playlists.by_id.get(draftId);
					if (playlist) {
						playlist.setField('folder_id', destinationId);
						snackbar.update(true, "Playlist déplacée.", "success");
					}
				}

				popupManagePlaylist.close();
				playlists.save();

			} else {
				// popup.setMessage(popupManagePlaylistKey, "Vérifiez votre saisie", "warning");
			}
		});
	}

	// Render
	// ==================================================================================================

	// Popup --> Title
	// -----------------------------------------------

	let popupTitle = (draftKind == "playlist") ? "Playlist" : "Dossier";
	if (mode == "create") {
		popupTitle = (draftKind == "playlist") ? "Nouvelle playlist" : "Nouveau dossier";
	}
	if (mode == "edit") {
		popupTitle = (draftKind == "playlist") ? "Modification playlist" : "Modification dossier";
	}
	if (mode == "add" || mode == "move") {
		popupTitle = "Choix de la destination";
	}

	// Popup --> Content
	// -----------------------------------------------

	let popupContent = null;
	if (isOpen) {

		const sourceType = popupManagePlaylist.sourceType;
		const playlistItems = playlists.playlistItems;
		const folderItems = playlists.folderItems;

		popupContent = (
			<div>

				{(draftKind == 'playlist' && ['create', 'edit'].includes(mode)) && (
					<Field
						id="txt-playlist-name"
						component='input'
						label='Nom'
						savePath={['popupManagePlaylist', 'draftPlaylist', 'name']}
						disabled={isLoading}
					/>
				)}

				{(draftKind == 'folder' && ['create', 'edit'].includes(mode)) && (
					<Field
						id="txt-folder-name"
						component='input'
						label='Nom'
						savePath={['popupManagePlaylist', 'draftFolder', 'name']}
						disabled={isLoading}
					/>
				)}

				{mode == 'add' && (
					<Field
						id="lst-playlist-destination"
						component='select'
						label="Playlist"
						datas={playlistItems}
						savePath={['popupManagePlaylist', 'destinationId']}
						disabled={isLoading}
						canBeEmpty={true}
					/>
				)}

				{mode == 'move' && (
					<Field
						id="lst-folder-destination"
						component='select'
						label="Dossier"
						datas={folderItems}
						savePath={['popupManagePlaylist', 'destinationId']}
						disabled={isLoading}
						canBeEmpty={true}
					/>
				)}

			</div>
		)
	}

	// Popup --> Buttons
	// -----------------------------------------------

	let popupButtons = [];

	popupButtons.push(
		<Button
			key="btn-manage-playlist-cancel"
			disabled={isLoading}
			onClick={() => handleBtnClose()}
		>
			Annuler
		</Button>
	)

	popupButtons.push(
		<Button
			key="btn-manage-playlist-validate"
			disabled={isLoading}
			color="primary"
			onClick={() => handleBtnValidate()}
		>
			{(mode == "create") && "Créer"}
			{(mode == "edit") && "Modifier"}
			{(mode == "add") && "Ajouter"}
			{(mode == "move") && "Déplacer"}
		</Button>
	)

	// -----------------------------------------------

	return (
		<Popup
			id={popupManagePlaylistKey}
			title={popupTitle}
			buttons={popupButtons}

			callbackClose={handleClose}
		>
			{popupContent}
		</Popup>
	)
})
