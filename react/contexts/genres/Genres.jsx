import React from 'react';
import { types, getRoot } from "mobx-state-tree";
import { observer } from "mobx-react-lite";
import clsx from 'clsx';

import { GenreStore } from 'gramophone_client/contexts/genre/Genre';

import {
	TableContainer,
	Table,
	TableHead,
	TableBody,
	TableRow,
	TableCell
} from 'nexus/forms/table/Table';

import { HeaderTitle } from 'nexus/layout/header/Header';
import { MenuItem } from 'nexus/layout/menu/Menu';
import { Ribbon } from 'nexus/layout/ribbon/Ribbon';
import {
	GroupDivider,
	Group,
} from 'nexus/layout/group/Group';

import { Helper } from 'nexus/ui/helper/Helper';
import { IconButton } from 'nexus/ui/button/Button';
import { Avatar } from 'nexus/ui/avatar/Avatar';
import { Paper } from 'nexus/ui/paper/Paper';

import './Genres.css';


// Models
// ======================================================================================================

// ***** GenresStore *****
// ***********************

const TAG_GenresStore = () => {}
export const GenresStore = types
	.model({
		by_id: types.map(GenreStore),

		loaded: false,
	})
	.views(self => ({

		get genresCollectionFilePath() {
			const store = getRoot(self);
			const library = store.library;
			const path = ipc.sendSync('pathJoin', [library.collectionPath, 'genres.json']);
			return path;
		},

		get nbGenres() {
			return Object.entries(self.by_id.toJSON()).length;
		},

		// Getters
		// -

		getByLetter() {
			let byLetter = {};
			for (const [genreId, genre] of self.by_id.entries()) {
				const letter = genre.letter;
				if (!byLetter.hasOwnProperty(letter)) {
					byLetter[letter] = [];
				}
				byLetter[letter].push(genre);
			}
			return byLetter;
		},

	}))
	.actions(self => ({

		setField: (field, value) => {
			self[field] = value;
		},

		// -

		update: (raw) => {
			self.by_id = {};
			for (const [genreId, genreRaw] of Object.entries(raw.by_id)) {
				const genre = GenreStore.create({});
				genre.update(genreRaw);
				self.by_id.set(genreId, genre);
			}
			self.loaded = true;
		},

		load: (callback) => {

			// Chargement des morceaux
			// ---

			const store = getRoot(self);

			const raw = store._readJsonFile(self.genresCollectionFilePath, {
				by_id: {},
			});
			self.update(raw);

			if (callback) {
				callback();
			}
		},

		save: (callback) => {

			// Sauvegarde des genres
			// ---

			const store = getRoot(self);
			store._writeJsonFile(self.genresCollectionFilePath, self.toJSON());

			if (callback) {
				callback();
			}
		},

		index: (metas) => {

			// Indexation d'un genre
			// ---

			let added = false;

			let genreId = metas.genreID;
			let genre = self.by_id.get(genreId);

			if (!genre) {
				genre = GenreStore.create({});
				genre.setField('id', genreId);
				added = true;
			}

			const tags = metas.fileTags;

			genre.setField('name', tags.genre[0]);

			genre.addAlbumId(metas.albumID);

			self.by_id.set(genreId, genre);
			return added;
		}

	}))


// Functions Components ReactJS
// ======================================================================================================

// ***** RenderGenres *****
// ************************

const TAG_RenderGenres = () => {}
export const RenderGenres = observer((props) => {

	const store = React.useContext(window.storeContext);
	const app = store.app;
	const genres = store.genres;

	// From ... store

	const isLoading = store.isLoading;

	const nbGenres = genres.nbGenres;
	const genresByLetter = genres.getByLetter();

	// ...

	const letters = Object.keys(genresByLetter);
	letters.sort();

	// Events
	// ==================================================================================================

	const handleThrowDiceClick = () => {
		// TODO
	}

	// -

	const handleLetterClick = (letter) => {
		// TODO
	}

	const handleFocusClick = (letter) => {
		// TODO
	}

	// -

	const handleGenreClick = (genreId) => {
		store.navigateTo('genre', genreId);
	}

	const handleShuffleClick = (genreId) => {
		// TODO
	}

	// Renderers
	// ==================================================================================================

	return (
		<div>

			<Ribbon
				avatarIconName="local_bar"
				avatarIconColor="typography"
				title={`${nbGenres} ${(nbGenres > 1) ? "Genres" : "Genre"}`}
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

			{letters.map((letter, letterIdx) => {

				const genresLetter = genresByLetter[letter];

				return (
					<Group
						id={`group-${letter}`}
						key={`group-${letter}-${letterIdx}`}
					>

						<GroupDivider
							spacing="big"
							left={(
								<IconButton
									color="secondary"
									onClick={() => handleLetterClick(letter)}
								>
									{letter.toUpperCase()}
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
									{genresLetter.length}
								</Avatar>
							)}
							right={(
								<IconButton
									iconName="arrow_forward"
									onClick={() => handleFocusClick(letter)}
								/>
							)}
						/>

						<TableContainer
							component={Paper}
							style={{
								marginLeft: '20px',
								marginRight: '20px',
								padding: '0px',
							}}
						>
							<Table>
								<TableBody>
									{genresLetter.map((genre, genreIdx) => (
										<TableRow
											key={`artist-${letter}-${genreIdx}`}
											hoverable={true}
											callbackClick={() => handleGenreClick(genre.id)}
										>
											<TableCell>
												{genre.name}
											</TableCell>
											<TableCell
												width="48px"
											>
												<IconButton
													size="small"
													iconName="shuffle"
													color="info"
													className="flex-0"
													onClick={(e) => {
														e.preventDefault();
														e.stopPropagation();
														handleShuffleClick(genre.id);
													}}
												/>
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						</TableContainer>

					</Group>
				)
			})}

		</div>
	)
})

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

	// Events
	// ==================================================================================================

	const handleMenuItemClick = () => {
		store.navigateTo(genresContext);
		app.menu.close();
	}

	// Render
	// ==================================================================================================

	return (
		<MenuItem
			iconName="local_bar"
			label="Genres"
			activeContexts={[genresContext, "genre"]}
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
	const genres = store.genres;

	// From ... store

	const loaded = store.loaded;
	const nbGenres = genres.nbGenres;

	// ...

	const showHelper = (!loaded || nbGenres == 0) ? true : false;

	// Renderers
	// ==================================================================================================

	const renderPage = () => {

		// Render :: Page
		// ---

		let pageContent = null;
		if (!showHelper) {
			pageContent = <RenderGenres />
		}
		return pageContent;
	}

	const renderHelper = () => {

		// Render :: Helper
		// ---

		return (
			<Helper
				iconName="local_bar"
				show={showHelper}
			/>
		)
	}

	return (
		<div className="nx-page">
			{renderPage()}
			{renderHelper()}
		</div>
	)
})
