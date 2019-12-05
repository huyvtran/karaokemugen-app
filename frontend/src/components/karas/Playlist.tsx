import React, { Component } from 'react';
import i18next from 'i18next';
import PlaylistHeader from './PlaylistHeader';
import KaraDetail from './KaraDetail';
import KaraLine from './KaraLine';
import axios from 'axios';
import {readCookie, createCookie, secondsTimeSpanToHMS, is_touch_device, getSocket, displayMessage, callModal} from '../tools';
import BlacklistCriterias from './BlacklistCriterias';
import {SortableContainer, SortableElement} from 'react-sortable-hoc';
import { AutoSizer, InfiniteLoader, CellMeasurer, CellMeasurerCache, List, Index, ListRowProps, IndexRange } from 'react-virtualized';
import store from '../../store';
import { DBPL } from '~../../../src/types/database/playlist';
import { Config } from '~../../../src/types/config';
import 'react-virtualized/styles.css';
import { Tag } from '../../types/tag';
import { KaraElement } from '../../types/kara';
import { DBBLC } from '../../../../src/types/database/blacklist';
import { Token } from '../../../../src/lib/types/user';
require('./Playlist.scss');

const chunksize = 400;
const _cache = new CellMeasurerCache({ defaultHeight: 50, fixedWidth: true });
let timer:any;

interface IProps {
	scope: string;
	side: number;
	config: Config;
	idPlaylistTo: number;
	navigatorLanguage: string;
	kidPlaying?: string | undefined;
	tags?: Array<Tag> | undefined;
	searchMenuOpen?: boolean;
	toggleSearchMenu?: () => void;
	showVideo: (file:string) => void;
	updateKidPlaying?: (kid:string) => void;
	majIdsPlaylist: (side:number, value:number) => void;
}

interface IState {
	searchValue?: string;
	searchCriteria?: string;
	searchType?: string;
	playlistCommands: boolean;
	getPlaylistInProgress: boolean;
	stopUpdate: boolean;
	forceUpdate: boolean;
	scope?: string;
	idPlaylist: number;
	data: KaraList | Array<DBBLC> | undefined;
	playlistToAddId: number;
	quotaString?: any;
	playlistList: Array<PlaylistList>;
	scrollToIndex?: number;
	playlistInfo?: DBPL;
}

interface KaraList {
	content: KaraElement[];
	i18n?: any;
	infos: {
		count: number,
		from: number,
		to: number
	}
}

class Playlist extends Component<IProps, IState> {
	constructor(props:IProps) {
		super(props);
		this.state = {
			playlistCommands: false,
			getPlaylistInProgress: false,
			stopUpdate: false,
			forceUpdate: false,
			idPlaylist: 0,
			playlistToAddId: 0,
			data: undefined,
			playlistList: []
		};
	}

	componentWillReceiveProps(nextProps:IProps) {
		if (nextProps.idPlaylistTo && nextProps.idPlaylistTo !== this.props.idPlaylistTo) {
			this.playlistForceRefresh();
		}
	}

	async componentDidMount() {
		if (axios.defaults.headers.common['authorization']) {
			this.initCall();
		}
		getSocket().on('playingUpdated', this.playingUpdate);
		getSocket().on('playlistsUpdated', this.getPlaylistList);
		getSocket().on('whitelistUpdated', () => {
			if (this.state.idPlaylist === -3) this.getPlaylist();
		});
		getSocket().on('blacklistUpdated', () => {
			if (this.state.idPlaylist === -2 || this.state.idPlaylist === -4)
				this.getPlaylist();
		});
		getSocket().on('favoritesUpdated', () => {
			if (this.state.idPlaylist === -5) this.getPlaylist();
		});
		getSocket().on('playlistContentsUpdated', this.playlistContentsUpdated);
		getSocket().on('playlistInfoUpdated', (idPlaylist:string) => {
			if (this.state.idPlaylist === Number(idPlaylist)) this.getPlaylistInfo();
		});
		getSocket().on('quotaAvailableUpdated', this.updateQuotaAvailable);
		store.addChangeListener('playlistContentsUpdated', (idPlaylist:number) => {
			var data = this.state.data as KaraList;
			data.infos.from = 0;
			this.setState({data: data});
			this.playlistContentsUpdated(idPlaylist);
		});
		store.addChangeListener('loginUpdated', this.initCall);
	}

