import React from 'react';
import { types, getRoot } from "mobx-state-tree";
import { observer } from "mobx-react-lite";
import clsx from 'clsx';

import { Helper } from 'nexus/ui/helper/Helper';
import { Popup } from 'nexus/ui/popup/Popup';

import './PopupZoomCover.css';


// Models
// ======================================================================================================

// ***** PopupZoomCoverStore *****
// *******************************

const TAG_PopupZoomCoverStore = () => {}
export const PopupZoomCoverStore = types
	.model({
		albumId: types.maybeNull(types.string),
	})
	.views(self => ({

		get album() {
			const store = getRoot(self);
			const albums = store.albums;
			const albumId = self.albumId;
			return albums.by_id.get(albumId);
		},

		get cover() {
			const album = self.album;
			if (album) {
				return album.coverUrl;
			}
			return "";
		},

	}))
	.actions(self => ({

		setField: (field, value) => {
			self[field] = value;
		},

	}))


// Functions Components ReactJS
// ======================================================================================================

// ***** PopupZoomCover *****
// **************************

const TAG_PopupZoomCover = () => {}
export const popupZoomCoverKey = 'popupZoomCover';
export const PopupZoomCover = observer((props) => {

	const store = React.useContext(window.storeContext);
	const app = store.app;
	const popup = app.popup;
	const popupZoomCover = store.popupZoomCover;

	// From ... store

	const isLoading = app.isLoading;
	const isOpen = popup.isOpen(popupZoomCoverKey);

	// Render
	// ==================================================================================================

	// Popup --> Title
	// -----------------------------------------------

	const popupTitle = "";

	// Popup --> Content
	// -----------------------------------------------

	let popupContent = null;

	if (isOpen) {
		const cover = popupZoomCover.cover;
		if (cover) {
			popupContent = (
				<img src={cover} />
			)
		} else {
			popupContent = (
				<Helper
					iconName="album"
					show={true}
					inFlux={true}
					style={{
						minHeight: '600px',
					}}
				/>
			)
		}
	}

	// -----------------------------------------------

	return (
		<Popup
			id={popupZoomCoverKey}
			title={popupTitle}
			closeVariant="hover"
			closeOnClick={true}
			style={{
				minWidth: '600px',
				maxWidth: '600px',
			}}
			contentStyle={{
				padding: '0px',
				minHeight: '600px',
				maxHeight: '600px',
			}}
		>
			{popupContent}
		</Popup>
	)
})
