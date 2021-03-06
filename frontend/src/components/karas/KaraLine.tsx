import axios from 'axios';
import i18next from 'i18next';
import React, { Component, MouseEvent } from 'react';
import ReactDOM from 'react-dom';
import { SortableHandle } from 'react-sortable-hoc';

import { DBKaraTag } from '../../../../src/lib/types/database/kara';
import { Tag } from '../../../../src/lib/types/tag';
import { Token } from '../../../../src/lib/types/user';
import { Config } from '../../../../src/types/config';
import { DBBlacklist } from '../../../../src/types/database/blacklist';
import { DBPL } from '../../../../src/types/database/playlist';
import store from '../../store';
import { KaraElement } from '../../types/kara';
import { tagTypes } from '../../utils/tagTypes';
import KaraMenuModal from '../modals/KaraMenuModal';
import { buildKaraTitle, displayMessage, getSerieLanguage, getTagInLanguage, is_touch_device, secondsTimeSpanToHMS } from '../tools';
import ActionsButtons from './ActionsButtons';
import KaraDetail from './KaraDetail';

require('./KaraLine.scss');

const DragHandle = SortableHandle(() => <span className="dragHandle"><i className="fas fa-ellipsis-v"></i></span>);

interface IProps {
	kara: KaraElement;
	side: number;
	config: Config;
	idPlaylist: number;
	idPlaylistTo: number;
	playlistInfo: DBPL | undefined;
	scope: string;
	i18nTag: { [key: string]: { [key: string]: string } };
	avatar_file: string;
	index: number;
	showVideo: (file: string) => void;
	checkKara: (id: number | string) => void;
	deleteCriteria: (kara: DBBlacklist) => void;
	jingle: boolean;
	sponsor: boolean;
}

interface IState {
	karaMenu: boolean;
	problematic: boolean
}

const pathAvatar = '/avatars/';
class KaraLine extends Component<IProps, IState> {

	constructor(props: IProps) {
		super(props);
		this.state = {
			karaMenu: false,
			problematic: this.isProblematic()
		};
	}

	toggleKaraDetail = () => {
		ReactDOM.render(<KaraDetail kid={this.props.kara.kid} playlistcontentId={this.props.kara.playlistcontent_id} scope={this.props.scope}
			idPlaylist={this.props.idPlaylist} mode='list'
			showVideo={this.props.showVideo}>
		</KaraDetail>, document.getElementById('modal'));
	};

	getTagInLocale = (tag: DBKaraTag) => {
		return getTagInLanguage(tag, store.getNavigatorLanguage() as string, 'eng', this.props.i18nTag);
	};

	upvoteKara = () => {
		const data = this.props.kara.flag_upvoted ? { 'downvote': 'true' } : {};
		axios.post(`/playlists/${this.props.idPlaylist}/karas/${this.props.kara.playlistcontent_id}/vote`, data);
	};

	deleteKara = async () => {
		if (this.props.idPlaylist === -1) {
			await axios.delete(`/playlists/${store.getState().publicPlaylistID}/karas/`, { data: { plc_id: this.props.kara.my_public_plc_id } });
		} else if (this.props.idPlaylist === -5) {
			await axios.delete('/favorites', { data: { kid: [this.props.kara.kid] } });
		} else if (this.props.idPlaylist === -2) {
			this.props.deleteCriteria(this.props.kara as unknown as DBBlacklist);
		} else if (this.props.idPlaylist === -3) {
			await axios.delete('/whitelist', { data: { kid: [this.props.kara.kid] } });
		} else {
			await axios.delete(`/playlists/${this.props.idPlaylist}/karas/`, { data: { plc_id: [this.props.kara.playlistcontent_id] } });
		}
	};

	playKara = () => {
		if (this.props.idPlaylist < 0) {
			axios.post(`/karas/${this.props.kara.kid}/play`);
		} else {
			axios.put(`/playlists/${this.props.idPlaylist}/karas/${this.props.kara.playlistcontent_id}`, { flag_playing: true });
		}
	};

