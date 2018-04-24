import React, {Component} from 'react';

import axios from 'axios';
import {Provider} from 'react-redux';
import {ConnectedRouter} from 'react-router-redux';
import {Redirect, Route, Switch} from 'react-router-dom';
import {Layout} from 'antd';
import {history, store} from './store';

import KMHeader from './layout/KMHeader';

import AuthRequired from './components/AuthRequired';
import DismissMessages from './components/DismissMessages';
import Home from './pages/Home';

import './App.css';

class App extends Component {

	componentWillMount() {
		const token = localStorage.getItem('kmToken');
		if (token) {
			axios.defaults.headers.common['authorization'] = token;
		}
	}

	render() {
		return (
			<Provider store={store}>
				<ConnectedRouter history={history}>
					<Layout className="layout">
						<KMHeader/>
						<Switch>
							<Redirect exact from='/' to='/home'/>
							<Route path='/home' component={Home}/>
							<Route path='/login' component={DismissMessages(import('./pages/Login'))}/>
							<Route path='/config' component={AuthRequired(import('./pages/Config'))}/>
							<Route path='/karas' component={AuthRequired(import('./pages/Karas'))}/>
							<Route path='/karasHistory' component={AuthRequired(import('./pages/KarasHistory'))}/>
							<Route path='/db' component={AuthRequired(import('./pages/Database'))}/>
							<Route path='/users/create' component={AuthRequired(import('./pages/Users/UserEdit'))}/>
							<Route path='/users/:userId' component={AuthRequired(import('./pages/Users/UserEdit'))}/>
							<Route path='/users' component={AuthRequired(import('./pages/Users/UserList'))}/>
						</Switch>
					</Layout>
				</ConnectedRouter>
			</Provider>
		);
	}
}

export default App;
