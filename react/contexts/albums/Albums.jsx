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

import { dateTools } from 'nexus/utils/DateTools';

import './Albums.css';


// Models
// ======================================================================================================

// ***** AlbumsStore *****
// ***********************

const TAG_AlbumsStore = () => {}
export const AlbumsStore = types
	.model({
		by_id: types.map(AlbumStore),

		last_added_ids: types.optional(types.array(types.string), []),

		loaded: false,
	})
	.views(self => ({

		get albumsCollectionFilePath() {
			const store = getRoot(self);
			const library = store.library;
			const path = ipc.sendSync('pathJoin', [library.collectionPath, 'albums.json']);
			return path;
		},

		get albumsList() {
			return self.by_id.toJSON().values();
		},

		get nbAlbums() {
			return Object.entries(self.by_id.toJSON()).length;
		},

		// Getters
		// -

		groupedByLetter() {
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

		// -

		getById(albumId) {
			let album = self.by_id.get(albumId);
			if (!album) {
				album = AlbumStore.create({});
			}
			return album;
		},

		getLastAdded(maxAlbums) {

			// Récupération des derniers albums rajoutés
			// ---

			let lastAdded = [];
			for (const lastAddedIdx in self.last_added_ids) {
				if (lastAdded.length < maxAlbums) {
					const albumId = self.last_added_ids[lastAddedIdx];
					const album = self.by_id.get(albumId);
					if (album) {
						lastAdded.push(album);
					}
				} else {
					break;
				}
			}
			return lastAdded;
		},

		getRandomly(howMany, load=true) {

			// Récupération aléatoire d'un certain nombre d'albums
			// ---

			const store = getRoot(self);
			const app = store.app;
			const helpers = app.helpers;

			// Il y en a-t-il assez ?
			const nbAlbums = self.nbAlbums;
			if (howMany > nbAlbums) {
				howMany = nbAlbums;
			}

			const albumIds = Array.from(self.by_id.keys());

			let randomAlbums = [];
			let randomAlbumsIdxs = [];
			let randomAlbumsIds = [];

			while (randomAlbumsIds.length < howMany) {
				const randomIdx = helpers.getRandomNumber(albumIds.length) - 1;
				if (randomAlbumsIdxs.indexOf(randomIdx) == -1) {
					const albumId = albumIds[randomIdx];
					randomAlbumsIdxs.push(randomIdx);
					randomAlbumsIds.push(albumId);
					if (load) {
						const album = self.by_id.get(albumId);
						if (album) {
							randomAlbums.push(album);
						}
					}
				}
			}
			return (load) ? randomAlbums : randomAlbumsIds;
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
			const app = store.app;

			store._readJsonFile(
				self.albumsCollectionFilePath,
				{
					by_id: {},
					last_added_ids: [],
				},
				(raw) => {
					// self.update(raw);
					// app.saveValue(['albums', 'by_id'], raw.by_id, () => {
					// 	self.setField('loaded', true);
					// 	if (callback) {
					// 		callback();
					// 	}
					// });
					app.applyPatches(
						[
							[['albums', 'by_id'], raw.by_id],
							[['albums', 'last_added_ids'], raw.last_added_ids],
						],
						() => {
							self.setField('loaded', true);
							if (callback) {
								callback();
							}
						}
					);
				}
			);
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
				album.setField('ts_added', dateTools.getNowIso());
				self.addLastAddedId(albumId);
				added = true;
			} else {
				if (self.last_added_ids.length < 10) {
					self.addLastAddedId(albumId);
				}
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
		},

		// -

		addLastAddedId: (albumId) => {
			if (self.last_added_ids.indexOf(albumId) > -1) {
				return;
			}
			if (self.last_added_ids.length >= 10) {
				self.last_added_ids.splice(0, 1);
			}
			self.last_added_ids.push(albumId);
		},

	}))


// Functions Components ReactJS
// ======================================================================================================

// ***** AlbumThumbnail *****
// **************************

const TAG_AlbumThumbnail = () => {}
export const AlbumThumbnail = observer((props) => {

	const store = React.useContext(window.storeContext);
	const app = store.app;

	// From ... state

	let [hover, setHover] = React.useState(false);

	// From ... props

	const isPlaying = (props.isPlaying == true) ? true : false;

	const album = props.album;

	const callbackClick = props.callbackClick;

	let style = (props.style) ? props.style : style;

	// ...

	// Events
	// ==================================================================================================

	const handleEnter = (evt) => {
		setHover(true);
	}

	const handleLeave = (evt) => {
		setHover(false);
	}

	// -

	const handleArtistClick = (artistId) => {
		store.navigateTo("artist", artistId);
	}

	// Render
	// ==================================================================================================

	// Thumbnail :: Bottom Right
	// ---------------------------------------------------

	let bottomRight = null;
	if (hover) {
		bottomRight = (
			<Avatar
				iconName="shuffle"
				iconVariant="filled"
				// iconColor="#FFFFFF"
				iconColor="info"
				color="transparent"
				size="tiny"
				style={{
					margin: '5px',
					// opacity: '0.9',
					stopPropagation: true,
					backdropFilter: 'blur(4px)',
				}}
				onClick={(e) => {
					e.preventDefault();
					e.stopPropagation();
					album.shuffle();
				}}
			/>
		)
	}

	// Thumbnail :: Bottom Left
	// ---------------------------------------------------

	let bottomLeft = null;
	if (hover) {
		bottomLeft = (
			<Avatar
				iconName={(isPlaying) ? "pause" : "play_arrow"}
				iconVariant="filled"
				// iconColor="#FFFFFF"
				iconColor="hot"
				color="transparent"
				size="tiny"
				style={{
					margin: '5px',
					// opacity: '0.9',
					stopPropagation: true,
					backdropFilter: 'blur(4px)',
				}}
				onClick={(e) => {
					e.preventDefault();
					e.stopPropagation();
					album.play();
				}}
			/>
		)
	}

	// ---------------------------------------------------

	return (
		<Thumbnail
			src={album.cover}
			iconName="album"
			title={album.name}
			subtitle={album.linkedArtist.name}
			size="small"

			bottomRight={bottomRight}
			bottomLeft={bottomLeft}

			rootStyle={style}

			callbackEnter={handleEnter}
			callbackLeave={handleLeave}
			callbackClick={callbackClick}
			callbackSubtitle={(e) => {
				e.preventDefault();
				e.stopPropagation();
				handleArtistClick(album.linkedArtist.id)
			}}
		/>
	)
})

// ***** RenderAlbums *****
// ************************

const TAG_RenderAlbums = () => {}
export const RenderAlbums = observer((props) => {

	const store = React.useContext(window.storeContext);
	const app = store.app;
	const albums = store.albums;
	const tracks = store.tracks;
	const popupJumpTo = store.popupJumpTo;

	// From ... store

	const isLoading = store.isLoading;
	const focusKey = app.focusKey;

	const nbAlbums = albums.nbAlbums;
	const albumsByLetter = albums.groupedByLetter();

	// ...

	const letters = Object.keys(albumsByLetter);
	letters.sort();

	// Events
	// ==================================================================================================

	const handleThrowDiceClick = () => {
		tracks.shuffle();
	}

	// -

	const handleLetterClick = (letter) => {
		popupJumpTo.setField("scope", "standard");
		popupJumpTo.setField("chars", letters);
		popupJumpTo.setField("current", letter);
		popupJumpTo.open();
	}

	const handleFocusClick = (focusKey) => {
		app.focus(focusKey);
	}

	const handleUnfocusClick = () => {
		app.unfocus();
	}

	// -

	const handleAlbumClick = (albumId) => {
		store.navigateTo('album', albumId);
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

				// Focus sur une lettre en particulier ?
				if (focusKey && focusKey != letter) {
					return;
				}

				// Fantômes flex
				let letterGhosts = []
				for (var i = 0; i < 10; i++) {
					letterGhosts.push(
						<ThumbnailGhost
							key={`thumbnail-ghost-${letterIdx}-${i}`}
							size="small"
							style={{
								marginRight: '16px',
							}}
						/>
					)
				}

				return (
					<Group
						id={`group-${letter}`}
						key={`group-${letter}`}
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
								<React.Fragment>
									{(focusKey != letter) && (
										<IconButton
											iconName="arrow_forward"
											// color="hot"
											onClick={() => handleFocusClick(letter)}
										/>
									)}
									{(focusKey == letter) && (
										<IconButton
											iconName="close"
											// color="hot"
											onClick={() => handleUnfocusClick()}
										/>
									)}
								</React.Fragment>
							)}
						/>

						<Grid
							style={{
								paddingLeft: '20px',
								paddingRight: '20px',
							}}
						>
							{albumsLetter.map((album, albumIdx) => (
								<AlbumThumbnail
									key={`thumbnail-album-${letterIdx}-${albumIdx}`}
									album={album}
									style={{
										marginRight: '20px',
										marginBottom: '30px',
									}}
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

	// From ... props

	const disabled = props.disabled;

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
			disabled={disabled}
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