	addKara = async (_event?: any, pos?: number) => {
		const logInfos = store.getLogInfos();
		let url = '';
		let data;
		let type;
		if (this.props.idPlaylistTo == -5) {
			url = '/favorites';
			data = { kid: [this.props.kara.kid] };
		} else if (this.props.scope === 'admin') {
			if (this.props.idPlaylistTo > 0) {
				url = '/playlists/' + this.props.idPlaylistTo + '/karas';
				if (this.props.idPlaylist > 0 && !pos) {
					data = { plc_id: [this.props.kara.playlistcontent_id] };
					type = 'PATCH';
				} else {
					if (pos) {
						data = { requestedby: (logInfos as Token).username, kid: this.props.kara.kid, pos: pos + 1 };
					} else {
						data = { requestedby: (logInfos as Token).username, kid: this.props.kara.kid };
					}
				}
			} else if (this.props.idPlaylistTo == -2 || this.props.idPlaylistTo == -4) {
				url = `/blacklist/set/${store.getCurrentBlSet()}/criterias`;
				data = { blcriteria_type: 1001, blcriteria_value: this.props.kara.kid };
			} else if (this.props.idPlaylistTo == -3) {
				url = '/whitelist';
				data = { kid: [this.props.kara.kid] };
			}
		} else {
			url = `/karas/${this.props.kara.kid}`;
			data = { requestedby: (logInfos as Token).username, kid: this.props.kara.kid };
		}
		let response;
		if (type === 'PATCH') {
			response = await axios.patch(url, data);
		} else {
			response = await axios.post(url, data);
		}
		if (response.data && response.data.data && response.data.data.plc && response.data.data.plc.time_before_play) {
			const playTime = new Date(Date.now() + response.data.data.plc.time_before_play * 1000);
			const playTimeDate = playTime.getHours() + 'h' + ('0' + playTime.getMinutes()).slice(-2);
			const beforePlayTime = secondsTimeSpanToHMS(response.data.data.plc.time_before_play, 'hm');
			displayMessage('success', <div>
				{i18next.t(`SUCCESS_CODES.${response.data.code}`)}
				<br />
				{i18next.t('TIME_BEFORE_PLAY', {
					time: beforePlayTime,
					date: playTimeDate
				})}
			</div>);
		}
	};

	transferKara = async (event: any, pos?: number) => {
		await this.addKara(event, pos);
		this.deleteKara();
	};

	checkKara = () => {
		if (this.props.idPlaylist >= 0) {
			this.props.checkKara(this.props.kara.playlistcontent_id);
		} else {
			this.props.checkKara(this.props.kara.kid);
		}
	};

	changeVisibilityKara = () => {
		axios.put('/playlists/' + this.props.idPlaylist + '/karas/' + this.props.kara.playlistcontent_id,
			{ flag_visible: true });
	};

	compareTag = (a: DBKaraTag, b: DBKaraTag) => {
		return a.name.localeCompare(b.name);
	}

	karaFamilies = this.props.kara.families ? this.props.kara.families.sort(this.compareTag).map(tag => {
		return <div key={tag.name} className="tag" title={this.getTagInLocale(tag)}>{tag.short ? tag.short : '?'}</div>;
	}) : [];

	karaPlatforms = this.props.kara.platforms ? this.props.kara.platforms.sort(this.compareTag).map(tag => {
		return <div key={tag.name} className="tag" title={this.getTagInLocale(tag)}>{tag.short ? tag.short : '?'}</div>;
	}) : [];

	karaGenres = this.props.kara.genres ? this.props.kara.genres.sort(this.compareTag).map(tag => {
		return <div key={tag.name} className="tag" title={this.getTagInLocale(tag)}>{tag.short ? tag.short : '?'}</div>;
	}) : [];

	karaOrigins = this.props.kara.origins ? this.props.kara.origins.sort(this.compareTag).map(tag => {
		return <div key={tag.name} className="tag" title={this.getTagInLocale(tag)}>{tag.short ? tag.short : '?'}</div>;
	}) : [];

	karaMisc = this.props.kara.misc ? this.props.kara.misc.sort(this.compareTag).map(tag => {
		return <div key={tag.name} className="tag" title={this.getTagInLocale(tag)}>{tag.short ? tag.short : '?'}</div>;
	}) : [];

	karaTitle = buildKaraTitle(this.props.kara, false, this.props.i18nTag);

	isProblematic = () => {
		let problematic = false;
		for (const tagType of Object.keys(tagTypes)) {
			if ((this.props.kara[tagType.toLowerCase()] as unknown as Tag[])?.length > 0
				&& this.props.kara[tagType.toLowerCase()].some((t: Tag) => t.problematic)) {
				problematic = true;
			}
		}
		return problematic;
	}

