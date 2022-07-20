import React from 'react';
import { observer } from "mobx-react-lite";
import clsx from 'clsx';

import { AlbumThumbnail } from 'gramophone_client/contexts/albums/Albums';

import { NavCard } from 'nexus/components/cards/NavCard';

import { Row } from 'nexus/layout/row/Row';
import { Column } from 'nexus/layout/column/Column';
import { Ribbon } from 'nexus/layout/ribbon/Ribbon';
import { Grid } from 'nexus/layout/grid/Grid';

import { Helper } from 'nexus/ui/helper/Helper';
import { Button } from 'nexus/ui/button/Button';
import { ThumbnailGhost } from 'nexus/ui/thumbnail/Thumbnail';

import './Home.css';


// Functions Components ReactJS
// ======================================================================================================

// ***** RenderHomeGrid *****
// **************************

const TAG_RenderHomeGrid = () => {}
export const RenderHomeGrid = observer((props) => {

	const store = React.useContext(window.storeContext);
	const app = store.app;

	// Renderers
	// ==================================================================================================

	// HomeGrid -> Artistes
	// ---

	const navCardArtists = (
		<NavCard
			key="nav-card-artists"
			icon="face"
			label="Artistes"
			onClick={() => store.navigateTo('artists')}
		/>
	)

	// HomeGrid -> Albums
	// ---

	const navCardAlbums = (
		<NavCard
			key="nav-card-albums"
			icon="album"
			label="Albums"
			onClick={() => store.navigateTo('albums')}
		/>
	)

	// HomeGrid -> Titres
	// ---

	const navCardTracks = (
		<NavCard
			key="nav-card-tracks"
			icon="audiotrack"
			label="Titres"
			onClick={() => store.navigateTo('tracks')}
		/>
	)

	// HomeGrid -> Années
	// ---

	const navCardYears = (
		<NavCard
			key="nav-card-years"
			icon="date_range"
			label="Années"
			onClick={() => store.navigateTo('years')}
		/>
	)

	// HomeGrid -> Genres
	// ---

	const navCardGenres = (
		<NavCard
			key="nav-card-genres"
			icon="local_bar"
			label="Genres"
			onClick={() => store.navigateTo('genres')}
		/>
	)

	// HomeGrid -> Playlists
	// ---

	const navCardPlaylists = (
		<NavCard
			key="nav-card-playlists"
			icon="playlist_play"
			label="Playlists"
			onClick={() => store.navigateTo('playlists')}
		/>
	)

	// ==================================================================================================

	return (
		<Row
			spacing="medium"
			style={{
				marginTop: '30px',
				marginBottom: '40px',
			}}
		>
			<Row spacing="medium" responsive={false}>
				{navCardArtists}
				{navCardAlbums}
				{navCardTracks}
			</Row>
			<Row spacing="medium" responsive={false}>
				{navCardYears}
				{navCardGenres}
				{navCardPlaylists}
			</Row>
		</Row>
	)
})

// ***** RenderLastAdded *****
// ***************************

const TAG_RenderLastAdded = () => {}
export const RenderLastAdded = observer((props) => {

	const store = React.useContext(window.storeContext);
	const app = store.app;
	const albums = store.albums;

	// From ... store

	const lastAdded = albums.getLastAdded(6);

	// Events
	// ==================================================================================================

	const handleAlbumClick = (albumId) => {
		store.navigateTo('album', albumId);
	}

	// Render
	// ==================================================================================================

	let lastAddedContent = null;
	if (lastAdded.length > 0) {

		// Fantômes flex
		let ghosts = []
		for (var i = 0; i < 10; i++) {
			ghosts.push(
				<ThumbnailGhost
					key={`ghost-last-added-${i}`}
					size="small"
				/>
			)
		}

		lastAddedContent = (
			<div>
				<Ribbon
					avatarIconName="new_releases"
					avatarIconColor="hot"
					title="Ajouté dernièrement"
					style={{
						backgroundColor: 'transparent',
						marginBottom: '20px',
					}}
				/>
				<Grid
					justify="space-between"
					style={{
						paddingLeft: '16px',
						paddingRight: '16px',
					}}
				>
					{lastAdded.map((album, albumIdx) => (
						<AlbumThumbnail
							key={`thumbnail-last-added-${albumIdx}`}
							album={album}
							callbackClick={() => handleAlbumClick(album.id)}
						/>
					))}
					{ghosts}
				</Grid>
			</div>
		)
	}
	return lastAddedContent;
})

