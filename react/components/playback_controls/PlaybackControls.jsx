import React from 'react';
import { types, getRoot } from "mobx-state-tree";
import { observer } from "mobx-react-lite";
import clsx from 'clsx';

import { Icon } from 'nexus/ui/icon/Icon';
import { IconButton } from 'nexus/ui/button/Button';

import './PlaybackControls.css';


// Functions Components ReactJS
// -------------------------------------------------------------------------------------------------------------

// ***** PlaybackControls *****
// ****************************

const TAG_PlaybackControls = () => {}
export const PlaybackControls = observer((props) => {

	const store = React.useContext(window.storeContext);
	const app = store.app;
	const player = store.player;

	// From ... props

	let style = (props.style) ? props.style : {};

	// From ... store

	const isPlaying = player.isPlaying;
	const playIdx = player.playIdx;

	const nbTracks = player.nbTracks;

	const previousTrackId = player.previousTrackId;
	const nextTrackId = player.nextTrackId;

	// ...

	// Events
	// ==================================================================================================

	const handlePreviousClick = () => {
		player.readPrevious();
	}

	const handlePlayPauseClick = () => {
		if (isPlaying) {
			player.audioPause();
		} else {
			if (playIdx > -1) {
				player.audioPlay();
			} else {
				player.read();
			}
		}
	}

	const handleNextClick = () => {
		player.readNext();
	}

	// Render
	// ==================================================================================================

	return (
		<div
			className={clsx(
				"g-playback-controls",
				"h-col",
				"flex-0",
			)}
			style={style}
		>
			<IconButton
				iconName="skip_previous"
				color="#FFFFFF"
				disabled={!previousTrackId}
				onClick={() => handlePreviousClick()}
			/>
			<IconButton
				iconName={(isPlaying) ? "pause_circle_filled" : "play_circle_filled"}
				color="#FFFFFF"
				disabled={nbTracks == 0}
				onClick={() => handlePlayPauseClick()}
			/>
			<IconButton
				iconName="skip_next"
				color="#FFFFFF"
				disabled={!nextTrackId}
				onClick={() => handleNextClick()}
			/>
		</div>
	)
})
