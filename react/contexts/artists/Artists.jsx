import React from 'react';
import { types, getRoot } from "mobx-state-tree";
import { observer } from "mobx-react-lite";
import clsx from 'clsx';

import { ArtistStore } from 'gramophone_client/contexts/artist/Artist';

import { Heading } from 'nexus/forms/heading/Heading';
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

import './Artists.css';


// Models
// ======================================================================================================

// ***** ArtistsStore *****
// ************************

const TAG_ArtistsStore = () => {}
export const ArtistsStore = types
	.model({
		by_id: types.map(ArtistStore),

		loaded: false,
	})
	.views(self => ({

		get artistsCollectionFilePath() {
			const store = getRoot(self);
			const library = store.library;
			const path = ipc.sendSync('pathJoin', [library.collectionPath, 'artists.json']);
			return path;
		},

		get nbArtists() {
			return Object.entries(self.by_id.toJSON()).length;
		},

		// Getters
		// -

		getByLetter() {
			let byLetter = {};
			for (const [artistId, artist] of self.by_id.entries()) {
				const letter = artist.letter;
				if (!byLetter.hasOwnProperty(letter)) {
					byLetter[letter] = [];
				}
				byLetter[letter].push(artist);
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
			for (let [artistId, artistRaw] of Object.entries(raw.by_id)) {
				const artist = ArtistStore.create({});
				artist.update(artistRaw);
				self.by_id.set(artistId, artist);
			}
			self.loaded = true;
		},

		load: (callback) => {

			// Chargement des artistes
			// ---

			const store = getRoot(self);

			const raw = store._readJsonFile(self.artistsCollectionFilePath, {
				by_id: {},
			});
			self.update(raw);

			if (callback) {
				callback();
			}
		},

		save: (callback) => {

			// Sauvegarde des artistes
			// ---

			const store = getRoot(self);
			store._writeJsonFile(self.artistsCollectionFilePath, self.toJSON());

			if (callback) {
				callback();
			}
		},

		index: (metas) => {

			// Indexation d'un artiste
			// ---

			let added = false;

			let artistId = metas.artistID;
			let artist = self.by_id.get(artistId);

			if (!artist) {
				artist = ArtistStore.create({});
				artist.setField('id', artistId);
				added = true;
			}

			const tags = metas.fileTags;

			artist.setField('name', tags.albumartist);

			artist.addAlbumId(metas.albumID);

			self.by_id.set(artistId, artist);
			return added;
		}

	}))


// Functions Components ReactJS
// ======================================================================================================

// ***** RenderArtists *****
// *************************

const TAG_RenderArtists = () => {}
export const RenderArtists = observer((props) => {

	const store = React.useContext(window.storeContext);
	const app = store.app;
	const artists = store.artists;

	// From ... store

	const isLoading = app.isLoading;

	const nbArtists = artists.nbArtists;
	const artistsByLetter = artists.getByLetter();

	// ...

	const letters = Object.keys(artistsByLetter);
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

	const handleArtistClick = (artistId) => {
		store.navigateTo('artist', artistId);
	}

	const handleShuffleClick = (artistId) => {
		// TODO
	}

	// Renderers
	// ==================================================================================================

	return (
		<div>

			<Ribbon
				avatarIconName="face"
				avatarIconColor="typography"
				title={`${nbArtists} ${(nbArtists > 1) ? "Artistes" : "Artiste"}`}
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

				const artistsLetter = artistsByLetter[letter];

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
									{artistsLetter.length}
								</Avatar>
							)}
							right={(
								<IconButton
									iconName="arrow_forward"
									// color="hot"
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
									{artistsLetter.map((artist, artistIdx) => (
										<TableRow
											key={`artist-${letter}-${artistIdx}`}
											hoverable={true}
											callbackClick={() => handleArtistClick(artist.id)}
										>
											<TableCell>
												{artist.name}
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
														handleShuffleClick(artist.id);
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

	// Events
	// ==================================================================================================

	const handleMenuItemClick = () => {
		store.navigateTo(artistsContext);
		app.menu.close();
	}

	// Render
	// ==================================================================================================

	return (
		<MenuItem
			iconName="face"
			label="Artistes"
			activeContexts={[artistsContext, 'artist']}
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

	// From ... store

	const loaded = store.loaded;

	// ...

	const showHelper = (!loaded) ? true : false;

	// Renderers
	// ==================================================================================================

	const renderPage = () => {

		// Render :: Page
		// ---

		let pageContent = null;
		if (loaded) {
			pageContent = <RenderArtists />
		}
		return pageContent;
	}

	const renderHelper = () => {

		// Render :: Helper
		// ---

		return (
			<Helper
				iconName="face"
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
