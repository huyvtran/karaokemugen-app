import React, { Component } from "react";
import i18next from 'i18next';
import axios from "axios";
import getLucky from "../../assets/clover.png"
import ActionsButtons from "./ActionsButtons";
import { buildKaraTitle, displayMessage, callModal } from '../tools';
import Autocomplete from "../generic/Autocomplete";
import store from "../../store";
import ReactDOM from 'react-dom';
import FavMixModal from "../modals/FavMixModal"

import styles from './PlaylistHeader.scss'

var tagsTypesList = [
  'DETAILS_SERIE',
  'BLCTYPE_3',
  'BLCTYPE_2',
  'BLCTYPE_4',
  'BLCTYPE_5',
  'BLCTYPE_6',
  'DETAILS_YEAR',
  'BLCTYPE_8',
  'BLCTYPE_9',
  'BLCTYPE_7',
  'BLCTYPE_10',
  'BLCTYPE_11',
  'BLCTYPE_12',
  'BLCTYPE_13',]
class PlaylistHeader extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectAllKarasChecked: false,
      tagType: 2,
      activeFilter: 1,
      activeFilterUUID: null
    };
  }

  addRandomKaras = () => {
    callModal('prompt', i18next.t('CL_ADD_RANDOM_TITLE'), '', function (nbOfRandoms) {
      axios.get(this.props.getPlaylistUrl(), { random: nbOfRandoms }).then(randomKaras => {
        if (randomKaras.content.length > 0) {
          let textContent = randomKaras.content.map(e => <React.Fragment>{buildKaraTitle(e)} <br /><br /></React.Fragment>);
          callModal('confirm', i18next.t('CL_CONGRATS'), <React.Fragment>{i18next.t('CL_ABOUT_TO_ADD')}<br /><br />{textContent}</React.Fragment>, () => {
            var karaList = randomKaras.content.map(a => {
              return a.kid;
            }).join();
            var urlPost = this.props.getPlaylistUrl();
            axios.post(urlPost, { kid: karaList });
          }, '');
        }
      });
    }, '');
  };

  addPlaylist = () => {
    callModal('prompt', i18next.t('CL_CREATE_PLAYLIST'), '', playlistName => {
      axios.post('/api/admin/playlists', { name: playlistName, flag_visible: false, flag_current: false, flag_public: false }).then(response => {
        this.props.changeIdPlaylist(response.data.data);
      });
    }
    );
  };

  deletePlaylist = () => {
    callModal('confirm', i18next.t('CL_DELETE_PLAYLIST', { playlist: this.props.playlistInfo.name }), '', confirm => {
      if (confirm) {
        axios.delete('/api/' + this.props.scope + '/playlists/' + this.props.idPlaylist);
      }
    });
  };

  startFavMix = async () => {
    var response = await axios.get('/api/public/users/');
    var userList = response.data.data.filter(u => u.type < 2);
    ReactDOM.render(<FavMixModal changeIdPlaylist={this.props.changeIdPlaylist} userList={userList} />, document.getElementById('modal'));
  };

  exportPlaylist = async () => {
    var url = this.props.idPlaylist === -5 ? '/api/public/favorites' : '/api' + this.props.scope + '/playlists/' + this.props.idPlaylist + '/export'
    var response = await axios.get(url);
    var dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(response.data, null, 4));
    var dlAnchorElem = document.getElementById('downloadAnchorElem');
    dlAnchorElem.setAttribute('href', dataStr);
    if (this.props.idPlaylist === -5) {
      dlAnchorElem.setAttribute('download', ['KaraMugen', 'fav', store.getLogInfos().username, new Date().toLocaleDateString().replace('\\', '-')].join('_') + '.kmplaylist');
    } else {
      dlAnchorElem.setAttribute('download', ['KaraMugen', this.props.playlistInfo.name, new Date().toLocaleDateString().replace('\\', '-')].join('_') + '.kmplaylist');
    }
    dlAnchorElem.click();
  };

  importPlaylist = () => {
    if (!window.FileReader) return alert('FileReader API is not supported by your browser.');
    var input = this;
    if (input.files && input.files[0]) {
      file = input.files[0];
      fr = new FileReader();
      fr.onload = function () {
        var data = {};
        var name;
        if (file.name.includes('KaraMugen_fav')) {
          data['favorites'] = fr['result'];
          url = '/api/public/favorites/import';
          name = 'Favs';
        } else {
          url = '/api/' + scope + '/playlists/import';
          data['playlist'] = fr['result'];
          name = JSON.parse(fr.result).PlaylistInformation.name;
        }
        axios.post(url, data).then(response => {
          displayMessage('success', i18next.t('PLAYLIST_ADDED', { name: name }));
          if (response.unknownKaras && response.unknownKaras.length > 0) {
            displayMessage('warning', i18next.t('UNKNOWN_KARAS', { count: response.unknownKaras }));
          }
          var playlist_id = file.name.includes('KaraMugen_fav') ? -5 : response.playlist_id;
          this.props.changeIdPlaylist(playlist_id);
        });
      };
      fr.readAsText(file);
    }
  };

  deleteAllKaras = () => {
    axios.put(this.props.getPlaylistUrl().replace('/karas', '') + '/empty');
  };

  setFlagCurrent = () => {
    if (!this.props.playlistInfo.flag_current) {
      axios.put('/api/admin/playlists/' + this.props.idPlaylist + '/setCurrent');
    }
  };

  setFlagPublic = () => {
    if (!this.props.playlistInfo.flag_public) {
      axios.put('/api/admin/playlists/' + this.props.idPlaylist + '/setPublic');
    }
  };

  setFlagVisible = () => {
    axios.put('/api/admin/playlists/' + this.props.idPlaylist,
      { name: this.props.playlistInfo.name, flag_visible: !this.props.playlistInfo.flag_visible });
  };

  shuffle = async () => {
    this.props.playlistWillUpdate();
    await axios.put('/api/' + this.props.scope + '/playlists/' + this.props.idPlaylist + '/shuffle')
    this.props.playlistDidUpdate();
  };

  smartShuffle = () => {
    this.props.playlistWillUpdate();
    axios.put('/api/' + this.props.scope + '/playlists/' + this.props.idPlaylist + '/shuffle', { smartShuffle: 1 })
    this.props.playlistDidUpdate();
  };

  getKarasList = (activeFilter, searchType) => {
    this.setState({ activeFilter: activeFilter });
    if (activeFilter === 2 && this.props.idPlaylist !== -5) {
      this.props.changeIdPlaylist(-5)
    } else if (activeFilter !== 2 && this.props.idPlaylist !== -1) {
      this.props.changeIdPlaylist(-1);
    }
    this.props.getPlaylist(searchType);
  };

  onChangeTags = value => {
    this.setState({ activeFilter: 5, activeFilterUUID: value });
    this.props.onChangeTags(this.state.tagType, value);
  };

  render() {
    const commandsControls = (
      <div className="btn-group plCommands controls">
        {this.props.idPlaylist >= 0 ?
          <button title={i18next.t("PLAYLIST_EDIT")} className="btn btn-default" name="editName" onClick={this.props.editNamePlaylist}>
            <i className="fas fa-pencil-alt"></i>
          </button> : null
        }
        <button title={i18next.t("START_FAV_MIX")} className="btn btn-default" name="startFavMix" onClick={this.startFavMix}>
          <i className="fas fa-bolt"></i>
        </button>
        <button title={i18next.t("PLAYLIST_ADD")} className="btn btn-default" name="add" onClick={this.addPlaylist}>
          <i className="fas fa-plus"></i>
        </button>
        {this.props.idPlaylist >= 0 && this.props.playlistInfo && !this.props.playlistInfo.flag_current && !this.props.playlistInfo.flag_public ?
          <button title={i18next.t("PLAYLIST_DELETE")} className="btn btn-danger" name="delete" onClick={this.deletePlaylist}>
            <i className="fas fa-times"></i>
          </button> : null
        }
        <label htmlFor={"import-file" + this.props.side} title={i18next.t("PLAYLIST_IMPORT")} className="btn btn-default" name="import">
          <i className="fas fa-download"></i>
          <input id={"import-file" + this.props.side} className="import-file" type="file" accept=".kmplaylist" style={{ display: 'none' }}
            onClick={this.importPlaylist} />
        </label>
        <button title={i18next.t("PLAYLIST_EXPORT")} className="btn btn-default" name="export" onClick={this.exportPlaylist} >
          <i className="fas fa-upload"></i>
        </button>
      </div>);

    const actionDivContainer = (
      <div className="btn-group plCommands actionDiv">
        {this.props.idPlaylistTo >= 0 ?
          <React.Fragment>
            <button title={i18next.t("ADD_RANDOM_KARAS")} name="addRandomKaras" className="btn btn-default clusterAction" onClick={this.addRandomKaras}>
              <img src={getLucky} />
            </button>
            <button title={i18next.t("ADD_ALL_KARAS")} name="addAllKaras" className="btn btn-danger clusterAction" onClick={this.props.addAllKaras}>
              <i className="fas fa-share"></i>
            </button>
          </React.Fragment>
          : null
        }
        {this.props.idPlaylist >= 0 ?
          <button title={i18next.t("EMPTY_LIST")} name="deleteAllKaras" className="btn btn-danger clusterAction" onClick={this.deleteAllKaras}>
            <i className="fas fa-eraser"></i>
          </button> : null
        }
        <ActionsButtons idPlaylistTo={this.props.idPlaylistTo} idPlaylist={this.props.idPlaylist}
          scope={this.props.scope} playlistToAddId={this.props.playlistToAddId} isHeader={true}
          addKara={this.props.addCheckedKaras} deleteKara={this.props.deleteCheckedKaras} transferKara={this.props.transferCheckedKaras} />
        <button
          title={i18next.t("SELECT_ALL")}
          name="selectAllKaras"
          onClick={() => {
            this.setState({ selectAllKarasChecked: !this.state.selectAllKarasChecked });
            this.props.selectAllKaras();
          }}
          className="btn btn-default clusterAction"
        >
          {
            this.state.selectAllKarasChecked
              ? <i className="far fa-check-square"></i>
              : <i className="far fa-square"></i>
          }
        </button>
      </div>);

      
  const plCommandsContainer =(
      this.props.scope === 'admin' && this.props.playlistCommands && this.props.idPlaylist !== -4 ?
        <div className="plCommandsContainer actionDivContainer">
          {this.props.side === 1 ?
            <React.Fragment>{commandsControls} {actionDivContainer}</React.Fragment> :
            <React.Fragment>{actionDivContainer}{commandsControls} </React.Fragment>
          }
        </div> : null);

    const searchMenu = (this.props.tags && this.props.tags.filter(tag => tag.type.includes(this.state.tagType)).length > 0 ? 
      <div className="searchMenuContainer">
        <div className="filterContainer">
          <div className={"filterButton " + (this.state.activeFilter === 5 ? "filterElementActive" : "")} onClick={() => this.getKarasList(5, "search")}>
            <i className="fas fa-filter"></i> <span>{i18next.t("FILTER")}</span>
          </div>
          <select type="text" className="filterElement filterTags" placeholder="Search"
            onChange={e => this.setState({ tagType: (Number(e.target.value) ? Number(e.target.value) : e.target.value) })}
            value={this.state.tagType}>
            {tagsTypesList.map(val => {
              if (val === 'DETAILS_SERIE') {
                return <option key={val} value='serie'>{i18next.t(val)}</option>
              } else if (val === 'DETAILS_YEAR') {
                return <option key={val} value='year'>{i18next.t(val)}</option>
              } else {
                return <option key={val} value={val.replace('BLCTYPE_', '')}>{i18next.t(val)}</option>
              }
            })}
          </select>
          <div className="filterElement filterTagsOptions">
            <Autocomplete value={this.state.activeFilterUUID || ""}
              options={this.props.tags.filter(tag => tag.type.includes(this.state.tagType))}
              onChange={this.onChangeTags} />
          </div>
        </div>
        <div className="filterContainer">
          <div className={"filterElement " + (this.state.activeFilter === 1 ? "filterElementActive" : "")} onClick={() => this.getKarasList(1)}>
            <i className="fas fa-sort-alpha-down"></i> {i18next.t("VIEW_STANDARD")}
          </div>
          <div className={"filterElement " + (this.state.activeFilter === 2 ? "filterElementActive" : "")}  onClick={() => this.getKarasList(2)}>
            <i className="fas fa-star"></i> {i18next.t("VIEW_FAVORITES")}
          </div>
        </div>
        <div className="filterContainer">
          <div className={"filterElement " + (this.state.activeFilter === 3 ? "filterElementActive" : "")}  onClick={() => this.getKarasList(3, "recent")}>
            <i className="far fa-clock"></i> {i18next.t("VIEW_RECENT")}
          </div>
          <div className={"filterElement " + (this.state.activeFilter === 4 ? "filterElementActive" : "")} onClick={() => this.getKarasList(4, "requested")}>
            <i className="fas fa-fire"></i> {i18next.t("VIEW_POPULAR")}
          </div>
        </div>
    </div> : null);

    
  const plSearch = (<div className="pull-left plSearch">
      <input type="text" className="plSearch-input form-control input-md" side={this.props.side}
        defaultValue={store.getFilterValue()} onChange={e => store.setFilterValue(e.target.value, this.props.side, this.props.idPlaylist)}
        id={"searchPlaylist" + this.props.side} placeholder="&#xF002;" name="searchPlaylist" />
    </div>);

  const flagsContainer = (
      this.props.idPlaylist >= 0 && this.props.scope !== "public" && this.props.playlistInfo ?
        <div className="flagsContainer " >
          <div className="btn-group plCommands flags" id={"flag" + this.props.side}>
            <button title={i18next.t("PLAYLIST_CURRENT")} name="flag_current" onClick={this.setFlagCurrent}
              className={"btn " + (this.props.playlistInfo.flag_current ? "btn-primary" : "btn-default")} >
              <i className="fas fa-video"></i>
            </button>
            <button title={i18next.t("PLAYLIST_PUBLIC")} name="flag_public" onClick={this.setFlagPublic}
              className={"btn " + (this.props.playlistInfo.flag_public ? "btn-primary" : "btn-default")} >
              <i className="fas fa-globe"></i>
            </button>
            {this.props.idPlaylist >= 0 ?
              <button title={i18next.t("PLAYLIST_VISIBLE")} className="btn btn-default" name="flag_visible" onClick={this.setFlagVisible}>
                {this.props.playlistInfo.flag_visible ?
                  <i className="fas fa-eye-slash"></i> :
                  <i className="fas fa-eye"></i>
                }
              </button> : null
            }
          </div>
        </div> : null
    );

    return (
      <React.Fragment>
        {this.props.scope !== "public" || this.props.side !== 1 ?
          <div className={"panel-heading plDashboard" + (this.props.playlistCommands ? " advanced" : "")}>
            {this.props.scope === "admin" || this.props.mode !== 1 ?
              <React.Fragment>
                {this.props.scope === "admin" && this.props.idPlaylist !== -4 ?
                <button title={i18next.t("PLAYLIST_COMMANDS")} onClick={this.props.togglePlaylistCommands}
                  className={"btn btn-default pull-left showPlaylistCommands" + (this.props.playlistCommands ? " btn-primary" : "")}>
                  <i className="fas fa-wrench"></i>
                </button> : null
                }
                <select side={this.props.side} className="selectPlaylist"
                  value={this.props.idPlaylist} onChange={(e) => this.props.changeIdPlaylist(e.target.value)}>
                  {(this.props.scope === 'public' && this.props.side === 1 && this.props.mode === 1) ?
                    <option value={this.props.playlistToAddId} ></option> :
                    this.props.scope === 'public' && this.props.side === 1 ? (
                      <React.Fragment>
                        <option value="-1"></option>
                        <option value="-5"></option>
                      </React.Fragment>) :
                      this.props.playlistList && this.props.playlistList.map(playlist => {
                        return <option key={playlist.playlist_id} value={playlist.playlist_id}>{playlist.name}</option>;
                      })
                  }
                </select>
              </React.Fragment> : null
            }
            {this.props.scope === 'admin' ?
              <React.Fragment>
                {this.props.idPlaylist > 0 ?
                  <div className="controlsContainer">
                    <div className="btn-group plCommands controls">
                      <button title={i18next.t("PLAYLIST_SHUFFLE")} className="btn btn-default" name="shuffle" onClick={this.shuffle}>
                        <i className="fas fa-random"></i>
                      </button>
                      <button title={i18next.t("PLAYLIST_SMART_SHUFFLE")} className="btn btn-default" name="smartShuffle" onClick={this.smartShuffle}>
                        <i className="fas fa-random"></i>
                      </button>
                    </div>
                  </div> : null
                }
                {this.props.idPlaylist === -1 ?
                  <div className="searchMenuButtonContainer btn-group plCommands">
                    <button type="button" className={"searchMenuButton collapsed btn btn-default" + (this.props.searchMenuOpen ? " searchMenuButtonOpen" : "")}
                      onClick={this.props.toggleSearchMenu}>
                      <i className="fas fa-filter"></i>
                    </button>
                  </div> : null
                }
              </React.Fragment > : null
            }
            {this.props.side === 1 ?
              <React.Fragment>{plSearch}{flagsContainer}{plCommandsContainer}</React.Fragment> :
              <React.Fragment>{plCommandsContainer}{flagsContainer}{plSearch}</React.Fragment>
            }

          </div> : null
        }
        {this.props.side === 1 && this.props.searchMenuOpen ?
          searchMenu : null
        }
      </React.Fragment >
    )
  }
}


export default PlaylistHeader;