import React from 'react';
import { observer } from "mobx-react-lite";
import clsx from 'clsx';

import { Helper } from 'nexus/ui/helper/Helper';
import { Button } from 'nexus/ui/button/Button';

import './Home.css';


// Functions Components ReactJS
// -------------------------------------------------------------------------------------------------------------

// ***** HomePage *****
// ********************

const TAG_HomePage = () => {}
export const HomePage = observer((props) => {

	const store = React.useContext(window.storeContext);
	const app = store.app;
	const tracks = store.tracks;
	const library = store.library;

	// From ... store

	const loaded = store.loaded;
	const isLoading = app.isLoading;

	const nbTracks = tracks.nbTracks;

	// Events
	// ==================================================================================================

	const handleChooseLibrary = () => {
		ipc.once('folderChoosed', (folders) => {
			for (const folder of folders) {
				library.addFolder(folder);
			}
		});
		ipc.send('chooseFolder');
	}

	// Renderers
	// ==================================================================================================

	const renderHelper = () => {

		// Render :: Helper
		// ---

		let helperSubtitle = "";
		if (loaded) {
			helperSubtitle = "Que souhaitez-vous écouter aujourd'hui ?";
			if (nbTracks == 0) {
				helperSubtitle = "Pour commencer, sélectionnez ou glissez un dossier contenant de la musique.";
			}
		}

		// -------------------------------------------------

		let helperContent = null;
		if (loaded && nbTracks == 0) {
			helperContent = (
				<Button
					key="btn-choose-library"
					id="btn-choose-library"
					variant="contained"
					color="secondary"
					disabled={isLoading}
					onClick={() => handleChooseLibrary()}
				>
					Sélectionner un dossier ...
				</Button>
			)
		}

		// -------------------------------------------------

		return (
			<Helper
				icon={<img className="nx-helper-icon" src="static/favicons/android-icon-192x192.png" />}
				title="Bienvenue sur Gramophone !"
				subtitle={helperSubtitle}
				show={true}
				style={{
					maxWidth: '400px',
				}}
			>
				{helperContent}
			</Helper>
		)
	}

	return (
		<div className="nx-page">
			{renderHelper()}
		</div>
	)
})
