import React from 'react';
import { types, getRoot } from "mobx-state-tree";
import { observer } from "mobx-react-lite";
import clsx from 'clsx';

import { Helper } from 'nexus/ui/helper/Helper';
import { HeaderTitle } from 'nexus/layout/header/Header';
import { MenuItem } from 'nexus/layout/menu/Menu';
import { Icon } from 'nexus/ui/icon/Icon';

import './Years.css';


// Models
// -------------------------------------------------------------------------------------------------------------

// ***** YearsStore *****
// **********************

const TAG_YearsStore = () => {}
export const YearsStore = types
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

// ***** YearsHeaderLeft *****
// ***************************

const TAG_YearsHeaderLeft = () => {}
export const YearsHeaderLeft = observer((props) => {

	const store = React.useContext(window.storeContext);
	const app = store.app;

	// ...

	// Render
	// ==================================================================================================

	return (
		<HeaderTitle
			title="Années"
			titleStyle={{
				marginLeft: '10px',
			}}
		/>
	)
})

// ***** YearsMenuItem *****
// *************************

const TAG_YearsMenuItem = () => {}
export const YearsMenuItem = observer((props) => {

	const store = React.useContext(window.storeContext);
	const app = store.app;
	const menu = app.menu;

	// ...

	const yearsContext = 'years';

	// Evènements
	// ==================================================================================================

	const handleMenuItemClick = () => {
		store.navigateTo(yearsContext);
		app.menu.close();
	}

	// Render
	// ==================================================================================================

	return (
		<MenuItem
			icon={<Icon name="date_range" width="120px" />}
			label="Années"
			activeContexts={[yearsContext]}
			callbackClick={handleMenuItemClick}
		/>
	)
})

// ***** YearsPage *****
// *********************

const TAG_YearsPage = () => {}
export const YearsPage = observer((props) => {

	const store = React.useContext(window.storeContext);
	const app = store.app;

	// Renderers
	// ==================================================================================================

	const renderHelper = () => {

		// Render :: Helper
		// ---

		return (
			<Helper
				iconName="date_range"
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
