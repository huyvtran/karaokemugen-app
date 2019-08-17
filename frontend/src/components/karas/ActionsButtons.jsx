import React, { Component } from "react";
import i18next from 'i18next';

class ActionsButtons extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        var classValue = this.props.isHeader ? "btn btn-default" : "btn btn-sm btn-action"
        return (
            <React.Fragment>
                {this.props.scope === 'admin' && this.props.idPlaylist !== -1 ?
                    <button title={i18next.t('TOOLTIP_DELETEKARA')} name="deleteKara"
                        className={classValue} onClick={this.props.deleteKara}><i className="fas fa-minus"></i></button> : null}
                {(this.props.scope === 'admin' && this.props.idPlaylistTo !== -1) ||
                    (this.props.scope === 'public' && this.props.idPlaylist !== this.props.playlistToAddId) ?
                    <button title={i18next.t('TOOLTIP_ADDKARA') + (this.props.scope == 'admin' ? ' - ' + i18next.t('TOOLTIP_ADDKARA_ADMIN') : '')}
                        name="addKara" className={classValue} onClick={this.props.addKara} ><i className="fas fa-plus"></i></button> : null}
                {this.props.scope === 'admin' && this.props.idPlaylistTo >= 0 && this.props.idPlaylist >= 0 ?
                    <button title={i18next.t('TOOLTIP_TRANSFERKARA')} name="transferKara" className={classValue}
                        onClick={this.props.transferKara}><i className="fas fa-exchange-alt"></i></button> : null
                }
            </React.Fragment>
        )
    }
}

export default ActionsButtons;
