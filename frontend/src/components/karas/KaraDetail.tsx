import React, { Component } from 'react';
import i18next from 'i18next';
import { is_touch_device, secondsTimeSpanToHMS, displayMessage, callModal } from '../tools';
import axios from 'axios';
import store from '../../store';
import ReactDOM from 'react-dom';
import { DBPLCInfo } from '~../../../src/types/database/playlist';
import { DBKaraTag, lastplayed_ago } from '../../../../src/lib/types/database/kara';
import { Token } from '../../../../src/lib/types/user';

interface IProps {
	kid: string | undefined;
	mode: string;
	scope: string;
	idPlaylist?: number;
	playlistcontentId?: number;
	navigatorLanguage: string;
	publicOuCurrent?: boolean | undefined;
	toggleKaraDetail?: () => void;
	freeKara?: () => void;
	showVideo?: (file:string) => void;
}

interface IState {
	kara?: DBPLCInfo;
	showLyrics: boolean;
	isFavorite: boolean;
	lyrics?: Array<string>;
}

class KaraDetail extends Component<IProps,IState> {
	private fullLyricsRef: React.RefObject<HTMLInputElement>;

	constructor(props:IProps) {
		super(props);
		this.state = {
			showLyrics: false,
			isFavorite: false
		};
		this.fullLyricsRef = React.createRef();
		this.getKaraDetail();
	}

	componentWillReceiveProps(nextProps:IProps) {
		if (nextProps.kid && nextProps.kid !== this.props.kid) {
			this.getKaraDetail(nextProps.kid);
		}
	}

  keyObserverHandler = (e:any) => {
  	var keyCode = e.keyCode || e.which;
  	if (keyCode == '27') {
  		this.props.toggleKaraDetail!();
  	}
  }

  componentDidMount() {
  	if(this.props.mode === 'list' && !is_touch_device())
		  document.addEventListener('keyup', this.keyObserverHandler);
  }

  componentWillUnmount() {
  	if(this.props.mode === 'list' && !is_touch_device())
  		document.removeEventListener('keyup', this.keyObserverHandler);
  }

  getKaraDetail = async (kid?:string) => {
  	var urlInfoKara = this.props.idPlaylist && this.props.idPlaylist > 0 ?
  		'/api/' + this.props.scope + '/playlists/' + this.props.idPlaylist + '/karas/' + this.props.playlistcontentId :
  		'/api/public/karas/' + (kid ? kid : this.props.kid);
  	var response = await axios.get(urlInfoKara);
  	const kara = response.data.data;
	  this.setState({
  		kara: kara,
  		isFavorite: kara.flag_favorites || this.props.idPlaylist === -5
  	});
  };

  getLastPlayed = (lastPlayed_at:Date, lastPlayed:lastplayed_ago) => {
  	if (
  		lastPlayed &&
      !lastPlayed.days &&
      !lastPlayed.months &&
      !lastPlayed.years
  	) {
  		var timeAgo =
        (lastPlayed.seconds ? lastPlayed.seconds : 0) +
        (lastPlayed.minutes ? lastPlayed.minutes * 60 : 0) +
        (lastPlayed.hours ? lastPlayed.hours * 3600 : 0);
  		var timeAgoStr =
        lastPlayed.minutes || lastPlayed.hours
        	? secondsTimeSpanToHMS(timeAgo, 'hm')
        	: secondsTimeSpanToHMS(timeAgo, 'ms');

  		return i18next.t('DETAILS_LAST_PLAYED_2', { time: timeAgoStr });
  	} else if (lastPlayed_at) {
  		return new Date(lastPlayed_at).toLocaleDateString();
	  }
	  return null;
  };

