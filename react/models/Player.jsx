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

		sliderCurrent: 0,
		sliderMax: 0,

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

		getHistoryTrackIdx(trackId) {
			return self.historyList.indexOf(trackId);
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
			// self.audioPlay();
		},

	}))
