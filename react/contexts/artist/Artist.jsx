import React from 'react';
import { types, getRoot } from "mobx-state-tree";
import { observer } from "mobx-react-lite";
import clsx from 'clsx';

import { AlbumThumbnail } from 'gramophone_client/contexts/albums/Albums';

import {
	TableRow,
	TableCell
} from 'nexus/forms/table/Table';

import { Ribbon } from 'nexus/layout/ribbon/Ribbon';
import { Row } from 'nexus/layout/row/Row';
import { Grid } from 'nexus/layout/grid/Grid';

import { Helper } from 'nexus/ui/helper/Helper';
import { IconButton } from 'nexus/ui/button/Button';
import { Typography } from 'nexus/ui/typography/Typography';
import { ThumbnailGhost } from 'nexus/ui/thumbnail/Thumbnail';

import { getLetter } from 'nexus/utils/Datas';

import './Artist.css';


// Models
// ======================================================================================================

// ***** ArtistStore *****
// ***********************

const TAG_ArtistStore = () => {}
export const ArtistStore = types
	.model({
		id: types.maybeNull(types.string),
		name: types.maybeNull(types.string),

		albums_ids: types.optional(types.array(types.string), []),
	})
	.views(self => ({

		get letter() {
			if (self.name) {
				return getLetter(self.name);
			}
			return "";
		},

		get nbAlbums() {
			return self.albums_ids.length;
		},

		get description() {
			const nbAlbums = self.nbAlbums;
			const description = `${nbAlbums} ${(nbAlbums > 1) ? "albums" : "album"}`;
			return description;
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
				if (a.year > b.year)
					return 1;
				if (a.year < b.year)
					return -1;
				return 0;
			});
			return albumsList;
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

		removeAlbumId: (albumId) => {
			const albumIdx = self.albums_ids.indexOf(albumId);
			if (albumIdx > -1) {
				self.albums_ids.splice(albumIdx, 1);
			}
		},

		// -

		play: () => {

			// Lecture de tous les morceaux de l'artiste
			// ---

			const store = getRoot(self);
			const app = store.app;
			const helpers = app.helpers;
			const player = store.player;

			let trackIds = [];

			const albums = self.getAlbums();
			for (const album of albums) {
				const albumsTrackIds = album.getPlayable(false);
				helpers.extendArray(trackIds, albumsTrackIds);
			}

			player.audioStop();
			player.clear();
			player.populate(trackIds);
			player.read();
		},

		shuffle: () => {

			// Lecture aléatoire de tous les morceaux de l'artiste
			// ---

			const store = getRoot(self);
			const app = store.app;
			const helpers = app.helpers;
			const player = store.player;

			let trackIds = [];

			const albums = self.getAlbums();
			for (const album of albums) {
				const albumsTrackIds = album.getPlayable(false);
				helpers.extendArray(trackIds, albumsTrackIds);
			}
			trackIds = helpers.shuffleArray(trackIds);

			player.audioStop();
			player.clear();
			player.populate(trackIds);
			player.read();
		},

	}))


// Functions Components ReactJS
// ======================================================================================================

// ***** ArtistRow *****
// *********************

const TAG_ArtistRow = () => {}
export const ArtistRow = observer((props) => {

	const store = React.useContext(window.storeContext);
	const app = store.app;

	// From ... state

	let [hover, setHover] = React.useState(false);

	// From ... props

	const artist = props.artist;

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

	const handleArtistClick = () => {
		store.navigateTo('artist', artist.id);
	}

	const handleShuffleClick = () => {
		artist.shuffle();
	}

	const handlePlayClick = () => {
		artist.play();
	}

	// Render
	// ==================================================================================================

	return (
		<TableRow
			hoverable={true}
			callbackEnter={handleEnter}
			callbackLeave={handleLeave}
			forceHover={hover}
			callbackClick={() => handleArtistClick()}
		>
			<TableCell
				size="small"
			>
				{artist.name}
			</TableCell>
			<TableCell
				size="small"
				width="100px"
				align="right"
			>
				<Typography
					size="small"
					variant="description"
					align="right"
				>
					{`${artist.nbAlbums} ${(artist.nbAlbums > 1) ? "albums" : "album"}`}
				</Typography>
			</TableCell>
			<TableCell
				width="36px"
				size="small"
			>
				<IconButton
					size="small"
					iconName="shuffle"
					color="info"
					className="flex-0"
					onClick={(e) => {
						e.preventDefault();
						e.stopPropagation();
						handleShuffleClick();
					}}
				/>
			</TableCell>
			<TableCell
				width="36px"
				size="small"
			>
				<IconButton
					size="small"
					iconName="play_arrow"
					color="hot"
					className="flex-0"
					onClick={(e) => {
						e.preventDefault();
						e.stopPropagation();
						handlePlayClick();
					}}
				/>
			</TableCell>
		</TableRow>
	)
})

// ***** RenderArtist *****
// ************************

const TAG_RenderArtist = () => {}
export const RenderArtist = observer((props) => {

	const store = React.useContext(window.storeContext);
	const app = store.app;
	const artists = store.artists;

	// From ... store

	const isLoading = app.isLoading;

	const artistId = store.artistId;
	const artist = artists.by_id.get(artistId);
	const artistName = artist.name;

	const nbAlbums = artist.nbAlbums;
	const albums = artist.getAlbums();

	// ...

	// Events
	// ==================================================================================================

	const handlePlayClick = () => {
		artist.play();
	}

	const handleThrowDiceClick = () => {
		artist.shuffle();
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
				title={artistName}
				right={(
					<div className="h-col">
						<IconButton
							iconName="play_arrow"
							color="hot"
							disabled={isLoading}
							onClick={() => handlePlayClick()}
						/>
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

// ***** ArtistPage *****
// **********************

const TAG_ArtistPage = () => {}
export const ArtistPage = observer((props) => {

	const store = React.useContext(window.storeContext);
	const app = store.app;

	// From ... store

	const loaded = store.loaded;
	const artistId = app.artistId;

	// ...

	const showHelper = (!loaded && !artistId) ? true : false;

	// Render
	// ==================================================================================================

	const renderPage = () => {

		// Render :: Page
		// ---

		let pageContent = null;
		if (loaded) {
			pageContent = <RenderArtist />
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

	// -------------------------------------------------

	return (
		<div className="nx-page">
			{renderPage()}
			{renderHelper()}
		</div>
	)
})
