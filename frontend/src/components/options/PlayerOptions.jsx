import React, { Component } from "react";
import i18next from 'i18next';
import Switch from '../generic/Switch';
import axios from 'axios';
import { dotify } from '../tools';

class PlayerOptions extends Component {
  constructor(props) {
    super(props);
    this.state = {
      displays: this.getDisplays(),
      settings: dotify(this.props.settings)
    };
    this.putPlayerCommando = this.putPlayerCommando.bind(this);
    this.getDisplays = this.getDisplays.bind(this);
    this.onChange = this.onChange.bind(this);
  }

  async getDisplays() {
    const res = await axios.get('/api/admin/displays');
    this.setState({ displays: res.data.data })
  }

  putPlayerCommando(e) {
    var settings = this.state.settings;
    const value = e.target.type === 'checkbox' ? e.target.checked : 
      (Number(e.target.value) ? Number(e.target.value) : e.target.value);
    settings[e.target.id] = value;
    this.setState({ settings: settings });
    axios.put('/api/admin/player', {
      command: e.target.getAttribute('namecommand')
    });
    this.props.onChange(e);
  }

  onChange(e) {
    var settings = this.state.settings;
    var value = e.target.type === 'checkbox' ? e.target.checked : 
      (Number(e.target.value) ? Number(e.target.value) : e.target.value);
    if (value === 'true') {
      value = true;
    } else if (value === 'false') {
      value = false;
    }
    settings[e.target.id] = value;
    this.setState({ settings: settings });
    if (e.target.type != "number" || (Number(e.target.value))) this.props.onChange(e);
  }

