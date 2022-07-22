import React from 'react';
import { types, getRoot } from "mobx-state-tree";
import { observer } from "mobx-react-lite";
import clsx from 'clsx';

import { Row } from 'nexus/layout/row/Row';
import { Column } from 'nexus/layout/column/Column';

import { Icon } from 'nexus/ui/icon/Icon';
import { IconButton } from 'nexus/ui/button/Button';
import { Avatar } from 'nexus/ui/avatar/Avatar';

import './PlayerDisplay.css';


// Functions Components ReactJS
// ======================================================================================================

// ***** PlayerDisplay *****
// *************************

const TAG_PlayerDisplay = () => {}
export const PlayerDisplay = observer((props) => {

	const store = React.useContext(window.storeContext);
	const app = store.app;
	const player = store.player;

	// From ... props

	let className = (props.className) ? props.className : "";
	let style = (props.style) ? props.style : {};

	// From ... store

	const track = player.playTrack;

	// ...

	let cover = "";
	if (track) {
		const album = track.linkedAlbum;
		cover = album.cover;
	}

	// Render
	// ==================================================================================================

	return (
		<div
			className={clsx(
				"g-player-display",
				className
			)}
			style={style}
		>
			{!track && (
				<div className="g-player-display-wrapper">
					<Icon
						color="rgba(255, 255, 255, 0.5)"
						// name="headphones"
						name="music_note"
					/>
				</div>
			)}
			{track && (
				<Row>
					<div className="g-player-display-cover">
						{!cover && (
							<Avatar
								size="small"
								color="transparent"
								iconName="music_note"
								iconColor="rgba(255, 255, 255, 0.5)"
							/>
						)}
						{cover && <img src={cover} />}
					</div>
					<Column
						className="g-player-display-metas"
						spacing="none"
						style={{
							"justifyContent": "space-evenly",
						}}
					>
						{track.name && (
							<div className="g-player-display-title">
								{track.name}
							</div>
						)}
						{track.subtitle && (
							<div className="g-player-display-subtitle">
								{track.subtitle}
							</div>
						)}
					</Column>
					<IconButton
						size="small"
						iconName="more_horiz"
						color="#FFFFFF"
						className="flex-0"
					/>
				</Row>
			)}
		</div>
	)
})
