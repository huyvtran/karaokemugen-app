import React, { Component } from "react";
import { withTranslation } from 'react-i18next';
import axios from 'axios';
import {expand} from '../tools';

class OnlineStatsModal extends Component {
    constructor(props) {
        super(props)
        this.state = {
            openDetails: false
        }
        this.onClick = this.onClick.bind(this);
    }

    onClick(value) {
        var data = expand("Online.Stats", value);
        axios.put('/api/admin/settings', {
            setting: JSON.stringify(data)
        });
        this.props.toggleOnlineStatsModal();
    }

    render() {
        const t = this.props.t;
        return (
            <div className="modal modalPage" id="onlineStatsModal">
                <div className="modal-dialog modal-md">
                    <div className="modal-content">
                        <ul className="nav nav-tabs nav-justified modal-header">
                            <li className="modal-title stats">
                                <a>{t('ONLINE_STATS.TITLE')}</a>
                            </li>
                        </ul>
                        <div className="tab-content" id="nav-stats-tab">
                            <div id="nav-stats" className="modal-body">
                                <div className="modal-message text">
                                    <p>{t('ONLINE_STATS.INTRO')}</p>
                                </div>
                                <div className="accordion text" id="accordionDetails">
                                    <div className="card">
                                        <div className="card-header" id="headingOne">
                                            <h5 className="mb-0">
                                                <a className="btn-link" type="button" onClick={() => this.setState({openDetails: !this.state.openDetails})}>
                                                    {t('ONLINE_STATS.DETAILS.TITLE')}
                                                </a>
                                            </h5>
                                        </div>
                                        {this.state.openDetails ?
                                            <div className="card-body">
                                                {'- ' + t('ONLINE_STATS.DETAILS.1')}<br />
                                                {'- ' + t('ONLINE_STATS.DETAILS.2')}<br />
                                                {'- ' + t('ONLINE_STATS.DETAILS.3')}<br />
                                                {'- ' + t('ONLINE_STATS.DETAILS.4')}<br />
                                                {'- ' + t('ONLINE_STATS.DETAILS.5')}<br />
                                                <p>{t('ONLINE_STATS.DETAILS.OUTRO')}</p>
                                                <br />
                                            </div> : null
                                        }
                                    </div >
                                    <div className="modal-message text">
                                        <p>{t('ONLINE_STATS.CHANGE')}</p>
                                        <p>{t('ONLINE_STATS.QUESTION')}</p>
                                    </div>
                                    <div></div>
                                    <div>
                                        <button type="button" className="onlineStatsBtn btn btn-default btn-primary col-xs-6" onClick={() => this.onClick(true)}>
                                            {t('YES')}
                                        </button>
                                        <button type="button" className="onlineStatsBtn btn btn-default col-xs-6" onClick={() => this.onClick(false)}>
                                            {t('NO')}
                                        </button>
                                    </div>
                                </div >
                            </div >
                        </div >
                    </div >
                </div >
            </div >
        )
    }
}

export default withTranslation()(OnlineStatsModal);
