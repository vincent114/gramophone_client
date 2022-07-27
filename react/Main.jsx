import React from 'react';
import ReactDOM from 'react-dom';
import { types } from "mobx-state-tree";
import { observer } from "mobx-react-lite";

import { NxAppStore, NxApp, makeInitSnapshot } from 'nexus/NxApp';

import { STATIC_SMAP } from 'nexus/models/services';
import { copyObj } from 'nexus/utils/Datas';
import { getFromStorage, setToStorage } from 'nexus/utils/Storage';

import { PlayerDrawer } from 'gramophone_client/components/player_drawer/PlayerDrawer';

import { ContextualHeader } from 'gramophone_client/ui/ContextualHeader';
import { ContextualMenu } from 'gramophone_client/ui/ContextualMenu';

import { HomeStore, HomePage } from 'gramophone_client/contexts/home/Home';
import { SearchStore, SearchPage } from 'gramophone_client/contexts/search/Search';
import { ArtistsStore, ArtistsPage } from 'gramophone_client/contexts/artists/Artists';
import { ArtistPage } from 'gramophone_client/contexts/artist/Artist';
import { AlbumsStore, AlbumsPage } from 'gramophone_client/contexts/albums/Albums';
import { AlbumPage } from 'gramophone_client/contexts/album/Album';
import { TracksStore, TracksPage } from 'gramophone_client/contexts/tracks/Tracks';
import { YearsStore, YearsPage } from 'gramophone_client/contexts/years/Years';
import { YearPage } from 'gramophone_client/contexts/year/Year';
import { GenresStore, GenresPage } from 'gramophone_client/contexts/genres/Genres';
import { GenrePage } from 'gramophone_client/contexts/genre/Genre';
import { PlaylistsStore, PlaylistsPage } from 'gramophone_client/contexts/playlists/Playlists';
import { PlaylistPage } from 'gramophone_client/contexts/playlist/Playlist';
import { PlaylistFolderPage } from 'gramophone_client/contexts/playlist_folder/PlaylistFolder';
import { AdminPage } from 'gramophone_client/contexts/admin/Admin';

import { LibraryStore } from 'gramophone_client/models/Library';
import { PlayerStore } from 'gramophone_client/models/Player';

import {
	PopupIgnoredFilesStore,
	popupIgnoredFilesKey,
	PopupIgnoredFiles
} from 'gramophone_client/popups/ignored_files/PopupIgnoredFiles';
import {
	PopupJumpToStore,
	popupJumpToKey,
	PopupJumpTo
} from 'gramophone_client/popups/jump_to/PopupJumpTo';
import {
	PopupZoomCoverStore,
	popupZoomCoverKey,
	PopupZoomCover
} from 'gramophone_client/popups/zoom_cover/PopupZoomCover';
import {
	PopupTrackMetadatasStore,
	popupTrackMetadatasKey,
	PopupTrackMetadatas
} from 'gramophone_client/popups/track_metadatas/PopupTrackMetadatas';
import {
	PopupManagePlaylistStore,
	popupManagePlaylistKey,
	PopupManagePlaylist
} from 'gramophone_client/popups/manage_playlist/PopupManagePlaylist';

import './Main.css';


// Functions
// ======================================================================================================

function readJsonFile(filePath, defaultDatas, callback, verbose) {

	// Lit le fichier JSON passé en paramètres et renvoie un dictionnaire
	// ---

	let datas = (defaultDatas) ? defaultDatas : {};

	// On s'assure que le fichier existe
	if (!ipc.sendSync('existsSync', filePath)) {
		ipc.sendSync('writeJSONSync', filePath, datas, {
			spaces: 4
		});
	}

	if (verbose) {
		console.log(`SEND readJson ${JSON.stringify(filePath)}`);
	}

	// Lecture des données du fichier
	try {
		ipc.invoke('readJson', [filePath]).then((result) => {
			if (verbose) {
				console.log(`CALLBACK readJson ${JSON.stringify(filePath)}`);
				console.log(result);
			}
			if (callback) {
				callback(result);
			}
		});
	} catch(err) {
		console.error(err);
	}
	return null;
}

function writeJsonFile(filePath, datas, callback) {

	// Ecrit le dictionnaire dans le fichier json passés en paramètres
	// ---

	try {
		ipc.invoke('writeJSON', [
			filePath,
			datas,
			{spaces: 4},
		])
		.then((result) => {
			if (callback) {
				callback(result);
			}
		});
	} catch(err) {
		console.error(err);
	}
	return null;
}


// Models
// ======================================================================================================

// ***** RootStore *****
// *********************

