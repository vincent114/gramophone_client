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
				library.save(() => {
					library.scan();
				});
			}
		});
		ipc.send('chooseFolder');
	}

	const handleFolderClick = (folderPath) => {
		console.log(folderPath);
	}

	const handleFolderDelete = (folderPath) => {
		console.log(folderPath);
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
			<Heading>
				Dossiers source
			</Heading>
			<List>
				{sourceFolders.map((sourceFolder, sourceFolderIdx) => (
					<ListItem
						key={`source-folder-${sourceFolderIdx}`}
						hoverable={true}
						onClick={() => handleFolderClick(sourceFolder.folder_path)}
						callbackDelete={() => handleFolderDelete(sourceFolder.folder_path)}
					>
						<ListIcon name="folder" />
						<ListText
							primary={sourceFolder.label}
							secondary={sourceFolder.folder_path}
						/>
					</ListItem>
				))}
			</List>
			<IconButton
				iconName="add"
				color="info"
				disabled={isLoading}
				onClick={() => handleAddFolder("source")}
			/>

			<Heading>
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

	const handleScanClick = (scope) => {

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
			<Row align="center">
				<Indicator
					variant="contrasted"
					padding="big"
					severity={fullScanInfos.severity}
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
				<IconButton
					iconName="refresh"
					color="info"
					disabled={isLoading || nbFolders == 0}
					className="flex-0"
					onClick={() => handleScanClick("full")}
				/>
			</Row>

			<Divider spacing="medium" />

			<Row align="center">
				<Indicator
					variant="contrasted"
					padding="big"
					severity={quickScanInfos.severity}
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
				<IconButton
					iconName="refresh"
					color="info"
					disabled={isLoading || nbFolders == 0}
					className="flex-0"
					onClick={() => handleScanClick("quick")}
				/>
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