// ***** RenderLastListened *****
// ******************************

const TAG_RenderLastListened = () => {}
export const RenderLastListened = observer((props) => {

	const store = React.useContext(window.storeContext);
	const app = store.app;

	// Render
	// ==================================================================================================

	let lastListenedContent = null;

	return lastListenedContent;
})

// ***** HomePage *****
// ********************

const TAG_HomePage = () => {}
export const HomePage = observer((props) => {

	const store = React.useContext(window.storeContext);
	const app = store.app;
	const menu = app.menu;
	const library = store.library;
	const albums = store.albums;

	// From ... store

	const loaded = store.loaded;
	const isLoading = app.isLoading;
	const menuPinned = menu.pinned;

	const nbFolders = library.nbFolders;
	const nbAlbums = albums.nbAlbums;

	// ...

	// Events
	// ==================================================================================================

	const handleScan = () => {
		library.startScan();
	}

	const handleChooseLibrary = () => {
		ipc.once('folderChoosed', (folders) => {
			for (const folder of folders) {
				library.addFolder("source", folder);
				library.refreshAvailability();
				library.save(() => {
					library.startScan();
				});
			}
		});
		ipc.send('chooseFolder');
	}

	// Renderers
	// ==================================================================================================

	const renderHelper = () => {

		// Render :: Helper
		// ---

		let helperTitle = "Bienvenue sur Gramophone !";
		let helperSeverity = null;
		let helperSubtitle = "Chargement de votre discothèque en cours...";
		let helperInFlux = false;
		let helperContent = null;

		if (loaded) {
			if (nbFolders == 0) {
				helperSeverity = "info"
				helperSubtitle = "Pour commencer, sélectionnez un dossier contenant de la musique.";
				helperContent = (
					<Button
						key="btn-choose-library"
						id="btn-choose-library"
						variant="contained"
						color="secondary"
						startAdornment="folder"
						disabled={isLoading}
						onClick={() => handleChooseLibrary()}
					>
						Sélectionner un dossier ...
					</Button>
				)
			} else {
				if (nbAlbums == 0) {
					helperSeverity = "warning"
					helperSubtitle = (
						<div>
							Aucune musique n'a été trouvée ! 😱<br/>
							Lançez un scan ou bien sélectionnez un autre dossier.
						</div>
					)
					helperContent = (
						<Column align="stretch">
							<Button
								key="btn-scan"
								id="btn-scan"
								variant="contained"
								color="secondary"
								startAdornment="youtube_searched_for"
								disabled={isLoading}
								onClick={() => handleScan()}
							>
								Scanner ...
							</Button>
							<Button
								key="btn-choose-library"
								id="btn-choose-library"
								variant="contained"
								color="secondary"
								startAdornment="folder"
								disabled={isLoading}
								onClick={() => handleChooseLibrary()}
							>
								Sélectionner un dossier ...
							</Button>
						</Column>
					)
				} else {
					helperTitle = "Que souhaitez-vous écouter aujourd'hui ?";
					helperSubtitle = "";
					helperContent = (
						<div>
							{!menuPinned && (
								<RenderHomeGrid />
							)}
							<RenderLastAdded />
							<RenderLastListened />
						</div>
					)
					if (nbAlbums >= 6) {
						helperInFlux = true;
					}
				}
			}
		}

		// -------------------------------------------------

		return (
			<Helper
				icon={<img className="nx-helper-icon" src="static/favicons/android-icon-192x192.png" />}
				title={helperTitle}
				subtitle={helperSubtitle}
				severity={helperSeverity}
				show={true}
				inFlux={helperInFlux}
				style={{
					maxWidth: (loaded && nbFolders > 0 && nbAlbums > 0) ? '1000px' : '400px',
					width: (loaded && nbFolders > 0) ? '100%' : 'unset',
					paddingLeft: '20px',
					paddingRight: '20px',
				}}
			>
				{helperContent}
			</Helper>
		)
	}

	return (
		<div className="nx-page medium">
			{renderHelper()}
		</div>
	)
})
