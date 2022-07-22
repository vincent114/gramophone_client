import React from 'react';
import { types, getRoot } from "mobx-state-tree";
import { observer } from "mobx-react-lite";
import clsx from 'clsx';

import { Popup } from 'nexus/ui/popup/Popup';

import './PopupJumpTo.css';


// Models
// ======================================================================================================

// ***** PopupJumpToStore *****
// ****************************

const TAG_PopupJumpToStore = () => {}
export const PopupJumpToStore = types
	.model({
		chars: types.optional(types.array(types.string), []),
		current: types.maybeNull(types.string),
	})
	.views(self => ({

		// Bools
		// -

		get isOpen() {
			const store = getRoot(self);
			const app = store.app;
			const popup = app.popup;

			return popup.isOpen(popupJumpToKey);
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

			popup.open(popupJumpToKey);
		},

	}))


// Functions Components ReactJS
// ======================================================================================================

// ***** PopupJumpTo *****
// ***********************

const TAG_PopupJumpTo = () => {}
export const popupJumpToKey = 'popupJumpTo';
export const PopupJumpTo = observer((props) => {

	const store = React.useContext(window.storeContext);
	const app = store.app;
	const popup = app.popup;
	const popupJumpTo = store.popupJumpTo;

	// From ... store

	const isLoading = app.isLoading;
	const isOpen = popupJumpTo.isOpen;

	// Render
	// ==================================================================================================

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
			id={popupJumpToKey}
			closeVariant="hover"
			closeOnClick={true}
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