  render() {
    if (this.state.settings["Karaoke.Display.ConnectionInfo.Host"] === null)
    this.state.settings["Karaoke.Display.ConnectionInfo.Host"] = '';
    const listdisplays =
      this.state.displays && this.state.displays.length > 0
        ? this.state.displays.map((display, index) => (
          <option key={index} value={index} >
            &nbsp;
            {index + 1} - ({display.resolutionx}x{display.resolutiony}) {display.model}
          </option>
        ))
        : null;
    return (
      <React.Fragment>
        <div className="form-group">
          <label className="col-xs-4 control-label" title={i18next.t("ALWAYS_ON_TOP_TOOLTIP")}>
            {i18next.t("ALWAYS_ON_TOP")}
            &nbsp;
            <i class="far fa-question-circle"></i>
          </label>
          <div className="col-xs-6">
            <Switch idInput="Player.StayOnTop" handleChange={this.putPlayerCommando}
              isChecked={this.state.settings["Player.StayOnTop"]} nameCommand="toggleAlwaysOnTop" />
          </div>
        </div>
        <div className="form-group">
          <label className="col-xs-4 control-label" title={i18next.t("FULLSCREEN_TOOLTIP")}>
            {i18next.t("FULLSCREEN")}
            &nbsp;
            <i class="far fa-question-circle"></i>
          </label>
          <div className="col-xs-6">
            <Switch idInput="Player.FullScreen" handleChange={this.putPlayerCommando}
              isChecked={this.state.settings["Player.FullScreen"]} nameCommand="toggleFullscreen" />
          </div>
        </div>
        <div className="form-group">
          <label className="col-xs-4 control-label">
            {i18next.t("MONITOR_NUMBER")}
          </label>
          <div className="col-xs-6">
            <select
              type="number"
              className="form-control"
              id="Player.Screen"
              onChange={this.onChange}
              value={this.state.settings["Player.Screen"]}
            >
              {listdisplays}
            </select>
          </div>
        </div>

        <div className="form-group">
          <label className="col-xs-4 control-label">
            {i18next.t("ENGINEDISPLAYCONNECTIONINFO")}
          </label>
          <div className="col-xs-6">
            <Switch idInput="Karaoke.Display.ConnectionInfo.Enabled" handleChange={this.onChange}
              isChecked={this.state.settings["Karaoke.Display.ConnectionInfo.Enabled"]} />
          </div>
        </div>

        {this.state.settings["Karaoke.Display.ConnectionInfo.Enabled"] ? (
          <div
            id="connexionInfoSettings"
            className="well well-sm settingsGroupPanel"
          >
            <div className="form-group">
              <label className="col-xs-4 control-label" title={i18next.t("ENGINEDISPLAYCONNECTIONINFOHOST_TOOLTIP")}>
                {i18next.t("ENGINEDISPLAYCONNECTIONINFOHOST")}
                &nbsp;
                <i class="far fa-question-circle"></i>
              </label>
              <div className="col-xs-6">
                <input
                  className="form-control"
                  id="Karaoke.Display.ConnectionInfo.Host"
                  onChange={this.onChange}
                  value={this.state.settings["Karaoke.Display.ConnectionInfo.Host"]}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="col-xs-4 control-label" title={i18next.t("ENGINEDISPLAYCONNECTIONINFOMESSAGE_TOOLTIP")}>
                {i18next.t("ENGINEDISPLAYCONNECTIONINFOMESSAGE")}
                &nbsp;
                <i class="far fa-question-circle"></i>
              </label>
              <div className="col-xs-6">
                <input
                  className="form-control"
                  id="Karaoke.Display.ConnectionInfo.Message"
                  onChange={this.onChange}
                  value={this.state.settings["Karaoke.Display.ConnectionInfo.Message"]}
                />
              </div>
            </div>
          </div>
        ) : null}

        <div className="form-group">
          <label className="col-xs-4 control-label" title={i18next.t("PLAYERPIP_TOOLTIP")}>
            {i18next.t("PLAYERPIP")}
            &nbsp;
            <i class="far fa-question-circle"></i>
          </label>
          <div className="col-xs-6">
            <Switch idInput="Player.PIP.Enabled" handleChange={this.onChange}
              isChecked={this.state.settings["Player.PIP.Enabled"]} />
          </div>
        </div>
        {this.state.settings["Player.PIP.Enabled"] ?
          <div id="pipSettings" className="well well-sm settingsGroupPanel">
            <div className="form-group">
              <label className="col-xs-4 control-label" title={i18next.t("VIDEO_SIZE_TOOLTIP")}>
                {`${i18next.t("VIDEO_SIZE")} (${this.state.settings["Player.PIP.Size"]}%)`}
                &nbsp;
                <i class="far fa-question-circle"></i>
              </label>
              <div className="col-xs-6">
                <input
                  type="range"
                  id="Player.PIP.Size"
                  onChange={this.onChange}
                  value={this.state.settings["Player.PIP.Size"]}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="col-xs-4 control-label" title={i18next.t("VIDEO_POSITION_X_TOOLTIP")}>
                {i18next.t("VIDEO_POSITION_X")}
                &nbsp;
                <i class="far fa-question-circle"></i>
              </label>
              <div className="col-xs-6">
                <select
                  className="form-control"
                  id="Player.PIP.PositionX"
                  onChange={this.onChange}
                  value={this.state.settings["Player.PIP.PositionX"]}
                >
                  <option value="Left"> {i18next.t("LEFT")} </option>
                  <option value="Center" default>{i18next.t("CENTER")}</option>
                  <option value="Right"> {i18next.t("RIGHT")} </option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="col-xs-4 control-label" title={i18next.t("VIDEO_POSITION_Y_TOOLTIP")}>
                {i18next.t("VIDEO_POSITION_Y")}
                &nbsp;
                <i class="far fa-question-circle"></i>
              </label>
              <div className="col-xs-6">
                <select
                  className="form-control"
                  id="Player.PIP.PositionY"
                  onChange={this.onChange}
                  value={this.state.settings["Player.PIP.PositionY"]}
                >
                  <option value="Bottom"> {i18next.t("BOTTOM")} </option>
                  <option value="Center" default>{i18next.t("CENTER")}</option>
                  <option value="Top"> {i18next.t("TOP")} </option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="col-xs-4 control-label" title={i18next.t("ENGINEDISPLAYNICKNAME_TOOLTIP")}>
                {i18next.t("ENGINEDISPLAYNICKNAME")}
                &nbsp;
                <i class="far fa-question-circle"></i>
              </label>
              <div className="col-xs-6">
                <Switch idInput="Karaoke.Display.Nickname" handleChange={this.onChange}
                  isChecked={this.state.settings["Karaoke.Display.Nickname"]} />
              </div>
            </div>

            <div className="form-group">
              <label className="col-xs-4 control-label">
                {i18next.t("ENGINEDISPLAYAVATAR")}
              </label>
              <div className="col-xs-6">
                <Switch idInput="Karaoke.Display.Avatar" handleChange={this.onChange}
                  isChecked={this.state.settings["Karaoke.Display.Avatar"]} />
              </div>
            </div>

            <div className="form-group">
              <label className="col-xs-4 control-label" title={i18next.t("PLAYERMONITOR_TOOLTIP")}>
                {i18next.t("PLAYERMONITOR")}
                &nbsp;
                <i class="far fa-question-circle"></i>
              </label>
              <div className="col-xs-6">
                <Switch idInput="Player.Monitor" handleChange={this.onChange}
                  isChecked={this.state.settings["Player.Monitor"]} />
              </div>
            </div>

            <div className="form-group">
              <label className="col-xs-4 control-label" title={i18next.t("PLAYERVISUALIZATIONEFFECTS_TOOLTIP")}>
                {i18next.t("PLAYERVISUALIZATIONEFFECTS")}
                &nbsp;
                <i class="far fa-question-circle"></i>
              </label>
              <div className="col-xs-6">
                <Switch idInput="Player.VisualizationEffects" handleChange={this.onChange}
                  isChecked={this.state.settings["Player.VisualizationEffects"]} />
              </div>
            </div>
          </div> : null}
      </React.Fragment>
    );
  }
}

export default PlayerOptions;