  initCall = async () => {
  	this.getPlaylistList();
  	await this.getPlaylistToAddId();
  	await this.getIdPlaylist();
  	await this.getPlaylist();
  }

  componentWillUnmount() {
  	store.removeChangeListener('playlistContentsUpdated', this.playlistContentsUpdated);
  	store.removeChangeListener('loginUpdated', this.initCall);
  }

  SortableList = SortableContainer((List as any), { withRef: true })
  SortableItem = SortableElement(({value,style}:any) => {
  	if(value.content) {
  		let kara = value.content;
  		let s = JSON.parse(JSON.stringify(style));
  		s.zIndex = 999999999 - value.index;
  		return <li data-kid={kara.kid} key={value.key} style={s}>
  			<KaraLine
  				key={kara.kid}
  				kara={kara}
  				scope={this.props.scope}
  				idPlaylist={this.state.idPlaylist}
  				playlistInfo={this.state.playlistInfo}
  				i18nTag={(this.state.data as KaraList).i18n}
  				navigatorLanguage={this.props.navigatorLanguage}
  				playlistToAddId={this.state.playlistToAddId}
  				side={this.props.side}
  				config={this.props.config}
  				playlistCommands={this.state.playlistCommands}
  				idPlaylistTo={this.props.idPlaylistTo}
  				checkKara={this.checkKara}
  				showVideo={this.props.showVideo}
  			/>
  		</li>;
  	} else {
  		var s = JSON.parse(JSON.stringify(style));
  		s.height = 39;
  		// placeholder line while loading kara content
  		return (
  			<li key={value.key} style={s}>
  				<div className="list-group-item">
  					<div className="actionDiv" />
  					<div className="infoDiv" />
  					<div className="contentDiv" >Loading...</div>
  				</div>
  			</li>
  		);
  	}
  });

isRowLoaded = ({index}:Index) => {
	return Boolean(this.state.data && (this.state.data as KaraList).content[index]);
}

loadMoreRows = async ({startIndex, stopIndex}:IndexRange) => {
	if (!this.state.getPlaylistInProgress) {
		var data = this.state.data as KaraList;
		data.infos.from = Math.floor(stopIndex/chunksize)*chunksize;
		await this.setState({data: data});
		if (timer) clearTimeout(timer);
		timer = setTimeout(this.getPlaylist, 1000);
	}
}


rowRenderer = ({ index, isScrolling, key, parent, style }:ListRowProps) => {
	let content;
	if (this.state.data && (this.state.data as KaraList).content && (this.state.data as KaraList).content[index]) {
		content = (this.state.data as KaraList).content[index];
	} else {
		content = null;
	}
	return (
		<CellMeasurer
			cache={_cache}
			columnIndex={0}
			key={key}
			parent={parent}
			rowIndex={index}
		>
			<this.SortableItem key={key} index={index} style={style} value={{content,key,index}} />
		</CellMeasurer>
	);
}

noRowsRenderer = () => {
	return <React.Fragment>
		{this.props.config &&
    this.props.config.Gitlab.Enabled &&
    this.state.idPlaylist === -1 ? (
				<li className="list-group-item karaSuggestion" onClick={this.karaSuggestion}>
					{i18next.t('KARA_SUGGESTION_MAIL')}
				</li>
			) : null}
	</React.Fragment>; 
}

  playlistContentsUpdated = (idPlaylist:number) => {
  	if (this.state.idPlaylist === Number(idPlaylist) && !this.state.stopUpdate) this.getPlaylist();
  };

  updateQuotaAvailable = (data:{username:string, quotaType:number, quotaLeft:number}) => {
  	if (store.getLogInfos() && (store.getLogInfos() as Token).username === data.username) {
  		var quotaString:any = '';
  		if (data.quotaType == 1) {
  			quotaString = data.quotaLeft;
  		} else if (data.quotaType == 2) {
  			quotaString = secondsTimeSpanToHMS(data.quotaLeft, 'ms');
  		}
  		if (data.quotaLeft == -1) {
  			quotaString = <i className="fas fa-infinity"></i>;
  		}
  		this.setState({ quotaString: quotaString });
  	}
  };

