import React from 'react';
import { types, getRoot } from "mobx-state-tree";
import { observer } from "mobx-react-lite";
import clsx from 'clsx';

import { Indicator } from 'nexus/forms/indicator/Indicator';
import {
	TableContainer,
	Table,
	TableHead,
	TableBody,
	TableRow,
	TableCell
} from 'nexus/forms/table/Table';
import { Field } from 'nexus/forms/field/Field';

import { Row } from 'nexus/layout/row/Row';
import { Column } from 'nexus/layout/column/Column';
import { Ribbon } from 'nexus/layout/ribbon/Ribbon';
import {
	GroupDivider,
	Group,
} from 'nexus/layout/group/Group';

import { Helper } from 'nexus/ui/helper/Helper';
import { Typography } from 'nexus/ui/typography/Typography';
import { IconButton } from 'nexus/ui/button/Button';
import { Avatar } from 'nexus/ui/avatar/Avatar';
import { Paper } from 'nexus/ui/paper/Paper';

import './Album.css';


// Models
// ======================================================================================================

// ***** AlbumStore *****
// **********************

const TAG_AlbumStore = () => {}
export const AlbumStore = types
	.model({
		id: types.maybeNull(types.string),
		name: types.maybeNull(types.string),
		cover: types.maybeNull(types.string),
		folder: types.maybeNull(types.string),
		year: types.maybeNull(types.integer),

		ts_added: types.maybeNull(types.string),

		artist_id: types.maybeNull(types.string),
		year_id: types.maybeNull(types.string),
		genre_id: types.maybeNull(types.string),
		tracks_ids: types.optional(types.array(types.string), []),
	})
	.views(self => ({

		get letter() {
			if (self.name) {
				return self.name[0].toLowerCase();
			}
			return "";
		},

		get nbTracks() {
			return self.tracks_ids.length;
		},

		// -

		get linkedArtist() {
			const store = getRoot(self);
			const artists = store.artists;
			return artists.getById(self.artist_id);
		},

		get linkedYear() {
			const store = getRoot(self);
			const years = store.years;
			return years.getById(self.year_id);
		},

		get linkedGenre() {
			const store = getRoot(self);
			const genres = store.genres;
			return genres.getById(self.genre_id);
		},

		// -

		get firstTrack() {
			const store = getRoot(self);
			const tracks = store.tracks;

			let firstTrackId = "";
			const sortedTracks = self.getSortedByNumber();
			if (sortedTracks.length > 0) {
				firstTrackId = sortedTracks[0].id;
			}
			return tracks.getById(firstTrackId);
		},

		// Getters
		// -

		getSortedByNumber() {

			const store = getRoot(self);
			const tracks = store.tracks;

			let tracksList = [];
			for (const trackId of self.tracks_ids) {
				const track = tracks.by_id.get(trackId);
				if (track) {
					tracksList.push(track);
				}
			}
			// tracksList.sort((a, b) => a.sortNumber - b.sortNumber);
			tracksList.sort(function (a, b) {
				if (a.sortNumber > b.sortNumber)
					return 1;
				if (a.sortNumber < b.sortNumber)
					return -1;
				return 0;
			});
			return tracksList;
		},

		// -

		groupedByDisc() {
			let byDisc = {};
			const tracks = self.getSortedByNumber();
			for (const track of tracks) {
				const discNumber = track.discNumber;
				if (!byDisc.hasOwnProperty(discNumber)) {
					byDisc[discNumber] = [];
				}
				byDisc[discNumber].push(track);
			}
			return byDisc;
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
			self.cover = raw.cover;
			self.folder = raw.folder;
			self.year = raw.year;

			self.ts_added = raw.ts_added;

			self.artist_id = raw.artist_id;
			self.year_id = raw.year_id;
			self.genre_id = raw.genre_id;
			self.tracks_ids = [];
			for (const trackId of raw.tracks_ids) {
				self.tracks_ids.push(trackId);
			}
		},

		addTrackId: (trackId) => {
			if (self.tracks_ids.indexOf(trackId) == -1) {
				self.tracks_ids.push(trackId);
			}
		},

	}))


// Functions Components ReactJS
// ======================================================================================================

// ***** RenderAlbum *****
// ***********************

