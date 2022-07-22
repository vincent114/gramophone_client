import React from 'react';
import { types, getRoot } from "mobx-state-tree";
import { observer } from "mobx-react-lite";
import clsx from 'clsx';

import { Popup } from 'nexus/ui/popup/Popup';

import './PopupTrackMetadatas.css';


// Models
// ======================================================================================================

// ***** PopupTrackMetadatasStore *****
// ************************************

const TAG_PopupTrackMetadatasStore = () => {}
export const PopupTrackMetadatasStore = types
	.model({
		trackId: types.maybeNull(types.string),
	})
	.views(self => ({

		// Bools
		// -

		get isOpen() {
			const store = getRoot(self);
			const app = store.app;
			const popup = app.popup;

			return popup.isOpen(popupTrackMetadatasKey);
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

			popup.open(popupTrackMetadatasKey);
		},

	}))


// Functions Components ReactJS
// ======================================================================================================

// ***** PopupTrackMetadatas *****
// *******************************

const TAG_PopupTrackMetadatas = () => {}
export const popupTrackMetadatasKey = 'popupTrackMetadatas';
export const PopupTrackMetadatas = observer((props) => {

	const store = React.useContext(window.storeContext);
	const app = store.app;
	const popup = app.popup;
	const popupTrackMetadatas = store.popupTrackMetadatas;

	// From ... store

	const isLoading = app.isLoading;
	const isOpen = popupTrackMetadatas.isOpen;

	// Render
	// ==================================================================================================

	// Popup --> Title
	// -----------------------------------------------

	let popupTitle = "Informations";

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
			id={popupTrackMetadatasKey}
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
