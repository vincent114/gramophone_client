import React from 'react';
import { types, getRoot } from "mobx-state-tree";

import { ResultSummary } from 'nexus/components/summaries/ResultSummary';

import './AlbumSummary.css';


// Models
// ======================================================================================================

// ***** AlbumSummaryStore *****
// *****************************

const TAG_AlbumSummaryStore = () => {}
export const AlbumSummaryStore = types
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

// ***** AlbumSummary *****
// ************************

const TAG_AlbumSummary = () => {}
export const AlbumSummary = (props) => {

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
			iconName="album"
			titleUpper={title}
			subtitle={subtitle}
			showGuideLine={showGuideLine}
			callbackClick={callbackClick}
		/>
	)
}
