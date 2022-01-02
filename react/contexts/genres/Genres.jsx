import React from 'react';
import { types, getRoot } from "mobx-state-tree";
import { observer } from "mobx-react-lite";
import clsx from 'clsx';

import { Helper } from 'nexus/ui/helper/Helper';
import { HeaderTitle } from 'nexus/layout/header/Header';
import { MenuItem } from 'nexus/layout/menu/Menu';
import { Icon } from 'nexus/ui/icon/Icon';

import './Genres.css';


// Models
// -------------------------------------------------------------------------------------------------------------

// ***** GenresStore *****
// ***********************

const TAG_GenresStore = () => {}
export const GenresStore = types
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

// ***** GenresHeaderLeft *****
// ****************************

const TAG_GenresHeaderLeft = () => {}
export const GenresHeaderLeft = observer((props) => {

	const store = React.useContext(window.storeContext);
	const app = store.app;

	// ...

	// Render
	// ==================================================================================================

	return (
		<HeaderTitle
			title="Genres"
			titleStyle={{
				marginLeft: '10px',
			}}
		/>
	)
})

// ***** GenresMenuItem *****
// **************************

const TAG_GenresMenuItem = () => {}
export const GenresMenuItem = observer((props) => {

	const store = React.useContext(window.storeContext);
	const app = store.app;
	const menu = app.menu;

	// ...

	const genresContext = 'genres';

	// Evènements
	// ==================================================================================================

	const handleMenuItemClick = () => {
		store.navigateTo(genresContext);
		app.menu.close();
	}

	// Render
	// ==================================================================================================

	return (
		<MenuItem
			icon={<Icon name="local_bar" width="120px" />}
			label="Genres"
			activeContexts={[genresContext]}
			callbackClick={handleMenuItemClick}
		/>
	)
})

// ***** GenresPage *****
// **********************

const TAG_GenresPage = () => {}
export const GenresPage = observer((props) => {

	const store = React.useContext(window.storeContext);
	const app = store.app;

	// Renderers
	// ==================================================================================================

	const renderHelper = () => {

		// Render :: Helper
		// ---

		return (
			<Helper
				iconName="local_bar"
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
