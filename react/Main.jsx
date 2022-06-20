import React from 'react';
import ReactDOM from 'react-dom';
import { types } from "mobx-state-tree";
import { observer } from "mobx-react-lite";

import { NxAppStore, NxApp, makeInitSnapshot } from 'nexus/NxApp';

import { ContextualHeader } from 'gramophone_client/ui/ContextualHeader';
import { ContextualMenu } from 'gramophone_client/ui/ContextualMenu';

import { HomePage } from 'gramophone_client/contexts/home/Home';
import { SearchStore, SearchPage } from 'gramophone_client/contexts/search/Search';
import { ArtistsStore, ArtistsPage } from 'gramophone_client/contexts/artists/Artists';
import { AlbumsStore, AlbumsPage } from 'gramophone_client/contexts/albums/Albums';
import { TracksStore, TracksPage } from 'gramophone_client/contexts/tracks/Tracks';
import { YearsStore, YearsPage } from 'gramophone_client/contexts/years/Years';
import { GenresStore, GenresPage } from 'gramophone_client/contexts/genres/Genres';
import { PlaylistsStore, PlaylistsPage } from 'gramophone_client/contexts/playlists/Playlists';
import { AdminPage } from 'gramophone_client/contexts/admin/Admin';

import { LibraryStore } from 'gramophone_client/models/Library';

import './Main.css';


// Models
// -------------------------------------------------------------------------------------------------------------

// ***** RootStore *****
// *********************

const TAG_RootStore = () => {}
const RootStore = types
	.model({
		app: types.optional(NxAppStore, {}),

		// -

		search: types.optional(SearchStore, {}),

		// -

		artists: types.optional(ArtistsStore, {}),
		albums: types.optional(AlbumsStore, {}),
		tracks: types.optional(TracksStore, {}),

		// -

		years: types.optional(YearsStore, {}),
		genres: types.optional(GenresStore, {}),
		playlists: types.optional(PlaylistsStore, {}),

		// -

		library: types.optional(LibraryStore, {}),

		loaded: false,

	})
	.views(self => ({

		get ajaxGramophone() {
			const app = self.app;
			const services = app.services;
			return services.getAjaxBase('gramophone');
		},

	}))
	.actions(self => ({

		afterLoad: () => {

			// La bibliothèque est-elle entièrement chargée ?
			// ---

			const app = self.app;
			const library = self.library;

			if (!library.loaded) { return; }

			if (!self.artists.loaded) { return; }
			if (!self.albums.loaded) { return; }
			if (!self.tracks.loaded) { return; }

			if (!self.years.loaded) { return; }
			if (!self.genres.loaded) { return; }
			if (!self.playlists.loaded) { return; }

			self.loaded = true;
			app.removeTask('load_library');

			if (library.source_folder.folder_available && library.auto_scan_enabled) {
				library.scan(true);
			}
		},

		update: (datas) => {

			// Gramophone-specific init datas
			// ---

			self.library.load();

			self.artists.load(self.afterLoad);
			self.albums.load(self.afterLoad);
			self.tracks.load(self.afterLoad);

			self.years.load(self.afterLoad);
			self.genres.load(self.afterLoad);
			self.playlists.load(self.afterLoad);
		},

		navigateTo: (navContext, contextId, contextUrl, contextExtras, callback) => {

			// Herald own navigation function
			// ---

			const app = self.app;
			const context = app.context;

			// -

			// Search
			// if (navContext == 'search') {
			// 	app.navigate('/main.html', 'search');
			// }

			// -

			// Artistes
			if (navContext == 'artists') {
				app.navigate('/main.html', 'artists');
			}

			// Albums
			if (navContext == 'albums') {
				app.navigate('/main.html', 'albums');
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

			// Genres
			if (navContext == 'genres') {
				app.navigate('/main.html', 'genres');
			}

			// Playlists
			if (navContext == 'playlists') {
				app.navigate('/main.html', 'playlists');
			}

		},

		// -

		_readJsonFile: (filePath, defaultDatas) => {

			// Lit le fichier JSON passé en paramètres et renvoie un dictionnaire
			// ---

			let datas = (defaultDatas) ? defaultDatas : {};

			// On s'assure que le fichier existe
			if (!ipc.sendSync('existsSync', filePath)) {
				ipc.sendSync('writeJSONSync', filePath, datas, {
					spaces: 4
				});
			}

			// Lecture des données du fichier
			try {
				datas = ipc.sendSync('readJsonSync', filePath);
			} catch(err) {
				console.error(err);
			}
			return datas;
		},

		_writeJsonFile: (filePath, datas) => {

			// Ecrit le dictionnaire dans le fichier json passés en paramètres
			// ---

			const self = this;

			ipc.once('writeJSON', (ret) => {
				console.log(ret);
			});

			ipc.send('writeJSON', {
				filePath: filePath,
				datas: datas,
				options: {spaces: 4},
			});
		},

	}))


// Init
// -------------------------------------------------------------------------------------------------------------

// Contexts
// -

let contexts = {
	'home': HomePage,
	'search': SearchPage,
	'artists': ArtistsPage,
	'albums': AlbumsPage,
	'tracks': TracksPage,
	'years': YearsPage,
	'genres': GenresPage,
	'playlists': PlaylistsPage,
	'admin': AdminPage,
}

// Popups
// -

let popups = {}

// Routes
// -

let routes = {
	'home': '/main.html',

	'artists': '/artists',
	'albums': '/albums',
	'tracks': '/tracks',

	'years': '/years',
	'genres': '/genres',
	'playlists': '/playlists',
}

// Store
// -

let initSnapshot = makeInitSnapshot(routes, {
	'app': {
		'context': 'home', // TODO : Last context ?
		'kind': 'electron',
		'tasks': ['load_library'],
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
		}
	}
});

export const rootStore = RootStore.create(initSnapshot);
export const RootStoreContext = React.createContext(rootStore);

window.store = rootStore;
window.storeContext = RootStoreContext;

rootStore.app.init(
	(datas) => {
		rootStore.update(datas);
	},
	popups,
	{}
);


// Functions Components ReactJS
// -------------------------------------------------------------------------------------------------------------

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
				popups={popups}
			/>
		</RootStoreContext.Provider>
	)
})


// DOM Ready
// --------------------------------------------------------------------------------------------------------------------------------------------

window.addEventListener('DOMContentLoaded', () => {
	ReactDOM.render(
		<Root></Root>,
		document.getElementById("nx-root")
	);
});
