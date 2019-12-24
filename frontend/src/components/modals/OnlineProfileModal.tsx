import React, { Component } from 'react';
import i18next from 'i18next';
import axios from 'axios';
import ReactDOM from 'react-dom';
import store from '../../store';
import { displayMessage } from '../tools';

interface IProps {
	loginServ?: string;
	type: string;
}

interface IState {
	modalLoginServ: string | undefined;
	password: string;
}

class OnlineProfileModal extends Component<IProps,IState> {
	constructor(props:IProps) {
		super(props);
		this.state = {
			modalLoginServ: this.props.loginServ,
			password: ''
		};
	}

    onClick = async () => {
    	var response:{ token: string; onlineToken: string; };
    	if (this.props.type === 'convert') {
    		response = await axios.post('/api/myaccount/online', { instance: this.state.modalLoginServ, password: this.state.password });
    		displayMessage('success', i18next.t('PROFILE_CONVERTED'));
    	} else {
    		response = await axios.delete('/api/myaccount/online', {data:{ password: this.state.password }});
    		displayMessage('success', i18next.t('PROFILE_ONLINE_DELETED'));
    	}
		store.setLogInfos(response);
		var element = document.getElementById('modal');
    	if (element) ReactDOM.unmountComponentAtNode(element);
    };

    render() {
    	return (
    		<div className="modal modalPage">
    			<div className="modal-dialog modal-md">
    				<div className="modal-content">
    					<ul className="modal-header">
    						<label className="modal-title">
    							{this.props.type === 'convert' ? i18next.t('PROFILE_CONVERT') : i18next.t('PROFILE_ONLINE_DELETE')}
    						</label>
    					</ul>
    					<div className="modal-body">
    						{this.props.type === 'convert' ?
    							<React.Fragment>
    								<label>{i18next.t('INSTANCE_NAME')}</label>
    								<input type="text" name="modalLoginServ" value={this.state.modalLoginServ} 
    									onChange={e => this.setState({modalLoginServ: e.target.value})} />
    							</React.Fragment> : null
    						}
    						<label>{i18next.t('PROFILE_PASSWORD_AGAIN')}</label>
    						<input type="password" placeholder={i18next.t('PASSWORD')} className="form-control" name="password" 
    							onChange={e => this.setState({password: e.target.value})}/>
    						<button className="btn btn-default confirm" onClick={this.onClick}>
    							<i className="fas fa-check"></i>
    						</button>
    					</div >
    				</div >
    			</div >
    		</div >
    	);
    }
}

export default OnlineProfileModal;