  moreInfo = async () => {
  	var externalUrl = '';
  	var serie = (this.state.kara as DBPLCInfo).serie;
  	var extraSearchInfo = '';
  	var searchLanguage = navigator.languages[0];
  	searchLanguage = searchLanguage.substring(0, 2);
  	var searchUrl =
      'https://' +
      searchLanguage +
      '.wikipedia.org/w/api.php?origin=*&action=query&format=json&formatversion=2&list=search&utf8=&srsearch=' +
      extraSearchInfo +
      serie;
  	var detailsUrl = '';

  	var xhttp = new XMLHttpRequest();
  	xhttp.onreadystatechange = function () {
  		if (this.readyState == 4 && this.status == 200) {
  			var json = JSON.parse(this.response);
  			var results = json.query.search;
  			var contentResult = json.query.pages;
  			var searchInfo = json.query.searchinfo;

  			if (results && results.length > 0 && detailsUrl === '') {
  				var pageId = results[0].pageid;
  				externalUrl =
            'https://' + searchLanguage + '.wikipedia.org/?curid=' + pageId;
  				detailsUrl =
            'https://' +
            searchLanguage +
            '.wikipedia.org/w/api.php?origin=*&action=query&format=json&formatversion=2&prop=extracts&exintro=&explaintext=&pageids=' +
            pageId;
  				xhttp.open('GET', detailsUrl, true);
  				xhttp.send();
  			} else if (
  				contentResult &&
          contentResult.length > 0 &&
          detailsUrl !== '') {
  				var extract = contentResult[0].extract;
  				callModal('alert',
  					<a target="_blank" href={externalUrl}>{serie}&nbsp;
  						<i className="fas fa-external-link-alt"></i></a>,extract);
  			} else if (
  				searchInfo &&
          searchInfo.totalhits === 0 &&
          searchInfo.suggestion
  			) {
  				var searchUrl =
            'https://' +
            searchLanguage +
            '.wikipedia.org/w/api.php?origin=*&action=query&format=json&formatversion=2&list=search&utf8=&srsearch=' +
            searchInfo.suggestion;
  				xhttp.open('GET', searchUrl, true);
  				xhttp.send();
  			} else {
  				displayMessage(
  					'warning',
  					i18next.t('NO_EXT_INFO', serie)
  				);
  			}
  		}
  	};
  	xhttp.open('GET', searchUrl, true);
  	xhttp.send();
  };

  /**
   * show full lyrics of a given kara
   */

  showFullLyrics = async () => {
  	var response = await axios.get('/api/public/karas/' + (this.state.kara as DBPLCInfo).kid + '/lyrics');
  	if (is_touch_device()) {
			callModal('alert', i18next.t('LYRICS'),
				<div style={{ textAlign: 'center' }}>
					{response.data.data.map((value:string) =>
						<React.Fragment>{value} <br /></React.Fragment>)}
				</div>);
  	} else {
  		this.setState({ lyrics: response.data.data, showLyrics:true });
  		if (this.props.mode !== 'karaCard') {
			  if (this.fullLyricsRef.current) this.fullLyricsRef.current.scrollIntoView({ behavior: 'smooth' });
  		}
  	}
  };

  getTagInLocale = (e:DBKaraTag) => {
  	return e.i18n[this.props.navigatorLanguage] ? e.i18n[this.props.navigatorLanguage] : e.i18n['eng'];
  };

  getTagNames = (data:DBPLCInfo) => {
  	var tagNames:Array<string> = [];
  	if (data.families) tagNames = tagNames.concat(data.families.map(e => this.getTagInLocale(e)));
  	if (data.platforms) tagNames = tagNames.concat(data.platforms.map(e => this.getTagInLocale(e)));
  	if (data.genres) tagNames = tagNames.concat(data.genres.map(e => this.getTagInLocale(e)));
  	if (data.origins) tagNames = tagNames.concat(data.origins.map(e => this.getTagInLocale(e)));
  	if (data.misc) tagNames = tagNames.concat(data.misc.map(e => this.getTagInLocale(e)));
  	return tagNames.join(', ');
  };

  changeVisibilityKara = () => {
  	if(this.props.scope === 'admin') {
  		axios.put('/api/' + this.props.scope + '/playlists/' + this.props.idPlaylist + '/karas/' + (this.state.kara as DBPLCInfo).playlistcontent_id, 
  			{ flag_visible: !(this.state.kara as DBPLCInfo).flag_visible });
  	}
  };

  onClick = () => {
	  var element = document.getElementById('modal');
  	if (element) ReactDOM.unmountComponentAtNode(element);
  }

