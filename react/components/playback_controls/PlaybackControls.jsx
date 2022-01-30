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

	// Events
	// ==================================================================================================

	const handlePreviousClick = () => {
		// TODO
	}

	const handlePlayClick = () => {
		// TODO
	}

	const handleNextClick = () => {
		// TODO
	}

	// -

	const handleQueueClick = () => {
		// TODO
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
		>
			<IconButton>
				<Icon
					name="volume_up"
					color="white"
				/>
			</IconButton>
			<IconButton>
				<Icon
					name="skip_previous"
					color="white"
					onClick={() => handlePreviousClick()}
				/>
			</IconButton>
			<IconButton>
				<Icon
					name="play_circle_filled" // pause_circle_filled
					color="white"
					onClick={() => handlePlayClick()}
				/>
			</IconButton>
			<IconButton>
				<Icon
					name="skip_next"
					color="white"
					onClick={() => handleNextClick()}
				/>
			</IconButton>
			<IconButton>
				<Icon
					name="queue_music"
					color="white"
					onClick={() => handleQueueClick()}
				/>
			</IconButton>
		</div>
	)
})
