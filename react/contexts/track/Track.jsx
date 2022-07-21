import React from 'react';
import { types, getRoot } from "mobx-state-tree";
import { observer } from "mobx-react-lite";
import clsx from 'clsx';

import {
	TableHead,
	TableRow,
	TableCell
} from 'nexus/forms/table/Table';
import { Field } from 'nexus/forms/field/Field';

import { IconButton } from 'nexus/ui/button/Button';

import './Track.css';


// Models
// ======================================================================================================

// ***** TrackStore *****
// **********************

const TAG_TrackStore = () => {}
export const TrackStore = types
	.model({
		id: types.maybeNull(types.string),
		name: types.maybeNull(types.string),
		disk: types.frozen(null),
		track: types.frozen(null),

		track_path: types.maybeNull(types.string),
		track_type: types.maybeNull(types.string),
		track_available: true,

		ts_file: types.maybeNull(types.string),
		ts_added: types.maybeNull(types.string),

		artist: types.maybeNull(types.string),
		album: types.maybeNull(types.string),

		checked: true,
		favorite: false,
		starred: false,

		album_id: types.maybeNull(types.string),
		artist_id: types.maybeNull(types.string),
		year_id: types.maybeNull(types.string),
		genre_id: types.maybeNull(types.string),
	})
	.views(self => ({

		get discNumber() {
			return (self.disk) ? self.disk : 0;
		},

		get discNumberLabel() {
			const discNumber = `${self.discNumber}`;
			if (discNumber.length < 2) {
				return `0${discNumber}`;
			}
			return discNumber;
		},

		get trackNumber() {
			return (self.track) ? self.track : 0;
		},

		get trackNumberLabel() {
			const trackNumber = `${self.trackNumber}`;
			if (trackNumber.length < 2) {
				return `0${trackNumber}`;
			}
			return trackNumber;
		},

		get sortNumber() {
			return `${self.discNumberLabel}-${self.trackNumberLabel}`;
		},

		// -

		get linkedAlbum() {
			const store = getRoot(self);
			const albums = store.albums;
			return albums.getById(self.album_id);
		},

		get linkedArtist() {
			const store = getRoot(self);
			const artists = store.artists;
			return artists.getById(self.artist_id);
		},

		get linkedYear() {
			const store = getRoot(self);
			const years = store.years;
			return years.getById(self.year_id);
		},

		get linkedGenre() {
			const store = getRoot(self);
			const genres = store.genres;
			return genres.getById(self.genre_id);
		},

		// Bools
		// -

		get isPlayerCandidate() {

			// Titre candidat à la lecture ordonnée ?
			// ---

			if (!self.checked) {
				return false;
			}
			return true;
		},

		get isShuffleCandidate() {

			// Titre candidat à la lecture aléatoire ?
			// ---

			const store = getRoot(self);
			const library = store.library;

			const shuffleOnlyFavorites = library.shuffle_only_favorites;
			const shuffleIgnoreSoudtracks = library.shuffle_ignore_soudtracks;
			const shuffleIgnoreHidden = library.shuffle_ignore_hidden;

			// Que des favoris ?
			if (shuffleOnlyFavorites && !self.favorite) {
				return false;
			}

			// Pas de soundtrack ?
			if (shuffleIgnoreSoudtracks && ['soundtrack', 'soundtracks'].indexOf(self.genre_id) == -1) {
				return false;
			}

			// Pas de titre désectionné ?
			if (shuffleIgnoreHidden && !self.checked) {
				return false;
			}

			return true;
		},

	}))
	.actions(self => ({

		setField: (field, value) => {
			self[field] = value;
		},

		// -

		update: (raw) => {
			self.id = raw.id;
			self.name = raw.name;
			self.disk = raw.disk;
			self.track = raw.track;

			self.track_path = raw.track_path;
			self.track_type = raw.track_type;
			self.track_available = raw.track_available;

			self.ts_file = raw.ts_file;
			self.ts_added = raw.ts_added;

			self.artist = raw.artist;
			self.album = raw.album;

			self.checked = raw.checked;
			self.favorite = raw.favorite;
			self.starred = raw.starred;

			self.album_id = raw.album_id;
			self.artist_id = raw.artist_id;
			self.year_id = raw.year_id;
			self.genre_id = raw.genre_id;
		},

	}))


// Functions Components ReactJS
// ======================================================================================================

// ***** TrackRow *****
// ********************

const TAG_TrackRow = () => {}
export const TrackRow = observer((props) => {

	const store = React.useContext(window.storeContext);
	const app = store.app;

	// From ... props

	const track = props.track;

	// From ... store

	const isLoading = app.isLoading;

	// ...

	// Events
	// ==================================================================================================

	const handleFavoriteClicked = (track) => {
		track.setField('favorite', !track.favorite);
	}

	const handleStarredClicked = (track) => {
		track.setField('starred', !track.starred);
	}

	const handleTrackMore = (trackId) => {
		// TODO
		console.log(trackId);
	}

	// Render
	// ==================================================================================================

	return (
		<TableRow
			hoverable={true}
		>
			<TableCell
				width={42}
				align="center"
				size="tiny"
			>
				<Field
					component='checkbox'
					ghostLabel={false}
					savePath={['tracks', 'by_id', track.id, 'checked']}
					disabled={isLoading}
				/>
			</TableCell>
			<TableCell
				width={42}
				align="center"
				size="tiny"
			>
				<IconButton
					size="small"
					iconName={(track.favorite) ? "favorite" : "favorite_border"}
					color={(track.favorite) ? "error" : null}
					disabled={isLoading}
					onClick={() => handleFavoriteClicked(track)}
				/>
			</TableCell>
			<TableCell
				width={42}
				align="center"
				size="tiny"
			>
				<IconButton
					size="small"
					iconName={(track.starred) ? "star" : "star_outline"}
					color={(track.starred) ? "warning" : null}
					disabled={isLoading}
					onClick={() => handleStarredClicked(track)}
				/>
			</TableCell>
			<TableCell
				width={42}
				size="tiny"
				fontSize="13px"
			>
				{track.track}
			</TableCell>
			<TableCell
				size="tiny"
				fontSize="13px"
			>
				{track.name}
			</TableCell>
			<TableCell
				width={42}
				align="right"
				size="tiny"
			>
				<IconButton
					size="small"
					iconName="more_horiz"
					// color="typography"
					onClick={() => handleTrackMore(track.id)}
				/>
			</TableCell>
		</TableRow>
	)
})
