import React from 'react';
import { types, getRoot } from "mobx-state-tree";
import { observer } from "mobx-react-lite";
import clsx from 'clsx';

import { AlbumThumbnail } from 'gramophone_client/contexts/albums/Albums';

import { NavCard } from 'nexus/components/cards/NavCard';

import { Row } from 'nexus/layout/row/Row';
import { Column } from 'nexus/layout/column/Column';
import { Ribbon } from 'nexus/layout/ribbon/Ribbon';
import { Grid } from 'nexus/layout/grid/Grid';

import { Helper } from 'nexus/ui/helper/Helper';
import { IconButton, Button } from 'nexus/ui/button/Button';
import { ThumbnailGhost } from 'nexus/ui/thumbnail/Thumbnail';
import { Popover } from 'nexus/ui/popover/Popover';
import { Icon } from 'nexus/ui/icon/Icon';
import {
	List,
	ListItem,
	ListIcon,
	ListText
} from 'nexus/ui/list/List';
import { Typography } from 'nexus/ui/typography/Typography';

import { setToStorage } from 'nexus/utils/Storage';

import './Home.css';


// Datas
// ======================================================================================================

const NB_SHOWCASED = 6;

const HOME_SECTIONS = [
	{
		"value": "showcased",
		"label": "Mis en avant",
		"icon": "tips_and_updates",
	},
	{
		"value": "new",
		"label": "Ajouté dernièrement",
		"icon": "new_releases",
	},
	{
		"value": "history",
		"label": "Écouté récemment",
		"icon": "history",
	},
]

export let HOME_SECTIONS_BY_KEYS = {};
for (const homeSectionItem of HOME_SECTIONS) {
	HOME_SECTIONS_BY_KEYS[homeSectionItem.value] = homeSectionItem;
}


// Models
// ======================================================================================================

// ***** HomeStore *****
// *********************

const TAG_HomeStore = () => {}
export const HomeStore = types
	.model({
		sectionDisplayed: types.optional(types.array(types.string), []),

		showcasedIds: types.optional(types.array(types.string), []),

		initialized: false,
	})
	.views(self => ({

		get sectionHidden() {
			let hiddenKeys = [];
			for (const homeSection of HOME_SECTIONS) {
				if (self.sectionDisplayed.indexOf(homeSection.value) == -1) {
					hiddenKeys.push(homeSection.value);
				}
			}
			return hiddenKeys;
		},

		// Bools
		// -

		get displayedShowcase() {
			if (self.sectionDisplayed.indexOf("showcased") > -1) {
				return true;
			}
			return false;
		},

		get displayedNew() {
			if (self.sectionDisplayed.indexOf("new") > -1) {
				return true;
			}
			return false;
		},

		get displayedHistory() {
			if (self.sectionDisplayed.indexOf("history") > -1) {
				return true;
			}
			return false;
		},

		// Getter
		// -

		getShowcased() {
			const store = getRoot(self);
			const albums = store.albums;

			let showcased = [];
			for (const albumId of self.showcasedIds) {
				const album = albums.by_id.get(albumId);
				if (album) {
					showcased.push(album);
				}
			}
			return showcased;
		},

	}))
	.actions(self => ({

		setField: (field, value) => {
			self[field] = value;
		},

		// -

		init: () => {
			self.refreshShowcased();
			self.initialized = true;
		},

		save: () => {
			setToStorage('homeSectionDisplayed', self.sectionDisplayed.toJSON(), 'json');
		},

		// -

		displaySection: (sectionKey) => {
			if (self.sectionDisplayed.indexOf(sectionKey) == -1) {
				self.sectionDisplayed.push(sectionKey);
				self.save();
			}
		},

		hideSection: (sectionKey) => {
			const sectionIdx = self.sectionDisplayed.indexOf(sectionKey);
			if (sectionIdx > -1) {
				self.sectionDisplayed.splice(sectionIdx, 1);
				self.save();
			}
		},

		// -

		refreshShowcased: () => {
			const store = getRoot(self);
			const albums = store.albums;
			self.showcasedIds = albums.getRandomly(NB_SHOWCASED, false);
		},

	}))


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

