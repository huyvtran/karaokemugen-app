import './LoginModal.scss';

import axios from 'axios';
import Fingerprint2 from 'fingerprintjs2';
import i18next from 'i18next';
import React, { Component } from 'react';
import ReactDOM from 'react-dom';

import Switch from '../generic/Switch';
import { callModal, displayMessage } from '../tools';
import HelpModal from './HelpModal';
require('babel-polyfill');
import store from '../../store';

interface IProps {
	role?: string;
	activeView?: number;
	admpwd?: string;
	scope: string;
}

interface IState {
	role: string;
	redBorders: string;
	errorBackground: string;
	serv: string;
	activeView?: number;
	onlineSwitch: boolean;
	forgotPassword: boolean;
	login: string;
	password: string;
	passwordConfirmation?: string;
	securityCode?: number;
}

class LoginModal extends Component<IProps, IState> {
	constructor(props: IProps) {
		super(props);
		const config = store.getConfig();
		this.state = {
			redBorders: '',
			errorBackground: '',
			serv: (config.Online.Users && config.Online.Host) ? config.Online.Host : '',
			role: this.props.role ? this.props.role : 'user',
			activeView: this.props.activeView ? this.props.activeView : 1,
			onlineSwitch: true,
			forgotPassword: false,
			password: '',
			login: ''
		};
	}

	login = async (username: string | undefined, password: string, securityCode?: number) => {
		let url = '/auth/login';
		let data: { username: string | undefined, password: string, securityCode?: number } | { fingerprint?: string } = { username: username, password: password };
		if (securityCode) data.securityCode = securityCode;

		if (!username) {
			url = '/auth/login/guest';
			data = { fingerprint: password };
		} else if (this.state.forgotPassword) {
			await this.callForgetPasswordApi();
		}

		let result = await axios.post(url, data);
		let response = result.data;
		if (this.props.scope === 'admin' && response.role !== 'admin') {
			if (!username) {
				displayMessage('warning', i18next.t('ERROR_CODES.ADMIN_PLEASE'));
				store.logOut();
			} else {
				callModal('prompt', i18next.t('MAKE_ACCOUNT_ADMIN'), i18next.t('MAKE_ACCOUNT_ADMIN_MESSAGE'), async (securityCode: string) => {
					(data as { username: string | undefined, password: string, securityCode?: number }).securityCode = parseInt(securityCode);
					result = await axios.post(url, data);
					response = result.data;
					const element = document.getElementById('modal');
					if (element) ReactDOM.unmountComponentAtNode(element);
					if (response) {
						store.setLogInfos(response);
						displayMessage('info', i18next.t('LOG_SUCCESS', { name: response.username }));
						store.getTuto() && store.getTuto().move(1);
					}
				}, undefined, true);
			}
		} else {
			const element = document.getElementById('modal');
			if (element) ReactDOM.unmountComponentAtNode(element);
			if (response) {
				store.setLogInfos(response);
				displayMessage('info', i18next.t('LOG_SUCCESS', { name: response.username }));
			}

			if (!localStorage.getItem('mugenTouchscreenHelp') && this.props.scope === 'public') {
				ReactDOM.render(<HelpModal />, document.getElementById('modal'));
			}
			store.getTuto() && store.getTuto().move(1);
		}
		await store.setUser();
	};

	loginGuest = () => {
		Fingerprint2.get({ excludes: { userAgent: true } }, (components: any) => {
			const values = components.map(function (component: any) {
				return component.value;
			});
			const murmur = Fingerprint2.x64hash128(values.join(''), 31);
			this.login('', murmur);
		});
	};

	loginUser = () => {
		if (this.state.login.includes('@')) {
			this.setState({ errorBackground: 'errorBackground' });
			displayMessage('warning', i18next.t('CHAR_NOT_ALLOWED', { char: '@' }));
			return;
		} else {
			this.setState({ errorBackground: '' });
		}
		const username = this.state.login + (this.state.onlineSwitch ? '@' + this.state.serv : '');
		this.login(username, this.state.password);
	};

	signup = async () => {
		if (this.state.login.includes('@')) {
			this.setState({ errorBackground: 'errorBackground' });
			displayMessage('warning', i18next.t('CHAR_NOT_ALLOWED', { char: '@' }));
			return;
		} else {
			this.setState({ errorBackground: '' });
		}
		const username = this.state.login + (this.state.onlineSwitch ? '@' + this.state.serv : '');
		const password = this.state.password;
		if (password !== this.state.passwordConfirmation) {
			this.setState({ redBorders: 'redBorders' });
		} else {
			const data: { login: string, password: string, securityCode?: number, role: string }
				= { login: username, password: password, role: this.props.scope === 'admin' ? 'admin' : 'user' };
			if (this.props.scope === 'admin') {
				if (!this.state.securityCode) {
					displayMessage('error', i18next.t('SECURITY_CODE_MANDATORY'));
					return;
				}
			}
			await axios.post('/users', data);
			this.setState({ redBorders: '' });
			this.login(username, password, this.state.securityCode);
		}
	};

	onKeyPress = (e: any) => {
		if (e.keyCode === 13) {
			this.state.activeView === 1 ? this.loginUser() : this.signup();
		}
	};

	callForgetPasswordApi = async () => {
		if (this.state.login) {
			await axios.post(`/users/${this.state.login}${this.state.onlineSwitch ? `@${this.state.serv}` : ''}/resetpassword`,
				this.state.onlineSwitch ? {} : {
					securityCode: this.state.securityCode,
					password: this.state.password
				});
		}
	}

	forgetPasswordClick = () => {
		if (this.state.onlineSwitch) {
			this.callForgetPasswordApi();
		} else {
			this.setState({ forgotPassword: !this.state.forgotPassword });
		}
	}

