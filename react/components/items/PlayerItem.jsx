import React from 'react';
import { types, getRoot } from "mobx-state-tree";
import { observer } from "mobx-react-lite";
import clsx from 'clsx';

import { Row } from 'nexus/layout/row/Row';

import { IconButton } from 'nexus/ui/button/Button';
import { Avatar } from 'nexus/ui/avatar/Avatar';
import { Typography } from 'nexus/ui/typography/Typography';

import { hexToRgbA } from 'nexus/utils/Colors';
import { copyObj } from 'nexus/utils/Datas';

import './PlayerItem.css';


// Functions Components ReactJS
// ======================================================================================================

// ***** PlayerItem *****
// **********************

const TAG_PlayerItem = () => {}
export const PlayerItem = observer((props) => {

	const store = React.useContext(window.storeContext);
	const app = store.app;
	const theme = app.theme;
	const player = store.player;

	// From ... state

	let [hover, setHover] = React.useState(false);

	// From ... props

	const track = props.track;
	const origin = (props.origin) ? props.origin : "playlist"; // playlist, history
	const index = (props.index) ? props.index : 0;

	let className = (props.className) ? props.className : "";
	let style = (props.style) ? copyObj(props.style) : {};

	// ...

	const trackId = track.id;
	const trackName = track.name;
	const artistName = track.artist;

	const album = track.linkedAlbum;
	const cover = album.cover;

	// ...

	if (hover) {
		style['backgroundColor'] = hexToRgbA(theme.palette.primary.main, 0.1);
	}

	// Events
	// ==================================================================================================

	const handleEnter = (evt) => {
		setHover(true);
	}

	const handleLeave = (evt) => {
		setHover(false);
	}

	// -

	const handleClick = (evt) => {
		if (origin == "playlist") {
			player.jumpTo(index);
		}
		if (origin == "history") {
			const insertedIdx = player.insert(trackId);
			console.log(insertedIdx);
			player.jumpTo(insertedIdx);
		}
	}

	// Render
	// ==================================================================================================

	return (
		<Row
			align="center"
			className={clsx(
				"g-player-item h-col-small",
				className
			)}
			style={style}
			callbackEnter={handleEnter}
			callbackLeave={handleLeave}
			callbackClick={handleClick}
		>
			<div className="g-player-item-icon">
				{!cover && (
					<Avatar
						color="transparent"
						iconName="music_note"
						iconColor="typography"
						size="small"
					/>
				)}
				{cover && <img src={cover} />}
			</div>
			<div className="g-player-item-metas">
				<Typography
					className="g-player-item-title"
					// variant="title"
					size="small"
				>
					{trackName}
				</Typography>
				<Typography
					className="g-player-item-subtitle"
					variant="subtitle"
					size="small"
					style={{
						marginTop: '2px',
					}}
				>
					{artistName}
				</Typography>
			</div>
			<IconButton
				size="small"
				iconName="more_horiz"
				className="flex-0"
			/>
		</Row>
	)
})