  getPlaylistList = async () => {
  	const response = await axios.get(
  		'/api/' + this.props.scope + '/playlists/'
  	);
  	const kmStats = await axios.get('/api/public/stats');
  	var playlistList = response.data.data;
  	if (
  		this.props.scope === 'admin' ||
      this.props.config.Frontend.Permissions!.AllowViewBlacklist
  	)
  		playlistList.push({
  			playlist_id: -2,
  			name: 'Blacklist'
  		});
  	if (
  		this.props.scope === 'admin' ||
      this.props.config.Frontend.Permissions!.AllowViewBlacklistCriterias
  	)
  		playlistList.push({
  			playlist_id: -4,
  			name: 'Blacklist criterias'
  		});
  	if (
  		this.props.scope === 'admin' ||
      this.props.config.Frontend.Permissions!.AllowViewWhitelist
  	)
  		playlistList.push({
  			playlist_id: -3,
  			name: 'Whitelist'
  		});
  	if (this.props.scope === 'admin')
  		playlistList.push({
  			playlist_id: -5,
  			name: 'Favs'
  		});
  	if (this.props.scope === 'admin')
  		playlistList.push({
  			playlist_id: -1,
  			name: 'Karas',
  			karacount: kmStats.data.data.karas
  		});
  	this.setState({ playlistList: playlistList });
  };

  async getPlaylistToAddId() {
  	var playlistToAdd = this.props.config.Karaoke.Private
  		? 'current'
  		: 'public';
  	const response = await axios.get('/api/public/playlists/' + playlistToAdd);
  	this.setState({ playlistToAddId: response.data.data.playlist_id });
  }

  getIdPlaylist = () => {
  	var value:number;
  	if (this.props.scope === 'public') {
  		value =
        this.props.side === 1 && this.props.config.Frontend.Mode !== 1
        	? -1
        	: this.state.playlistToAddId;
  	} else {
  		var plVal1Cookie = readCookie('mugenPlVal1');
  		var plVal2Cookie = readCookie('mugenPlVal2');
  		if (plVal1Cookie == plVal2Cookie) {
  			plVal2Cookie = null;
  			plVal1Cookie = null;
		}
		
  		if (this.props.side === 1) {
  			value = Number(plVal1Cookie) !== NaN ? Number(plVal1Cookie) : -1;
  		} else {
  			value = Number(plVal2Cookie) !== NaN ? Number(plVal2Cookie)  : this.state.playlistToAddId;
  		}
  	}
  	this.setState({ idPlaylist: value });
  	this.props.majIdsPlaylist(this.props.side, value);
  };

  changeIdPlaylist = (idPlaylist:number) => {
  	createCookie('mugenPlVal' + this.props.side, idPlaylist, 365);
  	this.setState({ idPlaylist: Number(idPlaylist),data: undefined }, this.getPlaylist);
  	this.props.majIdsPlaylist(this.props.side, idPlaylist);
  };

  editNamePlaylist = () => {
  	callModal('prompt', i18next.t('CL_RENAME_PLAYLIST', { playlist: (this.state.playlistInfo as DBPL).name }), '', (newName:string) => {
		  axios.put('/api/' + this.props.scope + '/playlists/' + this.state.idPlaylist, 
		  { name: newName, flag_visible: (this.state.playlistInfo as DBPL).flag_public });
  		var playlistInfo = this.state.playlistInfo as DBPL;
  		playlistInfo.name = newName;
  		this.setState({ playlistInfo: playlistInfo });
  	});
  };

  getPlaylistInfo = async () => {
  	if (!this.state.getPlaylistInProgress) {
  		var response = await axios.get(
  			'/api/' + this.props.scope + '/playlists/' + this.state.idPlaylist
  		);
  		this.setState({ playlistInfo: response.data.data });
  	}
  };

  getPlaylistUrl = (idPlaylistParam?:number) => {
  	var idPlaylist:number = idPlaylistParam ? idPlaylistParam : this.state.idPlaylist;
  	var url:string = '';
  	if (idPlaylist >= 0) {
  		url =
        '/api/' +
        this.props.scope +
        '/playlists/' +
        idPlaylist +
        '/karas';
  	} else if (idPlaylist === -1) {
  		url = '/api/public/karas';
  	} else if (idPlaylist === -2) {
  		url = '/api/' + this.props.scope + '/blacklist';
  	} else if (idPlaylist === -3) {
  		url = '/api/' + this.props.scope + '/whitelist';
  	} else if (idPlaylist === -4) {
  		url = '/api/' + this.props.scope + '/blacklist/criterias';
  	} else if (idPlaylist === -5) {
  		url = '/api/public/favorites';
  	}
  	return url;
  };

