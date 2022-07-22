import React from 'react';
import { types, getRoot } from "mobx-state-tree";
import { observer } from "mobx-react-lite";
import clsx from 'clsx';

import { AlbumThumbnail } from 'gramophone_client/contexts/albums/Albums';

import { Ribbon } from 'nexus/layout/ribbon/Ribbon';
import { Row } from 'nexus/layout/row/Row';
import { Grid } from 'nexus/layout/grid/Grid';

import { Helper } from 'nexus/ui/helper/Helper';
import { IconButton } from 'nexus/ui/button/Button';
import { Typography } from 'nexus/ui/typography/Typography';
import { ThumbnailGhost } from 'nexus/ui/thumbnail/Thumbnail';

import './Genre.css';


// Models
// ======================================================================================================

// ***** GenreStore *****
// **********************

const TAG_GenreStore = () => {}
export const GenreStore = types
	.model({
		id: types.maybeNull(types.string),
		name: types.maybeNull(types.string),

		albums_ids: types.optional(types.array(types.string), []),
	})
	.views(self => ({

		get letter() {
			if (self.name) {
				return self.name[0].toLowerCase();
			}
			return "";
		},

		get upperName() {
			if (self.name) {
				return self.name.toUpperCase();
			}
			return "";
		},

		get nbAlbums() {
			return self.albums_ids.length;
		},

		// Getters
		// -

		getAlbums() {
			const store = getRoot(self);
			const albums = store.albums;

			let albumsList = [];
			for (const albumId of self.albums_ids) {
				const album = albums.by_id.get(albumId);
				if (album) {
					albumsList.push(album);
				}
			}
			albumsList.sort(function (a, b) {
				if (a.year < b.year)
					return 1;
				if (a.year > b.year)
					return -1;
				return 0;
			});
			return albumsList;
		},

		getTracks(load=true, filter="all") {
			const store = getRoot(self);
			const app = store.app;
			const helpers = app.helpers;
			const albums = store.albums;
			const tracks = store.tracks;

			let tracksList = [];
			let tracksIds = [];

			for (const albumId of self.albums_ids) {
				const album = albums.by_id.get(albumId);
				if (album) {
					if (load) {
						helpers.extendArray(tracksList, album.getTracks(load, filter));
					} else {
						helpers.extendArray(tracksIds, album.getTracks(load, filter));
					}
				}
			}
			return (load) ? tracksList : tracksIds;
		},

		getTracksRandomly(load=true, howMany) {
			const store = getRoot(self);
			const app = store.app;
			const helpers = app.helpers;

			const tracksList = self.getTracks(load, "shuffle");
			return helpers.shuffleArray(tracksList, howMany);
		},

	}))
	.actions(self => ({

		setField: (field, value) => {
			self[field] = value;
		},

		// -

		update: (raw) => {
			self.id = raw.id;
			self.name = raw.name;

			self.albums_ids = [];
			for (const albumId of raw.albums_ids) {
				self.albums_ids.push(albumId);
			}
		},

		addAlbumId: (albumId) => {
			if (self.albums_ids.indexOf(albumId) == -1) {
				self.albums_ids.push(albumId);
			}
		},

		// -

		shuffle: () => {

			// Lecture aléatoire des morceaux du genre (100 au max)
			// ---

			const store = getRoot(self);
			const player = store.player;

			const playbackIds = self.getTracksRandomly(false, 100);
			player.audioStop();
			player.clear();
			player.populate(playbackIds);
			player.read();
		},

	}))


// Functions Components ReactJS
// ======================================================================================================

// ***** RenderGenre *****
// ***********************

const TAG_RenderGenre = () => {}
export const RenderGenre = observer((props) => {

	const store = React.useContext(window.storeContext);
	const app = store.app;
	const genres = store.genres;

	// From ... store

	const isLoading = app.isLoading;

	const genreId = store.genreId;
	const genre = genres.by_id.get(genreId);
	const genreName = genre.name;

	const nbAlbums = genre.nbAlbums;
	const albums = genre.getAlbums();

	// ...

	// Events
	// ==================================================================================================

	const handleThrowDiceClick = () => {
		// TODO
	}

	// -

	const handleAlbumClick = (albumId) => {
		store.navigateTo("album", albumId);
	}

	// Render
	// ==================================================================================================

	// Fantômes flex
	let ghosts = []
	for (var i = 0; i < 10; i++) {
		ghosts.push(
			<ThumbnailGhost
				key={`thumbnail-ghost-${i}`}
				size="small"
				style={{
					marginRight: '16px',
				}}
			/>
		)
	}

	return (
		<div>

			<Ribbon
				avatarIconName="face"
				avatarIconColor="typography"
				title={genreName}
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
			>
				<Row>
					<Typography
						variant="description"
						// size="small"
						className="flex-0"
						style={{
							marginLeft: '10px'
						}}
					>
						•
					</Typography>
					<Typography
						variant="description"
						// size="small"
						className="flex-0"
					>
						{nbAlbums} {(nbAlbums > 1) ? "albums" : "album"}
					</Typography>
				</Row>
			</Ribbon>

			<Grid
				style={{
					marginTop: '40px',
					paddingLeft: '20px',
					paddingRight: '20px',
				}}
			>
				{albums.map((album, albumIdx) => (
					<AlbumThumbnail
						key={`thumbnail-album-${albumIdx}`}
						album={album}
						style={{
							marginRight: '20px',
							marginBottom: '30px',
						}}
						callbackClick={() => handleAlbumClick(album.id)}
					/>
				))}
				{ghosts}
			</Grid>

		</div>
	)
})

// ***** GenrePage *****
// *********************

const TAG_GenrePage = () => {}
export const GenrePage = observer((props) => {

	const store = React.useContext(window.storeContext);
	const app = store.app;

	// From ... store

	const loaded = store.loaded;
	const genreId = app.genreId;

	// ...

	const showHelper = (!loaded && !genreId) ? true : false;

	// Render
	// ==================================================================================================

	const renderPage = () => {

		// Render :: Page
		// ---

		let pageContent = null;
		if (loaded) {
			pageContent = <RenderGenre />
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

	// -------------------------------------------------

	return (
		<div className="nx-page medium">
			{renderPage()}
			{renderHelper()}
		</div>
	)
})
