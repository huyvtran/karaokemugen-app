import React, { Component } from 'react';
import i18next from 'i18next';
import axios from 'axios';
import ProfilModal from './modals/ProfilModal';
import LoginModal from './modals/LoginModal';
import logo from '../assets/Logo-final-fond-transparent.png';
import Autocomplete from './generic/Autocomplete';
import { expand } from './tools';
import ReactDOM from 'react-dom';
import store from '../store';
import OnlineStatsModal from './modals/OnlineStatsModal';
import { Config } from '../../../src/types/config';
import { Token } from '../../../src/lib/types/user';
import { Session } from '../../../src/types/session';
import { News } from '../types/news';
import Switch from './generic/Switch';
import WelcomePageArticle from './WelcomePageArticle';
require ('../styles/welcome/WelcomePage.scss');
require('../styles/welcome/updateBanner.scss');

interface IProps {
	navigatorLanguage: string;
	admpwd: string | undefined;
	config: Config;
}

interface IState {
	news: Array<News>;
	sessions: Array<Session>;
	activeSession?: Session;
	latestVersion?: string;
	catchphrase?: string
}
class WelcomePage extends Component<IProps, IState> {
	constructor(props:IProps) {
		super(props);
		this.state = {
			news: [],
			sessions: []
		};
		if (!store.getLogInfos() || !(store.getLogInfos() as Token).token) {
			this.openLoginOrProfileModal();
		} else if (this.props.config.Online.Stats === undefined) {
			ReactDOM.render(<OnlineStatsModal />, document.getElementById('modal'));
		}
	}

	componentDidMount() {
		this.getCatchphrase();
		this.getNewsFeed();
		this.getSessions();
		this.checkAppUpdates();
		store.addChangeListener('loginOut', this.openLoginOrProfileModal);
		store.addChangeListener('loginUpdated', this.getSessions);
	}
  
	componentWillUnmount() {
		store.removeChangeListener('loginOut', this.openLoginOrProfileModal);
		store.removeChangeListener('loginUpdated', this.getSessions);
	}

	async checkAppUpdates() {
		if (store.getLogInfos() && (store.getLogInfos() as Token).role === 'admin') {
			const res = await axios.get('/api/checkUpdates');
			if (res.data) this.setState({ latestVersion: res.data });
		}
	}

  stopAppUpdates = () => {
  	this.closeUpdateBanner();
  	var data = expand('Online.Updates.App', false);
  	axios.put('/api/settings', { setting: JSON.stringify(data) });
  };

  closeUpdateBanner = () => {
  	this.setState({ latestVersion: undefined });
  };

  getSessions = async () => {
  	if (store.getLogInfos() && (store.getLogInfos() as Token).role === 'admin') {
		  const res = await axios.get('/api/sessions');
  		this.setState({
  			sessions: res.data,
  			activeSession: res.data.filter((valueSession:Session) => valueSession.active)[0]
		  });
  	}
  };

  setActiveSession = async (value:string) => {
  	var sessions:Array<Session> = this.state.sessions.filter(
  		session => session.name === value
  	);
  	var sessionId;
  	if (sessions.length === 0) {
  		const res = await axios.post('/api/sessions', { name: value });
  		sessionId = res.data;
  		const sessionsList = await axios.get('/api/sessions');
  		this.setState({
  			sessions: sessionsList.data,
  			activeSession: sessionsList.data.filter((valueSession:Session) => valueSession.active)[0]
  		});
  	} else {
  		this.setState({ activeSession: sessions[0] });
  		sessionId = sessions[0].seid;
  		axios.post('/api/sessions/' + sessionId);
  	}
  };

	majPrivate = async () => {
		let session = this.state.activeSession as Session;
		session.private = !(this.state.activeSession as Session).private;
		await axios.put(`/api/sessions/${session.seid}`, session);
		this.getSessions();
	};

  getCatchphrase = async () => {
  	const res = await axios.get('/api/catchphrase');
  	this.setState({ catchphrase: res.data });
  };