  playlistWillUpdate = () => {
  	this.setState({data: undefined, getPlaylistInProgress:true});
  }

  playlistDidUpdate = () => {
  	this.getPlaylist();
  }

  getPlaylist = async (searchType?:string) => {
	var criterias:any = {
		'year' : 'y',
		'serie' : 's',
		'tag' : 't'
	};
	var stateData = this.state.data as KaraList;
  	var data:any = {getPlaylistInProgress: true};
  	if (searchType) {
  		data.searchType = searchType;
  	} else if (stateData && stateData.infos && stateData.infos.from == 0) {
  		data.searchType = undefined;
  	}
  	var url:string = this.getPlaylistUrl();
  	if (this.state.idPlaylist >= 0) {
  		this.getPlaylistInfo();
  	}
  	await this.setState(data);

  	url +=
      '?filter=' +
      store.getFilterValue(this.props.side) +
      '&from=' +
      (stateData && stateData.infos && stateData.infos.from > 0 ? stateData.infos.from : 0) +
      '&size=' + chunksize;
  	if(this.state.searchType) {
  		let searchCriteria = this.state.searchCriteria ?
		  criterias[this.state.searchCriteria]
  			: '';
  
  		url += '&searchType=' + this.state.searchType
          + ((searchCriteria && this.state.searchValue) ? ('&searchValue=' + searchCriteria + ':' + this.state.searchValue) : '');
  	}

  	var response = await axios.get(url);
  	var karas:KaraList = response.data.data;
  	if (this.state.idPlaylist > 0) {
  		karas.content.forEach((kara) => {
  			if (kara.flag_playing) {
  				store.setPosPlaying(kara.pos);
  				if (this.props.config.Frontend.Mode === 1 && this.props.scope === 'public') {
					this.props.updateKidPlaying && this.props.updateKidPlaying(kara.kid);
  				}
  			}
  		});
  	}
  	var data;
  	if (karas.infos && karas.infos.from > 0) {
  		data = this.state.data;
  		if (karas.infos.from < data.content.length) {
  			for (let index = 0; index < karas.content.length; index++) {
  				data.content[karas.infos.from + index] = karas.content[index];
  			}
  		} else {
  			if (karas.infos.from > data.content.length) {
  				var nbCellToFill = data.infos.from - data.content.length;
  				for (let index = 0; index < nbCellToFill; index++) {
  					data.content.push(undefined);
  				}
  			}
  			data.content.push(...karas.content);
  		}
  		data.infos = karas.infos;
  		data.i18n = Object.assign(data.i18n, karas.i18n);
  	} else {
  		data = karas;
	  }
  	_cache.clearAll();
	  this.setState({ data: data, getPlaylistInProgress: false });
	  this.playlistForceRefresh();
  };

  playingUpdate = (data: {playlist_id:number,plc_id:number}) => {
  	if (this.state.idPlaylist === data.playlist_id && !this.stopUpdate) {
  		var playlistData = this.state.data as KaraList;
  		playlistData.content.forEach((kara, index) => {
  			if (kara.flag_playing) {
  				kara.flag_playing = false;
  				kara.flag_dejavu = true;
  			} else if (kara.playlistcontent_id === data.plc_id) {
  				kara.flag_playing = true;
  				store.setPosPlaying(kara.pos);
  				this.setState({scrollToIndex: index});
  				if (this.props.config.Frontend.Mode === 1 && this.props.scope === 'public') {
					this.props.updateKidPlaying && this.props.updateKidPlaying(kara.kid);
  				}
  			}
  		});
  		this.setState({ data: playlistData });
  	}
  };

  getPlInfosElement = () => {
	  var plInfos = '';
	  var stateData = this.state.data as KaraList;
  	if (this.state.idPlaylist && stateData && stateData.infos && stateData.infos.count) {
  		plInfos =
        this.state.idPlaylist != -4 ? stateData.infos.from + '-' + stateData.infos.to : '';
  		plInfos +=
        (this.state.idPlaylist != -4
        	? ' / ' +
			stateData.infos.count +
          (!is_touch_device() ? ' karas' : '')
        	: '') +
        (this.state.idPlaylist > -1 && this.state.playlistInfo
        	? ` ~ ${is_touch_device() ? 'dur.' : i18next.t('DETAILS_DURATION')} ` +
          secondsTimeSpanToHMS(this.state.playlistInfo.duration, 'hm') +
          ` / ${secondsTimeSpanToHMS(this.state.playlistInfo.time_left, 'hm')} ${is_touch_device() ? 're.' : i18next.t('DURATION_REMAINING')} `
        	: '');
  	}
  	return plInfos;
  };

