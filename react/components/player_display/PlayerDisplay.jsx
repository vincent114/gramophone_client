import React from 'react';
import { types, getRoot } from "mobx-state-tree";
import { observer } from "mobx-react-lite";
import clsx from 'clsx';

import { slider } from 'gramophone_client/models/Player';

import { Row } from 'nexus/layout/row/Row';
import { Column } from 'nexus/layout/column/Column';

import { Icon } from 'nexus/ui/icon/Icon';
import { IconButton } from 'nexus/ui/button/Button';
import { Avatar } from 'nexus/ui/avatar/Avatar';
import { BasicSlider } from 'nexus/ui/slider/Slider';

import './PlayerDisplay.css';


// Functions Components ReactJS
// ======================================================================================================

// ***** PlayerDisplaySlider *****
// *******************************

const TAG_PlayerDisplaySlider = () => {}
export const PlayerDisplaySlider = observer((props) => {

	// From ... props

	const onChange = props.onChange;

	// ...

	// Render
	// ==================================================================================================

	return (
		<BasicSlider
			className="g-player-display-slider"
			value={slider.current}
			min={0}
			max={slider.max}
			style={{
				position: 'absolute',
				left: '36px',
				right: '0px',
				bottom: '-13px',
				marginRight: '0px',
				zIndex: '98',
			}}
			railStyle={{
				backgroundColor: 'rgba(255, 255, 255, 0.3)',
				borderRadius: '0px 0px 4px 0px',
			}}
			trackStyle={{
				backgroundColor: 'rgba(255, 255, 255, 0.8)',
			}}
			onChange={onChange}
		/>
	)
})

// ***** PlayerDisplay *****
// *************************

const TAG_PlayerDisplay = () => {}
export const PlayerDisplay = observer((props) => {

	const store = React.useContext(window.storeContext);
	const app = store.app;
	const player = store.player;
	const popup = app.popup;
	const popupZoomCover = store.popupZoomCover;

	// From ... props

	let className = (props.className) ? props.className : "";
	let style = (props.style) ? props.style : {};

	// From ... store

	const track = player.playTrack;
	const isPlaying = player.isPlaying;

	// const sliderCurrent = player.sliderCurrent;
	// const sliderMax = player.sliderMax;

	// ...

	let cover = "";
	if (track) {
		const album = track.linkedAlbum;
		cover = album.cover;
	}

	// Events
	// ==================================================================================================

	const handleCoverClick = () => {
		popupZoomCover.setField("albumId", track.album_id);
		popupZoomCover.open();
	}

	const handleSliderChange = (newValue) => {
		player.audioSeek(newValue);
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
				<Row
					align="center"
					className="relative"
				>
					<div className="g-player-display-cover">
						{!cover && (
							<Avatar
								size="small"
								color="transparent"
								iconName="music_note"
								iconColor="rgba(255, 255, 255, 0.5)"
							/>
						)}
						{cover && (
							<img
								src={cover}
								onClick={() => handleCoverClick()}
							/>
						)}
					</div>
					<Column
						className="g-player-display-metas"
						spacing="none"
						style={{
							"justifyContent": "space-evenly",
							"paddingBottom": "6px",
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
					<PlayerDisplaySlider
						onChange={handleSliderChange}
					/>
					<IconButton
						size="tiny"
						iconName="more_horiz"
						color="#FFFFFF"
						className="flex-0"
						style={{
							zIndex: '100',
							marginBottom: "5px",
							marginRight: "5px",
						}}
					/>
				</Row>
			)}
		</div>
	)
})
