import React from 'react';
import { types, getRoot } from "mobx-state-tree";
import { observer } from "mobx-react-lite";
import clsx from 'clsx';

import { ArtistStore } from 'gramophone_client/contexts/artist/Artist';
import { ArtistRow } from 'gramophone_client/contexts/artist/Artist';

import { AlbumStore } from 'gramophone_client/contexts/album/Album';
import { AlbumThumbnail } from 'gramophone_client/contexts/albums/Albums';

import { TrackStore } from 'gramophone_client/contexts/track/Track';
import { TrackRow } from 'gramophone_client/contexts/track/Track';

import { PlaylistStore } from 'gramophone_client/contexts/playlist/Playlist';
import { PlaylistRow } from 'gramophone_client/contexts/playlist/Playlist';

import {
	TableContainer,
	Table,
	TableHead,
	TableBody,
	TableRow,
	TableCell
} from 'nexus/forms/table/Table';

import {
	GroupDivider,
	Group,
} from 'nexus/layout/group/Group';
import { Grid } from 'nexus/layout/grid/Grid';

import { Helper } from 'nexus/ui/helper/Helper';
import { Icon } from 'nexus/ui/icon/Icon';
import { Typography } from 'nexus/ui/typography/Typography';
import { Avatar } from 'nexus/ui/avatar/Avatar';
import { Paper } from 'nexus/ui/paper/Paper';
import { ThumbnailGhost } from 'nexus/ui/thumbnail/Thumbnail';

import { sanitizeString } from 'nexus/utils/Helpers';

import './Search.css';


// Models
// ======================================================================================================

// ***** SearchStore *****
// ***********************

const TAG_SearchStore = () => {}
export const SearchStore = types
	.model({
		query: '',

		artistsSummaries: types.optional(types.array(ArtistStore), []),
		albumsSummaries: types.optional(types.array(AlbumStore), []),
		tracksSummaries: types.optional(types.array(TrackStore), []),
		playlistsSummaries: types.optional(types.array(PlaylistStore), []),
	})
	.views(self => ({

		get nbResults() {

			const nbArtists = self.artistsSummaries.length;
			const nbAlbums = self.albumsSummaries.length;
			const nbTracks = self.tracksSummaries.length;
			const nbPlaylists = self.playlistsSummaries.length;

			return nbArtists + nbAlbums + nbTracks + nbPlaylists;
		},

	}))
	.actions(self => ({

		setField: (field, value) => {
			self[field] = value;
		},

		// -

		_searchForParts: (text, parts) => {
			let allPartsFound = true;
			for (const part of parts) {
				if (text.indexOf(part) == -1) {
					allPartsFound = false;
					break;
				}
			}
			return allPartsFound;
		},

		searchAll: () => {

			// Recherche globale
			// ---

			const store = getRoot(self);
			const artists = store.artists;
			const albums = store.albums;
			const tracks = store.tracks;
			const playlists = store.playlists;

			self.artistsSummaries = [];
			self.albumsSummaries = [];
			self.tracksSummaries = [];
			self.playlistsSummaries = [];

			// -

			let searchParts = self.query.split(' ');
			let searchPartsSanitized = [];
			for (var searchPart of searchParts) {
				searchPartsSanitized.push(sanitizeString(searchPart));
			}

			// Recherche :: artists
			// ---------------------------------------------------

			let nbArtistsFound = 0;

			for (const artistId of artists.by_id.keys()) {
				const allPartsFound = self._searchForParts(artistId, searchPartsSanitized);
				if (allPartsFound && nbArtistsFound < 10) {
					const artist = artists.by_id.get(artistId);
					if (artist) {
						const artistSummary = ArtistStore.create(artist.toJSON());
						self.artistsSummaries.push(artistSummary);
						nbArtistsFound += 1;
					}
				}
			}

			// Recherche :: albums
			// ---------------------------------------------------

			let nbAlbumsFound = 0;

			for (const albumId of albums.by_id.keys()) {
				const allPartsFound = self._searchForParts(albumId, searchPartsSanitized);
				if (allPartsFound && nbAlbumsFound < 12) {
					const album = albums.by_id.get(albumId);
					if (album) {
						const albumSummary = AlbumStore.create(album.toJSON());
						self.albumsSummaries.push(albumSummary);
						nbAlbumsFound += 1;
					}
				}
			}

			// Recherche :: tracks
			// ---------------------------------------------------

			let nbTracksFound = 0;

			for (const trackId of tracks.by_id.keys()) {
				const allPartsFound = self._searchForParts(trackId, searchPartsSanitized);
				if (allPartsFound && nbTracksFound < 10) {
					const track = tracks.by_id.get(trackId);
					if (track) {
						const trackSummary = TrackStore.create(track.toJSON());
						self.tracksSummaries.push(trackSummary);
						nbTracksFound += 1;
					}
				}
			}

			// Recherche :: playlists
			// ---------------------------------------------------

			let nbPlaylistsFound = 0;

			for (const [playlistId, playlist] of playlists.by_id.entries()) {
				if (playlist.permanent) {
					continue;
				}
				const allPartsFound = self._searchForParts(
					sanitizeString(playlist.name),
					searchPartsSanitized
				);
				if (allPartsFound && nbPlaylistsFound < 10) {
					const playlistSummary = PlaylistStore.create(playlist.toJSON());
					self.playlistsSummaries.push(playlistSummary);
					nbPlaylistsFound += 1;
				}
			}
		},

		clear: () => {

			// Nettoyage de la recherche
			// ---

			self.query = "";

			self.artistsSummaries = [];
			self.albumsSummaries = [];
			self.tracksSummaries = [];
			self.playlistsSummaries = [];
		},

	}))


