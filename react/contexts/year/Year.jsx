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

import './Year.css';


// Models
// ======================================================================================================

// ***** YearStore *****
// **********************

const TAG_YearStore = () => {}
export const YearStore = types
	.model({
		id: types.maybeNull(types.string),
		name: types.maybeNull(types.string),

		albums_ids: types.optional(types.array(types.string), []),
	})
	.views(self => ({

		get decade() {
			if (self.name && self.name.length >= 2) {
				return `${self.name.substring(0, self.name.length - 1)}0`;
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
				if (a.name > b.name)
					return 1;
				if (a.name < b.name)
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

			// Lecture aléatoire des morceaux de l'année (100 au max)
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

// ***** RenderYear *****
// **********************

const TAG_RenderYear = () => {}
export const RenderYear = observer((props) => {

	const store = React.useContext(window.storeContext);
	const app = store.app;
	const years = store.years;

	// From ... store

	const isLoading = app.isLoading;

	const yearId = store.yearId;
	const year = years.by_id.get(yearId);
	const yearName = year.name;

	const nbAlbums = year.nbAlbums;
	const albums = year.getAlbums();

	// ...

	// Events
	// ==================================================================================================

	const handleThrowDiceClick = () => {
		year.shuffle();
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
				title={yearName}
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

// ***** YearPage *****
// ********************

const TAG_YearPage = () => {}
export const YearPage = observer((props) => {

	const store = React.useContext(window.storeContext);
	const app = store.app;

	// From ... store

	const loaded = store.loaded;
	const yearId = app.yearId;

	// ...

	const showHelper = (!loaded && !yearId) ? true : false;

	// Render
	// ==================================================================================================

	const renderPage = () => {

		// Render :: Page
		// ---

		let pageContent = null;
		if (loaded) {
			pageContent = <RenderYear />
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

	// -------------------------------------------------

	return (
		<div className="nx-page medium">
			{renderPage()}
			{renderHelper()}
		</div>
	)
})
