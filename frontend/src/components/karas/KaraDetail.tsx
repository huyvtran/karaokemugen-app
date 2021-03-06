import './KaraDetail.scss';

import axios from 'axios';
import i18next from 'i18next';
import React, { Component, MouseEvent } from 'react';
import ReactDOM from 'react-dom';

import { DBKaraTag, lastplayed_ago } from '../../../../src/lib/types/database/kara';
import { Token } from '../../../../src/lib/types/user';
import { DBPLCInfo } from '../../../../src/types/database/playlist';
import store from '../../store';
import { callModal, getSerieLanguage, getTagInLanguage, is_touch_device, secondsTimeSpanToHMS } from '../tools';

interface IProps {
	kid: string | undefined;
	mode: string;
	scope: string;
	idPlaylist?: number;
	playlistcontentId?: number;
	showVideo?: (file: string) => void;
}

interface IState {
	kara?: DBPLCInfo;
	showLyrics: boolean;
	isFavorite: boolean;
	lyrics: Array<string>;
}

class KaraDetail extends Component<IProps, IState> {
	private fullLyricsRef: React.RefObject<HTMLInputElement>;

	constructor(props: IProps) {
		super(props);
		this.state = {
			showLyrics: false,
			isFavorite: false,
			lyrics: []
		};
		this.fullLyricsRef = React.createRef();
		if (this.props.kid || this.props.idPlaylist) {
			this.getKaraDetail();
		}
		if (store.getTuto() && store.getTuto().getStepLabel() === 'karadetails') {
			store.getTuto().move(1);
		}
	}

	componentWillReceiveProps(nextProps: IProps) {
		if (nextProps.kid && nextProps.kid !== this.props.kid) {
			this.getKaraDetail(nextProps.kid);
		}
	}

	keyObserverHandler = (e: KeyboardEvent) => {
		if (e.key === 'Escape' && !document.getElementById('video')) {
			this.closeModal();
		}
	}

	closeModal() {
		const element = document.getElementById('modal');
		if (element) ReactDOM.unmountComponentAtNode(element);
	}

	componentDidMount() {
		if (this.props.mode === 'list' && !is_touch_device())
			document.addEventListener('keyup', this.keyObserverHandler);
	}

	componentWillUnmount() {
		if (this.props.mode === 'list' && !is_touch_device())
			document.removeEventListener('keyup', this.keyObserverHandler);
	}

	onClickOutsideModal = (e: MouseEvent) => {
		const myElementToCheckIfClicksAreInsideOf = document.getElementsByClassName('modal-dialog')[0];
		if (!myElementToCheckIfClicksAreInsideOf?.contains((e.target as Node))) {
			this.closeModal();
		}
	}

	getKaraDetail = async (kid?: string) => {
		const urlInfoKara = this.props.idPlaylist && this.props.idPlaylist > 0 ?
			'/playlists/' + this.props.idPlaylist + '/karas/' + this.props.playlistcontentId :
			'/karas/' + (kid ? kid : this.props.kid);
		const response = await axios.get(urlInfoKara);
		const kara = response.data;
		await this.setState({
			kara: kara,
			isFavorite: kara.flag_favorites || this.props.idPlaylist === -5
		});
		if (this.props.mode === 'karaCard' && kara.subfile) this.showFullLyrics();
	};

	getLastPlayed = (lastPlayed_at: Date, lastPlayed: lastplayed_ago) => {
		if (
			lastPlayed &&
			!lastPlayed.days &&
			!lastPlayed.months &&
			!lastPlayed.years
		) {
			const timeAgo =
				(lastPlayed.seconds ? lastPlayed.seconds : 0) +
				(lastPlayed.minutes ? lastPlayed.minutes * 60 : 0) +
				(lastPlayed.hours ? lastPlayed.hours * 3600 : 0);
			const timeAgoStr =
				lastPlayed.minutes || lastPlayed.hours
					? secondsTimeSpanToHMS(timeAgo, 'hm')
					: secondsTimeSpanToHMS(timeAgo, 'ms');

			return i18next.t('DETAILS_LAST_PLAYED_2', { time: timeAgoStr });
		} else if (lastPlayed_at) {
			return new Date(lastPlayed_at).toLocaleDateString();
		}
		return null;
	};

