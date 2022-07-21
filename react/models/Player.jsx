import React from 'react';
import { types, getRoot } from "mobx-state-tree";
import { observer } from "mobx-react-lite";
import clsx from 'clsx';


// Datas
// ======================================================================================================

export const DRAWER_VIEWS_ITEMS = [
	{
		"value": "current",
		"label": "Suivant",
	},
	{
		"value": "history",
		"label": "Historique",
	},
]


// Models
// ======================================================================================================

// ***** PlayerStore *****
// ***********************

const TAG_PlayerStore = () => {}
export const PlayerStore = types
	.model({

		isPlaying: false,

		sliderCurrent: 0,
		sliderMax: 0,

		volume: 25,

		// -

		playList: types.optional(types.array(types.string), []),
		playIdx: types.maybeNull(types.integer, -1),

		historyList: types.optional(types.array(types.string), []),
		historyIdx: types.maybeNull(types.integer, -1),

		drawerOpen: false,
		drawerView: 'current', // current, history

	})
	.views(self => ({

		get nbTracks() {
			return self.playList.length;
		},

		get nbTracksHistory() {
			return self.historyList.length;
		},

		// Getters
		// -

		get playTracks() {
			const store = getRoot(self);
			const tracks = store.tracks;

			let tracksList = [];
			for (const trackId of self.playList) {
				const track = tracks.by_id.get(trackId);
				if (track) {
					tracksList.push(track);
				}
			}
			return tracksList;
		},

		get playTrackId() {
			if (self.playIdx > -1 && self.playIdx <= self.playList.length - 1) {
				return self.playList[self.playIdx];
			}
			return "";
		},

		get playTrack() {
			const store = getRoot(self);
			const tracks = store.tracks;

			const playTrackId = self.playTrackId;
			const playTrack = tracks.by_id.get(playTrackId);

			return playTrack;
		},

		// -

		get historyTracks() {
			const store = getRoot(self);
			const tracks = store.tracks;

			let tracksList = [];
			for (const trackId of self.historyList) {
				const track = tracks.by_id.get(trackId);
				if (track) {
					tracksList.push(track);
				}
			}
			return tracksList;
		},

		// -

		getTrackIdx(trackId) {
			return self.playList.indexOf(trackId);
		},

	}))
	.actions(self => ({

		setField: (field, value) => {
			self[field] = value;
		},

		toggleDrawer: () => {
			self.drawerOpen = !self.drawerOpen;
		},

		// -

		populate: (trackIds) => {
			for (const trackId of trackIds) {
				self.playList.push(trackId);
			}
		},

		populateHistory: (trackIds) => {
			for (const trackId of trackIds) {
				self.historyList.push(trackId);
			}
		},

		clear: () => {
			self.playList = [];
			self.playIdx = -1;
		},

		clearHistory: () => {
			self.historyList = [];
			self.historyIdx = -1;
		},

		// -

		read: (trackId) => {

			// Lecture du morceau passé en paramètres
			// ---

			if (self.nbTracks == 0) {
				return;
			}

			let trackIdx = -1;
			if (trackId == undefined) {
				trackIdx = 0;
				trackId = self.playList[0];
			} else {
				trackIdx = self.getTrackIdx(trackId);

				// Non trouvé dans la liste de lecture
				if (trackIdx == -1) {
					return;
				}
			}

			self.playIdx = trackIdx;
			self.audioPlay();
		},

		readNext: () => {
			// TODO
		},

		// -

		_stopSlideInterval: () => {
			clearInterval(window.audioInterval);
		},

		_startSlideInterval: () => {

			// Slide toute les secondes
			// ---

			self._stopSlideInterval();
			window.audioInterval = setInterval(function() {
				self.setField('sliderCurrent', window.audio.currentTime);
			}, 1000);
		},

		audioPlay: () => {

			// Lit le titre courant
			// ---

			const store = getRoot(self);
			const track = self.playTrack;

			if (!track) { return; }

			const volume = self.volume;

			// Initialisation + chargement fichier source
			if (!window.audio) {
				window.audio = new Audio(track.track_path);
				window.audio.volume = volume / 100;
			}
			window.audio.oncanplay = function() {
				if (window.audio && window.audio.duration) {
					self.setField("sliderMax", window.audio.duration);
				}
			}

			// Slide
			self._startSlideInterval();

			// Passage automatique à la suite de la liste de lecture
			window.audio.onended = function() {
				self.readNext();
			}

			// Lecture
			window.audio.play();
			self.isPlaying = true;

			// Notification
			const focused = document.hasFocus();
			if (!focused) {

				const options = {
					title: track.name,
					body: track.artist + ' - ' + track.album,
					silent: true,
				}

				// Jaquette d'album
				const album = track.linkedAlbum;
				if (album.cover) {
					options['icon'] = album.cover;
				}

				const notification = new Notification(options.title, options);
				notification.onclick = function() {
					store.navigateTo('album', track.album_id);
				}
			}
		},

		audioPause: () => {

			// Met en pause la lecture du titre en cours
			// ---

			if (window.audio) {
				clearInterval(window.audioInterval);
				window.audio.pause();
				self.setField("isPlaying", false);
			}
		},

		audioStop: () => {

			// Stoppe la lecture du titre en cours
			// ---

			if (window.audio) {
				clearInterval(window.audioInterval);
				window.audio.pause();
				window.audio.currentTime = 0;
				window.audio = null;
				self.setField("isPlaying", false);
			}
		},

	}))