// ***** RenderShowcased *****
// ***************************

const TAG_RenderShowcased = () => {}
export const RenderShowcased = observer((props) => {

	const store = React.useContext(window.storeContext);
	const app = store.app;
	const home = store.home;
	const albums = store.albums;

	// From ... store

	const showcased = home.getShowcased();

	// ...

	const homeSectionDef = HOME_SECTIONS_BY_KEYS["showcased"];

	// Events
	// ==================================================================================================

	const handleRefreshShowcased = () => {
		home.refreshShowcased();
	}

	const handleCloseClick = () => {
		home.hideSection(homeSectionDef.value);
	}

	// -

	const handleAlbumClick = (albumId) => {
		store.navigateTo('album', albumId);
	}

	// Render
	// ==================================================================================================

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

	return (
		<div>
			<Ribbon
				avatarIconName={homeSectionDef.icon}
				avatarIconColor="hot"
				title={homeSectionDef.label}
				right={(
					<div className="h-col">
						<IconButton
							iconName="model_training"
							color="info"
							onClick={() => handleRefreshShowcased()}
						/>
						<IconButton
							iconName="close"
							color="default"
							onClick={() => handleCloseClick()}
						/>
					</div>
				)}
				style={{
					backgroundColor: 'transparent',
					marginBottom: '20px',
				}}
			/>

			{showcased.length > 0 && (
				<Grid
					justify="space-between"
					style={{
						paddingLeft: '16px',
						paddingRight: '16px',
						marginBottom: '40px',
					}}
				>
					{showcased.map((album, albumIdx) => (
						<AlbumThumbnail
							key={`thumbnail-showcased-${albumIdx}`}
							album={album}
							callbackClick={() => handleAlbumClick(album.id)}
						/>
					))}
					{ghosts}
				</Grid>
			)}
		</div>
	)
})

// ***** RenderLastAdded *****
// ***************************

