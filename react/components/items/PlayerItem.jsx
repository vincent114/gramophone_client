import React from 'react';
import { types, getRoot } from "mobx-state-tree";
import { observer } from "mobx-react-lite";
import clsx from 'clsx';

import { Row } from 'nexus/layout/row/Row';

import { IconButton } from 'nexus/ui/button/Button';
import { Avatar } from 'nexus/ui/avatar/Avatar';
import { Typography } from 'nexus/ui/typography/Typography';

import './PlayerItem.css';


// Functions Components ReactJS
// ======================================================================================================

// ***** PlayerItem *****
// **********************

const TAG_PlayerItem = () => {}
export const PlayerItem = observer((props) => {

	const store = React.useContext(window.storeContext);
	const app = store.app;

	// From ... props

	const track = props.track;

	let className = (props.className) ? props.className : "";
	let style = (props.style) ? props.style : {};

	// ...

	const trackName = track.name;
	const artistName = track.artist;

	const album = track.linkedAlbum;
	const cover = album.cover;

	// Render
	// ==================================================================================================

	return (
		<Row
			className={clsx(
				"g-player-item h-col-small",
				className
			)}
			style={style}
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