  scrollToPlaying = () => {
  	let indexPlaying;
  	(this.state.data as KaraList).content.forEach((element, index) => {
  		if (element.flag_playing) indexPlaying = index;
  	});
  	if (indexPlaying)
  		this.setState({scrollToIndex: indexPlaying});
  };

  togglePlaylistCommands = () => {
  	this.setState({ playlistCommands: !this.state.playlistCommands });
  	store.getTuto() && store.getTuto().move(1);
  };

  selectAllKaras = () => {
  	var data = this.state.data;
  	(this.state.data as KaraList).content.forEach(kara => {
		  if(kara) kara.checked = !kara.checked;
  	});
	  this.setState({ data: data });
	  this.playlistForceRefresh();
  };

  checkKara = (id:string|number) => {
  	var data = this.state.data as KaraList;
  	data.content.forEach(kara => {
  		if (this.state.idPlaylist >= 0) {
  			if (kara.playlistcontent_id === id) {
  				kara.checked = !kara.checked;
  			}
  		} else if (kara.kid === id) {
  			kara.checked = !kara.checked;
  		}
  	});
	  this.setState({ data: data });
	  this.playlistForceRefresh();
  };

  addAllKaras = async () => {
  	var response = await axios.get(`${this.getPlaylistUrl()}?filter=${store.getFilterValue(this.props.side)}`);
  	var karaList = response.data.data.content.map((a:KaraElement) => a.kid).join();
  	displayMessage('info', i18next.t('PL_MULTIPLE_ADDED', {count: response.data.data.content.length}));
  	axios.post(this.getPlaylistUrl(this.props.idPlaylistTo), { kid: karaList, requestedby: (store.getLogInfos() as Token).username });
  };

  addCheckedKaras = async () => {
	  var stateData = this.state.data as KaraList;
  	var idKara = stateData.content.filter(a => a.checked).map(a => a.kid).join();
  	var idKaraPlaylist = stateData.content.filter(a => a.checked).map(a => String(a.playlistcontent_id)).join();
  	var url:string = '';
  	var data;
  	var type;

  	if (this.props.idPlaylistTo > 0) {
  		url = '/api/' + this.props.scope + '/playlists/' + this.props.idPlaylistTo + '/karas';
  		if (this.state.idPlaylist > 0) {
  			data = { plc_id: idKaraPlaylist };
  			type = 'PATCH';
  		} else {
  			data = { requestedby: (store.getLogInfos() as Token).username, kid: idKara };
  		}
  	} else if (this.props.idPlaylistTo == -2 || this.props.idPlaylistTo == -4) {
  		url = '/api/' + this.props.scope + '/blacklist/criterias';
  		data = { blcriteria_type: 1001, blcriteria_value: idKara };
  	} else if (this.props.idPlaylistTo == -3) {
  		url = '/api/' + this.props.scope + '/whitelist';
  		data = { kid: idKara };
  	} else if (this.props.idPlaylistTo == -5) {
  		url = '/api/public/favorites';
  		data = { kid: stateData.content.filter(a => a.checked).map(a => a.kid) };
  	}
  	try {
  		var response;
  		if (type === 'PATCH') {
  			response = await axios.patch(url, data);
  		} else {
  			response = await axios.post(url, data);
  		}
  		displayMessage('success', i18next.t(response.data.code));
  	} catch (error) {
  		displayMessage('warning', i18next.t(error.response.data.code));
  	}
  };

  transferCheckedKaras = () => {
  	this.addCheckedKaras();
  	this.deleteCheckedKaras();
  };

