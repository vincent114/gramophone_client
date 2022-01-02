import React from 'react';
import { types, getRoot } from "mobx-state-tree";
import { observer } from "mobx-react-lite";
import clsx from 'clsx';

import { Helper } from 'nexus/ui/helper/Helper';
import { HeaderTitle } from 'nexus/layout/header/Header';
import { MenuItem } from 'nexus/layout/menu/Menu';
import { Icon } from 'nexus/ui/icon/Icon';

import './Artists.css';


// Models
// -------------------------------------------------------------------------------------------------------------

// ***** ArtistsStore *****
// ***********************

const TAG_ArtistsStore = () => {}
export const ArtistsStore = types
	.model({

	})
	.actions(self => ({

		setField: (field, value) => {
			self[field] = value;
		},

		// -

		update: (raw) => {

		},

	}))


// Functions Components ReactJS
// -------------------------------------------------------------------------------------------------------------

// ***** ArtistsHeaderLeft *****
// *****************************

const TAG_ArtistsHeaderLeft = () => {}
export const ArtistsHeaderLeft = observer((props) => {

	const store = React.useContext(window.storeContext);
	const app = store.app;

	// ...

	// Render
	// ==================================================================================================

	return (
		<HeaderTitle
			title="Artistes"
			titleStyle={{
				marginLeft: '10px',
			}}
		/>
	)
})

// ***** ArtistsMenuItem *****
// ***************************

const TAG_ArtistsMenuItem = () => {}
export const ArtistsMenuItem = observer((props) => {

	const store = React.useContext(window.storeContext);
	const app = store.app;
	const menu = app.menu;

	// ...

	const artistsContext = 'artists';

	// Evènements
	// ==================================================================================================

	const handleMenuItemClick = () => {
		store.navigateTo(artistsContext);
		app.menu.close();
	}

	// Render
	// ==================================================================================================

	return (
		<MenuItem
			icon={<Icon name="face" width="120px" />}
			label="Artistes"
			activeContexts={[artistsContext]}
			callbackClick={handleMenuItemClick}
		/>
	)
})

// ***** ArtistsPage *****
// ***********************

const TAG_ArtistsPage = () => {}
export const ArtistsPage = observer((props) => {

	const store = React.useContext(window.storeContext);
	const app = store.app;

	// Renderers
	// ==================================================================================================

	const renderHelper = () => {

		// Render :: Helper
		// ---

		return (
			<Helper
				iconName="face"
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