  getNewsFeed = async () => {
  	const res = await axios.get('/api/newsfeed');
  	const data = res.data;
  	var base = data[0];
  	var appli = data[1];
  	var mast = data[2];
  	var news:Array<News> = [];
  	if (base.body && appli.body) {
  		base.body = JSON.parse(base.body);
  		appli.body = JSON.parse(appli.body);
  		news = [
  			{
  				html: base.body.feed.entry[0].content._text,
  				date: base.body.feed.entry[0].updated._text,
  				dateStr: new Date(
  					base.body.feed.entry[0].updated._text
  				).toLocaleDateString(),
  				title:
            i18next.t('BASE_UPDATE') +
            ' : ' +
            base.body.feed.title._text +
            (base.body.feed.entry[0].summary._text
            	? ' - ' + base.body.feed.entry[0].summary._text
            	: ''),
  				link: base.body.feed.entry[0].link._attributes.href,
  				type: 'base'
  			},
  			{
  				html: appli.body.feed.entry[0].content._text,
  				date: appli.body.feed.entry[0].updated._text,
  				dateStr: new Date(
  					appli.body.feed.entry[0].updated._text
  				).toLocaleDateString(),
  				title:
            i18next.t('APP_UPDATE') +
            ' : ' +
            appli.body.feed.entry[0].title._text +
            (appli.body.feed.entry[0].summary._text
            	? ' - ' + appli.body.feed.entry[0].summary._text
            	: ''),
  				link: appli.body.feed.entry[0].link._attributes.href,
  				type: 'app'
  			}
  		];
  	}

  	if (mast.body) {
  		mast.body = JSON.parse(mast.body);
  		var max =
        mast.body.rss.channel.item.length > 3
        	? 3
        	: mast.body.rss.channel.item.length;
  		for (var i = 0; i < max; i++) {
  			news.push({
  				html: mast.body.rss.channel.item[i].description._text,
  				date: mast.body.rss.channel.item[i].pubDate._text,
  				dateStr: new Date(
  					mast.body.rss.channel.item[i].pubDate._text
  				).toLocaleDateString(),
  				title: mast.body.rss.channel.item[i].title._text,
  				link: mast.body.rss.channel.item[i].link._text,
  				type: 'mast'
  			});
  		}
  	}
  	news.sort((a, b) => {
  		var dateA = new Date(a.date);
  		var dateB = new Date(b.date);
  		return dateA < dateB ? 1 : dateA > dateB ? -1 : 0;
  	});
  	this.setState({ news: news });
  };

  openLoginOrProfileModal = () => {
  	if (!store.getLogInfos() || !(store.getLogInfos() as Token).token) {
  		ReactDOM.render(<LoginModal
  			scope='admin'
  			admpwd={this.props.admpwd}
  		/>, document.getElementById('modal'));
  	} else {
  		ReactDOM.render(<ProfilModal
  			config={this.props.config}
  		/>, document.getElementById('modal'));
  	}
  };

