import React from 'react';
import { observer } from "mobx-react-lite";
import clsx from 'clsx';

import { Section } from 'nexus/layout/section/Section';
import { Helper } from 'nexus/ui/helper/Helper';
import { Icon } from 'nexus/ui/icon/Icon';

import './Admin.css';


// Functions Components ReactJS
// -------------------------------------------------------------------------------------------------------------

// ***** RenderAdminScan *****
// ***************************

const TAG_RenderAdminScan = () => {}
export const RenderAdminScan = observer((props) => {

	const store = React.useContext(window.storeContext);
	const app = store.app;

	// ...

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

// ***** RenderAdminFolders *****
// ******************************

const TAG_RenderAdminFolders = () => {}
export const RenderAdminFolders = observer((props) => {

	const store = React.useContext(window.storeContext);
	const app = store.app;

	// ...

	// Render
	// ==================================================================================================

	// Section -> Icon
	// -------------------------------------------------

	const sectionIcon = <Icon name="storage" />

	// Section -> Title
	// -------------------------------------------------

	const sectionTitle = "Dossiers";

	// Section -> Content
	// -------------------------------------------------

	const sectionContent = (
		<div>

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
			<RenderAdminScan />
			<RenderAdminFolders />
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
