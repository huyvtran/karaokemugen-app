import React, { Component } from "react";
import { withTranslation } from "react-i18next";
import axios from "axios";
import ProfilModal from "./modals/ProfilModal"
import LoginModal from "./modals/LoginModal"
import logo from '../assets/Logo-final-fond-transparent.png'
class WelcomePage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      news: [],
      loginModal: !this.props.logInfos.token || (this.props.admpwd && this.props.settings.config.App.FirstRun),
      profileModal: false,
      open: false
    };
    this.getCatchphrase = this.getCatchphrase.bind(this);
    this.getNewsFeed = this.getNewsFeed.bind(this);
    this.loginClick = this.loginClick.bind(this);
    this.getCatchphrase();
    this.getNewsFeed();
  }

  async getCatchphrase() {
    const res = await axios.get("/api/public/catchphrase");
    this.setState({ catchphrase: res.data });
  }

  async getNewsFeed() {
    const res = await axios.get("/api/public/newsfeed");
    const data = res.data;
    var base = data[0];
    var appli = data[1];
    var mast = data[2];
    var news = data[2].body;
    if (base.body && appli.body) {
      base.body = JSON.parse(base.body);
      appli.body = JSON.parse(appli.body);
      news = [
        {
          html: base.body.feed.entry[0].content._text,
          date: base.body.feed.entry[0].updated._text,
          dateStr: new Date(
            base.body.feed.entry[0].updated._text
          ).toLocaleDateString(),
          title:
            this.props.t("BASE_UPDATE") +
            " : " +
            base.body.feed.title._text +
            (base.body.feed.entry[0].summary._text ? " - " +
              base.body.feed.entry[0].summary._text : ''),
          link: base.body.feed.entry[0].link._attributes.href,
          type: "base"
        },
        {
          html: appli.body.feed.entry[0].content._text,
          date: appli.body.feed.entry[0].updated._text,
          dateStr: new Date(
            appli.body.feed.entry[0].updated._text
          ).toLocaleDateString(),
          title:
            this.props.t("APP_UPDATE") +
            " : " +
            appli.body.feed.entry[0].title._text +
            (appli.body.feed.entry[0].summary._text ?
              " - " +
              appli.body.feed.entry[0].summary._text : ''),
          link: appli.body.feed.entry[0].link._attributes.href,
          type: "app"
        }
      ];
    }

    if (mast.body) {
      mast.body = JSON.parse(mast.body);
      var max = mast.body.rss.channel.item.length > 3 ? 3 : mast.body.rss.channel.item.length;
      for (var i = 0; i < max; i++) {
        news.push({
          html: mast.body.rss.channel.item[i].description._text,
          date: mast.body.rss.channel.item[i].pubDate._text,
          dateStr: new Date(
            mast.body.rss.channel.item[i].pubDate._text
          ).toLocaleDateString(),
          title: mast.body.rss.channel.item[i].title._text,
          link: mast.body.rss.channel.item[i].link._text,
          type: "mast"
        });
      }
    }
    news.sort((a, b) => {
      var dateA = new Date(a.date);
      var dateB = new Date(b.date);
      return dateA < dateB ? 1 : dateA > dateB ? -1 : 0;
    });
    this.setState({ news: news });
  }


  loginClick() {
    if (!this.props.logInfos.token) {
      this.props.loginModal('welcome', null);
    } else {
      this.props.profileModal(true);
    }
  }


  render() {
    const t = this.props.t;
    return (
      <div id="welcomePage">
        {this.state.loginModal ?
          <LoginModal scope={this.props.admpwd && this.props.settings.config.App.FirstRun ? 'admin' : 'welcome'}
            config={this.props.settings.config} admpwd={this.props.admpwd} updateLogInfos={this.props.updateLogInfos}
            toggleLoginModal={() => this.setState({ loginModal: !this.state.loginModal })} /> : null
        }
        {this.state.profileModal ?
          <ProfilModal settingsOnline={this.props.settings.config.Online} updateLogInfos={this.props.updateLogInfos} logInfos={this.props.logInfos} 
            toggleProfileModal={() => this.setState({profileModal:!this.state.profileModal})} /> : null
        }
        <div className="navbar-default navbar-fixed-top" id="navigation">
          <div className="container">

              <ul className="nav navbar-nav navbar-right" id="top-nav">
                <li>
                  <a
                    href="http://mugen.karaokes.moe/contact.html"
                    target="_blank"
                  >
                    <i className="glyphicon glyphicon-pencil" />{" "}
                    {t("WLCM_CONTACT")}
                  </a>
                </li>
                <li>
                  <a href="http://mugen.karaokes.moe/" target="_blank">
                    <i className="glyphicon glyphicon-link" />
                    {t("WLCM_SITE")}
                  </a>
                </li>
                <li>
                  <a href="#" id="wlcm_login" onClick={this.loginClick}>
                    <i className="glyphicon glyphicon-user" />
                    <span>{this.props.logInfos.token ? this.props.logInfos.username : t("NOT_LOGGED")}</span>
                  </a>
                </li>
                {this.props.logInfos.token ?
                  <li id="wlcm_disconnect">
                    <a href="#" title={t("LOGOUT")} className="logout" onClick={this.props.logOut}>
                      <i className="glyphicon glyphicon-log-out" />{" "}
                      <span>{t("LOGOUT")}</span>
                    </a>
                  </li> : null
                }
              </ul>
          </div>
        </div>

        <section id="center-area">
          <div className="container">
            <div className="row">
              <div className="col-md-12 logoDiv">
                <h1 className="wow">
                  <img
                    className="logo-1"
                    height="122"
                    src={logo}
                    alt="LOGO"
                  />
                </h1>
              </div>
              <div className="col-md-12 text-center catchPhrase">
                {this.state.catchphrase}
              </div>
              <div className="col-md-12 block wow menu zoomIn">
                <ul id="welcome_dashboard">
                  <li className={this.props.admpwd && this.props.settings.config.App.FirstRun ? "manage tutorial" : "manage"}
                    onClick={() => window.open('/admin' + window.location.search, '_blank')}>
                    <div className="dash days_dash">
                      <i className="digit glyphicon glyphicon-list normalText" />
                      <i className="digit glyphicon glyphicon-hand-right tutorialText" />
                      <div className="dash_title normalText">
                        {t("WLCM_KARAMANAGER")}
                      </div>
                      <div className="dash_title tutorialText">
                        {t("WLCM_GETSTARTED")}
                      </div>
                    </div>
                  </li>
                  <li>
                    <div className="dash hours_dash"
                      onClick={() => window.open('/system', '_blank')}>
                      <i className="digit glyphicon glyphicon-cog" />
                      <div className="dash_title">
                        {t("WLCM_ADMINISTRATION")}
                      </div>
                    </div>
                  </li>
                  <li>
                    <div className="dash seconds_dash"
                      onClick={() => window.open('/' + window.location.search, '_blank')}>
                      <i className="digit glyphicon glyphicon-user" />
                      <div className="dash_title">{t("WLCM_PUBLIC")}</div>
                    </div>
                  </li>
                  <li onClick={() => window.open('http://mugen.karaokes.moe/docs/', '_blank')}>
                    <div className="dash minutes_dash">
                      <i className="digit glyphicon glyphicon-question-sign" />
                      <div className="dash_title">{t("WLCM_HELP")}</div>
                    </div>
                  </li>
                </ul>
              </div>
              <div className="col-md-12 wow block zoomIn">
                <ul className="news">
                  {this.state.news.map(article => {
                    return (<li key={Math.random()} className={this.state.open ? "new open" : "new"}
                      type={article.type} onClick={() => this.setState({ open: !this.state.open })}>
                      <p className="new-header">
                        <b>{article.title}</b>
                        <a href={article.link} target="_blank">
                          {article.dateStr}
                        </a>
                      </p>
                      <p dangerouslySetInnerHTML={{ __html: article.html }}></p>
                    </li>)
                  })}
                </ul>
              </div>
            </div>
          </div>
        </section>
        <a id="downloadAnchorElem"></a>
        <div className="toastMessageContainer"></div>
      </div>
    );
  }
}

export default withTranslation()(WelcomePage);
