import React from 'react';
import { types, getRoot } from "mobx-state-tree";
import { observer } from "mobx-react-lite";
import clsx from 'clsx';

import { Popup } from 'nexus/ui/popup/Popup';

import './PopupManagePlaylist.css';


// Models
// ======================================================================================================

// ***** PopupManagePlaylistStore *****
// ************************************

const TAG_PopupManagePlaylistStore = () => {}
export const PopupManagePlaylistStore = types
	.model({
		mode: types.maybeNull(types.string), // create, edit, add

		sourceId: types.maybeNull(types.string),
		sourceType: types.maybeNull(types.string), // track, album
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

		open: () => {
			const store = getRoot(self);
			const app = store.app;
			const popup = app.popup;

			popup.open(popupManagePlaylistKey);
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

	// Render
	// ==================================================================================================

	// Popup --> Title
	// -----------------------------------------------

	let popupTitle = "Playlist";

	// Popup --> Content
	// -----------------------------------------------

	let popupContent = null;
	if (isOpen) {
		popupContent = (
			<div>...</div>
		)
	}

	// -----------------------------------------------

	return (
		<Popup
			id={popupManagePlaylistKey}
			title={popupTitle}
			// style={{
			// 	minWidth: '600px',
			// 	maxWidth: '600px',
			// }}
			// contentStyle={{
			// 	padding: '0px',
			// 	minHeight: '600px',
			// 	maxHeight: '600px',
			// }}
		>
			{popupContent}
		</Popup>
	)
})
