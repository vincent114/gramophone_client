import React from 'react';
import { observer } from "mobx-react-lite";
import clsx from 'clsx';

import { RenderSectionTheme } from 'nexus/contexts/preferences/Preferences';

import { Heading } from 'nexus/forms/heading/Heading';
import { Indicator } from 'nexus/forms/indicator/Indicator';
// import { Field } from 'nexus/forms/field/Field';

import { Section } from 'nexus/layout/section/Section';
import { Row } from 'nexus/layout/row/Row';

import { Helper } from 'nexus/ui/helper/Helper';
import { Icon } from 'nexus/ui/icon/Icon';
import { IconButton } from 'nexus/ui/button/Button';
import {
	List,
	ListItem,
	ListText,
	ListIcon
} from 'nexus/ui/list/List';
import { Switch } from 'nexus/ui/switch/Switch';
import { Typography } from 'nexus/ui/typography/Typography';
import { Divider } from 'nexus/ui/divider/Divider';

import './Admin.css';


// Functions Components ReactJS
// -------------------------------------------------------------------------------------------------------------

// ***** RenderAdminFolders *****
// ******************************

const TAG_RenderAdminFolders = () => {}
export const RenderAdminFolders = observer((props) => {

	const store = React.useContext(window.storeContext);
	const app = store.app;
	const library = store.library;

	// From ... store

	const isLoading = app.isLoading;

	const nbFolders = library.nbFolders;

	const sourceFolders = library.source_folders;
	const copyFolder = library.copy_folder;

	// ...

	// Events
	// ==================================================================================================

	const handleParamsChange = (savePath, value) => {
		library.save();
	}

	const handleAddFolder = (folderKey) => {
		ipc.once('folderChoosed', (folders) => {
			for (const folder of folders) {
				library.addFolder(folderKey, folder);
				library.refreshAvailability();
				library.save(() => {
					library.startScan();
				});
			}
		});
		ipc.send('chooseFolder');
	}

	const handleFolderClick = (folderPath) => {
		ipc.send('showItemInFolder', [folderPath]);
	}

	const handleFolderDelete = (folderPath) => {
		const CONFIRM_DELETE_MSG = `Voulez-vous vraiment retirer le dossier ${folderPath}`;
		if (confirm(CONFIRM_DELETE_MSG)) {
			library.removeFolder(folderPath);
			library.save();
		}
	}

	// Render
	// ==================================================================================================

	// Section -> Icon
	// -------------------------------------------------

	const sectionIcon = <Icon name="storage" />

	// Section -> Title
	// -------------------------------------------------

	const sectionTitle = "Collection";

	// Section -> Content
	// -------------------------------------------------

	const sectionContent = (
		<div>
			<Heading variant="contained">
				Dossiers source
			</Heading>
			<List>
				{sourceFolders.map((sourceFolder, sourceFolderIdx) => (
					<ListItem
						key={`source-folder-${sourceFolderIdx}`}
						hoverable={true}
						onClick={() => handleFolderClick(sourceFolder.folder_path)}
						callbackDelete={(e) => handleFolderDelete(sourceFolder.folder_path)}
					>
						<ListIcon name="folder" />
						<ListText
							primary={sourceFolder.label}
							secondary={sourceFolder.folder_path}
						/>
						<Indicator
							variant="contrasted"
							color={(sourceFolder.folder_available) ? "success" : "error"}
							className="flex-0"
							style={{
								marginRight: "10px",
							}}
						/>
						<Indicator
							variant="contrasted"
							iconName="music_note"
							color={(sourceFolder.nb_files > 0) ? "success" : "default"}
							className="flex-0"
							style={{
								marginRight: "5px",
								paddingLeft: "5px",
								paddingRight: "10px",
							}}
						>
							{sourceFolder.nb_files}
						</Indicator>
						<Indicator
							variant="contrasted"
							iconName="dangerous"
							color={(sourceFolder.nb_files_ignored > 0) ? "error" : "default"}
							className="flex-0"
							style={{
								marginRight: "5px",
								paddingLeft: "5px",
								paddingRight: "10px",
							}}
						>
							{sourceFolder.nb_files_ignored}
						</Indicator>
					</ListItem>
				))}
			</List>
			<IconButton
				iconName="add"
				color="info"
				disabled={isLoading}
				onClick={() => handleAddFolder("source")}
			/>

			<Heading variant="contained">
				Dossier de recopie (optionnel)
			</Heading>
			<Switch
				label="Activer la copie à la demande"
				savePath={['library', 'copy_enabled']}
				style={{
					marginTop: '5px',
					marginLeft: '6px',
				}}
				callbackChange={handleParamsChange}
			/>
			<Divider spacing="small" />
			{copyFolder.isSet && (
				<List>
					<ListItem
						key="copy-folder"
						hoverable={true}
						onClick={() => handleFolderClick(copyFolder.folder_path)}
						callbackDelete={() => handleFolderDelete(copyFolder.folder_path)}
					>
						<ListIcon name="folder" />
						<ListText
							primary={copyFolder.label}
							secondary={copyFolder.folder_path}
						/>
						<Indicator
							variant="contrasted"
							color={(copyFolder.folder_available) ? "success" : "error"}
							className="flex-0"
							style={{
								marginRight: "10px",
							}}
						/>
						<Indicator
							variant="contrasted"
							iconName="music_note"
							color={(copyFolder.nb_files > 0) ? "success" : "default"}
							className="flex-0"
							style={{
								marginRight: "5px",
								paddingLeft: "5px",
								paddingRight: "10px",
							}}
						>
							{copyFolder.nb_files}
						</Indicator>
						<Indicator
							variant="contrasted"
							iconName="dangerous"
							color={(copyFolder.nb_files_ignored > 0) ? "error" : "default"}
							className="flex-0"
							style={{
								marginRight: "5px",
								paddingLeft: "5px",
								paddingRight: "10px",
							}}
						>
							{copyFolder.nb_files_ignored}
						</Indicator>
					</ListItem>
				</List>
			)}
			{!copyFolder.isSet && (
				<IconButton
					iconName="add"
					color="info"
					disabled={isLoading || nbFolders == 0}
					onClick={() => handleAddFolder("copy")}
				/>
			)}

		</div>
	)

	// -------------------------------------------------

	return (
		<Section
			icon={sectionIcon}
			title={sectionTitle}
		>
			{sectionContent}
		</Section>
	)
})