const TAG_RootStore = () => {}
const RootStore = types
	.model({
		app: types.optional(NxAppStore, {}),

		// -

		home: types.optional(HomeStore, {}),

		// -

		search: types.optional(SearchStore, {}),

		// -

		artists: types.optional(ArtistsStore, {}),
		artistId: types.maybeNull(types.string),

		albums: types.optional(AlbumsStore, {}),
		albumId: types.maybeNull(types.string),

		tracks: types.optional(TracksStore, {}),

		// -

		years: types.optional(YearsStore, {}),
		yearId: types.maybeNull(types.string),

		genres: types.optional(GenresStore, {}),
		genreId: types.maybeNull(types.string),

		playlists: types.optional(PlaylistsStore, {}),
		playlistId: types.maybeNull(types.string),
		playlistFolderId: types.maybeNull(types.string),

		// -

		library: types.optional(LibraryStore, {}),
		player: types.optional(PlayerStore, {}),

		// -

		popupIgnoredFiles: types.optional(PopupIgnoredFilesStore, {}),
		popupJumpTo: types.optional(PopupJumpToStore, {}),
		popupZoomCover: types.optional(PopupZoomCoverStore, {}),
		popupTrackMetadatas: types.optional(PopupTrackMetadatasStore, {}),
		popupManagePlaylist: types.optional(PopupManagePlaylistStore, {}),

		platform: types.maybeNull(types.string),

		loaded: false,

	})
	.views(self => ({

		get slashPath() {
			if (self.platform == 'win32') {
				return '\\';
			}
			return '/';
		},

	}))
	.actions(self => ({

		afterLoad: () => {

			// La bibliothèque est-elle entièrement chargée ?
			// ---

			const app = self.app;
			const library = self.library;
			const player = self.player;

			if (!library.loaded) { return; }
			if (!player.loaded) { return; }

			if (!self.artists.loaded) { return; }
			if (!self.albums.loaded) { return; }
			if (!self.tracks.loaded) { return; }

			if (!self.years.loaded) { return; }
			if (!self.genres.loaded) { return; }
			if (!self.playlists.loaded) { return; }

			self.loaded = true;
			app.removeTask('load_library');

			if (library.isSourceAvailable && library.auto_scan_enabled) {
				library.startScan(true);
			}
		},

		update: (datas) => {

			// Gramophone-specific init datas
			// ---

			self.library.load();
			self.player.load();

			setTimeout(() => {
				self.artists.load(self.afterLoad);
				self.albums.load(self.afterLoad);
				self.tracks.load(self.afterLoad);

				self.years.load(self.afterLoad);
				self.genres.load(self.afterLoad);
				self.playlists.load(self.afterLoad);
			}, 250);
		},

		save: (callback) => {

			// Sauvegarde des données
			// ---

			self.library.save();

			self.artists.save();
			self.albums.save();
			self.tracks.save();

			self.years.save();
			self.genres.save();
			self.playlists.save();

			if (callback) {
				callback();
			}
		},

		navigateTo: (navContext, contextId, contextUrl, contextExtras, callback) => {

			// Herald own navigation function
			// ---

			const app = self.app;
			const context = app.context;

			// -

			// Artistes
			if (navContext == 'artists') {
				app.navigate('/main.html', 'artists');
			}
			if (navContext == 'artist') {
				setToStorage('lastArtistId', contextId);
				app.navigate('/main.html', 'artist', [
					{"op": "replace", "path": "/artistId", "value": contextId},
				]);
			}

			// Albums
			if (navContext == 'albums') {
				app.navigate('/main.html', 'albums');
			}
			if (navContext == 'album') {
				setToStorage('lastAlbumId', contextId);
				app.navigate('/main.html', 'album', [
					{"op": "replace", "path": "/albumId", "value": contextId},
				]);
			}

			// Tracks
			if (navContext == 'tracks') {
				app.navigate('/main.html', 'tracks');
			}

			// -

			// Années
			if (navContext == 'years') {
				app.navigate('/main.html', 'years');
			}
			if (navContext == 'year') {
				setToStorage('lastYearId', contextId);
				app.navigate('/main.html', 'year', [
					{"op": "replace", "path": "/yearId", "value": contextId},
				]);
			}

			// Genres
			if (navContext == 'genres') {
				app.navigate('/main.html', 'genres');
			}
			if (navContext == 'genre') {
				setToStorage('lastGenreId', contextId);
				app.navigate('/main.html', 'genre', [
					{"op": "replace", "path": "/genreId", "value": contextId},
				]);
			}

			// Playlists
			if (navContext == 'playlists') {
				app.navigate('/main.html', 'playlists', null, callback);
			}
			if (navContext == 'playlist') {
				setToStorage('lastPlaylistId', contextId);
				app.navigate('/main.html', 'playlist', [
					{"op": "replace", "path": "/playlistId", "value": contextId},
				]);
			}
			if (navContext == 'playlist_folder') {
				setToStorage('lastPlaylistFolderId', contextId);
				app.navigate('/main.html', 'playlist_folder', [
					{"op": "replace", "path": "/playlistFolderId", "value": contextId},
				]);
			}
		},

		// -

		_readJsonFile: (filePath, defaultDatas, callback) => {
			const app = self.app;
			return readJsonFile(filePath, defaultDatas, callback, app.debugMode);
		},

		_writeJsonFile: (filePath, datas) => {
			return writeJsonFile(filePath, datas);
		},

	}))


