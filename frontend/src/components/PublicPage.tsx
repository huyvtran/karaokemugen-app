import axios from 'axios';
import i18next from 'i18next';
import React, { Component } from 'react';
import ReactDOM from 'react-dom';

import { Token } from '../../../src/lib/types/user';
import { Config } from '../../../src/types/config';
import { DBPLC, DBPLCInfo } from '../../../src/types/database/playlist';
import webappClose from '../assets/dame.jpg';
import store from '../store';
import { Tag } from '../types/tag';
import KmAppBodyDecorator from './decorators/KmAppBodyDecorator';
import KmAppHeaderDecorator from './decorators/KmAppHeaderDecorator';
import KmAppWrapperDecorator from './decorators/KmAppWrapperDecorator';
import PlaylistMainDecorator from './decorators/PlaylistMainDecorator';
import RadioButton from './generic/RadioButton';
import Playlist from './karas/Playlist';
import ProgressBar from './karas/ProgressBar';
import ClassicModeModal from './modals/ClassicModeModal';
import HelpModal from './modals/HelpModal';
import LoginModal from './modals/LoginModal';
import PollModal from './modals/PollModal';
import ProfilModal from './modals/ProfilModal';
import { buildKaraTitle, callModal, displayMessage, getSocket, is_touch_device, secondsTimeSpanToHMS } from './tools';

interface IProps {
	config: Config;
	tags: Array<Tag>;
	showVideo: (file: string) => void;
}

interface IState {
	idsPlaylist: { left: number, right: number };
	isPollActive: boolean;
	helpModal: boolean;
	lyrics: boolean;
	mobileMenu: boolean;
	dropDownMenu: boolean;
	searchMenuOpen: boolean;
	classicModeModal: boolean;
	kidPlaying?: string;
	currentSide: number;
	playlistList: Array<PlaylistElem>;
}

let timer: any;

class PublicPage extends Component<IProps, IState> {
	constructor(props: IProps) {
		super(props);
		this.state = {
			isPollActive: false,
			helpModal: false,
			lyrics: false,
			mobileMenu: false,
			idsPlaylist: { left: 0, right: 0 },
			dropDownMenu: false,
			searchMenuOpen: false,
			classicModeModal: false,
			currentSide: 1,
			playlistList: []
		};
		if (!store.getLogInfos() || !(store.getLogInfos() as Token).token) {
			this.openLoginOrProfileModal();
		} else if (this.props.config.Frontend.Mode === 1 && is_touch_device()) {
			callModal('confirm', i18next.t('WEBAPPMODE_LIMITED_NAME'),
				(<React.Fragment>
					<div className="text">
						{i18next.t('CL_HELP_PUBLIC_MOBILE_RESTRICTED')}
					</div>
					<div className="text">
						{i18next.t('CL_HELP_PUBLIC_MOBILE_RESTRICTED_DESCRIPTION')}
					</div>
				</React.Fragment>));
		}
	}

	majIdsPlaylist = (side: number, value: number) => {
		const idsPlaylist = this.state.idsPlaylist;
		if (side === 1) {
			idsPlaylist.left = Number(value);
		} else {
			idsPlaylist.right = Number(value);
		}
		this.setState({ idsPlaylist: idsPlaylist });
	};

