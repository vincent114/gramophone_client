import React from 'react';
import { types, getRoot } from "mobx-state-tree";
import { observer } from "mobx-react-lite";
import clsx from 'clsx';

import { PlayerItem } from 'gramophone_client/components/items/PlayerItem';
import { DRAWER_VIEWS_ITEMS } from 'gramophone_client/models/Player';

import { Field } from 'nexus/forms/field/Field';

import { Button } from 'nexus/ui/button/Button';

import './PlayerDrawer.css';


// Functions Components ReactJS
// ======================================================================================================

// ***** PlayerDrawer *****
// ************************

const TAG_PlayerDrawer = () => {}
export const PlayerDrawer = observer((props) => {

	const store = React.useContext(window.storeContext);
	const app = store.app;
	const player = store.player;

	// From ... store

	const playIdx = player.playIdx;

	const drawerOpen = player.drawerOpen;
	const drawerView = player.drawerView;

	// ...

	// Events
	// ==================================================================================================

	const handleClearList = () => {
		player.audioStop();
		player.clear();
	}

	const handleClearHistory = () => {
		player.clearHistory();
	}

	const handleRestartList = () => {
		player.audioStop();
		player.setField('playIdx', 0);
		player.audioPlay();
	}

	// Render
	// ==================================================================================================

	let playerDrawerContent = null;
	if (drawerOpen || true) {

		const remainingPlayTracks = player.remainingPlayTracks;
		const historyTracks = player.historyTracks;

		playerDrawerContent = (
			<div
				className={clsx(
					"g-player-drawer",
					{"open": drawerOpen}
				)}
			>

				<div className="g-player-drawer-header">
					<Field
						id="btn-player-drawer-view"
						component='button_group'
						datas={DRAWER_VIEWS_ITEMS}
						savePath={['player', 'drawerView']}
					/>
				</div>

				{drawerView == "current" && (
					<React.Fragment>
						{remainingPlayTracks.length > 0 && (
							<Button
								id="btn-clear-current-list"
								color="secondary"
								variant="outlined"
								startAdornment="cleaning_services"
								style={{
									'marginLeft': '10px',
									'marginRight': '10px',
									'marginBottom': '10px'
								}}
								onClick={() => handleClearList()}
							>
								Effacer
							</Button>
						)}
						{remainingPlayTracks.length > 0 && (
							<div
								className="g-player-drawer-list"
								style={{
									'marginBottom': '10px'
								}}
							>
								{remainingPlayTracks.map(([trackIdx, track], remainingPlayTrackIdx) => (
									<PlayerItem
										key={`player-current-trac-${remainingPlayTrackIdx}`}
										track={track}
										origin="playlist"
										index={trackIdx}
										style={{
											paddingLeft: '10px',
											paddingRight: '10px',
											// marginBottom: '5px',
										}}
									/>
								))}
							</div>
						)}
						{playIdx > 0 && (
							<Button
								id="btn-restart-current-list"
								color="secondary"
								variant="outlined"
								startAdornment="move_up"
								style={{
									'marginLeft': '10px',
									'marginRight': '10px',
									'marginBottom': '10px'
								}}
								onClick={() => handleRestartList()}
							>
								Recommencer
							</Button>
						)}
					</React.Fragment>
				)}

				{drawerView == "history" && (
					<React.Fragment>
						{historyTracks.length > 0 && (
							<Button
								id="btn-clear-history-list"
								color="secondary"
								variant="outlined"
								startAdornment="cleaning_services"
								style={{
									'marginLeft': '10px',
									'marginRight': '10px',
									'marginBottom': '10px'
								}}
								onClick={() => handleClearHistory()}
							>
								Effacer
							</Button>
						)}
						{historyTracks.length > 0 && (
							<div
								className="g-player-drawer-list"
								style={{
									'marginBottom': '10px'
								}}
							>
								{historyTracks.map((track, trackIdx) => (
									<PlayerItem
										key={`player-history-trac-${trackIdx}`}
										track={track}
										origin="history"
										index={trackIdx}
										style={{
											paddingLeft: '10px',
											paddingRight: '10px',
											marginBottom: '5px',
										}}
									/>
								))}
							</div>
						)}
					</React.Fragment>
				)}

			</div>
		)
	}
	return playerDrawerContent;
})