// ***** RenderAdminScan *****
// ***************************

const TAG_RenderAdminScan = () => {}
export const RenderAdminScan = observer((props) => {

	const store = React.useContext(window.storeContext);
	const app = store.app;
	const library = store.library;

	// From ... store

	const isLoading = app.isLoading;

	const nbFolders = library.nbFolders;
	const fullScanInfos = library.fullScanInfos;
	const quickScanInfos = library.quickScanInfos;

	// ...

	// Events
	// ==================================================================================================

	const handleParamsChange = () => {
		library.save();
	}

	// -

	const handleScanClick = (quick) => {
		library.startScan(quick);
	}

	const handleCancelScanClick = () => {
		library.stopScan();
	}

	// Render
	// ==================================================================================================

	// Section -> Icon
	// -------------------------------------------------

	const sectionIcon = <Icon name="youtube_searched_for" />

	// Section -> Title
	// -------------------------------------------------

	const sectionTitle = "Scan";

	// Section -> Content
	// -------------------------------------------------

	const sectionContent = (
		<div>
			<Switch
				label="Scanner automatiquement au démarrage"
				savePath={['library', 'auto_scan_enabled']}
				callbackChange={handleParamsChange}
			/>

			<Divider spacing="medium" />

			<Row align="center">
				<Indicator
					variant="contrasted"
					padding="big"
					color={fullScanInfos.severity}
					className="flex-0"
					style={{
						minWidth: "100px",
					}}
				>
					{fullScanInfos.title}
				</Indicator>
				<Typography
					size="small"
					variant="description"
				>
					{fullScanInfos.subtitle}
				</Typography>
				{fullScanInfos.severity != "warning" && (
					<IconButton
						iconName="refresh"
						color="info"
						disabled={isLoading || nbFolders == 0}
						className="flex-0"
						onClick={() => handleScanClick()}
					/>
				)}
				{fullScanInfos.severity == "warning" && (
					<IconButton
						iconName="clear"
						color="error"
						className="flex-0"
						onClick={() => handleCancelScanClick()}
					/>
				)}
			</Row>

			<Divider spacing="medium" />

			<Row align="center">
				<Indicator
					variant="contrasted"
					padding="big"
					color={quickScanInfos.severity}
					className="flex-0"
					style={{
						minWidth: "100px",
					}}
				>
					{quickScanInfos.title}
				</Indicator>
				<Typography
					size="small"
					variant="description"
				>
					{quickScanInfos.subtitle}
				</Typography>
				{quickScanInfos.severity != "warning" && (
					<IconButton
						iconName="refresh"
						color="info"
						disabled={isLoading || nbFolders == 0}
						className="flex-0"
						onClick={() => handleScanClick(true)}
					/>
				)}
				{quickScanInfos.severity == "warning" && (
					<IconButton
						iconName="clear"
						color="error"
						className="flex-0"
						onClick={() => handleCancelScanClick()}
					/>
				)}
			</Row>
		</div>
	)

	// -------------------------------------------------

	return (
		<Section
			icon={sectionIcon}
			title={sectionTitle}
		>
			{sectionContent}
		</Section>
	)
})