// Functions Components ReactJS
// ======================================================================================================

// ***** RenderSearch *****
// ************************

const TAG_RenderSearch = () => {}
export const RenderSearch = observer((props) => {

	const store = React.useContext(window.storeContext);
	const app = store.app;
	const search = store.search;

	// From ... store

	const nbResults = search.nbResults;

	const artistsSummaries = search.artistsSummaries;
	const albumsSummaries = search.albumsSummaries;
	const tracksSummaries = search.tracksSummaries;
	const playlistsSummaries = search.playlistsSummaries;

	// ...

	// Render
	// ==================================================================================================

	let contentSearch = null;
	if (nbResults > 0) {

		let resultList = [];

		// Results :: artists
		// ---------------------------------------------------

		if (artistsSummaries.length > 0) {
			resultList.push(
				<Group
					id="group-search-artists"
					key="group-search-artists"
					style={{
						marginBottom: '40px',
					}}
				>

					<GroupDivider
						spacing="big"
						left={(
							<Typography
								variant="title"
								color="secondary"
								style={{
									minWidth: '60px',
									marginRight: '20px',
								}}
							>
								Artistes
							</Typography>
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
								{artistsSummaries.length}
							</Avatar>
						)}
					/>

					<TableContainer
						component={Paper}
						style={{
							marginTop: '10px',
							marginLeft: '20px',
							marginRight: '20px',
							padding: '0px',
						}}
					>
						<Table>
							<TableBody>
								{artistsSummaries.map((artist, artistIdx) => (
									<ArtistRow
										key={`artist-${artist.id}`}
										artist={artist}
									/>
								))}
							</TableBody>
						</Table>
					</TableContainer>

				</Group>
			)
		}

		// Results :: albums
		// ---------------------------------------------------

		if (albumsSummaries.length > 0) {

			// Fantômes flex
			let albumGhosts = []
			for (var i = 0; i < 10; i++) {
				albumGhosts.push(
					<ThumbnailGhost
						key={`thumbnail-ghost-${i}`}
						size="small"
						style={{
							marginRight: '16px',
						}}
					/>
				)
			}

			resultList.push(
				<Group
					id="group-search-albums"
					key="group-search-albums"
					style={{
						marginBottom: '40px',
					}}
				>

					<GroupDivider
						spacing="big"
						left={(
							<Typography
								variant="title"
								color="secondary"
								style={{
									minWidth: '60px',
									marginRight: '20px',
								}}
							>
								Albums
							</Typography>
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
								{albumsSummaries.length}
							</Avatar>
						)}
					/>

					<Grid
						style={{
							marginTop: '10px',
							paddingLeft: '20px',
							paddingRight: '20px',
						}}
					>
						{albumsSummaries.map((album, albumIdx) => (
							<AlbumThumbnail
								key={`thumbnail-album-${album.id}`}
								album={album}
								style={{
									marginRight: '20px',
									marginBottom: '30px',
								}}
								callbackClick={() => store.navigateTo("album", album.id)}
							/>
						))}
						{albumGhosts}
					</Grid>

				</Group>
			)
		}

		// Results :: tracks
		// ---------------------------------------------------

		if (tracksSummaries.length > 0) {
			resultList.push(
				<Group
					id="group-search-tracks"
					key="group-search-tracks"
					style={{
						marginBottom: '40px',
					}}
				>

					<GroupDivider
						spacing="big"
						left={(
							<Typography
								variant="title"
								color="secondary"
								style={{
									minWidth: '60px',
									marginRight: '20px',
								}}
							>
								Titres
							</Typography>
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
								{tracksSummaries.length}
							</Avatar>
						)}
					/>

					<TableContainer
						component={Paper}
						style={{
							marginTop: '10px',
							marginLeft: '20px',
							marginRight: '20px',
							padding: '0px',
						}}
					>
						<Table>

							<TableHead>
								<TableRow>
									<TableCell
										header={true}
										width={56}
										align="center"
									>
									</TableCell>
									<TableCell header={true}>
										Titre
									</TableCell>
									<TableCell header={true} style={{maxWidth: '200px'}}>
										Artiste
									</TableCell>
									<TableCell header={true} style={{maxWidth: '200px'}}>
										Album
									</TableCell>
									<TableCell
										header={true}
										width={56}
										align="right"
									>
									</TableCell>
								</TableRow>
							</TableHead>

							<TableBody>
								{tracksSummaries.map((track, trackIdx) => (
									<TrackRow
										key={`track-${track.id}`}
										track={track}
										origin="search"
									/>
								))}
							</TableBody>

						</Table>
					</TableContainer>

				</Group>
			)
		}

		// Results :: playlists
		// ---------------------------------------------------

		if (playlistsSummaries.length > 0) {
			resultList.push(
				<Group
					id="group-search-playlists"
					key="group-search-playlists"
					style={{
						marginBottom: '40px',
					}}
				>

					<GroupDivider
						spacing="big"
						left={(
							<Typography
								variant="title"
								color="secondary"
								style={{
									minWidth: '60px',
									marginRight: '20px',
								}}
							>
								Playlists
							</Typography>
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
								{playlistsSummaries.length}
							</Avatar>
						)}
					/>

					<TableContainer
						component={Paper}
						style={{
							marginTop: '10px',
							marginLeft: '20px',
							marginRight: '20px',
							padding: '0px',
						}}
					>
						<Table>
							<TableBody>
								{playlistsSummaries.map((playlist, playlistIdx) => (
									<PlaylistRow
										key={`playlist-${playlist.id}`}
										playlist={playlist}
									/>
								))}
							</TableBody>
						</Table>
					</TableContainer>

				</Group>
			)
		}

		// ---------------------------------------------------

		contentSearch = (
			<React.Fragment>
				{resultList}
			</React.Fragment>
		)
	}
	return contentSearch;
})


// ***** SearchPage *****
// **********************

const TAG_SearchPage = () => {}
export const SearchPage = observer((props) => {

	const store = React.useContext(window.storeContext);
	const app = store.app;
	const search = store.search;

	React.useEffect(() => {
		setTimeout(() => {
			document.getElementById('txt-main-search').focus();
		}, 100);
	}, []);

	// From ... props

	const loaded = store.loaded;
	const nbResults = search.nbResults;

	// ...

	const showHelper = (!loaded || nbResults == 0) ? true : false;

	// Renderers
	// ==================================================================================================

	const renderPage = () => {

		// Render :: Page
		// ---

		let pageContent = null;
		if (!showHelper) {
			pageContent = <RenderSearch />
		}
		return pageContent;
	}

	const renderHelper = () => {

		// Render :: Helper
		// ---

		return (
			<Helper
				iconName="search"
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
