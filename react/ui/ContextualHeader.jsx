import React from 'react';
import { types, getRoot } from "mobx-state-tree";
import { observer } from "mobx-react-lite";
import clsx from 'clsx';

import { PlayerDisplay } from 'gramophone_client/components/player_display/PlayerDisplay';

import {
	Header,
	HeaderDivider
} from 'nexus/layout/header/Header';
import { Row } from 'nexus/layout/row/Row';

import { SearchHeaderMiddle } from 'nexus/contexts/search/Search';
import { AboutHeaderLeft } from 'nexus/contexts/about/About';
import { AdminHeaderLeft } from 'nexus/contexts/admin/Admin';

import { Icon } from 'nexus/ui/icon/Icon';
import { IconButton } from 'nexus/ui/button/Button';
import { Popover } from 'nexus/ui/popover/Popover';
import { Avatar } from 'nexus/ui/avatar/Avatar';
import { Slider } from 'nexus/ui/slider/Slider';

import { ArtistsHeaderLeft } from 'gramophone_client/contexts/artists/Artists';
import { AlbumsHeaderLeft } from 'gramophone_client/contexts/albums/Albums';
import { TracksHeaderLeft } from 'gramophone_client/contexts/tracks/Tracks';

import { YearsHeaderLeft } from 'gramophone_client/contexts/years/Years';
import { GenresHeaderLeft } from 'gramophone_client/contexts/genres/Genres';
import { PlaylistsHeaderLeft } from 'gramophone_client/contexts/playlists/Playlists';

import { PlaybackControls } from 'gramophone_client/components/playback_controls/PlaybackControls';


// Functions Components ReactJS
// ======================================================================================================

// ***** ContextualHeader *****
// ****************************

const TAG_ContextualHeader = () => {}
export const ContextualHeader = observer((props) => {

	const store = React.useContext(window.storeContext);
	const app = store.app;
	const player = store.player;

	// From ... store

	const breakPoint650 = app.breakPoint650;
	const context = app.context;
	const homeContext = app.homeContext;
	const authContext = app.authContext;

	const drawerOpen = player.drawerOpen;
	const volume = player.volume;

	// From ... states

	const [anchorVolume, setAnchorVolume] = React.useState(null);

	// ...

	// Events
	// ==================================================================================================

	const handleMenuVolume = (event) => {
		setAnchorVolume(event.currentTarget);
	}

	const handleCloseMenuVolume = () => {
		setAnchorVolume(null);
	}

	const handleVolumeChange = (volume) => {
		player.setVolume(volume);
	}

	// -

	const handleQueueClick = () => {
		player.toggleDrawer();
	}

	// Render
	// ==================================================================================================

	let headerLeft = null;
	let headerMiddle = <PlayerDisplay />
	let headerRight = null;

	// -------------------------------------------------

	const renderHeaderSearch = () => {

		if (breakPoint650 && context != 'search') { return; }

		headerRight = (
			<SearchHeaderMiddle
				style={{
					marginRight: '10px',
					minWidth: '200px',
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

			<div data-flex="0">
				<IconButton
					onClick={(e) => handleMenuVolume(e)}
				>
					<Icon
						name="volume_up"
						color="white"
					/>
				</IconButton>
				<Popover
					id="pop-volume"
					open={Boolean(anchorVolume)}
					anchorEl={anchorVolume}
					onClose={handleCloseMenuVolume}
					anchorOrigin={{
						vertical: 'bottom',
						horizontal: 'center',
					}}
					transformOrigin={{
						vertical: 'top',
						horizontal: 'center',
					}}
					style={{
						width: '200px',
					}}
				>
					<Row
						align="center"
						spacing="none"
					>
						<Avatar
							color="transparent"
							size="small"
							iconName="volume_mute"
							iconColor="typography"
						/>
						<Slider
							value={volume}
							color="secondary"
							min={0}
							max={100}
							onChangeCommitted={handleVolumeChange}
							style={{
								minWidth: '120px',
							}}
						/>
						<Avatar
							color="transparent"
							size="small"
							iconName="volume_up"
							iconColor="typography"
						/>
					</Row>
				</Popover>
			</div>

			<IconButton
				onClick={() => handleQueueClick()}
			>
				<Icon
					name="queue_music"
					color={(drawerOpen) ? "info" : "white"}
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
