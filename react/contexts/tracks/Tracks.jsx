import React from 'react';
import { types, getRoot } from "mobx-state-tree";
import { observer } from "mobx-react-lite";
import clsx from 'clsx';

import { Helper } from 'nexus/ui/helper/Helper';
import { HeaderTitle } from 'nexus/layout/header/Header';
import { MenuItem } from 'nexus/layout/menu/Menu';
import { Icon } from 'nexus/ui/icon/Icon';

import './Tracks.css';


// Datas
// ======================================================================================================

export const MODEL_TRACK = {
	'id': '',
	'name': '',
	'disk': null,
	'track': null,
	'audio_file': '',
	'audio_file_type': '',

	'stamp_file': '',
	'stamp_added': '',

	'artist': '',
	'album': '',

	'selected': true,
	'favorite': false,
	'starred': false,

	'album_id': '',
	'artist_id': '',
	'year_id': '',
	'genre_id': '',

	'not_found': false,
}


// Models
// ======================================================================================================

// ***** TracksStore *****
// ***********************

const TAG_TracksStore = () => {}
export const TracksStore = types
	.model({

	})
	.views(self => ({

		get nbTracks() {
			// TODO
			return 0;
		},

	}))
	.actions(self => ({

		setField: (field, value) => {
			self[field] = value;
		},

		// -

		update: (raw) => {

		},

	}))


// Functions Components ReactJS
// ======================================================================================================

// ***** TracksHeaderLeft *****
// ****************************

const TAG_TracksHeaderLeft = () => {}
export const TracksHeaderLeft = observer((props) => {

	const store = React.useContext(window.storeContext);
	const app = store.app;

	// ...

	// Render
	// ==================================================================================================

	return (
		<HeaderTitle
			title="Titres"
			titleStyle={{
				marginLeft: '10px',
			}}
		/>
	)
})

// ***** TracksMenuItem *****
// **************************

const TAG_TracksMenuItem = () => {}
export const TracksMenuItem = observer((props) => {

	const store = React.useContext(window.storeContext);
	const app = store.app;
	const menu = app.menu;

	// ...

	const tracksContext = 'tracks';

	// Evènements
	// ==================================================================================================

	const handleMenuItemClick = () => {
		store.navigateTo(tracksContext);
		app.menu.close();
	}

	// Render
	// ==================================================================================================

	return (
		<MenuItem
			icon={<Icon name="audiotrack" width="120px" />}
			label="Titres"
			activeContexts={[tracksContext]}
			callbackClick={handleMenuItemClick}
		/>
	)
})

// ***** TracksPage *****
// **********************

const TAG_TracksPage = () => {}
export const TracksPage = observer((props) => {

	const store = React.useContext(window.storeContext);
	const app = store.app;

	// Renderers
	// ==================================================================================================

	const renderHelper = () => {

		// Render :: Helper
		// ---

		return (
			<Helper
				iconName="audiotrack"
				show={true}
			/>
		)
	}

	return (
		<div className="nx-page">
			{renderHelper()}
		</div>
	)
})