const TAG_RenderLastAdded = () => {}
export const RenderLastAdded = observer((props) => {

	const store = React.useContext(window.storeContext);
	const app = store.app;
	const home = store.home;
	const albums = store.albums;

	// From ... store

	const lastAdded = albums.getLastAdded(6);

	// ...

	const homeSectionDef = HOME_SECTIONS_BY_KEYS["new"];

	// Events
	// ==================================================================================================

	const handleCloseClick = () => {
		home.hideSection(homeSectionDef.value);
	}

	// -

	const handleAlbumClick = (albumId) => {
		store.navigateTo('album', albumId);
	}

	// Render
	// ==================================================================================================

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

	return (
		<div>
			<Ribbon
				avatarIconName={homeSectionDef.icon}
				avatarIconColor="hot"
				title={homeSectionDef.label}
				right={(
					<div className="h-col">
						<IconButton
							iconName="close"
							color="default"
							onClick={() => handleCloseClick()}
						/>
					</div>
				)}
				style={{
					backgroundColor: 'transparent',
					marginBottom: '20px',
				}}
			/>
			{lastAdded.length > 0 && (
				<Grid
					justify="space-between"
					style={{
						paddingLeft: '16px',
						paddingRight: '16px',
						marginBottom: '40px',
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
			)}
		</div>
	)
})

// ***** RenderLastListened *****
// ******************************

const TAG_RenderLastListened = () => {}
export const RenderLastListened = observer((props) => {

	const store = React.useContext(window.storeContext);
	const app = store.app;
	const home = store.home;

	// From ... store

	const recentHistory = []; // TODO

	// ...

	const homeSectionDef = HOME_SECTIONS_BY_KEYS["history"];

	// Events
	// ==================================================================================================

	const handleCloseClick = () => {
		home.hideSection(homeSectionDef.value);
	}

	// -

	const handleAlbumClick = (albumId) => {
		store.navigateTo('album', albumId);
	}

	// Render
	// ==================================================================================================

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

	return (
		<div>
			<Ribbon
				avatarIconName={homeSectionDef.icon}
				avatarIconColor="hot"
				title={homeSectionDef.label}
				right={(
					<div className="h-col">
						<IconButton
							iconName="close"
							color="default"
							onClick={() => handleCloseClick()}
						/>
					</div>
				)}
				style={{
					backgroundColor: 'transparent',
					marginBottom: '20px',
				}}
			/>
			{recentHistory.length > 0 && (
				<Grid
					justify="space-between"
					style={{
						paddingLeft: '16px',
						paddingRight: '16px',
						marginBottom: '40px',
					}}
				>
					{recentHistory.map((album, albumIdx) => (
						<AlbumThumbnail
							key={`thumbnail-history-${albumIdx}`}
							album={album}
							callbackClick={() => handleAlbumClick(album.id)}
						/>
					))}
					{ghosts}
				</Grid>
			)}
			{(recentHistory.length == 0 && false) && (
				<Typography
					style={{
						paddingLeft: '16px',
						paddingRight: '16px',
						marginBottom: '40px',
					}}
				>
					Rien pour le moment.
				</Typography>
			)}
		</div>
	)
})

// ***** HomePage *****
// ********************

const TAG_HomePage = () => {}
export const HomePage = observer((props) => {

	const store = React.useContext(window.storeContext);
	const app = store.app;
	const menu = app.menu;
	const home = store.home;
	const library = store.library;
	const albums = store.albums;

	// From ... states

	const [anchorAddSection, setAnchorAddSection] = React.useState(null);

	// From ... store

	const loaded = store.loaded;
	const initialized = home.initialized;
	const isLoading = app.isLoading;
	const menuPinned = menu.pinned;

	const sectionHidden = home.sectionHidden;
	const displayedShowcase = home.displayedShowcase;
	const displayedNew = home.displayedNew;
	const displayedHistory = home.displayedHistory;

	const nbFolders = library.nbFolders;
	const nbAlbums = albums.nbAlbums;

	// ...

	React.useEffect(() => {
		if (loaded && !initialized) {
			home.init();
		}
	}, [loaded, initialized]);

	// ...

	// Events
	// ==================================================================================================

	const handleAddClick = (event) => {
		setAnchorAddSection(event.currentTarget);
	}

	const handleCloseAdd = () => {
		setAnchorAddSection(null);
	}

	// -

	const handleAddSectionClick = (sectionKey) => {
		home.displaySection(sectionKey);
	}

	// -

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
							{displayedShowcase && <RenderShowcased />}
							{displayedNew && <RenderLastAdded/>}
							{displayedHistory && <RenderLastListened />}
							{sectionHidden.length > 0 && (
								<div data-flex="0">
									<IconButton
										iconName="add"
										// color="info"
										onClick={(e) => handleAddClick(e)}
									/>
									<Popover
										id="pop-add-section"
										open={Boolean(anchorAddSection)}
										anchorEl={anchorAddSection}
										onClose={handleCloseAdd}
										anchorOrigin={{
											vertical: 'bottom',
											horizontal: 'center',
										}}
										transformOrigin={{
											vertical: 'top',
											horizontal: 'left',
										}}
										style={{
											width: '240px',
										}}
									>
										<List>
											{sectionHidden.map((sectionKey, sectionIdx) => {
												const homeSectionDef = HOME_SECTIONS_BY_KEYS[sectionKey];
												return (
													<ListItem
														key={`menu-item-${sectionKey}`}
														onClick={() => handleAddSectionClick(sectionKey)}
													>
														<ListIcon
															name={homeSectionDef.icon}
															color="typography"
														/>
														<ListText>
															{homeSectionDef.label}
														</ListText>
													</ListItem>
												)
											})}
										</List>
									</Popover>
								</div>
							)}
						</div>
					)
					if (displayedShowcase || displayedNew || displayedHistory) {
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