	getLangs(data: KaraElement) {
		const isMulti = data.langs ? data.langs.find(e => e.name.indexOf('mul') > -1) : false;
		if (data.langs && isMulti) {
			data.langs = [isMulti];
		}
		return data.langs.map(e => e.name).join(', ').toUpperCase();
	}

	getSerieOrSingers(data: KaraElement) {
		return (data.series && data.series.length > 0) ? data.series.map(e => getSerieLanguage(e, data.langs[0].name, this.props.i18nTag)).join(', ')
			: data.singers.map(e => this.getTagInLocale(e)).join(', ');
	}

	getSongtypes(data: KaraElement) {
		return data.songtypes.map(e => e.short ? + e.short : e.name).sort().join(' ') + (data.songorder > 0 ? ' ' + data.songorder : '');
	}

	openKaraMenu(event: MouseEvent) {
		if (event?.currentTarget) {
			const element = (event.currentTarget as Element).getBoundingClientRect();
			ReactDOM.render(<KaraMenuModal
				kara={this.props.kara}
				side={this.props.side}
				idPlaylist={this.props.idPlaylist}
				idPlaylistTo={this.props.idPlaylistTo}
				publicOuCurrent={this.props.playlistInfo && (this.props.playlistInfo.flag_current || this.props.playlistInfo.flag_public)}
				topKaraMenu={element.bottom}
				leftKaraMenu={element.left}
				transferKara={this.transferKara}
				closeKaraMenu={this.closeKaraMenu}
			/>, document.getElementById('modal'));
			this.setState({ karaMenu: true });
		}
	}

	closeKaraMenu = () => {
		const element = document.getElementById('modal');
		if (element) ReactDOM.unmountComponentAtNode(element);
		this.setState({ karaMenu: false });
	}

	karaLangs = this.getLangs(this.props.kara);
	karaSerieOrSingers = this.getSerieOrSingers(this.props.kara);
	karaSongTypes = this.getSongtypes(this.props.kara);

