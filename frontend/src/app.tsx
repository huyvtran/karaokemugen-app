import { Switch, Route } from 'react-router';
import WelcomePage from './components/WelcomePage';
import AdminPage from './components/AdminPage';
import PublicPage from './components/PublicPage';
import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import i18n from './components/i18n';
import NotFoundPage from './components/NotfoundPage';
import langs from 'langs';
import axios from 'axios';
import { startIntro, getSocket, is_touch_device } from './components/tools';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import store from './store';
import { Config } from '../../src/types/config';
import { KaraTag } from '../../src/lib/types/kara'; 
import { DBSeries } from '../../src/lib/types/database/series';
import { DBYear } from '../../src/lib/types/database/kara';
import { Tag }  from '../../src/lib/types/tag'; 
import { Tag as FrontendTag }  from './types/tag'; 

interface IState {
	navigatorLanguage: string;
	admpwd: string | undefined;
	shutdownPopup: boolean;
	config?: Config;
	tags?: Array<KaraTag>;
	mediaFile?: string;
  }

class App extends Component<{}, IState> {
	constructor(props:{}) {
		super(props);
		this.state = {
			navigatorLanguage: this.getNavigatorLanguage(),
			admpwd: window.location.search.indexOf('admpwd') ? window.location.search.split('=')[1] : undefined,
			shutdownPopup: false
		};
		axios.defaults.headers.common['authorization'] = document.cookie.replace(/(?:(?:^|.*;\s*)mugenToken\s*\=\s*([^;]*).*$)|^.*$/, '$1');
		axios.defaults.headers.common['onlineAuthorization'] = document.cookie.replace(/(?:(?:^|.*;\s*)mugenTokenOnline\s*\=\s*([^;]*).*$)|^.*$/, '$1');
	}

	async parseTags() {
		try {
			const response = await axios.get('/api/tags');
			return response.data.content.filter((val:Tag) => val.karacount !== null)
				.map((val:{i18n:{[key: string]: string}, tid:string, name:string, types:Array<number|string>, karacount:string}) => {
				var trad = val.i18n![this.state.navigatorLanguage];
				return { value: val.tid, label: trad ? trad : val.name, type: val.types, karacount: val.karacount };
			});
		} catch (error) {
			// if error the authorization must be broken so we delete it
			store.logOut();
		}
	}

	async parseSeries() {
		const response = await axios.get('/api/series');
		return response.data.content.map((val:DBSeries) => {
			return {
				value: val.sid, label: val.i18n_name, type: ['serie'],
				aliases: val.aliases, karacount: val.karacount
			};
		});
	}

	async parseYears() {
		const response = await axios.get('/api/years');
		return response.data.content.map((val:DBYear) => {
			return { value: val.year, label: val.year, type: ['year'], karacount: val.karacount };
		});
	}

	async componentDidMount() {
		await this.getSettings();
		getSocket().on('settingsUpdated', this.getSettings);
		getSocket().on('connect', () => this.setState({ shutdownPopup: false }));
		getSocket().on('disconnect', () => this.setState({ shutdownPopup: true }));
		this.addTags();
		if (this.state.admpwd && this.state.config && this.state.config.App.FirstRun && window.location.pathname === '/admin') {
			startIntro('admin');
		}
		store.addChangeListener('loginUpdated', this.addTags);
	}

    addTags = async () => {
    	if (this.state.config && this.state.config.Frontend.Mode !== 0 && axios.defaults.headers.common['authorization']) {
    		const [tags, series, years] = await Promise.all([this.parseTags(), this.parseSeries(), this.parseYears()]);
    		this.setState({ tags: tags.concat(series, years) });
    	}
    }

    componentWillUnmount() {
    	store.removeChangeListener('loginUpdated', this.addTags);
    }

    getSettings = async () => {
    	const res = await axios.get('/api/settings');
		store.setConfig(res.data.config);
		store.setVersion(res.data.version);
		store.setModePlaylistID(res.data.state.modePlaylistID);
    	this.setState({ config: res.data.config});
    };

    getNavigatorLanguage() {
    	var navigatorLanguage;
    	var languages = langs.all();
    	var index = 0;
    	while (!navigatorLanguage && index < languages.length) {
    		if (navigator.languages[0].substring(0, 2) === languages[index]['1']) {
    			navigatorLanguage = languages[index]['2B'];
    		}
    		index++;
    	}
    	return navigatorLanguage;
    }

    powerOff = () => {
    	axios.post('/api/shutdown');
    	this.setState({ shutdownPopup: true });
    };

    showVideo = (file:string) => {
    	this.setState({mediaFile: file});
    };

    render() {
    	return (
    		this.state.shutdownPopup ?
    			<div className="shutdown-popup">
    				<div className="noise-wrapper" style={{ opacity: 1 }}>
    					<div className="noise"></div>'
				    </div>
    				<div className="shutdown-popup-text">{i18n.t('SHUTDOWN_POPUP')}<br />{'·´¯`(>_<)´¯`·'}</div>
    				<button title={i18n.t('TOOLTIP_CLOSEPARENT')} className="closeParent btn btn-action"
    					onClick={() => this.setState({ shutdownPopup: false })}>
    					<i className="fas fa-times"></i>
    				</button>
    			</div> :
    			this.state.config ?
    				<div className={is_touch_device() ? 'touch' : ''}>
    					<Switch>
    						<Route path="/welcome" render={(props) => <WelcomePage {...props}
    							navigatorLanguage={this.state.navigatorLanguage}
    							admpwd={this.state.admpwd} config={this.state.config as Config} />} />
    						<Route path="/admin" render={(props) => <AdminPage {...props}
    							navigatorLanguage={this.state.navigatorLanguage}
    							powerOff={this.powerOff} tags={this.state.tags as FrontendTag[]}
    							showVideo={this.showVideo} config={this.state.config as Config} />} />
    						<Route exact path="/" render={(props) => <PublicPage {...props}
    							navigatorLanguage={this.state.navigatorLanguage}
								tags={this.state.tags as FrontendTag[]} showVideo={this.showVideo}
								config={this.state.config as Config} />} />
    						<Route component={NotFoundPage} />
    					</Switch>
    					<a id="downloadAnchorElem" />
    					{this.state.mediaFile ?
    						<div className="overlay" onClick={() => this.setState({mediaFile: undefined})}>
    							<video id="video" autoPlay src={`/medias/${this.state.mediaFile}`} />
    						</div> : null
    					}
    					<ToastContainer />
    				</div> : null
    	);
    }
}

export default App;
ReactDOM.render(<BrowserRouter><App /></BrowserRouter>, document.getElementById('root'));