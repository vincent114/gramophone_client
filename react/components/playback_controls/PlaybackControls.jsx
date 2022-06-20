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

	// From ... props

	let style = (props.style) ? props.style : {};

	// ...

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
		</div>
	)
})
