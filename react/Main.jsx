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

import './Main.css';

// const electron = require('electron');
// const remote = electron.remote;
// const { app } = remote;


// Models
// -------------------------------------------------------------------------------------------------------------

// ***** RootStore *****
// *********************

const TAG_RootStore = () => {}
const RootStore = types
	.model({
		'app': types.optional(NxAppStore, {}),

		// Search
		// -

		'search': types.optional(SearchStore, {}),

		// Artistes
		// -

		'artists': types.optional(ArtistsStore, {}),

		// Albums
		// -

		'albums': types.optional(AlbumsStore, {}),

		// Titres
		// -

		'tracks': types.optional(TracksStore, {}),

		// Années
		// -

		'years': types.optional(YearsStore, {}),

		// Genres
		// -

		'genres': types.optional(GenresStore, {}),

		// Playlists
		// -

		'playlists': types.optional(PlaylistsStore, {}),

	})
	.views(self => ({

		get ajaxGramophone() {
			const app = self.app;
			const services = app.services;
			return services.getAjaxBase('gramophone');
		},

	}))
	.actions(self => ({

		update: (datas) => {

			// Gramophone-specific init datas
			// ---

			console.log(datas);
		},

		navigateTo: (navContext, contextId, contextUrl, contextExtras, callback) => {

			// Herald own navigation function
			// ---

			const app = self.app;
			const context = app.context;

			// -

			// Search
			if (navContext == 'search') {
				app.navigate('/main.html', 'search');
			}

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
	'search': '/search',
	'artists': '/artists',
	'albums': '/albums',
	'tracks': '/tracks',
	'years': '/years',
	'genres': '/genres',
	'playlists': '/playlists',
	'admin': '/admin',
}

// Store
// -

let initSnapshot = makeInitSnapshot(routes, {
	'app': {
		'context': 'home', // TODO : Last context ?
		'kind': 'electron',
		'theme': {
			'variant': 'light',
			'palette': {
				'default': {
					'main': '#000000',
					'contrastText': '#fff',
				},
				'primary': {
					'main': '#009688',
					'contrastText': '#fff',
				},
				'secondary': {
					'main': '#607d8b',
					'contrastText': '#fff',
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

	console.log(window.process);

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