  render() {
	  var logInfos = store.getLogInfos();
	  var sessions:[{label:string, value:string}?] = [];
  	if (logInfos && logInfos.role === 'admin') {
  		this.state.sessions.forEach(session => {
  			sessions.push({ label: session.name, value: session.name });
  		});
	  }
  	return (
  		<div id="welcomePage">
  			{this.state.latestVersion ? (
  				<div className="updateBanner">
  					<div className="updateBanner--wrapper">
  						<dl className="updateBanner--description">
  							<dt>{i18next.t('UPDATE_BANNER_TITLE')}</dt>
  							<dd className="updateBanner--message">
  								{i18next.t('UPDATE_BANNER_MESSAGE', {
  									actualVersion: store.getVersion().number
  								})}
  								<b> {this.state.latestVersion}</b>
  							</dd>
  							<dd className="updateBanner--download">
  								<a href="http://mugen.karaokes.moe/blog.html">
  									<i className="fas fa-download"></i> {i18next.t('UPDATE_BANNER_GET_IT')}
  								</a>
  							</dd>
  						</dl>
  						<div className="updateBanner--actions">
  							<button type="button" data-action="later" onClick={this.closeUpdateBanner}>
  								<i className="fas fa-stopwatch"></i> {i18next.t('UPDATE_BANNER_REMIND_ME_LATER')}
  							</button>
  							<button type="button" data-action="never" onClick={this.stopAppUpdates}>
  								<i className="fas fa-bell-slash"></i> {i18next.t('UPDATE_BANNER_DONT_BOTHER_ME')}
  							</button>
  						</div>
  					</div>
  				</div>
  			) : null}
  			<div className="menu-top">
				<div className="menu-top-left">
					{logInfos && logInfos.role === 'admin' && sessions.length > 0 ? (
						<React.Fragment>
							<label className="menu-top-sessions-label">{i18next.t('ACTIVE_SESSION')}&nbsp;</label>
							<Autocomplete
								value={this.state.activeSession?.name}
								options={sessions}
								onChange={this.setActiveSession}
								acceptNewValues={true}
							/>
							<label className="menu-top-sessions-label">{i18next.t('PRIVATE_SESSION')}&nbsp;</label>
							<Switch handleChange={this.majPrivate} isChecked={this.state.activeSession?.private} />
						</React.Fragment>
					) : null}
				</div>
  				<div className="menu-top-right">
  					<a href="http://mugen.karaokes.moe/contact.html">
  						<i className="fas fa-pencil-alt" />&nbsp;
  						{i18next.t('WLCM_CONTACT')}
  					</a>
  					<a href="http://mugen.karaokes.moe/">
  						<i className="fas fa-link" />&nbsp;
  						{i18next.t('WLCM_SITE')}
  					</a>
  					<a href="#" onClick={this.openLoginOrProfileModal}>
  						<i className="fas fa-user" />&nbsp;
  						<span>
  							{logInfos && logInfos.token
  								? decodeURIComponent(logInfos.username)
  								: i18next.t('NOT_LOGGED')}
  						</span>
  					</a>
  					{logInfos && logInfos.token ? (
  						<a
  							href="#"
  							title={i18next.t('LOGOUT')}
  							className="logout"
  							onClick={() => {
								store.logOut();
								this.openLoginOrProfileModal();
							  }}
  						>
  							<i className="fas fa-sign-out-alt" />&nbsp;
  							<span>{i18next.t('LOGOUT')}</span>
  						</a>
  					) : null}
  				</div>
  			</div>
			<div className="row">
				<div className="logoDiv">
					<img src={logo} alt="Logo Karaoke Mugen" />
					<div className="separatorLogo" />
					<div className="catchPhrase">{this.state.catchphrase}</div>
				</div>
				<div className="block menuWelcome">
					<li className={`manage ${this.props.admpwd && this.props.config.App.FirstRun ? 'tutorial' : ''}`}
						onClick={() => window.open('/admin' + window.location.search)}>
						<i className={`fas ${this.props.admpwd && this.props.config.App.FirstRun ? 'fa-hand-point-right' : 'fa-list'}`} />
						<div>
							{this.props.admpwd && this.props.config.App.FirstRun ? i18next.t('WLCM_GETSTARTED') : i18next.t('WLCM_KARAMANAGER')}
						</div>
					</li>
					<li onClick={() => window.open('/system')}>
						<i className="fas fa-cog" />
						<div>{i18next.t('WLCM_ADMINISTRATION')}</div>
					</li>
					<li onClick={() => window.open('/' + window.location.search)}>
						<i className="fas fa-user" />
						<div>{i18next.t('WLCM_PUBLIC')}</div>
					</li>
					<li	onClick={() => window.open('https://mugen.karaokes.moe/docs/')}>
						<i className="fas fa-question-circle" />
						<div>{i18next.t('WLCM_HELP')}</div>
					</li>
				</div>
				<div className="block">
					{this.state.news.map(article => {
						return (
							<WelcomePageArticle key={article.date} article={article} />
						);
					})}
				</div>
  			</div>
  		</div>
  	);
  }
}

export default WelcomePage;
