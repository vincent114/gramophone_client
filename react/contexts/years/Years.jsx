import React from 'react';
import { types, getRoot } from "mobx-state-tree";
import { observer } from "mobx-react-lite";
import clsx from 'clsx';

import { YearStore } from 'gramophone_client/contexts/year/Year';

import { HeaderTitle } from 'nexus/layout/header/Header';
import { MenuItem } from 'nexus/layout/menu/Menu';
import { Ribbon } from 'nexus/layout/ribbon/Ribbon';
import {
	GroupDivider,
	Group,
} from 'nexus/layout/group/Group';
import { Grid } from 'nexus/layout/grid/Grid';

import { Helper } from 'nexus/ui/helper/Helper';
import { IconButton } from 'nexus/ui/button/Button';
import { Avatar } from 'nexus/ui/avatar/Avatar';
import {
	Card,
	CardGhost,
	CardHeader
} from 'nexus/ui/card/Card';

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

		// -

		get groupedByDecade() {
			let byDecade = {};
			for (const [yearId, year] of self.by_id.entries()) {
				const decade = year.decade;
				if (!byDecade.hasOwnProperty(decade)) {
					byDecade[decade] = [];
				}
				byDecade[decade].push(year);
			}
			return byDecade;
		},

		// Getters
		// -

		getById(yearId) {
			let year = self.by_id.get(yearId);
			if (!year) {
				year = YearStore.create({});
			}
			return year;
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
			const app = store.app;

			store._readJsonFile(
				self.yearsCollectionFilePath,
				{
					by_id: {},
				},
				(raw) => {
					// self.update(raw);
					app.saveValue(['years', 'by_id'], raw.by_id, () => {
						self.setField('loaded', true);
						if (callback) {
							callback();
						}
					});
				}
			);
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
	const groupedByDecade = years.groupedByDecade;

	// ...

	const decades = Object.keys(groupedByDecade);
	decades.sort((a, b) => b - a);

	// Events
	// ==================================================================================================

	const handleThrowDiceClick = () => {
		// TODO
	}

	// -

	const handleDecadeClick = (decade) => {
		// TODO
	}

	const handleFocusClick = (decade) => {
		// TODO
	}

	// -

	const handleYearClick = (yearId) => {
		store.navigateTo('year', yearId);
	}

	const handleShuffleClick = (yearId) => {
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

			{decades.map((decade, decadeIdx) => {

				const yearsDecade = groupedByDecade[decade];

				// Fantômes flex
				let decadeGhosts = []
				for (var i = 0; i < 10; i++) {
					decadeGhosts.push(
						<CardGhost
							key={`thumbnail-ghost-${decadeIdx}-${i}`}
							size="normal"
							style={{
								marginRight: '10px',
							}}
						/>
					)
				}

				return (
					<Group
						id={`group-${decade}`}
						key={`group-${decade}-${decadeIdx}`}
						style={{
							marginBottom: '40px',
						}}
					>

						<GroupDivider
							spacing="big"
							left={(
								<IconButton
									color="secondary"
									onClick={() => handleDecadeClick(decade)}
								>
									{`${decade}'s`}
								</IconButton>
							)}
							center={(
								<Avatar
									size="small"
									color="rgba(111, 126, 140, 0.1)"
									textColor="typography"
									style={{
										fontSize: '14px',
										color: 'gray',
									}}
								>
									{yearsDecade.length}
								</Avatar>
							)}
							right={(
								<IconButton
									iconName="arrow_forward"
									onClick={() => handleFocusClick(decade)}
								/>
							)}
						/>

						<Grid
							// style={{
							// 	paddingLeft: '20px',
							// 	paddingRight: '20px',
							// }}
						>
							{yearsDecade.map((year, yearIdx) => (
								<Card
									key={`thumbnail-year-${decadeIdx}-${yearIdx}`}
									size="normal"
									style={{
										marginRight: '10px',
										marginBottom: '20px',
									}}
									callbackClick={() => handleYearClick(year.id)}
								>
									<CardHeader
										title={year.name}
										subtitle={`${year.nbAlbums} ${(year.nbAlbums > 1) ? "albums" : "album"}`}
										action={(
											<IconButton
												size="small"
												iconName="shuffle"
												color="info"
												onClick={(e) => {
													e.preventDefault();
													e.stopPropagation();
													handleShuffleClick(year.id);
												}}
											/>
										)}
									/>
								</Card>
							))}
							{decadeGhosts}
						</Grid>

					</Group>
				)
			})}

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