  deleteCheckedKaras = async () => {
  	var url;
	  var data;
	  var stateData = this.state.data as KaraList;
  	if (this.state.idPlaylist > 0) {
  		var idKaraPlaylist = stateData.content.filter(a => a && a.checked).map(a => String(a.playlistcontent_id)).join();
  		url = '/api/' + this.props.scope + '/playlists/' + this.state.idPlaylist + '/karas/';
  		data = { plc_id: idKaraPlaylist };
  	} else if (this.state.idPlaylist == -3) {
  		var idKara = stateData.content.filter(a => a.checked).map(a => a.kid).join();
  		url = '/api/ ' + this.props.scope + '/whitelist';
  		data = { kid: idKara };
  	} else if (this.state.idPlaylist == -5) {
  		url = '/api/public/favorites';
  		data = { kid: stateData.content.filter(a => a.checked).map(a => a.kid) };
  	}
  	if (url) {
  		try {
  			var response = await axios.delete(url, {data:data});
  			displayMessage('success', i18next.t(response.data.code));
  		} catch (error) {
  			if (error.response.data.code) {
  				displayMessage('warning', i18next.t(error.response.data.code));
  			} else {
  				displayMessage('warning', JSON.stringify(error.response.data));
  			}
  		}
  	}
  };

  karaSuggestion() {
  	callModal('prompt', i18next.t('KARA_SUGGESTION_NAME'), '', (text:string) => {
  		axios.post('/api/public/karas/suggest', { karaName: text }).then(response => {
  			setTimeout(() => {
  				displayMessage('info', <div><label>{i18next.t('KARA_SUGGESTION_INFO')}</label> <br/> 
  					{i18next.t('KARA_SUGGESTION_LINK', response.data.data.issueURL, 'console')}</div>, 30000);
  			}, 200);
  		});
  	}, store.getFilterValue(this.props.side));
  }

  onChangeTags = (type:number|string, value:string) => {
  	var searchCriteria = (type === 'serie' || type === 'year') ? type : 'tag';
  	var stringValue = searchCriteria === 'tag' ? `${value}~${type}` : value;
  	this.setState({searchCriteria: searchCriteria, searchValue: stringValue}, () => this.getPlaylist('search'));
  };

  sortRow = ({oldIndex, newIndex}:{oldIndex:number, newIndex:number}) => {
  	if(oldIndex !== newIndex) {
		let data = this.state.data as KaraList;
  		// extract playlistcontent_id based on sorter index
  		let playlistcontent_id = data.content[oldIndex].playlistcontent_id;

  		// fix index to match api behaviour
  		let apiIndex = newIndex+1;
  		if(newIndex > oldIndex)
  			apiIndex = apiIndex+1;

  		axios.put('/api/' + this.props.scope + '/playlists/' + this.state.idPlaylist + '/karas/' + playlistcontent_id, { pos: apiIndex });

  		let karas:Array<KaraElement> = [];
  		if(oldIndex<newIndex) {
  			karas = data.content.splice(0,oldIndex).concat(
  				data.content.splice(oldIndex+1,newIndex-oldIndex),
  				data.content[oldIndex],
  				data.content.splice(newIndex)
  			);
  		} else if(oldIndex>newIndex) {
  			karas = data.content.splice(0,newIndex).concat(
  				data.content[oldIndex],
  				data.content.splice(newIndex,oldIndex-newIndex),
  				data.content.splice(oldIndex+1)
  			);
  		}
  		data.content = karas;
  		this.setState({data:data, scrollToIndex: oldIndex, stopUpdate: false});
  	}
  }
  
  clearScrollToIndex = () => {
  	this.setState({ scrollToIndex: -1 });
  }

  stopUpdate = () => {
	  this.setState({stopUpdate : true});
  }

  playlistForceRefresh = () => {
	  this.setState({forceUpdate: !this.state.forceUpdate});
  }
  