// ***** RenderSectionPlayback *****
// *********************************

const TAG_RenderSectionPlayback = () => {}
export const RenderSectionPlayback = observer((props) => {

	const store = React.useContext(window.storeContext);
	const app = store.app;
	const library = store.library;

	// From ... store

	const isLoading = app.isLoading;

	// ...

	// Events
	// ==================================================================================================

	const handleParamsChange = () => {
		library.save();
	}

	// Render
	// ==================================================================================================

	// Section -> Icon
	// -------------------------------------------------

	const sectionIcon = <Icon name="headphones" />

	// Section -> Title
	// -------------------------------------------------

	const sectionTitle = "Lecture aléatoire";

	// Section -> Content
	// -------------------------------------------------

	const sectionContent = (
		<div>
			<Switch
				label="Qu'à partir des titres favoris"
				savePath={['library', 'shuffle_only_favorites']}
				callbackChange={handleParamsChange}
			/>
			<Switch
				label="Ignorer les bandes originales"
				savePath={['library', 'shuffle_ignore_soudtracks']}
				callbackChange={handleParamsChange}
			/>
		</div>
	)

	// -------------------------------------------------

	return (
		<Section
			icon={sectionIcon}
			title={sectionTitle}
		>
			{sectionContent}
		</Section>
	)
})

// ***** RenderAdmin *****
// ***********************

const TAG_RenderAdmin = () => {}
export const RenderAdmin = observer((props) => {

	const store = React.useContext(window.storeContext);
	const app = store.app;

	// ...

	// Render
	// ==================================================================================================

	return (
		<React.Fragment>
			<RenderAdminFolders />
			<RenderAdminScan />
			<RenderSectionPlayback />
			<RenderSectionTheme />
		</React.Fragment>
	)
})

// ***** AdminPage *****
// *********************

const TAG_AdminPage = () => {}
export const AdminPage = observer((props) => {

	const store = React.useContext(window.storeContext);
	const app = store.app;

	// From ... store

	const initialized = app.initialized;

	// ...

	const showHelper = (!initialized) ? true : false;

	// Renderers
	// ==================================================================================================

	const renderPage = () => {

		// Render :: Page
		// ---

		let pageContent = null;
		if (initialized) {
			pageContent = <RenderAdmin />
		}
		return pageContent;
	}

	const renderHelper = () => {

		// Render :: Helper
		// ---

		return (
			<Helper
				iconName="setting"
				show={showHelper}
			/>
		)
	}

	return (
		<div className="nx-page">
			{renderPage()}
			{renderHelper()}
		</div>
	)
})
