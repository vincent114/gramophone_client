import React from 'react';
import { types, getRoot } from "mobx-state-tree";
import { observer } from "mobx-react-lite";
import { observable } from "mobx";
import clsx from 'clsx';

import {
	getFromStorage,
	setToStorage
} from 'nexus/utils/Storage';
import { uuid } from 'nexus/utils/Datas';


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

export let slider = observable({
	current: 0,
	max: 0,
});


// Models
// ======================================================================================================

// ***** PlayerStore *****
// ***********************

const TAG_PlayerStore = () => {}
export const PlayerStore = types
	.model({

		isPlaying: false,

		repeatMode: false,

		// sliderCurrent: 0,
		// sliderMax: 0,

		volume: 25,

		// -

		playList: types.optional(types.array(types.string), []),
		playIdx: -1, // L'index de lecture courante

		historyList: types.optional(types.array(types.string), []),

		drawerOpen: false,
		drawerView: 'current', // current, history

		// -

		renderBurst: types.maybeNull(types.string),

		loaded: false,
	})
	.views(self => ({

		get nbTracks() {
			return self.playList.length;
		},

		// -

		get previousTrackId() {
			const previousTrackIdx = self.playIdx - 1;
			if (previousTrackIdx > -1) {
				return self.playList[previousTrackIdx];
			}
			return "";
		},

		get nextTrackId() {
			const nextTrackIdx = self.playIdx + 1;
			if (nextTrackIdx < self.playList.length) {
				return self.playList[nextTrackIdx];
			} else {
				if (self.repeatMode && self.playList.length > 0) {
					return self.playList[0];
				}
			}
			return "";
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

		getRemainingPlayTracks() {
			const store = getRoot(self);
			const tracks = store.tracks;

			const playIdx = self.playIdx;

			let tracksList = [];
			for (let trackIdx in self.playList) {
				trackIdx = parseInt(trackIdx);
				if (playIdx > -1 && (trackIdx <= playIdx)) {
					continue;
				}
				const trackId = self.playList[trackIdx];
				const track = tracks.by_id.get(trackId);
				if (track) {
					tracksList.push([trackIdx, track]);
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

		getHistoryTracks() {
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

		getLastListened(maxAlbums) {

			// Récupération des derniers albums écoutés
			// ---

			const store = getRoot(self);
			const tracks = store.tracks;

			let lastListened = [];
			let lastListenedIds = [];

			for (const trackId of self.historyList) {
				if (lastListened.length < maxAlbums) {
					const track = tracks.by_id.get(trackId);
					if (track) {
						const linkedAlbum = track.linkedAlbum;
						if (lastListenedIds.indexOf(linkedAlbum.id) == -1) {
							lastListened.push(linkedAlbum);
							lastListenedIds.push(linkedAlbum.id)
						}
					}
				} else {
					break;
				}
			}
			return lastListened;
		},

	}))
	.actions(self => ({

		setField: (field, value) => {
			self[field] = value;
		},

		setVolume: (value) => {
			self.volume = value;
			setToStorage("volume", value);
			if (window.audio) {
				window.audio.volume = value / 100;
			}
		},

		toggleDrawer: () => {
			self.drawerOpen = !self.drawerOpen;
		},

		toggleRepeat: () => {
			self.repeatMode = !self.repeatMode;
		},

		// -

		load: () => {

			// Chargement des paramètres de la bibliothèque
			// ---

			const store = getRoot(self);
			const app = store.app;

			self.repeatMode = getFromStorage('repeatMode', false, 'bool');

			const historyList = getFromStorage('historyList', [], 'json');
			self.historyList = historyList;

			self.loaded = true;
		},

		save: (callback) => {

			// Sauvegarde des de l'historique de lecture
			// ---

			setToStorage('repeatMode', self.repeatMode, 'bool');

			const historyList = self.historyList.toJSON();
			setToStorage('historyList', historyList, 'json');

			if (callback) {
				callback();
			}
		},

		// -

		insert: (trackId) => {
			if (self.playList.length > 0 && self.playList[0] == trackId) {
				return;
			}
			self.playList.splice(self.playIdx, 0, trackId);
			return self.playIdx;
		},

		populate: (trackIds) => {
			for (const trackId of trackIds) {
				self.playList.push(trackId);
			}
			self.renderBurst = uuid();
		},

		remove: (trackId) => {
			const trackIdx = self.playList.indexOf(trackId);
			if (trackIdx == self.playIdx) {
				self.audioStop();
				self.playIdx = -1;
			}
			self.playList.splice(trackIdx, 1);
		},

		clear: () => {
			self.playList = [];
			self.playIdx = -1;
		},

		// -

		addHistory: (trackId) => {

			// Ajoute un élément à l'historique de lecture
			// ---

			// 100 maximum
			if (self.historyList.length == 100) {
				self.historyList.splice(self.historyList.length - 1, 1);
			}
			self.historyList.splice(0, 0, trackId);
			self.save();
		},

		removeFromHistory: (trackId) => {
			const trackIdx = self.historyList.indexOf(trackId);
			if (trackIdx > -1) {
				self.historyList.splice(trackIdx, 1);
			}
		},

		populateHistory: (trackIds) => {
			for (const trackId of trackIds) {
				self.historyList.push(trackId);
			}
			self.save();
		},


		clearHistory: () => {
			self.historyList = [];
			self.save();
		},

		// -

		jumpTo: (idx) => {

			// Saute la lecture à l'index passé en paramètres
			// ---

			self.audioStop();
			self.playIdx = idx;
			self.audioPlay();
		},

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
			if (self.isPlaying) {
				self.audioStop();
			}
			clearTimeout(window.addHistoryTimeout);
			window.addHistoryTimeout = setTimeout(() => {
				self.addHistory(trackId);
			}, 1000);
			self.audioPlay();
		},

		readPrevious: () => {

			// Lecture du titre précédent
			// ---

			const previousTrackId = self.previousTrackId;
			if (previousTrackId) {
				if (window.audio.currentTime < 10) {
					self.read(previousTrackId);
				} else {
					self.audioSeek(0, true);
				}
			} else {
				self.audioStop();
			}
		},

		readNext: () => {

			// Lecture du titre suivant
			// ---

			let nextTrackId = self.nextTrackId;
			if (nextTrackId) {
				self.read(nextTrackId);
			} else {
				self.audioStop();
				self.playIdx = -1;
			}
		},

		// -

		refreshSlider: () => {
			if (window.audio) {
				slider.current = window.audio.currentTime;
			} else {
				slider.current = 0;
			}
		},

		_stopSlideInterval: () => {
			clearInterval(window.audioInterval);
		},

		_startSlideInterval: () => {

			// Slide toute les secondes
			// ---

			self._stopSlideInterval();
			window.audioInterval = setInterval(function() {
				const focused = document.hasFocus();
				if (focused) {
					// self.setField('sliderCurrent', window.audio.currentTime);
					slider.current = window.audio.currentTime;
				}
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
					// self.setField("sliderMax", window.audio.duration);
					slider.max = window.audio.duration;
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
				// self.sliderCurrent = 0;
				slider.current = 0;
				self.setField("isPlaying", false);
			}
		},

		audioSeek: (value, affectAudio=true) => {

			// Saut sur le titre en cours
			// ---

			self._stopSlideInterval();
			if (window.audio && affectAudio == true) {
				window.audio.currentTime = value;
				self._startSlideInterval();
			}
			// self.setField("sliderCurrent", value);
			slider.current = value;
		},

	}))