	async componentDidMount() {
		getSocket().on('playerStatus', this.displayClassicModeModal);
		getSocket().on('newSongPoll', () => {
			if (axios.defaults.headers.common['authorization']) {
				this.setState({ isPollActive: true });
				ReactDOM.render(<PollModal hasVoted={() => this.setState({ isPollActive: false })} />,
					document.getElementById('modal'));
			}
		});
		getSocket().on('songPollEnded', () => {
			this.setState({ isPollActive: false });
			const element = document.getElementById('modal');
			if (element) ReactDOM.unmountComponentAtNode(element);
		});
		getSocket().on('songPollResult', (data: any) => {
			displayMessage('success', i18next.t('POLLENDED', { kara: data.kara.substring(0, 100), votes: data.votes }));
		});
		getSocket().on('adminMessage', (data: any) => displayMessage('info',
			<div><label>{i18next.t('CL_INFORMATIVE_MESSAGE')}</label> <br />{data.message}</div>, data.duration));
		getSocket().on('userSongPlaysIn', (data: DBPLCInfo) => {
			if (data && data.username === (store.getLogInfos() as Token)?.username) {
				const playTime = new Date(Date.now() + data.time_before_play * 1000);
				const playTimeDate = playTime.getHours() + 'h' + ('0' + playTime.getMinutes()).slice(-2);
				const beforePlayTime = secondsTimeSpanToHMS(data.time_before_play, 'hm');
				displayMessage('info', i18next.t('USER_SONG_PLAYS_IN', {
					kara: buildKaraTitle(data, true),
					time: beforePlayTime,
					date: playTimeDate
				}));
			}
		});
		getSocket().on('nextSong', (data: DBPLC) => {
			if (data && data.flag_visible) {
				if (timer) clearTimeout(timer);
				timer = setTimeout(() => {
					displayMessage('info',
						<div>
							<label>{i18next.t('NEXT_SONG_MESSAGE')}</label>
							<br />
							{buildKaraTitle(data, true)}
						</div>);
				}, 500);
			}
		});
		if (axios.defaults.headers.common['authorization']) {
			await this.getPlaylistList();
		}
		getSocket().on('publicPlaylistUpdated', this.getPlaylistList);
		getSocket().on('playlistsUpdated', this.getPlaylistList);
		store.addChangeListener('loginOut', this.openLoginOrProfileModal);
		store.addChangeListener('loginUpdated', this.getPlaylistList);
	}

	componentWillUnmount() {
		store.removeChangeListener('loginOut', this.openLoginOrProfileModal);
		store.removeChangeListener('loginUpdated', this.getPlaylistList);
	}

	displayClassicModeModal = (data: any) => {
		if (data.playerStatus === 'stop' && data.currentRequester === (store.getLogInfos() as Token)?.username && !this.state.classicModeModal) {
			ReactDOM.render(<ClassicModeModal />, document.getElementById('modal'));
			this.setState({ classicModeModal: true });
		} else if (data.playerStatus === 'play' && this.state.classicModeModal) {
			const element = document.getElementById('modal');
			if (element) ReactDOM.unmountComponentAtNode(element);
			this.setState({ classicModeModal: false });
		}
	};

	openLoginOrProfileModal = () => {
		this.closeMobileMenu();
		if (store.getLogInfos() && (store.getLogInfos() as Token).token) {
			ReactDOM.render(<ProfilModal
				config={this.props.config}
			/>, document.getElementById('modal'));
		} else {
			ReactDOM.render(<LoginModal
				scope="public"
			/>, document.getElementById('modal'));
		}
	};

	setLyrics = () => {
		this.closeMobileMenu();
		this.setState({ lyrics: !this.state.lyrics });
	};

	// pick a random kara & add it after (not) asking user's confirmation
	getLucky = async () => {
		this.closeMobileMenu();
		if (axios.defaults.headers.common['authorization']) {
			const response = await axios.get('/karas?filter=' + store.getFilterValue(1) + '&random=1');
			if (response.data && response.data.content && response.data.content[0]) {
				const chosenOne = response.data.content[0].kid;
				const response2 = await axios.get('/karas/' + chosenOne);
				callModal('confirm', i18next.t('CL_CONGRATS'), i18next.t('CL_ABOUT_TO_ADD', { title: buildKaraTitle(response2.data, true) }), () => {
					axios.post('/karas/' + chosenOne, { requestedby: (store.getLogInfos() as Token).username });
				}, 'lucky');
			}
		}
	};

	toggleSearchMenu = () => {
		this.setState({ searchMenuOpen: !this.state.searchMenuOpen });
	};

	updateKidPlaying = (kid: string) => {
		this.setState({ kidPlaying: kid });
	};

	changeCurrentSide = () => {
		if (this.state.currentSide === 1) {
			this.setState({ currentSide: 2 });
			if (store.getTuto() && store.getTuto().getStepLabel() === 'change_screen') {
				store.getTuto().move(1);
			}
		} else if (this.state.currentSide === 2) {
			this.setState({ currentSide: 1 });
			if (store.getTuto() && store.getTuto().getStepLabel() === 'change_screen2') {
				store.getTuto().move(1);
			}
		}
	};

	closeMobileMenu = () => {
		if (this.state.mobileMenu || this.state.dropDownMenu) {
			this.setState({ mobileMenu: false, dropDownMenu: false });
		}
	}