// Init
// ======================================================================================================

// Contexts
// -

let contexts = {
	'home': HomePage,
	'search': SearchPage,

	'artists': ArtistsPage,
	'artist': ArtistPage,
	'albums': AlbumsPage,
	'album': AlbumPage,
	'tracks': TracksPage,

	'years': YearsPage,
	'year': YearPage,
	'genres': GenresPage,
	'genre': GenrePage,
	'playlists': PlaylistsPage,
	'playlist': PlaylistPage,
	'playlist_folder': PlaylistFolderPage,

	'admin': AdminPage,
}

// Popups
// -

let popups = {
	[popupIgnoredFilesKey] : PopupIgnoredFiles,
	[popupJumpToKey]: PopupJumpTo,
	[popupZoomCoverKey]: PopupZoomCover,
	[popupTrackMetadatasKey]: PopupTrackMetadatas,
	[popupManagePlaylistKey]: PopupManagePlaylist,
}

// Routes
// -

let routes = {
	'home': '/main.html',

	'artists': '/artists',
	'artist:artistId': '/artist/:artistId',
	'albums': '/albums',
	'album:albumId': '/album/:albumId',
	'tracks': '/tracks',

	'years': '/years',
	'year:yearId': '/year/:yearId',
	'genres': '/genres',
	'genre:genreId': '/genre/:genreId',
	'playlists': '/playlists',
	'playlist:playlistId': '/playlist/:playlistId',
	'playlist_folder:playlistFolderId': '/playlist_folder/:playlistFolderId',
}

// Store
// -

let initSnapshot = makeInitSnapshot(routes, {
	'app': {
		'context': getFromStorage("lastContext", "home"),
		'kind': 'electron',
		'tasks': ['load_library'],
		'header': {
			'dynamic': false,
		},
		'menu': {
			'pinned': false,
		},
		'theme': {
			'palette_light': {
				'primary': {
					'main': '#009688',
				},
				'secondary': {
					'main': '#607d8b',
				},
			},
			'palette_dark': {
				'primary': {
					'main': '#009688',
				},
				'secondary': {
					'main': '#607d8b',
				},
			}
		},
		'scrollIgnoredContexts': [
			'home',
			'about',
			'admin',

			'artist',
			'album',
			'year',
			'genre',
			'playlist',
			'playlist_folder',
		],
	},
	'home': {
		'sectionDisplayed': getFromStorage('homeSectionDisplayed', ['showcased'], 'json'),
	},
	'artistId': getFromStorage('lastArtistId', ''),
	'albumId': getFromStorage('lastAlbumId', ''),
	'yearId': getFromStorage('lastYearId', ''),
	'genreId': getFromStorage('lastGenreId', ''),
	'playlistId': getFromStorage('lastPlaylistId', ''),
	'playlistFolderId': getFromStorage('lastPlaylistFolderId', ''),
	'player': {
		'volume': getFromStorage('volume', 25, 'int'),
	},
	'platform': ipc.sendSync('platform'),
});

export const rootStore = RootStore.create(initSnapshot);
export const RootStoreContext = React.createContext(rootStore);

window.store = rootStore;
window.storeContext = RootStoreContext;

setToStorage('debugMode', true, 'bool');

let staticRaw = {
	'smap': copyObj(STATIC_SMAP),
}
staticRaw['smap']['me'] = copyObj(STATIC_SMAP['gramophone']);

rootStore.app.init(
	(datas) => {
		rootStore.update(datas);
	},
	popups,
	{},
	staticRaw
);


// Functions Components ReactJS
// ======================================================================================================

// ***** Root *****
// ****************

const TAG_Root = () => {}
const Root = observer(() => {

	// Render
	// ==================================================================================================

	return (
		<RootStoreContext.Provider value={rootStore}>
			<NxApp
				header={ContextualHeader}
				menu={ContextualMenu}
				contexts={contexts}
				right={<PlayerDrawer />}
				popups={popups}
				callbackFocus={() => {
					rootStore.player.refreshSlider();
				}}
			/>
		</RootStoreContext.Provider>
	)
})


// DOM Ready
// ======================================================================================================

window.addEventListener('DOMContentLoaded', () => {
	ReactDOM.render(
		<Root></Root>,
		document.getElementById("nx-root")
	);
});
