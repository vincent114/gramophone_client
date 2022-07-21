import React from 'react';
import { types, getRoot } from "mobx-state-tree";
import { observer } from "mobx-react-lite";
import clsx from 'clsx';

import {
	MenuDivider,
	MenuItem,
	Menu
} from 'nexus/layout/menu/Menu';
import { HomeMenuItem } from 'nexus/contexts/home/Home';
import { SearchMenuItem } from 'nexus/contexts/search/Search';
import { AboutMenuItem } from 'nexus/contexts/about/About';
import { AdminMenuItem } from 'nexus/contexts/admin/Admin';
import { Icon } from 'nexus/ui/icon/Icon';

import { ArtistsMenuItem } from 'gramophone_client/contexts/artists/Artists';
import { AlbumsMenuItem } from 'gramophone_client/contexts/albums/Albums';
import { TracksMenuItem } from 'gramophone_client/contexts/tracks/Tracks';

import { YearsMenuItem } from 'gramophone_client/contexts/years/Years';
import { GenresMenuItem } from 'gramophone_client/contexts/genres/Genres';
import { PlaylistsMenuItem } from 'gramophone_client/contexts/playlists/Playlists';


// Functions Components ReactJS
// -------------------------------------------------------------------------------------------------------------

// ***** ContextualMenu *****
// **************************

const TAG_ContextualMenu = () => {}
export const ContextualMenu = observer((props) => {

	const store = React.useContext(window.storeContext);
	const app = store.app;

	// From ... store

	const context = app.context;
	const breakPoint650 = app.breakPoint650;

	// Render
	// ==================================================================================================

	return (
		<Menu>
			<HomeMenuItem disabled={false} />
			<SearchMenuItem disabled={false} />

			<MenuDivider />

			<ArtistsMenuItem disabled={false} />
			<AlbumsMenuItem disabled={false} />
			{false && <TracksMenuItem disabled={false} />}

			<MenuDivider />

			<YearsMenuItem disabled={false} />
			<GenresMenuItem disabled={false} />
			<PlaylistsMenuItem disabled={false} />

			<MenuDivider />

			<AboutMenuItem disabled={false} />
			<AdminMenuItem disabled={false} />
		</Menu>
	)
})