	/**
	 * show full lyrics of a given kara
	 */

	showFullLyrics = async () => {
		const response = await axios.get('/karas/' + (this.state.kara as DBPLCInfo).kid + '/lyrics');
		if (is_touch_device() && this.props.mode !== 'karaCard') {
			callModal('alert', i18next.t('LYRICS'),
				<div style={{ textAlign: 'center' }}>
					{response.data.map((value: string) =>
						<React.Fragment>{value} <br /></React.Fragment>)}
				</div>);
		} else {
			this.setState({ lyrics: response.data, showLyrics: true });
			if (this.props.mode !== 'karaCard') {
				if (this.fullLyricsRef.current) this.fullLyricsRef.current.scrollIntoView({ behavior: 'smooth' });
			}
		}
	};

	getTagInLocale = (e: DBKaraTag) => {
		return <span key={e.name} className={e.problematic ? 'problematicTag' : ''}>
			{getTagInLanguage(e, store.getNavigatorLanguage(), 'eng')}
		</span>;
	};

	getTagNames = (data: DBPLCInfo) => {
		let tagNames: any[] = [];
		if (data.families) tagNames = tagNames.concat(data.families.map(e => this.getTagInLocale(e)));
		if (data.platforms) tagNames = tagNames.concat(data.platforms.map(e => this.getTagInLocale(e)));
		if (data.genres) tagNames = tagNames.concat(data.genres.map(e => this.getTagInLocale(e)));
		if (data.origins) tagNames = tagNames.concat(data.origins.map(e => this.getTagInLocale(e)));
		if (data.misc) tagNames = tagNames.concat(data.misc.map(e => this.getTagInLocale(e)));
		return tagNames.reduce((acc, x) => acc === null ? [x] : [acc, ', ', x], null);
	};

	onClick = () => {
		const element = document.getElementById('modal');
		if (element) ReactDOM.unmountComponentAtNode(element);
	}

