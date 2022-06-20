import React from 'react';
import { types, getRoot } from "mobx-state-tree";
import { observer } from "mobx-react-lite";
import clsx from 'clsx';

import {
	Header,
	HeaderDivider
} from 'nexus/layout/header/Header';
import { SearchHeaderMiddle } from 'nexus/contexts/search/Search';
import { AboutHeaderLeft } from 'nexus/contexts/about/About';
import { AdminHeaderLeft } from 'nexus/contexts/admin/Admin';

import { Icon } from 'nexus/ui/icon/Icon';
import { IconButton } from 'nexus/ui/button/Button';

import { ArtistsHeaderLeft } from 'gramophone_client/contexts/artists/Artists';
import { AlbumsHeaderLeft } from 'gramophone_client/contexts/albums/Albums';
import { TracksHeaderLeft } from 'gramophone_client/contexts/tracks/Tracks';

import { YearsHeaderLeft } from 'gramophone_client/contexts/years/Years';
import { GenresHeaderLeft } from 'gramophone_client/contexts/genres/Genres';
import { PlaylistsHeaderLeft } from 'gramophone_client/contexts/playlists/Playlists';

import { PlaybackControls } from 'gramophone_client/components/playback_controls/PlaybackControls';


// Functions Components ReactJS
// -------------------------------------------------------------------------------------------------------------

// ***** ContextualHeader *****
// ****************************

const TAG_ContextualHeader = () => {}
export const ContextualHeader = observer((props) => {

	const store = React.useContext(window.storeContext);
	const app = store.app;

	// From ... store

	const breakPoint650 = app.breakPoint650;
	const context = app.context;
	const homeContext = app.homeContext;
	const authContext = app.authContext;

	// Events
	// ==================================================================================================

	const handleQueueClick = () => {

	}

	// Render
	// ==================================================================================================

	let headerLeft = null;
	let headerMiddle = null;
	let headerRight = null;

	// -------------------------------------------------

	const renderHeaderSearch = () => {

		if (breakPoint650 && context != 'search') { return; }

		headerRight = (
			<SearchHeaderMiddle
				style={{
					marginRight: '10px',
				}}
			/>
		)
	}

	// -------------------------------------------------

	const renderHeaderArtists = () => {

		if (context != 'artists') { return; }

		headerLeft = <ArtistsHeaderLeft />
	}

	const renderHeaderAlbums = () => {

		if (context != 'albums') { return; }

		headerLeft = <AlbumsHeaderLeft />
	}

	const renderHeaderTracks = () => {

		if (context != 'tracks') { return; }

		headerLeft = <TracksHeaderLeft />
	}

	// -------------------------------------------------

	const renderHeaderYears = () => {

		if (context != 'years') { return; }

		headerLeft = <YearsHeaderLeft />
	}

	const renderHeaderGenres = () => {

		if (context != 'genres') { return; }

		headerLeft = <GenresHeaderLeft />
	}

	const renderHeaderPlaylists = () => {

		if (context != 'playlists') { return; }

		headerLeft = <PlaylistsHeaderLeft />
	}

	// -------------------------------------------------

	const renderHeaderAbout = () => {

		if (context != app.aboutContext) { return; }

		headerLeft = <AboutHeaderLeft />
	}

	const renderHeaderAdmin = () => {

		if (context != app.adminContext) { return; }

		headerLeft = <AdminHeaderLeft />
	}

	// -------------------------------------------------

	renderHeaderSearch();

	renderHeaderArtists();
	renderHeaderAlbums();
	renderHeaderTracks();

	renderHeaderYears();
	renderHeaderGenres();
	renderHeaderPlaylists();

	renderHeaderAbout();
	renderHeaderAdmin();

	headerLeft = (
		<React.Fragment>
			<PlaybackControls
				style={{
					marginLeft: '40px',
				}}
			/>
		</React.Fragment>
	)

	headerRight = (
		<React.Fragment>
			{headerRight}
			<IconButton>
				<Icon
					name="volume_up"
					color="white"
				/>
			</IconButton>
			<IconButton>
				<Icon
					name="queue_music"
					color="white"
					onClick={() => handleQueueClick()}
				/>
			</IconButton>
		</React.Fragment>
	)

	return (
		<Header
			left={headerLeft}
			right={headerRight}
		>
			{headerMiddle}
		</Header>
	)
})