const TAG_RenderAlbum = () => {}
export const RenderAlbum = observer((props) => {

	const store = React.useContext(window.storeContext);
	const app = store.app;
	const albums = store.albums;

	// From ... store

	const isLoading = app.isLoading;

	const albumId = store.albumId;
	const album = albums.by_id.get(albumId);

	const albumCover = album.cover;
	const albumName = album.name;

	const albumArtist = album.linkedArtist;
	const artistName = albumArtist.name;

	const albumGenre = album.linkedGenre;
	const genreName = albumGenre.upperName;

	const albumYear = album.linkedYear;
	const yearName = albumYear.name;

	const tracksByDiscs = album.groupedByDisc();
	const nbAlbumTracks = album.nbTracks;

	// ...

	const discs = Object.keys(tracksByDiscs);
	const nbDiscs = discs.length;
	discs.sort();

	// Events
	// ==================================================================================================

	const handlePlayAlbumClick = () => {
		// TODO
	}

	const handleThrowDiceClick = () => {
		// TODO
	}

	// -

	const handleDiscClick = (disc) => {
		// TODO
	}

	const handleFocusDisc = (disc) => {
		// TODO
	}

	// -

	const handleFavoriteClicked = (track) => {
		track.setField('favorite', !track.favorite);
	}

	const handleStarredClicked = (track) => {
		track.setField('starred', !track.starred);
	}

	const handleTrackMore = (trackId) => {
		// TODO
		console.log(trackId);
	}

	// Render
	// ==================================================================================================

	return (
		<div>

			<Row
				align="stretch"
				spacing="large"
				style={{
					marginBottom: '40px',
				}}
			>
				{albumCover && (
					<img
						className="g-album-cover"
						src={albumCover}
					/>
				)}
				<Column align="stretch">
					<div></div>
					<div className="flex-1">
						{albumName && (
							<Typography
								className="g-album-name"
								size="x-big"
							>
								{albumName}
							</Typography>
						)}
						{artistName && (
							<Typography
								className="g-album-artist"
								size="x-big"
								color="hot"
								style={{
									marginTop: '4px',
								}}
							>
								{artistName}
							</Typography>
						)}
						{(genreName || yearName) && (
							<Row
								align="center"
								style={{
									marginTop: '10px',
								}}
							>
								{genreName && (
									<Typography
										variant="description"
										size="small"
										// color="hot"
										className="flex-0"

									>
										{genreName}
									</Typography>
								)}
								{(genreName && yearName) && (
									<Typography
										variant="description"
										size="small"
										className="flex-0"
									>
										•
									</Typography>
								)}
								{yearName && (
									<Typography
										variant="description"
										size="small"
										// color="hot"
										className="flex-0"

									>
										{yearName}
									</Typography>
								)}
							</Row>
						)}
					</div>
					<div></div>
					<div className="flex-0">
						<Ribbon
							title={`${nbAlbumTracks} ${(nbAlbumTracks > 1) ? "Titres" : "Titre"}`}
							left={(
								<div className="h-col">
									<IconButton
										iconName="play_arrow"
										color="hot"
										disabled={isLoading}
										onClick={() => handlePlayAlbumClick()}
									/>
									<IconButton
										iconName="casino"
										color="hot"
										disabled={isLoading}
										style={{
											marginRight: '20px',
										}}
										onClick={() => handleThrowDiceClick()}
									/>
								</div>
							)}
							right={(
								<div className="h-col">
									<IconButton
										iconName="more_horiz"
										color="typography"
										disabled={isLoading}
										onClick={() => handleThrowDiceClick()}
									/>
								</div>
							)}
						/>
					</div>
				</Column>
			</Row>

			{discs.map((disc, discIdx) => {

				const discTracks = tracksByDiscs[disc];

				return (
					<Group
						id={`group-${disc}-${discIdx}`}
						key={`group-${disc}-${discIdx}`}
					>

						{nbDiscs > 1 && (
							<GroupDivider
								spacing="big"
								left={(
									<IconButton
										iconName="album"
										onClick={() => handleDiscClick(disc)}
									/>
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
										{disc}
									</Avatar>
								)}
								right={(
									<IconButton
										iconName="arrow_forward"
										onClick={() => handleFocusDisc(disc)}
									/>
								)}
							/>
						)}

						<TableContainer
							component={Paper}
							style={{
								marginTop: '60px',
								marginLeft: '16px',
								marginRight: '16px',
								padding: '0px',
							}}
						>
							<Table>

								<TableHead>
									<TableRow>
										<TableCell
											header={true}
											width={42}
											align="center"
										>
										</TableCell>
										<TableCell
											header={true}
											width={42}
											align="center"
										>
										</TableCell>
										<TableCell
											header={true}
											width={42}
											align="center"
										>
											Mix
										</TableCell>
										<TableCell
											header={true}
											width={42}
										>
											N°
										</TableCell>
										<TableCell header={true}>
											Titre
										</TableCell>
										<TableCell
											header={true}
											width={42}
											align="right"
										>
										</TableCell>
									</TableRow>
								</TableHead>

								<TableBody>
									{discTracks.map((track, trackIdx) => (
										<TableRow
											key={`track-${disc}-${trackIdx}`}
											hoverable={true}
										>
											<TableCell
												width={42}
												align="center"
												size="tiny"
											>
												<Field
													component='checkbox'
													ghostLabel={false}
													savePath={['tracks', 'by_id', track.id, 'checked']}
													disabled={isLoading}
												/>
											</TableCell>
											<TableCell
												width={42}
												align="center"
												size="tiny"
											>
												<IconButton
													size="small"
													iconName={(track.favorite) ? "favorite" : "favorite_border"}
													color={(track.favorite) ? "error" : null}
													disabled={isLoading}
													onClick={() => handleFavoriteClicked(track)}
												/>
											</TableCell>
											<TableCell
												width={42}
												align="center"
												size="tiny"
											>
												<IconButton
													size="small"
													iconName={(track.starred) ? "star" : "star_outline"}
													color={(track.starred) ? "warning" : null}
													disabled={isLoading}
													onClick={() => handleStarredClicked(track)}
												/>
											</TableCell>
											<TableCell
												width={42}
												size="tiny"
											>
												{track.track}
											</TableCell>
											<TableCell
												size="tiny"
											>
												{track.name}
											</TableCell>
											<TableCell
												width={42}
												align="right"
												size="tiny"
											>
												<IconButton
													size="small"
													iconName="more_horiz"
													color="typography"
													// style={{
													// 	marginRight: '-5px'
													// }}
													onClick={() => handleTrackMore(track.id)}
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

// ***** AlbumPage *****
// *********************

const TAG_AlbumPage = () => {}
export const AlbumPage = observer((props) => {

	const store = React.useContext(window.storeContext);
	const app = store.app;

	// From ... store

	const loaded = store.loaded;
	const albumId = store.albumId;

	// ...

	const showHelper = (!loaded || !albumId) ? true : false;

	// Render
	// ==================================================================================================

	const renderPage = () => {

		// Render :: Page
		// ---

		let pageContent = null;
		if (loaded) {
			pageContent = <RenderAlbum />
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

	// -------------------------------------------------

	return (
		<div className="nx-page medium">
			{renderPage()}
			{renderHelper()}
		</div>
	)
})
