import React from 'react';
import { types, getRoot } from "mobx-state-tree";
import { observer } from "mobx-react-lite";
import clsx from 'clsx';

import { PlaylistStore } from 'gramophone_client/contexts/playlist/Playlist';
import { PlaylistFolderStore } from 'gramophone_client/contexts/playlists/Playlists';

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
		mode: types.maybeNull(types.string), // create, edit, add

		// create + edit

		draftKind: 'playlist', // playlist, folder
		draftId: types.maybeNull(types.string),
		draftPlaylist: types.optional(PlaylistStore, {}),
		draftFolder: types.optional(PlaylistFolderStore, {}),

		// add
		// -

		sourceId: types.maybeNull(types.string),
		sourceType: types.maybeNull(types.string), // track, album, playlist
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
				// TODO
			}
			if (mode == 'edit' && kind == 'folder') {
				// TODO
			}

			// add
			// -

			// TODO

		},

		// -

		open: () => {
			const store = getRoot(self);
			const app = store.app;
			const popup = app.popup;

			popup.open(popupManagePlaylistKey);
		},

		close: () => {
			const store = getRoot(self);
			const app = store.app;
			const popup = app.popup;

			popup.close(popupManagePlaylistKey);
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
	const popup = app.popup;
	const popupManagePlaylist = store.popupManagePlaylist;

	// From ... store

	const isLoading = app.isLoading;
	const isOpen = popupManagePlaylist.isOpen;

	const mode = popupManagePlaylist.mode;
	const draftKind = popupManagePlaylist.draftKind;

	// ...

	// Events
	// ==================================================================================================

	const handleBtnClose = () => {
		popupManagePlaylist.close();
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
	if (mode == "add") {
		popupTitle = "Choix de la destination";
	}

	// Popup --> Content
	// -----------------------------------------------

	let popupContent = null;
	if (isOpen) {

		const sourceType = popupManagePlaylist.sourceType;

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
		</Button>
	)

	// -----------------------------------------------

	return (
		<Popup
			id={popupManagePlaylistKey}
			title={popupTitle}
			buttons={popupButtons}
		>
			{popupContent}
		</Popup>
	)
})
