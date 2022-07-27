import React from 'react';
import { types, getRoot } from "mobx-state-tree";
import { observer } from "mobx-react-lite";
import clsx from 'clsx';

import { Field } from 'nexus/forms/field/Field';

import { Row } from 'nexus/layout/row/Row';
import { Column } from 'nexus/layout/column/Column';

import { Helper } from 'nexus/ui/helper/Helper';
import { Popup } from 'nexus/ui/popup/Popup';
import { Icon } from 'nexus/ui/icon/Icon';
import { Typography } from 'nexus/ui/typography/Typography';

import { dateTools } from 'nexus/utils/DateTools';

import './PopupTrackMetadatas.css';


// Models
// ======================================================================================================

// ***** PopupTrackMetadatasStore *****
// ************************************

const TAG_PopupTrackMetadatasStore = () => {}
export const PopupTrackMetadatasStore = types
	.model({
		trackId: types.maybeNull(types.string),
	})
	.views(self => ({

		get track() {
			const store = getRoot(self);
			const tracks = store.tracks;
			return tracks.by_id.get(self.trackId);
		},

		// Bools
		// -

		get isOpen() {
			const store = getRoot(self);
			const app = store.app;
			const popup = app.popup;

			return popup.isOpen(popupTrackMetadatasKey);
		},

	}))
	.actions(self => ({

		setField: (field, value) => {
			self[field] = value;
		},

		// -

		open: () => {
			const store = getRoot(self);
			const app = store.app;
			const popup = app.popup;

			popup.open(popupTrackMetadatasKey);
		},

	}))


// Functions Components ReactJS
// ======================================================================================================

// ***** PopupTrackMetadatas *****
// *******************************

const TAG_PopupTrackMetadatas = () => {}
export const popupTrackMetadatasKey = 'popupTrackMetadatas';
export const PopupTrackMetadatas = observer((props) => {

	const store = React.useContext(window.storeContext);
	const app = store.app;
	const popup = app.popup;
	const popupTrackMetadatas = store.popupTrackMetadatas;

	// From ... store

	const isLoading = app.isLoading;
	const isOpen = popupTrackMetadatas.isOpen;

	// ...

	const track = popupTrackMetadatas.track;

	// Render
	// ==================================================================================================

	// Popup --> Title
	// -----------------------------------------------

	let popupTitle = "Informations";

	// Popup --> Content
	// -----------------------------------------------

	let popupContent = null;
	if (isOpen) {
		if (track) {

			// id: types.maybeNull(types.string),
			// name: types.maybeNull(types.string),
			// disk: types.frozen(null),
			// track: types.frozen(null),

			// track_path: types.maybeNull(types.string),
			// track_type: types.maybeNull(types.string),
			// track_available: true,

			// ts_file: types.maybeNull(types.string),
			// ts_added: types.maybeNull(types.string),

			// artist: types.maybeNull(types.string),
			// album: types.maybeNull(types.string),

			// checked: true,
			// favorite: false,
			// starred: false,

			// album_id: types.maybeNull(types.string),
			// artist_id: types.maybeNull(types.string),
			// year_id: types.maybeNull(types.string),
			// genre_id: types.maybeNull(types.string),

			const linkedAlbum = track.linkedAlbum;
			const linkedArtist = track.linkedArtist;
			const linkedYear = track.linkedYear;
			const linkedGenre = track.linkedGenre;

			popupContent = (
				<Row
					spacing="medium"
					style={{
						padding: '10px',
					}}
				>

					<div
						className="g-metadatas-cover"
						style={{
							marginBottom: '10px',
						}}
					>
						{!linkedAlbum.cover && (
							<Icon
								name="album"
								color="default"
								style={{
									width: '80px',
								}}
							/>
						)}
						{linkedAlbum.cover && (
							<img src={linkedAlbum.cover} />
						)}
					</div>

					<Column align="stretch">

						<Row marginBottom="normal">
							<Field
								id="txt-track-name"
								component='input'
								label="Titre"
								value={track.name}
								disabled={true}
							/>
						</Row>

						<Row marginBottom="normal">
							<Field
								id="txt-artist-name"
								component='input'
								label="Artiste"
								value={linkedArtist.name}
								disabled={true}
							/>
						</Row>

						<Row marginBottom="normal">
							<Field
								id="txt-album-name"
								component='input'
								label="Album"
								value={linkedAlbum.name}
								disabled={true}
							/>
						</Row>

						<Row marginBottom="normal">
							<Field
								id="txt-genre-name"
								component='input'
								label="Genre"
								value={linkedGenre.name}
								disabled={true}
							/>
							<Field
								id="txt-year-name"
								component='input'
								label="Genre"
								value={linkedYear.name}
								disabled={true}
							/>
						</Row>

						<Row>
							<div className="h-col-small">
								<Field
									id="txt-track"
									component='input'
									label="Piste"
									value={track.track}
									disabled={true}
								/>
								<Field
									id="txt-disc"
									component='input'
									label="Piste"
									value={track.disc}
									disabled={true}
								/>
							</div>
							<div className="responsive-hidden"></div>
						</Row>

						{track.ts_added && (
							<Row
								style={{
									marginTop: '10px',
								}}
							>
								<Typography
									variant="description"
									size="small"
								>
									Ajouté le {dateTools.dateToFrenchFull(track.ts_added)} à {dateTools.fromTimeToHumanized(track.ts_added)}
								</Typography>
							</Row>
						)}

					</Column>

				</Row>
			)
		} else {
			popupContent = (
				<Helper
					iconName="album"
					show={true}
					inFlux={true}
					style={{
						minHeight: '600px',
					}}
				/>
			)
		}
	}

	// -----------------------------------------------

	return (
		<Popup
			id={popupTrackMetadatasKey}
			title={popupTitle}
			maxWidth="md"
		>
			{popupContent}
		</Popup>
	)
})