	makeFavorite = () => {
		this.state.isFavorite ?
			axios.delete('/favorites', { data: { 'kid': [this.props.kid] } }) :
			axios.post('/favorites', { 'kid': [this.props.kid] });
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
			const data = this.state.kara;
			const todayDate = Date.now();
			const playTime = new Date(todayDate + data.time_before_play * 1000);
			const playTimeDate =
				playTime.getHours() + 'h' + ('0' + playTime.getMinutes()).slice(-2);
			const beforePlayTime = secondsTimeSpanToHMS(data.time_before_play, 'hm');
			const details: any = {
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
				BLCTYPE_6: data.authors.map(e => this.getTagInLocale(e))
					.reduce((acc, x): any => acc === null ? [x] : [acc, ', ', x], null),
				DETAILS_VIEWS: data.played,
				BLCTYPE_4: data.creators.map(e => this.getTagInLocale(e))
					.reduce((acc, x): any => acc === null ? [x] : [acc, ', ', x], null),
				DETAILS_DURATION:
					~~(data.duration / 60) +
					':' +
					(data.duration % 60 < 10 ? '0' : '') +
					(data.duration % 60),
				DETAILS_LANGUAGE: data.langs.map(e => this.getTagInLocale(e))
					.reduce((acc, x): any => acc === null ? [x] : [acc, ', ', x], null),
				BLCTYPE_7: this.getTagNames(data),
				BLCTYPE_1: data.series.map(e => getSerieLanguage(e, data.langs[0].name))
					.reduce((acc, x) => acc === null ? [x] : [acc, ', ', x], null),
				BLCTYPE_2: data.singers.map(e => this.getTagInLocale(e))
					.reduce((acc, x): any => acc === null ? [x] : [acc, ', ', x], null),
				DETAILS_TYPE: <React.Fragment>
					{data.songtypes.map(e => this.getTagInLocale(e))
						.reduce((acc, x): any => acc === null ? [x] : [acc, ', ', x], null)}
					<span>{data.songorder > 0 ? ' ' + data.songorder : ''}</span>
				</React.Fragment>,
				DETAILS_YEAR: data.year,
				BLCTYPE_8: data.songwriters.map(e => this.getTagInLocale(e))
					.reduce((acc, x): any => acc === null ? [x] : [acc, ', ', x], null)
			};
			const htmlDetails = Object.keys(details).map(function (k: string) {
				if (details[k]) {
					return (
						<tr key={k}>
							<td> {i18next.t(k)}</td>
							<td> {details[k]}</td>
						</tr>
					);
				} else {
					return null;
				}
			});
			const makeFavButton = (
				<button
					type="button"
					title={this.state.isFavorite ? i18next.t('TOOLTIP_FAV_DEL') : i18next.t('TOOLTIP_FAV')}
					onClick={this.makeFavorite}
					className={(this.state.isFavorite ? 'currentFav' : '') + ' makeFav btn btn-action'}
				>
					<i className="fas fa-star" />
					<span>{!is_touch_device() && i18next.t('TOOLTIP_FAV_SHORT')}</span>
				</button>
			);

			const lyricsKara =
				data.subfile && this.state.showLyrics ? (
					<div className="lyricsKara alert alert-info" ref={this.fullLyricsRef}>
						<button
							type="button"
							title={i18next.t('TOOLTIP_CLOSEPARENT')}
							className="closeParent btn btn-action"
							onClick={() => this.setState({ showLyrics: false })}
						><i className="fas fa-times"></i></button>
						<div className="lyricsKaraLoad">
							{(this.state.lyrics as string[]).map((ligne: string) => {
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
							onClick={() => this.setState({ showLyrics: false })}
						><i className="fas fa-times"></i></button>
					</div>
				) : null;

			let infoKaraTemp;
			if (this.props.mode === 'list') {
				infoKaraTemp = (
					<div className="modal modalPage" onClick={this.onClickOutsideModal}>
						<div className="modal-dialog">
							<div className="modal-content">
								<div className="modal-header">
									<h4 className="modal-title">{i18next.t('MODAL.KARA_DETAILS')}</h4>
								</div>
								<div className="detailsKara">
									<div className="topRightButtons">
										<button
											type="button"
											title={i18next.t('TOOLTIP_CLOSEPARENT')}
											className={`closeParent btn btn-action ${is_touch_device() ? 'mobile' : ''}`}
											onClick={this.closeModal}
										>
											<i className="fas fa-times" />
											<span>{!is_touch_device() && i18next.t('TOOLTIP_CLOSEPARENT')}</span>
										</button>
										{(store.getLogInfos() as Token).role === 'guest'
											? null
											: makeFavButton}
										{data.subfile ? (
											<button
												type="button"
												title={i18next.t('TOOLTIP_SHOWLYRICS')}
												className={`fullLyrics btn btn-action ${is_touch_device() ? 'mobile' : ''}`}
												onClick={this.showFullLyrics}
											>
												<i className="fas fa-quote-right" />
												<span>{!is_touch_device() && i18next.t('TOOLTIP_SHOWLYRICS_SHORT')}</span>
											</button>
										) : null}
										<button
											type="button"
											title={i18next.t('TOOLTIP_SHOWVIDEO')}
											className={`showVideo btn btn-action ${is_touch_device() ? 'mobile' : ''}`}
											onClick={() => this.props.showVideo && this.props.showVideo((this.state.kara as DBPLCInfo).mediafile)}
										>
											<i className="fas fa-video" />
											<span>{!is_touch_device() && i18next.t('TOOLTIP_SHOWVIDEO_SHORT')}</span>
										</button>
									</div>
									<table>
										<tbody>{htmlDetails}</tbody>
									</table>
								</div>
							</div>
							{lyricsKara}
						</div>
					</div>
				);
			} else if (this.props.mode === 'karaCard') {
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
							{data.subfile && this.state.lyrics?.map((ligne, index) => {
								return (
									<React.Fragment key={index}>
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
