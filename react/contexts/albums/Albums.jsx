import React from 'react';
import { types, getRoot } from "mobx-state-tree";
import { observer } from "mobx-react-lite";
import clsx from 'clsx';

import { AlbumStore } from 'gramophone_client/contexts/album/Album';

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
	Thumbnail,
	ThumbnailGhost
} from 'nexus/ui/thumbnail/Thumbnail';

import './Albums.css';


// Models
// ======================================================================================================

// ***** AlbumsStore *****
// ***********************

const TAG_AlbumsStore = () => {}
export const AlbumsStore = types
	.model({
		by_id: types.map(AlbumStore),

		loaded: false,
	})
	.views(self => ({

		get albumsCollectionFilePath() {
			const store = getRoot(self);
			const library = store.library;
			const path = ipc.sendSync('pathJoin', [library.collectionPath, 'albums.json']);
			return path;
		},

		get nbAlbums() {
			return Object.entries(self.by_id.toJSON()).length;
		},

		// Getters
		// -

		getByLetter() {
			let byLetter = {};
			for (const [albumId, album] of self.by_id.entries()) {
				const letter = album.letter;
				if (!byLetter.hasOwnProperty(letter)) {
					byLetter[letter] = [];
				}
				byLetter[letter].push(album);
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
			for (let [albumId, albumRaw] of Object.entries(raw.by_id)) {
				const album = AlbumStore.create({});
				album.update(albumRaw);
				self.by_id.set(albumId, album);
			}
			self.loaded = true;
		},

		load: (callback) => {

			// Chargement des albums
			// ---

			const store = getRoot(self);

			const raw = store._readJsonFile(self.albumsCollectionFilePath, {
				by_id: {},
			});
			self.update(raw);

			if (callback) {
				callback();
			}
		},

		save: (callback) => {

			// Sauvegarde des albums
			// ---

			const store = getRoot(self);
			store._writeJsonFile(self.albumsCollectionFilePath, self.toJSON());

			if (callback) {
				callback();
			}
		},

		index: (metas) => {

			// Indexation d'un album
			// ---

			let added = false;

			let albumId = metas.albumID;
			let album = self.by_id.get(albumId);

			if (!album) {
				album = AlbumStore.create({});
				album.setField('id', albumId);
				added = true;
			}

			const tags = metas.fileTags;

			album.setField('name', tags.album);
			album.setField('cover', metas.coverFile);
			album.setField('folder', metas.fileFolder);
			album.setField('year', tags.year);

			album.setField('artist_id', metas.artistID);
			album.setField('year_id', metas.yearID);
			album.setField('genre_id', metas.genreID);
			album.addTrackId(metas.trackID);

			self.by_id.set(albumId, album);
			return added;
		}

	}))


// Functions Components ReactJS
// ======================================================================================================

// ***** RenderAlbums *****
// ************************

const TAG_RenderAlbums = () => {}
export const RenderAlbums = observer((props) => {

	const store = React.useContext(window.storeContext);
	const app = store.app;
	const albums = store.albums;

	// From ... store

	const isLoading = store.isLoading;

	const nbAlbums = albums.nbAlbums;
	const albumsByLetter = albums.getByLetter();

	// ...

	const letters = Object.keys(albumsByLetter);
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

	const handleAlbumClick = (albumId) => {
		store.navigateTo('album', albumId);
	}

	const handleShuffleClick = (albumId) => {
		// TODO
	}

	// Render
	// ==================================================================================================

	return (
		<div>

			<Ribbon
				avatarIconName="album"
				avatarIconColor="typography"
				title={`${nbAlbums} ${(nbAlbums > 1) ? "Albums" : "Album"}`}
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

				const albumsLetter = albumsByLetter[letter];

				// Fantômes flex
				let letterGhosts = []
				for (var i = 0; i < 10; i++) {
					letterGhosts.push(
						<ThumbnailGhost
							key={`thumbnail-ghost-${i}`}
							size="small"
						/>
					)
				}

				return (
					<Group
						id={`group-${letter}`}
						key={`group-${letter}-${letterIdx}`}
						style={{
							marginBottom: '40px',
						}}
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
									{albumsLetter.length}
								</Avatar>
							)}
							right={(
								<IconButton
									iconName="arrow_forward"
									onClick={() => handleFocusClick(letter)}
								/>
							)}
						/>

						<Grid
							style={{
								paddingLeft: '20px',
								paddingRight: '20px',
							}}
						>
							{albumsLetter.map((album, albumIdx) => (
								<Thumbnail
									key={`thumbnail-album-${albumIdx}`}
									src={album.cover}
									iconName="album"
									title={album.name}
									subtitle={album.artist.name}
									size="small"
									callbackClick={() => handleAlbumClick(album.id)}
								/>
							))}
							{letterGhosts}
						</Grid>

					</Group>
				)
			})}

		</div>
	)
})

// ***** AlbumsHeaderLeft *****
// *****************************

const TAG_AlbumsHeaderLeft = () => {}
export const AlbumsHeaderLeft = observer((props) => {

	const store = React.useContext(window.storeContext);
	const app = store.app;

	// ...

	// Render
	// ==================================================================================================

	return (
		<HeaderTitle
			title="Albums"
			titleStyle={{
				marginLeft: '10px',
			}}
		/>
	)
})

// ***** AlbumsMenuItem *****
// **************************

const TAG_AlbumsMenuItem = () => {}
export const AlbumsMenuItem = observer((props) => {

	const store = React.useContext(window.storeContext);
	const app = store.app;
	const menu = app.menu;

	// ...

	const albumsContext = 'albums';

	// Events
	// ==================================================================================================

	const handleMenuItemClick = () => {
		store.navigateTo(albumsContext);
		app.menu.close();
	}

	// Render
	// ==================================================================================================

	return (
		<MenuItem
			iconName="album"
			label="Albums"
			activeContexts={[albumsContext, "album"]}
			callbackClick={handleMenuItemClick}
		/>
	)
})

// ***** AlbumsPage *****
// **********************

const TAG_AlbumsPage = () => {}
export const AlbumsPage = observer((props) => {

	const store = React.useContext(window.storeContext);
	const app = store.app;
	const albums = store.albums;

	// From ... store

	const loaded = store.loaded;
	const nbAlbums = albums.nbAlbums;

	// ...

	const showHelper = (!loaded || nbAlbums == 0) ? true : false;

	// Renderers
	// ==================================================================================================

	const renderPage = () => {

		// Render :: Page
		// ---

		let pageContent = null;
		if (!showHelper) {
			pageContent = <RenderAlbums />
		}
		return pageContent;
	}

	const renderHelper = () => {

		// Render :: Helper
		// ---

		return (
			<Helper
				iconName="album"
				show={showHelper}
			/>
		)
	}

	return (
		<div className="nx-page even large">
			{renderPage()}
			{renderHelper()}
		</div>
	)
})