  render() {
  	return this.props.scope === 'public' &&
      this.props.side === 1 && this.props.config.Frontend.Mode === 1 ? (
  			<div className="playlist--wrapper">
  				<div className="playlistContainer">
  					<ul id="playlist1" className="list-group">
  						<li className="list-group-item">
  							<KaraDetail kid={this.props.kidPlaying} mode="karaCard" scope={this.props.scope} 
  								navigatorLanguage={this.props.navigatorLanguage} />
  						</li>
  					</ul>
  				</div>
  			</div>
  		) : (
  			<div className="playlist--wrapper">
  				<PlaylistHeader
  					side={this.props.side}
					  scope={this.props.scope}
					  config={this.props.config}
  					playlistList={this.state.playlistList}
  					playlistToAddId={this.state.playlistToAddId}
  					idPlaylist={this.state.idPlaylist}
  					changeIdPlaylist={this.changeIdPlaylist}
  					playlistInfo={this.state.playlistInfo}
  					getPlaylistUrl={this.getPlaylistUrl}
  					togglePlaylistCommands={this.togglePlaylistCommands}
  					playlistCommands={this.state.playlistCommands}
  					editNamePlaylist={this.editNamePlaylist}
  					idPlaylistTo={this.props.idPlaylistTo}
  					selectAllKaras={this.selectAllKaras}
  					addAllKaras={this.addAllKaras}
  					addCheckedKaras={this.addCheckedKaras}
  					transferCheckedKaras={this.transferCheckedKaras}
  					deleteCheckedKaras={this.deleteCheckedKaras}
  					tags={this.props.tags}
  					onChangeTags={this.onChangeTags}
  					getPlaylist={this.getPlaylist}
  					toggleSearchMenu={this.props.toggleSearchMenu}
  					searchMenuOpen={this.props.searchMenuOpen}
  					playlistWillUpdate={this.playlistWillUpdate}
  					playlistDidUpdate={this.playlistDidUpdate}
  				/>
  				<div
  					id={'playlistContainer' + this.props.side}
  					className="playlistContainer"
  				>
  					<ul id={'playlist' + this.props.side} className="list-group" style={{height: '100%'}}>
  						{
							  (!this.state.data || this.state.data && (this.state.data as KaraList).infos 
							  && ((this.state.data as KaraList).infos.count === 0 || !(this.state.data as KaraList).infos.count)) 
							  && this.state.getPlaylistInProgress
  								? <li className="getPlaylistInProgressIndicator"><span className="fas fa-sync"></span></li>
  								: (
  									this.state.idPlaylist !== -4 && this.state.data
  										? <InfiniteLoader
  											isRowLoaded={this.isRowLoaded}
  											loadMoreRows={this.loadMoreRows}
  											rowCount={(this.state.data as KaraList).infos.count || 0}>
  											{({ onRowsRendered, registerChild }) => (
  												<AutoSizer>
  													{({ height, width }) => (
  														<this.SortableList
														  {...[this.state.playlistCommands, this.state.forceUpdate]}
  															pressDelay={0}
  															helperClass="playlist-dragged-item"
  															useDragHandle={true}
  															deferredMeasurementCache={_cache}
  															ref={registerChild}
  															onRowsRendered={onRowsRendered}
  															rowCount={((this.state.data as KaraList).infos.count) || 0}
  															rowHeight={_cache.rowHeight}
  															rowRenderer={this.rowRenderer}
  															noRowsRenderer={this.noRowsRenderer}
  															height={height}
  															width={width}
  															onSortStart={this.stopUpdate}
  															onSortEnd={this.sortRow}
  															onScroll={this.clearScrollToIndex}
  															scrollToIndex={this.state.scrollToIndex}
  														/>)}
  												</AutoSizer>
  											)}
  										</InfiniteLoader>
  										: (
  											this.state.data
  												? <BlacklistCriterias data={this.state.data as DBBLC[]} scope={this.props.scope} tags={this.props.tags} />
  												: null
  										)
  								)
  						}
  					</ul>
  				</div>
  				<div
  					className="plFooter">
  					<div className="plBrowse">
  						<button
  							type="button"
  							title={i18next.t('GOTO_TOP')}
  							className="btn btn-sm btn-action"
  							onClick={() => this.setState({scrollToIndex: 0})}
  						>
  							<i className="fas fa-chevron-up"></i>
  						</button>
  						{this.state.playlistInfo && this.state.playlistInfo.flag_current ?
  							<button
  								type="button"
  								title={i18next.t('GOTO_PLAYING')}
  								className="btn btn-sm btn-action"
  								onClick={this.scrollToPlaying}
  								value="playing"
  							>
  								<i className="fas fa-play"></i>
  							</button> : null
  						}
  						<button
  							type="button"
  							title={i18next.t('GOTO_BOTTOM')}
  							className="btn btn-sm btn-action"
  							onClick={() => this.setState({scrollToIndex: (this.state.data as KaraList).infos.count-1})}
  						>
  							<i className="fas fa-chevron-down"></i>
  						</button>
  					</div>
  					<div className="plInfos">{this.getPlInfosElement()}</div>
  					{this.props.side === 1 && this.state.quotaString ?
  						<div id="plQuota" className="plQuota right">
  							{i18next.t('QUOTA')}{this.state.quotaString}
  						</div> : null
  					}
  				</div>
  			</div>
  		);
  }
}

export default Playlist;