import React from 'react';
import GlobalContext from './context';
import useGlobalState from './useGlobalState';

const GlobalStateProvider = ({children}) => {
	return (
		<GlobalContext.Provider value={useGlobalState()}>{children}</GlobalContext.Provider>
	);
}

export default GlobalStateProvider;