	getPlaylistList = async () => {
		axios.get('/stats');
		const response = await axios.get('/playlists/');
		const playlistList = response.data.filter((playlist: PlaylistElem) => playlist.flag_visible);
		if (this.props.config.Frontend.Permissions?.AllowViewBlacklist)
			playlistList.push({
				playlist_id: -2,
				name: i18next.t('PLAYLIST_BLACKLIST')
			});
		if (this.props.config.Frontend.Permissions?.AllowViewBlacklistCriterias)
			playlistList.push({
				playlist_id: -4,
				name: i18next.t('PLAYLIST_BLACKLIST_CRITERIAS')
			});
		if (this.props.config.Frontend.Permissions?.AllowViewWhitelist)
			playlistList.push({
				playlist_id: -3,
				name: i18next.t('PLAYLIST_WHITELIST')
			});
		this.setState({ playlistList: playlistList });
	};


	render() {
		return (
			<div id="publicPage">
				{this.props.config.Frontend.Mode === 0 ? (
					<div
						style={{
							top: '25%',
							position: 'relative',
							textAlign: 'center'
						}}
					>
						<img
							style={{ maxWidth: '100%', maxHeight: 'calc(100vh - 150px)' }}
							src={webappClose}
						/>
						<div style={{ fontSize: '30px', padding: '10px' }}>
							{i18next.t('WEBAPPMODE_CLOSED_MESSAGE')}
						</div>
					</div>
				) :
					(
						<React.Fragment>
							<KmAppWrapperDecorator>
								{this.props.config.Frontend.Mode === 2 ?
									<KmAppHeaderDecorator mode="public">
										<button
											type="button"
											title={i18next.t('FILTERS')}
											className={
												'searchMenuButton btn btn-sm btn-default' +
												(this.state.searchMenuOpen
													? ' searchMenuButtonOpen'
													: '')
											}
											onClick={this.toggleSearchMenu}
										>
											<i className="fas fa-filter" />
										</button>

										<div
											className="plSearch"
										>
											<input
												placeholder={`\uF002 ${i18next.t('SEARCH')}`}
												type="text"
												defaultValue={store.getFilterValue(1)}
												onChange={e =>
													store.setFilterValue(
														e.target.value,
														1,
														this.state.idsPlaylist.left
													)
												}
											/>
										</div>

										<button
											title={i18next.t('GET_LUCKY')}
											className="btn btn-action btn-default"
											onClick={this.getLucky}
										>
											<i className="fas fa-dice" />
										</button>
										<button
											className={`btn btn-dark sideButton ${this.state.currentSide === 2 ? 'side2Button' : 'side1Button'}`}
											type="button" onClick={this.changeCurrentSide}>
											<i className="fas fa-tasks"></i>
										</button>
										<div className="dropdown buttonsNotMobile">
											<button
												className="btn btn-dark dropdown-toggle klogo"
												id="menuPC"
												type="button"
												onClick={() => axios.defaults.headers.common['authorization'] ? 
													this.setState({ dropDownMenu: !this.state.dropDownMenu })
													: this.openLoginOrProfileModal()}
											/>
											{this.state.dropDownMenu ? (
												<ul className="dropdown-menu">
													<li>
														<a
															href="#"
															onClick={this.openLoginOrProfileModal}
														>
															<i className="fas fa-user" />&nbsp;{i18next.t('ACCOUNT')}
														</a>
													</li>
													<li>
														<a href="#" onClick={() => {
															this.closeMobileMenu();
															ReactDOM.render(<HelpModal />, document.getElementById('modal'));
														}}>
															<i className="fas fa-question-circle" />&nbsp;{i18next.t('HELP')}
														</a>
													</li>
													<li>
														<a
															href="#"
															className="logout"
															onClick={() => {
																store.logOut();
																this.openLoginOrProfileModal();
															}}
														>
															<i className="fas fa-sign-out-alt" />&nbsp;
															{i18next.t('LOGOUT')}
														</a>
													</li>
												</ul>
											) : null}
										</div>

										<div className="switchParent">
											{this.state.isPollActive ? (
												<button
													className="btn btn-default showPoll"
													onClick={() => ReactDOM.render(<PollModal hasVoted={() => this.setState({ isPollActive: false })} />, document.getElementById('modal'))}
												>
													<i className="fas fa-chart-line" />
												</button>
											) : null}
											<RadioButton
												title={i18next.t('SWITCH_BAR_INFOS')}
												buttons={[
													{
														label: i18next.t('SWITCH_BAR_INFOS_TITLE'),
														active: !this.state.lyrics,
														onClick: this.setLyrics
													},
													{
														label: i18next.t('SWITCH_BAR_INFOS_LYRICS'),
														active: this.state.lyrics,
														onClick: this.setLyrics
													}
												]}
											/>
										</div>
									</KmAppHeaderDecorator> : null
								}

								<ProgressBar scope="public" lyrics={this.state.lyrics} />

								<KmAppBodyDecorator
									mode={this.props.config.Frontend.Mode}
									extraClass={
										this.props.config.Frontend.Mode === 1
											? ' mode1'
											: ''
									}
								>
									{this.state.playlistList.length > 0 ?
										<PlaylistMainDecorator currentSide={this.state.currentSide}>
											<Playlist
												scope="public"
												side={1}
												config={this.props.config}
												idPlaylistTo={this.state.idsPlaylist.right}
												majIdsPlaylist={this.majIdsPlaylist}
												tags={this.props.tags}
												toggleSearchMenu={this.toggleSearchMenu}
												searchMenuOpen={this.state.searchMenuOpen}
												showVideo={this.props.showVideo}
												kidPlaying={this.state.kidPlaying}
												updateKidPlaying={this.updateKidPlaying}
												playlistList={this.state.playlistList}
											/>
											<Playlist
												scope="public"
												side={2}
												config={this.props.config}
												idPlaylistTo={this.state.idsPlaylist.left}
												majIdsPlaylist={this.majIdsPlaylist}
												showVideo={this.props.showVideo}
												kidPlaying={this.state.kidPlaying}
												updateKidPlaying={this.updateKidPlaying}
												playlistList={this.state.playlistList}
											/>
										</PlaylistMainDecorator> : null
									}
								</KmAppBodyDecorator>
							</KmAppWrapperDecorator>

							{this.props.config.Frontend.Mode === 2 &&
								this.state.isPollActive ? (
									<div
										className="fixed-action-btn right right2 mobileActions"
									>
										<a
											className="btn-floating btn-large waves-effect z-depth-3 showPoll"
											onClick={() => {
												this.closeMobileMenu();
												ReactDOM.render(<PollModal hasVoted={() => this.setState({ isPollActive: false })} />,
													document.getElementById('modal'));
											}}
										>
											<i className="fas fa-bar-chart" />
										</a>
									</div>
								) : null}

							<div className="fixed-action-btn right mobileActions">
								<a
									className="btn-floating btn-large waves-effect z-depth-3 klogo"
									id="menuMobile"
									onClick={() =>
										axios.defaults.headers.common['authorization'] ?
											this.setState({ mobileMenu: !this.state.mobileMenu })
											: this.openLoginOrProfileModal()
									}
									style={{
										backgroundColor: '#1b4875',
										border: '.5px solid #FFFFFF12'
									}}
								/>
								{this.state.mobileMenu ? (
									<ul>
										{this.props.config.Frontend.Mode === 2 ? (
											<React.Fragment>
												<li>
													<a
														className="z-depth-3 btn-floating btn-large logout"
														style={{ backgroundColor: '#111' }}
														onClick={() => {
															this.closeMobileMenu();
															store.logOut();
														}}
													>
														<i className="fas fa-sign-out-alt" />
													</a>
												</li>
												<li>
													<a
														className="z-depth-3 btn-floating btn-large"
														style={{ backgroundColor: '#111' }}
														onClick={this.getLucky}
													>
														<i className="fas fa-dice" />
													</a>
												</li>
											</React.Fragment>
										) : null}
										<li>
											<a
												className="z-depth-3 btn-floating btn-large"
												style={{ backgroundColor: '#613114' }}
												onClick={() => {
													this.closeMobileMenu();
													ReactDOM.render(<HelpModal />, document.getElementById('modal'));
												}}
											>
												<i className="fas fa-question-circle" />
											</a>
										</li>
										<li>
											<a
												className="z-depth-3 btn-floating btn-large"
												style={{ backgroundColor: '#431b50' }}
												onClick={this.openLoginOrProfileModal}
											>
												<i className="fas fa-user" />
											</a>
										</li>
										<li>
											<a
												className="z-depth-3 btn-floating btn-large"
												id="switchInfoBar"
												style={{ backgroundColor: '#125633' }}
												onClick={this.setLyrics}
											>
												{this.state.lyrics ? (
													<i className="fas fa-closed-captioning" />
												) :
													(
														<i className="fas fa-info-circle" />
													)}
											</a>
										</li>
									</ul>
								) : null}
							</div>
						</React.Fragment>
					)}
			</div>
		);
	}
}

export default PublicPage;
