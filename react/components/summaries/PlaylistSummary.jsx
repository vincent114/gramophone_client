import React from 'react';
import { types, getRoot } from "mobx-state-tree";

import { ResultSummary } from 'nexus/components/summaries/ResultSummary';

import './PlaylistSummary.css';


// Models
// ======================================================================================================

// ***** PlaylistSummaryStore *****
// ********************************

const TAG_PlaylistSummaryStore = () => {}
export const PlaylistSummaryStore = types
	.model({
		id: types.maybeNull(types.string),
		name: types.maybeNull(types.string),
		description: types.maybeNull(types.string),
	})
	.actions(self => ({

		updateFromSearch: (searchDatas) => {
			self.id = searchDatas.id;
			self.name = searchDatas.name;
			self.description = searchDatas.description;
		},

	}))


// Functions Components ReactJS
// ======================================================================================================

// ***** PlaylistSummary *****
// ***************************

const TAG_PlaylistSummary = () => {}
export const PlaylistSummary = (props) => {

	// From ... props

	const summary = props.summary;
	const showGuideLine = props.showGuideLine;
	const callbackClick = props.callbackClick;

	// ...

	const title = summary.name;
	const subtitle = summary.description;

	// Render
	// ==================================================================================================

	return (
		<ResultSummary
			iconName="playlist_play"
			titleUpper={title}
			subtitle={subtitle}
			showGuideLine={showGuideLine}
			callbackClick={callbackClick}
		/>
	)
}
