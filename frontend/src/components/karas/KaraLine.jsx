import React, { Component } from "react";
import { withTranslation } from "react-i18next";
import { is_touch_device } from "../toolsReact";
import KaraDetail from "./KaraDetail";
import axios from "axios";
import ActionsButtons from "./ActionsButtons";
import {buildKaraTitle} from '../toolsReact';

class KaraLine extends Component {
  constructor(props) {
    super(props);
    this.state = {
      karaDetailState: false,
      isFavorite: this.props.kara.flag_favorites,
      isLike: this.props.kara.flag_upvoted,
      startSwipeX: 0
    };
    this.toggleKaraDetail = this.toggleKaraDetail.bind(this);
    this.makeFavorite = this.makeFavorite.bind(this);
    this.getTagInLocale = this.getTagInLocale.bind(this);
    this.handleSwipe = this.handleSwipe.bind(this);
    this.handleStart = this.handleStart.bind(this);
    this.playKara = this.playKara.bind(this);
    this.deleteKara = this.deleteKara.bind(this);
    this.likeKara = this.likeKara.bind(this);
    this.addKara = this.addKara.bind(this);
    this.transferKara = this.transferKara.bind(this);
    this.freeKara = this.freeKara.bind(this);
  }

  handleSwipe(e) {
    var panelWidth = $('#panel1').width();
    var elem = $('#panel1, #panel2');
    elem.css({ transition: 'transform 1s ease' });
    if (this.props.side === 1 && this.props.mode === 2 && e.changedTouches[0].clientX > this.state.startSwipeX + 50) {
      this.addKara();
    } else if (this.props.side === 1 && e.changedTouches[0].clientX < this.state.startSwipeX - 50) {
      elem.css({ transform: 'translateX(' + -1 * panelWidth + 'px)' });
    } else if (this.props.side === 2 && e.changedTouches[0].clientX > this.state.startSwipeX + 50) {
      elem.css({ transform: 'translateX(0)' });
    }
    e.preventDefault();
  }

  handleStart(e) {
    this.setState({ startSwipeX: e.changedTouches[0].clientX });
  }

  toggleKaraDetail() {
    this.setState({ karaDetailState: !this.state.karaDetailState });
  }

  makeFavorite() {
    this.state.isFavorite ?
      axios.delete('/api/public/favorites', { 'kid': this.props.kara.kid }) :
      axios.get('/api/public/favorites', { 'kid': this.props.kara.kid })
    this.setState({ isFavorite: !this.state.isFavorite })
  };

  getTagInLocale(tag) {
    if (this.props.i18nTag && this.props.i18nTag[tag.tid]) {
      let i18nTag = this.props.i18nTag[tag.tid];
      return i18nTag[this.props.navigatorLanguage] ? i18nTag[this.props.navigatorLanguage] : i18nTag['eng'];
    } else {
      return tag.name;
    }
  }

  likeKara() {
    var data = kara.flag_upvoted ? {} : dataLikeKara = { 'downvote': 'true' };
    axios.post('/api/public/playlists/public/karas/' + this.props.idPlaylist + '/vote', data);
    this.setState({ isLike: !this.state.isLike })
  }

  deleteKara() {
    axios.delete('/api/' + this.props.scope + '/playlists/' + this.props.idPlaylist + '/karas/', {data:{plc_id:String(this.props.kara.playlistcontent_id)}});
  }

  playKara() {
    axios.put('/api/' + this.props.scope + '/playlists/' + this.props.idPlaylist + '/karas/' + this.props.kara.playlistcontent_id, { flag_playing: true });
  }

  addKara() {
    axios.post('/api/public/karas/' + this.props.kara.kid, { requestedby: this.props.logInfos.token ? this.props.logInfos.username : '' });
  }

  transferKara() {
    this.addKara();
  }

  freeKara() {
    if(this.props.scope === 'admin') {
      axios.put('/api/ ' + this.props.scope + '/playlists/' + this.props.idPlaylist + '/karas/' + kara.playlistcontent_id, { flag_free: true });
    }
  }

