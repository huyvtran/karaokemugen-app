import React, { Component } from "react";
import { withTranslation } from 'react-i18next';
import Switch from '../generic/Switch';
import { dotify } from '../tools';

class InterfaceOptions extends Component {
  constructor(props) {
    super(props);
    this.state = {
      settings: dotify(this.props.settings)
    };
    this.onChange = this.onChange.bind(this);
  }

  onChange(e) {
    var settings = this.state.settings;
    const value = e.target.type === 'checkbox' ? e.target.checked : 
      (Number(e.target.value) ? Number(e.target.value) : e.target.value);
    settings[e.target.id] = value;
    this.setState({ settings: settings });
    if (e.target.type != "number" || (Number(e.target.value))) this.props.onChange(e);
  }

  render() {
    return (
      <React.Fragment>
        <div className="form-group">
          <label className="col-xs-4 control-label">
            {this.props.t("WEBAPPMODE")}
          </label>
          <div className="col-xs-6">
            <select
              type="number"
              className="form-control"
              id="Frontend.Mode"
              onChange={this.onChange}
              value={this.state.settings["Frontend.Mode"]}
            >
              <option value="0">{this.props.t("WEBAPPMODE_CLOSED")}</option>
              <option value="1">{this.props.t("WEBAPPMODE_LIMITED")}</option>
              <option value="2">{this.props.t("WEBAPPMODE_OPEN")}</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label className="col-xs-4 control-label">
            {this.props.t("SERIE_NAME_MODE")}
          </label>
          <div className="col-xs-6">
            <select
              type="number"
              className="form-control"
              id="Frontend.SeriesLanguageMode"
              onChange={this.onChange}
              value={this.state.settings["Frontend.SeriesLanguageMode"]}
            >
              <option value="0">{this.props.t("SERIE_NAME_MODE_ORIGINAL")}</option>
              <option value="1">{this.props.t("SERIE_NAME_MODE_SONG")}</option>
              <option value="2">{this.props.t("SERIE_NAME_MODE_ADMIN")}</option>
              <option value="3">{this.props.t("SERIE_NAME_MODE_USER")}</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label className="col-xs-4 control-label">
            {this.props.t("ENGINEALLOWVIEWBLACKLIST")}
          </label>
          <div className="col-xs-6">
            <Switch idInput="Frontend.Permissions.AllowViewBlacklist" handleChange={this.onChange}
              isChecked={this.state.settings["Frontend.Permissions.AllowViewBlacklist"]} />
          </div>
        </div>

        <div className="form-group">
          <label className="col-xs-4 control-label">
            {this.props.t("ENGINEALLOWVIEWBLACKLISTCRITERIAS")}
          </label>
          <div className="col-xs-6">
            <Switch idInput="Frontend.Permissions.AllowViewBlacklistCriterias" handleChange={this.onChange}
              isChecked={this.state.settings["Frontend.Permissions.AllowViewBlacklistCriterias"]} />
          </div>
        </div>

        <div className="form-group">
          <label className="col-xs-4 control-label">
            {this.props.t("ENGINEALLOWVIEWWHITELIST")}
          </label>
          <div className="col-xs-6">
            <Switch idInput="Frontend.Permissions.AllowViewWhitelist" handleChange={this.onChange}
              isChecked={this.state.settings["Frontend.Permissions.AllowViewWhitelist"]} />
          </div>
        </div>
      </React.Fragment>
    );
  }
}

export default withTranslation()(InterfaceOptions);
