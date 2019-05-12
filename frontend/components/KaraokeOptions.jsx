import React from 'react';

const KaraokeOptions = () => {
  return (
    <>
      <div id="nav-karaokeAllMode">
        <div className="form-group">
          <label htmlFor="Karaoke.Quota.Type" className="col-xs-4 control-label">
            {'i18n QUOTA_TYPE'}
          </label>
          <div className="col-xs-6">
            <select
              type="number"
              className="form-control"
              name="Karaoke.Quota.Type"
            >
              <option value="0"> {'i18n QUOTA_TYPE_0'} </option>
              <option value="1"> {'i18n QUOTA_TYPE_1'} </option>
              <option value="2"> {'i18n QUOTA_TYPE_2'} </option>
            </select>
          </div>
        </div>
        <div className="form-group">
          <label htmlFor="Karaoke.Quota.Time" className="col-xs-4 control-label">
            {'i18n TIME_BY_USER'}
          </label>
          <div className="col-xs-6">
            <input
              type="number"
              className="form-control"
              name="Karaoke.Quota.Time"
              placeholder="1000"
            />
          </div>
        </div>
        <div className="form-group">
          <label htmlFor="Karaoke.Quota.Songs" className="col-xs-4 control-label">
            {'i18n SONGS_BY_USER'}
          </label>
          <div className="col-xs-6">
            <input
              type="number"
              className="form-control"
              name="Karaoke.Quota.Songs"
              placeholder="1000"
            />
          </div>
        </div>
        <div className="form-group">
          <label
            htmlFor="Karaoke.Quota.FreeAutoTime"
            className="col-xs-4 control-label"
          >
            {'i18n FREE_AUTO_TIME'}
          </label>
          <div className="col-xs-6">
            <input
              type="number"
              className="form-control"
              name="Karaoke.Quota.FreeAutoTime"
              placeholder="1000"
            />
          </div>
        </div>
        <div className="form-group">
          <label htmlFor="Karaoke.JinglesInterval" className="col-xs-4 control-label">
            {'i18n ENGINEJINGLESINTERVAL'}
          </label>
          <div className="col-xs-6">
            <input
              type="number"
              className="form-control"
              name="Karaoke.JinglesInterval"
              placeholder="20"
            />
          </div>
        </div>
      </div>
      <div className="form-group settingsGroupPanel subCategoryGroupPanel">
        <div className="col-xs-12" style={{textAlign: 'center'}}>
          {'i18n ONLINESETTINGS'}
        </div>
      </div>
      <div id="nav-karaokeOnlineSettings" />
      <div className="form-group settingsGroupPanel subCategoryGroupPanel">
        <div className="col-xs-12" style={{textAlign: 'center'}}>
          {'i18n PUBLICMODESETTINGS'}
        </div>
      </div>
      <div id="nav-karaokePublicMode">
        <div id="freeUpvotesSettings" className="well well-sm settingsGroupPanel">
          <div className="form-group">
            <label
              className="col-xs-4 control-label"
              htmlFor="Karaoke.Quota.FreeUpVotesRequiredMin"
            >
              {'i18n ENGINEFREEUPVOTESREQUIREDMIN'}
            </label>
            <div className="col-xs-6">
              <input
                className="form-control"
                type="number"
                name="Karaoke.Quota.FreeUpVotesRequiredMin"
              />
            </div>
          </div>
          <div className="form-group">
            <label
              htmlFor="Karaoke.Quota.FreeUpVotesRequiredPercent"
              className="col-xs-4 control-label"
            >
              {'i18n ENGINEFREEUPVOTESREQUIREDPERCENT'}
            </label>
            <div className="col-xs-6">
              <input
                className="form-control"
                type="number"
                name="Karaoke.Quota.FreeUpVotesRequiredPercent"
              />
            </div>
          </div>
        </div>
        <div id="songPollSettings" className="well well-sm settingsGroupPanel">
          <div className="form-group">
            <label className="col-xs-4 control-label" htmlFor="Karaoke.Poll.Choices">
              {'i18n ENGINESONGPOLLCHOICES'}
            </label>
            <div className="col-xs-6">
              <input
                className="form-control"
                type="number"
                name="Karaoke.Poll.Choices"
              />
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="Karaoke.Poll.Timeout" className="col-xs-4 control-label">
              {'i18n ENGINESONGPOLLTIMEOUT'}
            </label>
            <div className="col-xs-6">
              <input
                className="form-control"
                type="number"
                name="Karaoke.Poll.Timeout"
              />
            </div>
          </div>
        </div>
      </div>
      <input name="App.FirstRun" className="hideInput hidden" />
    </>
  );
};

export default KaraokeOptions;