  render() {
    const t = this.props.t;
    var kara = this.props.kara;
    var scope = this.props.scope;
    var idPlaylist = this.props.idPlaylist;
    var flagPublic = this.props.flagPublic
    return (
      <div className={"list-group-item " + (kara.flag_playing ? 'currentlyplaying ' : ' ') + (kara.flag_dejavu ? 'dejavu' : '')}
        onTouchEnd={this.handleSwipe} onTouchStart={this.handleStart}>
        {is_touch_device() && scope !== 'admin' ? null :
          <div className="actionDiv"> {this.props.idPlaylistTo !== this.props.idPlaylist ? 
            <ActionsButtons idPlaylistTo={this.props.idPlaylistTo} idPlaylist={this.props.idPlaylist} 
              scope={this.props.scope} playlistToAddId={this.props.playlistToAddId}
              addKara={this.addKara} deleteKara={this.deleteKara} transferKara={this.transferKara} /> : null}
            {!is_touch_device() && scope == 'admin' && idPlaylist > 0 ? 
              <span className="dragHandle" draggable onDragStart={() => this.props.handleDragStart(kara.playlistcontent_id)}
                  onDragOver={(e) => {
                  console.log(e)
                  this.props.handleDragEnd(e)}}>
                <i className="glyphicon glyphicon-option-vertical"></i>
              </span> : null}
          </div>
        }
        {scope == 'admin' && this.props.idPlaylist !== -2 && this.props.idPlaylist != -4 && this.props.playlistCommands ? 
          <span name="checkboxKara" className={kara.checked ? 'checked' : 'notchecked'} 
            onClick={() => this.props.checkKara(kara.playlistcontent_id)}></span> : null}
        <div className="infoDiv">
          {scope === 'admin' || !is_touch_device() ? <button title={t('TOOLTIP_SHOWINFO')} name="infoKara" className="btn btn-sm btn-action"
            style={this.state.karaDetailState ? { borderColor: '#8aa9af' } : {}} onClick={this.toggleKaraDetail}
          ></button> : null}
          {scope === 'public' && this.props.logInfos.role !== 'guest' && !is_touch_device() ?
            <button title={t('TOOLTIP_FAV')} onClick={this.makeFavorite}
              className={"makeFav btn-sm btn btn-action "
                + (is_touch_device() ? 'mobile' : '')
                + (kara.flag_favorites || idPlaylist === -5 ? 'currentFav' : '')}>
            </button> : null}
          {scope === 'admin' && idPlaylist > 0 ? <button title={t('TOOLTIP_PLAYKARA')} className="btn btn-sm btn-action playKara" 
            onClick={this.playKara}></button> : null}
          {scope !== 'admin' && flagPublic ? <button className={"likeKara btn btn-sm btn-action " + this.state.isLike ? 'currentLike' : ''} 
            onClick={this.likeKara}></button> : null}
          {scope !== 'admin' && kara.username == this.props.logInfos.username && (idPlaylist == this.props.playlistToAddId) ?
            <button title={t('TOOLTIP_DELETEKARA')} name="deleteKara" className="btn btn-sm btn-action" onClick={this.deleteKara}></button> : null}
        </div>
        <div className="contentDiv">
          <div>{buildKaraTitle(kara)}</div>
          <div>
            {kara.families && kara.families.map(tag => {
              return <div key={tag.name} className="tag" title={this.getTagInLocale(tag)}>{tag.short ? tag.short : '?'}</div>
            })}
            {kara.platforms && kara.platforms.map(tag => {
              return <div key={tag.name} className="tag" title={this.getTagInLocale(tag)}>{tag.short ? tag.short : '?'}</div>
            })}
            {kara.genres && kara.genres.map(tag => {
              return <div key={tag.name} className="tag" title={this.getTagInLocale(tag)}>{tag.short ? tag.short : '?'}</div>
            })}
            {kara.origins && kara.origins.map(tag => {
              return <div key={tag.name} className="tag" title={this.getTagInLocale(tag)}>{tag.short ? tag.short : '?'}</div>
            })}
            {kara.misc && kara.misc.map(tag => {
              return <div key={tag.name} className="tag" title={this.getTagInLocale(tag)}>{tag.short ? tag.short : '?'}</div>
            })}
            {kara.upvotes ?
              <div className="tag likeCount" title={t('TOOLTIP_UPVOTE')} onClick={this.freeKara}>
                {kara.upvotes}<i className="glyphicon glyphicon-heart"></i>
              </div> : null
            }
          </div>
        </div>
        {this.state.karaDetailState ?
          <KaraDetail kara={this.props.kara} scope={this.props.scope} idPlaylist={this.props.idPlaylist} mode='list'
            publicOuCurrent={this.props.playlistInfo && (this.props.playlistInfo.flag_current || this.props.playlistInfo.flag_public)} 
            toggleKaraDetail={this.toggleKaraDetail} karaDetailState={this.state.karaDetailState} 
            makeFavorite={this.makeFavorite} isFavorite={this.state.isFavorite}
            getTagInLocale={this.getTagInLocale} logInfos={this.props.logInfos} freeKara={this.freeKara}></KaraDetail> : null
        }
      </div>)
  }
}

export default withTranslation()(KaraLine);