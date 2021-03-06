import Axios from 'axios';
import i18next from 'i18next';
import React, { Component } from 'react';

import store from '../../store';
import { KaraElement } from '../../types/kara';
import { is_touch_device } from '../tools';

interface IProps {
	kara: KaraElement;
	side: number;
	idPlaylist: number;
	idPlaylistTo: number;
	publicOuCurrent?: boolean | undefined;
	topKaraMenu: number;
	leftKaraMenu: number;
	closeKaraMenu: () => void;
	transferKara: (event: any, pos?: number) => void;
}

interface IState {
	kara?: KaraElement;
}

class KaraMenuModal extends Component<IProps, IState> {
	constructor(props: IProps) {
		super(props);
		this.state = {};
		this.getKaraDetail();
	}

	getKaraDetail = async () => {
		const urlInfoKara = this.props.idPlaylist && this.props.idPlaylist > 0 ?
			'/playlists/' + this.props.idPlaylist + '/karas/' + this.props.kara.playlistcontent_id :
			'/karas/' + this.props.kara.kid;
		const response = await Axios.get(urlInfoKara);
		this.setState({ kara: response.data });
	};

	onRightClickTransfer = (e: any) => {
		e.preventDefault();
		e.stopPropagation();
		this.props.transferKara(e, store.getPosPlayingOpposite(this.props.side));
		this.props.closeKaraMenu();
	};


	freeKara = () => {
		Axios.put('/playlists/' + this.props.idPlaylist + '/karas/' + this.state.kara?.playlistcontent_id, { flag_free: true });
		this.props.closeKaraMenu();
	};


	changeVisibilityKara = () => {
		Axios.put('/playlists/' + this.props.idPlaylist + '/karas/' + this.state.kara?.playlistcontent_id,
			{ flag_visible: !this.state.kara?.flag_visible });
		this.props.closeKaraMenu();
	};

	makeFavorite = () => {
		this.state.kara?.flag_favorites ?
			Axios.delete('/favorites', { data: { 'kid': [this.state.kara?.kid] } }) :
			Axios.post('/favorites', { 'kid': [this.state.kara?.kid] });
		this.props.closeKaraMenu();
	};

	addToBlacklist = () => {
		Axios.post(`/blacklist/set/${store.getCurrentBlSet()}/criterias`, { blcriteria_type: 1001, blcriteria_value: this.state.kara?.kid });
		this.props.closeKaraMenu();
	}

	addToWhitelist = () => {
		Axios.post('/whitelist', { kid: [this.state.kara?.kid] });
		this.props.closeKaraMenu();
	}

	handleClick = (e: MouseEvent) => {
		if (!(e.target as Element).closest('#modal')) {
			this.props.closeKaraMenu();
		}
	}

	componentDidMount() {
		document.addEventListener('click', this.handleClick);
	}

	componentWillUnmount() {
		document.removeEventListener('click', this.handleClick);
	}

	render() {
		return (
			this.state.kara ?
				<ul
					className="dropdown-menu"
					style={{
						position: 'absolute',
						zIndex: 9998,
						bottom: window.innerHeight < (this.props.topKaraMenu + 250) ? (window.innerHeight - this.props.topKaraMenu) + (is_touch_device() ? 65 : 35) : undefined,
						top: window.innerHeight < (this.props.topKaraMenu + 250) ? undefined : this.props.topKaraMenu,
						left: window.innerWidth < (this.props.leftKaraMenu + 250) ? window.innerWidth - 250 : this.props.leftKaraMenu
					}}>
					{this.props.idPlaylistTo >= 0 && this.props.idPlaylist >= 0 ?
						<li>
							<a href="#" onContextMenu={this.onRightClickTransfer} onClick={(event) => {
								this.props.transferKara(event);
								this.props.closeKaraMenu();
							}}>
								<i className="fas fa-exchange-alt" />
								&nbsp;
								{i18next.t('KARA_MENU.TRANSFER_KARA')}
							</a>
						</li> : null
					}
					{this.props.idPlaylist >= 0 && !this.props.kara?.flag_playing ?
						<li>
							<a href="#" onClick={() => {
								Axios.put(`/playlists/${this.props.idPlaylist}/karas/${this.props.kara.playlistcontent_id}`, 
									{ pos: store.getPosPlaying(this.props.side) + 1 });
								this.props.closeKaraMenu();
							}}>
								<i className="fas fa-level-up-alt" />
								&nbsp;
								{i18next.t('KARA_MENU.MOVE_KARA')}
							</a>
						</li> : null
					}
					<li>
						<a href="#" onClick={this.makeFavorite}>
							<i className="fas fa-star" />
							&nbsp;
							{this.state.kara.flag_favorites ? i18next.t('TOOLTIP_FAV_DEL') : i18next.t('TOOLTIP_FAV')}
						</a>
					</li>
					{this.props.publicOuCurrent && !this.state.kara.flag_free ?
						<li>
							<a href="#" onClick={this.freeKara} title={i18next.t('KARA_MENU.FREE')}>
								<i className="fas fa-gift" />
								&nbsp;
								{i18next.t('KARA_MENU.FREE_SHORT')}
							</a>
						</li> : null
					}
					<li>
						<a href="#" onClick={this.changeVisibilityKara}
							title={this.state.kara.flag_visible ? i18next.t('KARA_MENU.VISIBLE_OFF') : i18next.t('KARA_MENU.VISIBLE_ON')}>
							{this.state.kara.flag_visible ?
								<React.Fragment>
									<i className="fas fa-eye-slash" />
									&nbsp;
									{i18next.t('KARA_MENU.VISIBLE_OFF_SHORT')}
								</React.Fragment> :
								<React.Fragment>
									<i className="fas fa-eye" />
									&nbsp;
									{i18next.t('KARA_MENU.VISIBLE_ON_SHORT')}
								</React.Fragment>
							}
						</a>
					</li>
					{this.props.idPlaylist !== -2 && this.props.idPlaylist !== -4 ?
						<li>
							<a href="#" onClick={this.addToBlacklist}>
								<i className="fas fa-ban" />
								&nbsp;
								{i18next.t('KARA_MENU.ADD_BLACKLIST')}
							</a>
						</li> : null
					}
					{this.props.idPlaylist !== -3 ?
						<li>
							<a href="#" onClick={this.addToWhitelist}>
								<i className="fas fa-check-circle" />
								&nbsp;
								{i18next.t('KARA_MENU.ADD_WHITELIST')}
							</a>
						</li> : null
					}
				</ul> : null
		);
	}
}

export default KaraMenuModal;