	render() {
		const logInfos = store.getLogInfos();
		const kara = this.props.kara;
		const scope = this.props.scope;
		const idPlaylist = this.props.idPlaylist;
		return (
			<>
				<div className={`list-group-item ${kara.flag_playing ? 'currentlyplaying ' : ''} ${kara.flag_dejavu ? 'dejavu ' : ''}
				${this.props.index % 2 === 0 ? 'list-group-item-binaire ' : ''} ${(this.props.jingle || this.props.sponsor) && scope === 'admin' ? 'marker ' : ''}
				${this.props.sponsor && scope === 'admin' ? 'green' : ''}`}>
					{scope === 'public' && logInfos && kara.username !== logInfos.username && kara.flag_visible === false ?
						<div className="contentDiv">
							<div style={{ height: '33px' }}>
								{
									(this.props.config.Playlist.MysterySongs.Labels as string[])[(this.props.config.Playlist.MysterySongs.Labels as string[]).length * Math.random() | 0]
								}
							</div>
						</div> :
						<React.Fragment>
							<div className="actionDiv">
								{((store.getLogInfos() && kara.username !== (store.getLogInfos() as Token).username)
									&& !(is_touch_device() && scope === 'admin') || !is_touch_device())
									&& this.props.config.Frontend.ShowAvatarsOnPlaylist && this.props.avatar_file ?
									<img className={`img-circle ${is_touch_device() ? 'mobile' : ''}`}
										src={pathAvatar + this.props.avatar_file} alt="User Pic" title={kara.nickname} /> : null}
								<div className="actionButtonsDiv">
									{this.props.idPlaylistTo !== idPlaylist ?
										<ActionsButtons
											idPlaylistTo={this.props.idPlaylistTo}
											idPlaylist={idPlaylist}
											scope={this.props.scope}
											side={this.props.side}
											kara={kara}
											addKara={this.addKara}
											deleteKara={this.deleteKara}
											transferKara={this.transferKara} />
										: null}
								</div>
								{scope === 'admin' ?
									<button title={i18next.t('KARA_MENU.KARA_COMMANDS')}
										onClick={(event) => {
											this.state.karaMenu ? this.closeKaraMenu() : this.openKaraMenu(event);
										}}
										className={'btn-sm btn-action showPlaylistCommands karaLineButton' + (this.state.karaMenu ? ' btn-primary' : '')}>
										<i className="fas fa-wrench"></i>
									</button> : null
								}
								{!is_touch_device() && scope === 'admin' && idPlaylist > 0 ? <DragHandle /> : null}
							</div>
							{scope === 'admin' && idPlaylist !== -2 && idPlaylist !== -4 ?
								<span className="checkboxKara" onClick={this.checkKara}>
									{kara.checked ? <i className="far fa-check-square"></i>
										: <i className="far fa-square"></i>}
								</span> : null}
							<div className="infoDiv">
								{scope === 'admin' ?
									<button title={i18next.t(idPlaylist < 0 ? 'KARA_MENU.PLAY_LIBRARY' : 'KARA_MENU.PLAY')}
										className="btn btn-sm btn-action playKara karaLineButton" onClick={this.playKara}>
										<i className={`fas ${idPlaylist < 0 ? 'fa-play' : 'fa-play-circle'}`}></i>
									</button> : null}
								{scope === 'admin' && idPlaylist > 0 && !kara.flag_visible ?
									<button type="button" className={'btn btn-sm btn-action btn-primary'} onClick={this.changeVisibilityKara}>
										<i className="fas fa-eye-slash"></i>
									</button> : null
								}
								{scope !== 'admin' && !kara.flag_dejavu && !kara.flag_playing && kara.username === logInfos?.username
									&& idPlaylist === store.getState().publicPlaylistID ?
									<button title={i18next.t('TOOLTIP_DELETEKARA')} className="btn btn-sm btn-action karaLineButton"
										onClick={this.deleteKara}><i className="fas fa-minus"></i></button> : null}
								{scope !== 'admin' && this.props.idPlaylist > 0 && this.props.playlistInfo?.flag_public ?
									<button className='upvoteKara btn btn-sm btn-action'
										title={i18next.t('TOOLTIP_UPVOTE')}
										disabled={this.props.kara.username === store.getLogInfos()?.username}
										onClick={this.upvoteKara}>
										<i className={`fas fa-thumbs-up ${kara.flag_upvoted ? 'currentUpvote' : ''} ${kara.upvotes > 0 ? 'upvotes' : ''}`} />
										{kara.upvotes > 0 && kara.upvotes}
									</button> : null}
							</div>
							{is_touch_device() ?
								<div className="contentDiv contentDivMobile" onClick={this.toggleKaraDetail} tabIndex={1}>
									<div className={`disable-select contentDivMobileTop ${this.state.problematic ? 'problematic' : ''}`}>
										<div className="contentDivMobileFirstColumn">
											<div>{this.karaLangs}</div>
											<div>{this.karaSongTypes}</div>
										</div>
										<div>
											<div className="contentDivMobileSerie">{this.karaSerieOrSingers}</div>
											<div className="contentDivMobileTitle">{kara.title}</div>
										</div>
										{kara.upvotes && this.props.scope === 'admin' ?
											<div className="upvoteCount"
												title={i18next.t('TOOLTIP_FREE')}>
												<i className="fas fa-thumbs-up" />
												{kara.upvotes}
											</div> : null
										}
									</div>
									<div className="disable-select">
										<div>
											{this.karaFamilies}
											{this.karaPlatforms}
											{this.karaGenres}
											{this.karaOrigins}
											{this.karaMisc}
										</div>
									</div>
								</div> :
								<div className="contentDiv" onClick={this.toggleKaraDetail} tabIndex={1}>
									<div className={`disable-select karaTitle ${this.state.problematic ? 'problematic' : ''}`}>
										{this.karaTitle}
										{kara.upvotes && this.props.scope === 'admin' ?
											<div className="upvoteCount"
												title={i18next.t('UPVOTE_NUMBER')}>
												<i className="fas fa-thumbs-up" />
												{kara.upvotes}
											</div> : null
										}
										<div className="tagConteneur">
											{this.karaFamilies}
											{this.karaPlatforms}
											{this.karaGenres}
											{this.karaOrigins}
											{this.karaMisc}
										</div>
									</div>
								</div>
							}
						</React.Fragment>
					}
				</div>
				{(this.props.sponsor && this.props.jingle && scope === 'admin') ? <div className="marker-label green">
					{i18next.t('JINGLE_SPONSOR')}
				</div> : this.props.jingle && scope === 'admin' ? <div className="marker-label">
					{i18next.t('JINGLE')}
				</div> : this.props.sponsor && scope === 'admin' ? <div className="marker-label green">
					{i18next.t('SPONSOR')}
				</div> : ''}
			</>
		);
	}
}

export default KaraLine;
