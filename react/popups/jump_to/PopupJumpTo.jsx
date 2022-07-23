import React from 'react';
import { types, getRoot } from "mobx-state-tree";
import { observer } from "mobx-react-lite";
import clsx from 'clsx';

import { Row } from 'nexus/layout/row/Row';
import { Grid } from 'nexus/layout/grid/Grid';

import { Popup } from 'nexus/ui/popup/Popup';
import { IconButton } from 'nexus/ui/button/Button';

import {
	LETTERS,
	NUMBERS
} from 'nexus/utils/Datas';

import './PopupJumpTo.css';


// Models
// ======================================================================================================

// ***** PopupJumpToStore *****
// ****************************

const TAG_PopupJumpToStore = () => {}
export const PopupJumpToStore = types
	.model({
		scope: types.maybeNull(types.string), // standard, known
		chars: types.optional(types.array(types.string), []),
		current: types.maybeNull(types.string),
	})
	.views(self => ({

		// Bools
		// -

		get isOpen() {
			const store = getRoot(self);
			const app = store.app;
			const popup = app.popup;

			return popup.isOpen(popupJumpToKey);
		},

	}))
	.actions(self => ({

		setField: (field, value) => {
			self[field] = value;
		},

		// -

		open: () => {
			const store = getRoot(self);
			const app = store.app;
			const popup = app.popup;

			popup.open(popupJumpToKey);
		},

		close: () => {
			const store = getRoot(self);
			const app = store.app;
			const popup = app.popup;

			popup.close(popupJumpToKey);
		},

	}))


// Functions Components ReactJS
// ======================================================================================================

// ***** PopupJumpTo *****
// ***********************

const TAG_PopupJumpTo = () => {}
export const popupJumpToKey = 'popupJumpTo';
export const PopupJumpTo = observer((props) => {

	const store = React.useContext(window.storeContext);
	const app = store.app;
	const popup = app.popup;
	const popupJumpTo = store.popupJumpTo;

	// From ... store

	const isLoading = app.isLoading;
	const isOpen = popupJumpTo.isOpen;
	const scope = popupJumpTo.scope;

	// ...

	const jumpChars = ['&', '#'];
	const knownChars = popupJumpTo.chars;

	// Events
	// ==================================================================================================

	const handleJumpBtnClick = (jumpChar) => {
		popupJumpTo.close();
		const groupId = `group-${jumpChar}`;
		const groupNode = document.getElementById(groupId);
		if (groupNode) {
			// groupNode.scrollIntoView({behavior: "smooth"});
			groupNode.scrollIntoView();
		}
	}

	// Render
	// ==================================================================================================

	// Popup --> Content
	// -----------------------------------------------

	// Fantômes flex
	let ghosts = []
	for (var i = 0; i < 10; i++) {
		ghosts.push(<div className="g-jump-to-ghost"></div>);
	}

	let popupContent = null;
	if (isOpen) {
		popupContent = (
			<div
				style={{
					padding: '30px',
				}}
			>

				{scope == "standard" && (
					<Grid
						className="g-jump-to-chars-wrapper"
						style={{
							marginBottom: '20px',
						}}
					>
						{jumpChars.map((jumpChar, jumpCharIdx) => {
							return (
								<IconButton
									key={`btn-jump-to-${jumpChar}`}
									color="secondary"
									disabled={knownChars.indexOf(jumpChar) == -1}
									onClick={() => handleJumpBtnClick(jumpChar)}
								>
									{jumpChar}
								</IconButton>
							)
						})}
					</Grid>
				)}

				{scope == "standard" && (
					<Grid className="g-jump-to-chars-wrapper">
						{LETTERS.map((letter, letterIdx) => {
							return (
								<IconButton
									key={`btn-jump-to-${letter}`}
									disabled={knownChars.indexOf(letter) == -1}
									onClick={() => handleJumpBtnClick(letter)}
								>
									{letter}
								</IconButton>
							)
						})}
						{ghosts}
					</Grid>
				)}

				{scope == "known" && (
					<Grid className="g-jump-to-chars-wrapper">
						{knownChars.map((knownChar, knownCharIdx) => {
							return (
								<IconButton
									key={`btn-jump-to-${knownChar}`}
									onClick={() => handleJumpBtnClick(knownChar)}
									style={{
										fontSize: '13px',
									}}
								>
									{knownChar}
								</IconButton>
							)
						})}
						{ghosts}
					</Grid>
				)}

			</div>
		)
	}

	// -----------------------------------------------

	return (
		<Popup
			id={popupJumpToKey}
			closeVariant="hover"
			closeOnClick={true}
			style={{
				minWidth: '316px',
				maxWidth: '316px',
			}}
		>
			{popupContent}
		</Popup>
	)
})
