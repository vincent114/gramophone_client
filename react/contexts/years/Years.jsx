import React from 'react';
import { types, getRoot } from "mobx-state-tree";
import { observer } from "mobx-react-lite";
import clsx from 'clsx';

import { YearStore } from 'gramophone_client/contexts/year/Year';

import { HeaderTitle } from 'nexus/layout/header/Header';
import { MenuItem } from 'nexus/layout/menu/Menu';
import { Ribbon } from 'nexus/layout/ribbon/Ribbon';

import { Helper } from 'nexus/ui/helper/Helper';
import { IconButton } from 'nexus/ui/button/Button';

import './Years.css';


// Models
// ======================================================================================================

// ***** YearsStore *****
// **********************

const TAG_YearsStore = () => {}
export const YearsStore = types
	.model({
		by_id: types.map(YearStore),

		loaded: false,
	})
	.views(self => ({

		get yearsCollectionFilePath() {
			const store = getRoot(self);
			const library = store.library;
			const path = ipc.sendSync('pathJoin', [library.collectionPath, 'years.json']);
			return path;
		},

		get nbYears() {
			return Object.entries(self.by_id.toJSON()).length;
		},

	}))
	.actions(self => ({

		setField: (field, value) => {
			self[field] = value;
		},

		// -

		update: (raw) => {
			self.by_id = {};
			for (const [yearId, yearRaw] of Object.entries(raw.by_id)) {
				const year = YearStore.create({});
				year.update(yearRaw);
				self.by_id.set(yearId, year);
			}
			self.loaded = true;
		},

		load: (callback) => {

			// Chargement des années
			// ---

			const store = getRoot(self);

			const raw = store._readJsonFile(self.yearsCollectionFilePath, {
				by_id: {},
			});
			self.update(raw);

			if (callback) {
				callback();
			}
		},

		save: (callback) => {

			// Sauvegarde des années
			// ---

			const store = getRoot(self);
			store._writeJsonFile(self.yearsCollectionFilePath, self.toJSON());

			if (callback) {
				callback();
			}
		},

		index: (metas) => {

			// Indexation d'une année
			// ---

			let added = false;

			let yearId = metas.yearID;
			let year = self.by_id.get(yearId);

			if (!year) {
				year = YearStore.create({});
				year.setField('id', yearId);
				added = true;
			}

			const tags = metas.fileTags;

			year.setField('name', `${tags.year}`);

			year.addAlbumId(metas.albumID);

			self.by_id.set(yearId, year);
			return added;
		}

	}))


// Functions Components ReactJS
// ======================================================================================================

// ***** RenderYears *****
// ***********************

const TAG_RenderYears = () => {}
export const RenderYears = observer((props) => {

	const store = React.useContext(window.storeContext);
	const app = store.app;
	const years = store.years;

	// From ... store

	const isLoading = store.isLoading;
	const nbYears = years.nbYears;

	// ...

	// Events
	// ==================================================================================================

	const handleThrowDiceClick = () => {
		// TODO
	}

	// Render
	// ==================================================================================================

	return (
		<div>

			<Ribbon
				avatarIconName="date_range"
				avatarIconColor="typography"
				title={`${nbYears} ${(nbYears > 1) ? "Années" : "Année"}`}
				right={(
					<div className="h-col">
						<IconButton
							iconName="casino"
							color="hot"
							disabled={isLoading}
							onClick={() => handleThrowDiceClick()}
						/>
					</div>
				)}
			/>

		</div>
	)
})

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

	// Events
	// ==================================================================================================

	const handleMenuItemClick = () => {
		store.navigateTo(yearsContext);
		app.menu.close();
	}

	// Render
	// ==================================================================================================

	return (
		<MenuItem
			iconName="date_range"
			label="Années"
			activeContexts={[yearsContext, "year"]}
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
	const years = store.years;

	// From ... store

	const loaded = store.loaded;
	const nbYears = years.nbYears;

	// ...

	const showHelper = (!loaded || nbYears == 0) ? true : false;

	// Renderers
	// ==================================================================================================

	const renderPage = () => {

		// Render :: Page
		// ---

		let pageContent = null;
		if (!showHelper) {
			pageContent = <RenderYears />
		}
		return pageContent;
	}

	const renderHelper = () => {

		// Render :: Helper
		// ---

		return (
			<Helper
				iconName="date_range"
				show={showHelper}
			/>
		)
	}

	return (
		<div className="nx-page medium">
			{renderPage()}
			{renderHelper()}
		</div>
	)
})