	render() {
		return (
			<div className="modal modalPage" id="loginModal">
				<div className="modal-dialog">
					<div className="modal-content">
						<ul className="nav nav-tabs nav-justified modal-header">
							<li className={(this.state.activeView === 1 ? 'active' : '')}>
								<a onClick={() => this.setState({ activeView: 1 })}>{i18next.t('LOGIN')}</a>
							</li>
							<li className={(this.state.activeView === 2 ? 'active' : '')}>
								<a onClick={() => this.setState({ activeView: 2 })}>{i18next.t('NEW_ACCOUNT')}</a>
							</li>
							<button className="closeModal btn btn-action"
								onClick={() => {
									const element = document.getElementById('modal');
									if (element) ReactDOM.unmountComponentAtNode(element);
								}}>
								<i className="fas fa-times"></i>
							</button>
						</ul>
						{this.state.activeView === 1 ?
							<div id="nav-login" className="modal-body">
								{this.props.scope !== 'admin' ?
									<React.Fragment>
										<button className="btn guestButton" onClick={this.loginGuest}>
											{i18next.t('GUEST_CONTINUE')}
										</button>
										<div>
											{i18next.t('OR')}
										</div>
									</React.Fragment> : null
								}
								<div>
									<label className="accountLabel">{i18next.t('ONLINE_ACCOUNT')}</label>
									<Switch handleChange={() => this.setState({ onlineSwitch: !this.state.onlineSwitch })}
										isChecked={this.state.onlineSwitch} />
									<label className="loginLabel">{i18next.t('USERNAME')}{this.state.onlineSwitch ?
										`@${i18next.t('INSTANCE_NAME_SHORT')}` : ''}</label>
									<div className="loginLine">
										<input type="text" className={this.state.onlineSwitch ? 'loginName' : ''} defaultValue={this.state.login}
											required autoFocus onChange={(event) => this.setState({ login: event.target.value })} />
										{this.state.onlineSwitch ? <React.Fragment>
											<div className="arobase">@</div>
											<input type="text" className="instanceName" defaultValue={this.state.serv}
												onChange={(event) => this.setState({ serv: event.target.value })} />
										</React.Fragment> : null}
									</div>
									<label className="loginLabel">{this.state.forgotPassword && !this.state.onlineSwitch ?
										i18next.t('NEW_PASSWORD') : i18next.t('PASSWORD')}
									</label>
									<div>
										<input type="password" onKeyPress={this.onKeyPress} className={this.state.redBorders}
											defaultValue={this.state.password} required
											onChange={(event) => this.setState({ password: event.target.value })} />
									</div>
									{this.props.scope === 'admin' || this.state.onlineSwitch ?
										<React.Fragment>
											<label className="accountLabel">{i18next.t('FORGOT_PASSWORD')}</label>
											<button type="button" className="forgotPasswordButton" onClick={this.forgetPasswordClick}><i className="fas fa-lock"></i></button>
										</React.Fragment> : null
									}
									{this.state.forgotPassword && this.props.scope === 'admin' && !this.state.onlineSwitch ?
										<input type="text" placeholder={i18next.t('SECURITY_CODE')}
											defaultValue={this.state.securityCode} required autoFocus onChange={(event) => this.setState({ securityCode: parseInt(event.target.value) })} /> : null
									}

									<button type="button" className="btn submitButton" onClick={this.loginUser}>
										{i18next.t('LOG_IN')}
									</button>
								</div>
							</div> :
							<div id="nav-signup" className="modal-body">
								<div>
									<label className="accountLabel">{i18next.t('ONLINE_ACCOUNT')}</label>
									<Switch handleChange={() => this.setState({ onlineSwitch: !this.state.onlineSwitch })}
										isChecked={this.state.onlineSwitch} />
									<label className="loginLabel">{i18next.t('USERNAME')}{this.state.onlineSwitch ?
										`@${i18next.t('INSTANCE_NAME_SHORT')}` : ''}</label>
									<div className="loginLine">
										<input className={`${this.state.errorBackground}${this.state.onlineSwitch ? 'loginName' : ''}`}
											type="text" defaultValue={this.state.login} required autoFocus
											onChange={(event) => this.setState({ login: event.target.value })} />
										{this.state.onlineSwitch ? <React.Fragment>
											<div className="arobase">@</div>
											<input type="text" className="instanceName" defaultValue={this.state.serv}
												onChange={(event) => this.setState({ serv: event.target.value })} />
										</React.Fragment> : null}
									</div>
									<div>
										<label className="loginLabel">{i18next.t('PASSWORD')}</label>
										<input type="password" className={this.state.redBorders} required defaultValue={this.state.password}
											onKeyPress={this.onKeyPress} onChange={(event) => this.setState({ password: event.target.value })} />
										<label className="loginLabel">{i18next.t('PASSWORDCONF')}</label>
										<input type="password" className={this.state.redBorders} required defaultValue={this.state.passwordConfirmation}
											onKeyPress={this.onKeyPress} onChange={(event) => this.setState({ passwordConfirmation: event.target.value })} />
									</div>
									{this.props.scope === 'admin' ?
										<div>
											<br />
											<input type="text" placeholder={i18next.t('SECURITY_CODE')}
												defaultValue={this.state.securityCode} required autoFocus onChange={(event) => this.setState({ securityCode: parseInt(event.target.value) })} />
										</div> : null
									}
									<div>
										<button type="button" className="btn submitButton" onClick={this.signup}>
											{i18next.t('SIGN_UP')}
										</button>
									</div>
								</div>
							</div>
						}
					</div>
				</div>
			</div>
		);
	}
}

export default LoginModal;