  makeFavorite = () => {
  	this.state.isFavorite ?
  		axios.delete('/api/public/favorites', { data: { 'kid': [this.props.kid] } }) :
  		axios.post('/api/public/favorites', { 'kid': [this.props.kid] });
  	this.setState({ isFavorite: !this.state.isFavorite });
  };

  /**
   * Build kara details depending on the data
   * @param {Object} data - data from the kara
   * @param {String} mode - html mode
   * @return {String} the details, as html
   */
  render() {
  	if (this.state.kara) {
  		var data = this.state.kara;
  		var todayDate = Date.now();
  		var playTime = new Date(todayDate + data.time_before_play * 1000);
  		var playTimeDate =
        playTime.getHours() + 'h' + ('0' + playTime.getMinutes()).slice(-2);
  		var beforePlayTime = secondsTimeSpanToHMS(data.time_before_play, 'hm');
  		var details:any = {
  			DETAILS_TITLE: data.title,
  			UPVOTE_NUMBER: data.upvotes,
  			DETAILS_ADDED:
          (data.created_at
          	? i18next.t('DETAILS_ADDED_2') +
            new Date(data.created_at).toLocaleDateString()
          	: '') +
          (data.nickname ? ' ' + i18next.t('DETAILS_ADDED_3') + data.nickname : ''),
  			DETAILS_PLAYING_IN: data.time_before_play
  				? i18next.t('DETAILS_PLAYING_IN_2', {
  					time: beforePlayTime,
  					date: playTimeDate
  				})
  				: '',
  			DETAILS_LAST_PLAYED: data.lastplayed_ago
  				? this.getLastPlayed(data.lastplayed_at, data.lastplayed_ago)
  				: '',
  			BLCTYPE_6: data.authors.map(e => this.getTagInLocale(e)).join(', '),
  			DETAILS_VIEWS: data.played,
  			BLCTYPE_4: data.creators.map(e => this.getTagInLocale(e)).join(', '),
  			DETAILS_DURATION:
          ~~(data.duration / 60) +
          ':' +
          (data.duration % 60 < 10 ? '0' : '') +
          (data.duration % 60),
  			DETAILS_LANGUAGE: data.langs.map(e => this.getTagInLocale(e)).join(', '),
  			BLCTYPE_7: this.getTagNames(data),
  			DETAILS_SERIE: data.serie,
  			DETAILS_SERIE_ORIG: data.serie_orig,
  			BLCTYPE_2: data.singers.map(e => this.getTagInLocale(e)).join(', '),
  			DETAILS_TYPE: this.getTagInLocale(data.songtypes[0])
          + (data.songorder > 0 ? ' ' + data.songorder : ''),
  			DETAILS_YEAR: data.year,
  			BLCTYPE_8: data.songwriters.map(e => this.getTagInLocale(e)).join(', ')
  		};
  		var htmlDetails = Object.keys(details).map(function (k:string) {
  			if (details[k]) {
  				var detailsLine = details[k].toString().replace(/,/g, ', ');
  				return (
  					<tr key={k}>
  						<td> {i18next.t(k)}</td>
  						<td> {detailsLine}</td>
  					</tr>
  				);
  			} else {
  				return null;
  			}
  		});
  		var makeFavButton = (
  			<button
  				type="button"
  				title={i18next.t('TOOLTIP_FAV')}
  				onClick={this.makeFavorite}
  				className={(this.state.isFavorite ? 'currentFav' : '') + ' makeFav btn btn-action'}
  			><i className="fas fa-star"></i></button>
  		);

  		var lyricsKara =
        data.subfile && this.state.showLyrics ? (
        	<div className="lyricsKara alert alert-info" ref={this.fullLyricsRef}>
        		<button
        			type="button"
        			title={i18next.t('TOOLTIP_CLOSEPARENT')}
        			className="closeParent btn btn-action"
        			onClick={() => this.setState({showLyrics: false})}
        		><i className="fas fa-times"></i></button>
        		<div className="lyricsKaraLoad">
        			{(this.state.lyrics as string[]).map((ligne:string) => {
        				return (
        					<React.Fragment key={Math.random()}>
        						{ligne}
        						<br />
        					</React.Fragment>
        				);
        			})}
        		</div>
        		<button
        			type="button"
        			title={i18next.t('TOOLTIP_CLOSEPARENT')}
        			className="closeParent btn btn-action"
        			onClick={() => this.setState({showLyrics: false})}
        		><i className="fas fa-times"></i></button>
        	</div>
        ) : null;

  		var infoKaraTemp;
  		if (this.props.mode == 'list') {
  			infoKaraTemp = (
  				<div className="modal modalPage">
  					<div className="modal-dialog modal-md">
  						<div className="detailsKara">
  							<div className="topRightButtons">
  								<button
  									type="button"
  									title={i18next.t('TOOLTIP_CLOSEPARENT')}
  									className="closeParent btn btn-action"
  									onClick={this.props.toggleKaraDetail}
  								><i className="fas fa-times"></i></button>
  								{(store.getLogInfos() as Token).role === 'guest'
  									? null
  									: makeFavButton}
  								{data.subfile ? (
  									<button
  										type="button"
  										title={i18next.t('TOOLTIP_SHOWLYRICS')}
  										className={
  											'fullLyrics btn btn-action ' +
                        (is_touch_device() ? 'mobile' : '')
  										}
  										onClick={this.showFullLyrics}
  									><i className="fas fa-quote-right"></i></button>
  								) : null}
  								<button
  									type="button"
  									title={i18next.t('TOOLTIP_SHOWVIDEO')}
  									className={
  										'showVideo btn btn-action' +
                      (is_touch_device() ? 'mobile' : '')
  									}
  									onClick={() => this.props.showVideo!((this.state.kara as DBPLCInfo).mediafile)}
  								><i className="fas fa-video"></i></button>
  								{data.serie ? (
  									<button
  										type="button"
  										className={
  											'moreInfo btn btn-action' + (is_touch_device() ? 'mobile' : '')
  										}
  										onClick={this.moreInfo}
  									><i className="fas fa-info-circle"></i></button>
  								) : null}
  								{this.props.scope === 'admin' && this.props.publicOuCurrent ? (
  									<button
  										type="button"
  										title={i18next.t('TOOLTIP_UPVOTE')} onClick={this.props.freeKara}
  										className={'likeFreeButton btn btn-action ' + (data.flag_free ? 'btn-primary': '')}
  									><i className="fas fa-gift"></i></button>
  								) : null}
  								{this.props.scope === 'admin' && this.props.publicOuCurrent ? (
  									<button
  										type="button"
  										title={data.flag_visible ? i18next.t('TOOLTIP_VISIBLE_OFF') : i18next.t('TOOLTIP_VISIBLE_ON')} onClick={this.changeVisibilityKara}
  										className={'btn btn-action ' + (data.flag_visible ? '': 'btn-primary')}
  									>{data.flag_visible ? <i className="fas fa-eye"/> : <i className="fas fa-eye-slash"/>}</button>
  								) : null}
  							</div>
  							<table>
  								<tbody>{htmlDetails}</tbody>
  							</table>
  						</div>
  						{lyricsKara}
  					</div>
  				</div>
  			);
  		} else if (this.props.mode == 'karaCard') {
  			if (data.subfile) this.showFullLyrics();
  			infoKaraTemp = (
  				<React.Fragment>
  					<div className="details karaCard">
  						<div className="topRightButtons">
  							{(store.getLogInfos() as Token).role === 'guest' ? null : makeFavButton}
  						</div>
  						<table>
  							<tbody>{htmlDetails}</tbody>
  						</table>
  					</div>
  					<div className="lyricsKara alert alert-info">
  						{data.subfile && this.state.lyrics && this.state.lyrics.map(ligne => {
  							return (
  								<React.Fragment key={Math.random()}>
  									{ligne}
  									<br />
  								</React.Fragment>
  							);
  						})}
  					</div>
  				</React.Fragment>
  			);
  		}

  		return infoKaraTemp;
  	} else {
  		return null;
  	}
  }
}

export default KaraDetail;