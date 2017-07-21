var sqlite3 = require('sqlite3').verbose();
var path = require('path');
var fs = require('fs');
const logger = require('../../_common/utils/logger.js');
const moment = require('moment');
var timestamp = require("unix-timestamp");
require("moment-duration-format");
moment.locale('fr');

module.exports = {
	SYSPATH:null,
	SETTINGS:null,
	_ready: false,
	_db_handler: null,

	init: function(){
		return new Promise(function(resolve,error){
			// démarre une instance de SQLITE

			if(module.exports.SYSPATH === null)
			{
				logger.error('_engine/components/db_interface.js : SYSPATH is null');
				process.exit();
			}

			var userDB_Test = new Promise(function(resolve,reject){
				if(!fs.existsSync(path.join(module.exports.SYSPATH,'app/db/userdata.sqlite3')))
				{
					logger.warn(__('USER_DB_NOT_FOUND'));
					NeedToCreateUserTables = true;
					var db = new sqlite3.Database(path.join(module.exports.SYSPATH,'app/db/userdata.sqlite3'));
					var sqlCreateUserDB = fs.readFileSync(path.join(__dirname,'../../_common/db/userdata.sqlite3.sql'),'utf-8');
					db.exec(sqlCreateUserDB, function (err){
						if (err)
						{
							logger.error(__('USER_DB_CREATION_FAILED',err));
							process.exit();
						} else
						{
							logger.info(__('USER_DB_CREATED'));
							resolve();
						}
					});
				} else {
					resolve();
				}
			});

			var karasDB_Test = new Promise(function(resolve,reject){
				if(!fs.existsSync(path.join(module.exports.SYSPATH,'app/db/karas.sqlite3')))
				{
					logger.warn(__('KARA_DB_NOT_FOUND'));
					var generator = require('../../_admin/generate_karasdb.js');
					generator.SYSPATH = module.exports.SYSPATH;
					generator.SETTINGS = module.exports.SETTINGS;
					generator.onLog = function(type,message) {
						logger.info(__('DATABASE_GENERATION',message));
					}
					generator.run().then(function(response){
						resolve();
					}).catch(function(response,error){
						// erreur ?
						console.log(response);
						process.exit();
					});
				} else {
					resolve();
				}
			});

			Promise.all([ userDB_Test, karasDB_Test ]).then(function() {
				module.exports.init_on_db_ready();
				module.exports._user_db_handler.run('ATTACH DATABASE "'+path.join(module.exports.SYSPATH,'app/db/karas.sqlite3')+'" as karasdb;')
				resolve();
			});
		});
	},

	init_on_db_ready:function(){

		// les fichiers sqlites sont externe (car l'appli ne peux écrire dans ses assets interne)

		module.exports._db_handler = new sqlite3.Database(path.join(module.exports.SYSPATH,'app/db/karas.sqlite3'), function(err){
			if (err)
			{
				logger.error(__('LOADING_KARA_DB_FAILED',+err));
				process.exit();
			}
		});

		module.exports._user_db_handler = new sqlite3.Database(path.join(module.exports.SYSPATH,'app/db/userdata.sqlite3'), function (err) {
			if (err)
			{
				logger.error(__('LOADING_USER_DB_FAILED',+err));
				process.exit();
			}
		});

		module.exports._ready = true;
		module.exports.getStats().then(function(stats){
			logger.info(__('STATS_COUNT',stats.totalcount));
			logger.info(__('STATS_DURATION',stats.totalduration));
			logger.info(__('STATS_SERIES',stats.totalseries));
			logger.info(__('STATS_LANGUAGES',stats.totallanguages));
			logger.info(__('STATS_ARTISTS',stats.totalartists));
			logger.info(__('STATS_PLAYLISTS',stats.totalplaylists));
		}).catch(function(err){
			logger.warn(__('STATS_FAILED',err));
		})
		logger.info(__('DATABASE_READY'));

	},

	// fermeture des instances SQLITE (unlock les fichiers)
	close:function()
	{
		module.exports._ready = false;
		module.exports._db_handler.close();
		module.exports._user_db_handler.close();
	},

	isReady: function()
	{
		return module.exports._ready;
	},

	// implémenter ici toutes les méthodes de lecture écritures qui seront utilisé par l'ensemble de l'applicatif
	// aucun autre composant ne doit manipuler la base SQLITE par un autre moyen

	/**
	* @function {Calculate various stats}
	* @return {number} {Object with stats}
	*/
	getStats:function()
	{
		return new Promise(function(resolve,reject){
			var stats = {};
			if(!module.exports.isReady())
			{
				reject(__('DBI_IS_NOT_READY'));
			}

			var pGetSeriesCount = new Promise((resolve,reject) =>
			{
				var sqlCalculateSeriesCount = fs.readFileSync(path.join(__dirname,'../../_common/db/calculate_series_count.sql'),'utf-8');
				module.exports._db_handler.get(sqlCalculateSeriesCount,
					function (err, res)
					{
						if (err)
						{
							logger.warn(__('DB_STATS_SERIES_FAILED',err));
							stats.totalseries = 0;
							resolve();
						} else {
							stats.totalseries = res.seriescount;
							resolve();
						}
					})
			});

			var pGetPlaylistCount = new Promise((resolve,reject) =>
			{
				var sqlCalculatePlaylistCount = fs.readFileSync(path.join(__dirname,'../../_common/db/calculate_playlist_count.sql'),'utf-8');
				module.exports._user_db_handler.get(sqlCalculatePlaylistCount,
					function (err, res)
					{
						if (err)
						{
							logger.warn(__('DB_STATS_PLAYLISTS_FAILED',err));
							stats.totalplaylists = 0;
							resolve();
						} else {
							stats.totalplaylists = res.plcount;
							resolve();
						}
					})
			});
			var pGetArtistCount = new Promise((resolve,reject) =>
			{
				var sqlCalculateArtistCount = fs.readFileSync(path.join(__dirname,'../../_common/db/calculate_artist_count.sql'),'utf-8');
				module.exports._db_handler.get(sqlCalculateArtistCount,
					function (err, res)
					{
						if (err)
						{
							logger.warn(__('DB_STATS_ARTISTS_FAILED',err));
							stats.totalartists = 0;
							resolve();
						} else {
							stats.totalartists = res.artistcount;
							resolve();
						}
					})
			});
			var pGetKaraCount = new Promise((resolve,reject) =>
			{
				var sqlCalculateKaraCount = fs.readFileSync(path.join(__dirname,'../../_common/db/calculate_kara_count.sql'),'utf-8');
				module.exports._db_handler.get(sqlCalculateKaraCount,
					function (err, res)
					{
						if (err)
						{
							logger.error(__('DB_STATS_COUNT_FAILED',err));
							stats.totalcount = 0;
							resolve();
						} else {
							stats.totalcount = res.karacount;
							resolve();
						}
					})
			});
			var pGetLanguageCount = new Promise((resolve,reject) =>
			{
				var sqlCalculateLanguageCount = fs.readFileSync(path.join(__dirname,'../../_common/db/calculate_lang_count.sql'),'utf-8');
				module.exports._db_handler.get(sqlCalculateLanguageCount,
					function (err, res)
					{
						if (err)
						{
							logger.error(__('DB_STATS_LANGUAGES_FAILED',err));
							stats.totallanguages = 0;
							resolve();
						} else {
							stats.totallanguages = res.langcount;
							resolve();
						}
					})
			});
			var pGetDuration = new Promise((resolve,reject) =>
			{
				var sqlCalculateTotalDuration = fs.readFileSync(path.join(__dirname,'../../_common/db/calculate_total_duration.sql'),'utf-8');
				module.exports._db_handler.get(sqlCalculateTotalDuration,
					function (err, res)
					{
						if (err)
						{
							logger.error(__('DB_STATS_DURATION_FAILED',err));
							stats.totalduration = 'Unknown';
							resolve();
						} else {
							stats.totalduration = moment.duration(res.totalduration,'seconds').format('D ['+__('DAY')+'], H ['+__('HOUR')+'], m ['+__('MINUTE')+'], s ['+__('SECOND')+']');
							resolve();
						}
					})
			});

			Promise.all([
				pGetKaraCount,
				pGetDuration,
				pGetSeriesCount,
				pGetLanguageCount,
				pGetArtistCount,
				pGetPlaylistCount
			]).then(function(){
				resolve(stats);
			}).catch(function(){
				reject(__('DB_STATS_GENERAL_ERROR'));
			})
		})
	},
	/**
	* @function {Calculate number of a karaoke songs in a whole playlist}
	* @param  {number} playlist_id {ID of playlist to recalculate number of songs}
	* @return {number} {Number of karaoke songs found}
	*/
	calculatePlaylistNumOfKaras:function(playlist_id)
	{
		return new Promise(function(resolve,reject){
			if(!module.exports.isReady())
			{
				reject(__('DBI_NOT_READY'));
			}
			var sqlCalculatePlaylistNumOfKaras = fs.readFileSync(path.join(__dirname,'../../_common/db/calculate_playlist_numofkaras.sql'),'utf-8');
			module.exports._user_db_handler.get(sqlCalculatePlaylistNumOfKaras,
			{
				$playlist_id: playlist_id
			}, function (err, num_karas)
			{
				if (err)
				{
					reject(__('DB_KARACOUNT_ERROR',err));
				} else {
					resolve(num_karas.NumberOfKaras);
				}
			})
		})
	},
	/**
	* @function {Calculate duration of a whole playlist}
	* @param  {number} playlist_id {ID of playlist to recalculate duration for}
	* @return {object} {duration object (duration.duration = number)}
	*/
	calculatePlaylistDuration:function(playlist_id)
	{
		return new Promise(function(resolve,reject){
			if(!module.exports.isReady())
			{
				reject(__('DBI_NOT_READY'));
			}
			var sqlCalculatePlaylistDuration = fs.readFileSync(path.join(__dirname,'../../_common/db/calculate_playlist_duration.sql'),'utf-8');
			module.exports._user_db_handler.serialize(function(){
						module.exports._user_db_handler.get(sqlCalculatePlaylistDuration,
						{
							$playlist_id: playlist_id
						}, function (err, duration)
						{
								if (err)
								{
									reject(__('DB_DURATION_PL_ERROR',playlist_id,err));									
								} else {									
									resolve(duration);
								}
						})
				
			})
		})
	},
	/**
	* @function {Generate new blacklist}
	* @return {boolean} {Promise}
	*/
	generateBlacklist:function()
	{
		return new Promise(function(resolve,reject){
			if(!module.exports.isReady())
			{
				reject(__('DBI_NOT_READY'));
			}
			var sqlGenerateBlacklist = fs.readFileSync(path.join(__dirname,'../../_common/db/generate_blacklist.sql'),'utf-8');
			
			module.exports._user_db_handler.exec(sqlGenerateBlacklist,
			function (err, rep)
			{
				if (err)
				{
					reject(__('DB_BLACKLIST_GENERATION_ERROR',err));														
				} else {											
					resolve();
				}
			});
		});
	},
	/**
	* @function {Get list of criterias for blacklist}
	* @return {object} {List of criterias}
	*/
	getBlacklistCriterias:function()
	{
		return new Promise(function(resolve,reject){
			if(!module.exports.isReady())
			{
				reject(__('DBI_NOT_READY'));
			}
			var sqlGetBlacklistCriterias = fs.readFileSync(path.join(__dirname,'../../_common/db/select_blacklist_criterias.sql'),'utf-8');
			
			module.exports._user_db_handler.all(sqlGetBlacklistCriterias,
			function (err, blcriterias)
			{
				if (err)
				{
					reject(__('DB_BLACKLIST_GET_CRITERIAS_ERROR',err));									
				} else {											
					resolve(blcriterias);
				}
			});
		});
	},
	/**
	* @function {Add criteria to blacklist}
	* @param {number} {type of criteria}
	* @param {string} {value of criteria}
	* @return {boolean} {promise}
	*/
	addBlacklistCriteria:function(blctype,blcvalue)
	{
		return new Promise(function(resolve,reject){
			if(!module.exports.isReady())
			{
				logger.error('DB_INTERFACE is not ready to work');
				reject(__('DBI_NOT_READY'));
			}
			var sqlAddBlacklistCriterias = fs.readFileSync(path.join(__dirname,'../../_common/db/insert_blacklist_criteria.sql'),'utf-8');
			
			module.exports._user_db_handler.run(sqlAddBlacklistCriterias,
			{
				$blctype: blctype,
				$blcvalue: blcvalue
			},
			function (err)
			{
				if (err)
				{
					reject(__('DB_BLACKLIST_ADD_CRITERIA_ERROR',err));														
				} else {											
					resolve();
				}
			});
		});
	},
	/**
	* @function {Delete criteria from blacklist}
	* @param {number} {blacklist criteria ID}
	* @return {boolean} {promise}
	*/
	deleteBlacklistCriteria:function(blc_id)
	{
		return new Promise(function(resolve,reject){
			if(!module.exports.isReady())
			{
				logger.error('DB_INTERFACE is not ready to work');
				reject(__('DBI_NOT_READY'));
			}
			var sqlDeleteBlacklistCriterias = fs.readFileSync(path.join(__dirname,'../../_common/db/delete_blacklist_criteria.sql'),'utf-8');
			
			module.exports._user_db_handler.run(sqlDeleteBlacklistCriterias,
			{
				$blc_id: blc_id				
			},
			function (err)
			{
				if (err)
				{
					reject(__('DB_BLACKLIST_DELETE_CRITERIA_ERROR',err));												
				} else {											
					resolve();
				}
			});
		});
	},
	/**
	* @function {Edit criteria from blacklist}
	* @param {number} {blacklist criteria ID}
	* @param {number} {blacklist criteria type}
	* @param {string} {blacklist criteria value}
	* @return {boolean} {promise}
	*/
	editBlacklistCriteria:function(blc_id,blctype,blcvalue)
	{
		return new Promise(function(resolve,reject){
			if(!module.exports.isReady())
			{
				reject(__('DBI_NOT_READY'));
			}
			var sqlEditBlacklistCriteria = fs.readFileSync(path.join(__dirname,'../../_common/db/edit_blacklist_criteria.sql'),'utf-8');
			
			module.exports._user_db_handler.run(sqlEditBlacklistCriteria,
			{
				$blc_id: blc_id,
				$blctype: blctype,
				$blcvalue: blcvalue
			},
			function (err)
			{
				if (err)
				{
					reject(__('DB_BLACKLIST_EDIT_CRITERIA_ERROR',err));									
				} else {											
					resolve();
				}
			});
		});
	},
	updatePlaylistNumOfKaras:function(playlist_id,num_karas)
	{
		return new Promise(function(resolve,reject){
			if(!module.exports.isReady())
			{
				reject(__('DBI_NOT_READY'));
			}
			var sqlUpdatePlaylistNumOfKaras = fs.readFileSync(path.join(__dirname,'../../_common/db/update_playlist_numofkaras.sql'),'utf-8');
			module.exports._user_db_handler.run(sqlUpdatePlaylistNumOfKaras,
				{
					$playlist_id: playlist_id,
					$num_karas: num_karas
				}, function (err)
				{
					if (err)
					{
						reject(__('DB_PLAYLIST_UPDATE_KARACOUNT_ERROR',playlist_id,err));												
					} else {
						resolve(num_karas);
					}
				})
		})
	},
	/**
	* @function {Reorders playlist item positions}
	* @param  {number} playlist_id {ID of playlist to reorder}
	* @param  {array} playlist   {Playlist array of kara objects}
	* @return {boolean} {Promise}
	*/
	reorderPlaylist:function(playlist_id,playlist)
	{
		return new Promise(function(resolve,reject){
			if(!module.exports.isReady())
			{
				reject(__('DBI_NOT_READY'));
			}
			var sqlUpdateKaraPosition = fs.readFileSync(path.join(__dirname,'../../_common/db/update_kara_position.sql'),'utf-8');

			var newpos = 0;
			playlist.forEach(function(kara)
			{
				newpos++;
				logger.debug('Updating '+kara.playlistcontent_id+' to position '+newpos);
				module.exports._user_db_handler.run(sqlUpdateKaraPosition,
				{
					$pos: newpos,
					$playlistcontent_id: kara.playlistcontent_id
				}, function (err)
				{
					if (err)
					{
						reject(__('DB_PLAYLIST_REORDER_ERROR',playlist_id,err));														
					}
				})
			})			
			resolve();								
		})
	},
	/**
	* @function {Update playlist's duration field}
	* @param  {number} playlist_id {ID of playlist to update}
	* @param  {number} duration    {Duration in seconds}
	* @return {boolean} {Promise}
	*/
	updatePlaylistDuration:function(playlist_id,duration)
	{
		return new Promise(function(resolve,reject){
			if(!module.exports.isReady())
			{
				reject(__('DBI_NOT_READY'));
			}
			var sqlUpdatePlaylistDuration = fs.readFileSync(path.join(__dirname,'../../_common/db/update_playlist_duration.sql'),'utf-8');
			module.exports._user_db_handler.run(sqlUpdatePlaylistDuration,
				{
					$playlist_id: playlist_id,
					$duration: duration
				}, function (err)
				{
					if (err)
					{
						reject(__('DB_PLAYLIST_UPDATE_DURATION_ERROR',playlist_id,err));									
					} else {
						resolve(duration);
					}
				})
		})
	},
	/**
	* @function {Get contents of playlist}
	* @param  {number} playlist_id {ID of playlist to get a list of songs from}
	* @return {Object} {Playlist object}
	*/
	getPlaylistContents:function(playlist_id){
		return new Promise(function(resolve,reject){
			if(!module.exports.isReady())
			{
				reject(__('DBI_NOT_READY'));
			}
			var sqlGetPlaylistContents = fs.readFileSync(path.join(__dirname,'../../_common/db/select_playlist_contents.sql'),'utf-8');
			module.exports._user_db_handler.serialize(function(){				
						module.exports._user_db_handler.all(sqlGetPlaylistContents,
						{
							$playlist_id: playlist_id
						}, function (err, playlist)
						{
								if (err)
								{
									reject(__('DB_PLAYLIST_GET_CONTENTS_ERROR',playlist_id,err));									
								} else {
									resolve(playlist);
								}
						})


			})

		})
	},
	/**
	* @function {Get all karaokes}
	* @return {array} {array of karaoke objects}
	*/
	getAllKaras:function(){
		return new Promise(function(resolve,reject){
			if(!module.exports.isReady())
			{
				reject(__('DBI_NOT_READY'));
			}
			var sqlGetAllKaras = fs.readFileSync(path.join(__dirname,'../../_common/db/select_all_karas.sql'),'utf-8');
			module.exports._db_handler.all(sqlGetAllKaras,
				function (err, playlist)
				{
					if (err)
					{
						reject(__('DB_GET_ALL_KARAS_ERROR',err));									
					} else {
						resolve(playlist);
					}
				})


		})
	},
	/**
	* @function {Get karaoke info from a playlistcontent_id}
	* @return {object} {Karaoke object}
	*/
	getPLContentInfo:function(playlistcontent_id){
		return new Promise(function(resolve,reject){
			if(!module.exports.isReady())
			{
				reject(__('DBI_NOT_READY'));
			}
			var sqlGetPLContentInfo = fs.readFileSync(path.join(__dirname,'../../_common/db/select_plcontent_info.sql'),'utf-8');
			module.exports._user_db_handler.get(sqlGetPLContentInfo,
				{
					$playlistcontent_id: playlistcontent_id
				},
				function (err, kara)
				{
					if (err)
					{
						reject(__('DB_KARA_GET_PLCINFO_ERROR',playlistcontent_id,err));									
					} else {
						resolve(kara);
					}
				})


		})
	},
	/**
	* @function {Get one karaoke}
	* @param  {number} kara_id {Karaoke ID}
	* @return {Object} {karaoke object}
	*/
	getKara:function(kara_id){
		return new Promise(function(resolve,reject){
			if(!module.exports.isReady())
			{
				reject(__('DBI_NOT_READY'));
			}
			
			var sqlGetKara = fs.readFileSync(path.join(__dirname,'../../_common/db/select_kara.sql'),'utf-8');
			module.exports._db_handler.get(sqlGetKara,
				{	
					$kara_id: kara_id					
				},
				function (err, kara)
				{
					if (err)
					{
						reject(__('DB_KARA_GET_ERROR',kara_id,err));									
					} else {
						resolve(kara);
					}
				})


		})
	},
	/**
	* @function {getPlaylistInfo}
	* @param  {number} playlist_id {Playlist ID}
	* @return {Object} {Playlist object}
	* Selects playlist info from playlist table. Returns the info in a callback.
	*/
	getPlaylistInfo:function(playlist_id,callback)
	{
		//TODO : transformer en promesse
		var sqlGetPlaylistInfo = fs.readFileSync(path.join(__dirname,'../../_common/db/select_playlist_info.sql'),'utf-8');
		module.exports._user_db_handler.get(sqlGetPlaylistInfo,
		{
			$playlist_id: playlist_id
		}, function (err, row)
		{
			if (err)
			{				
				callback(null,__('DB_PLAYLIST_GET_INFO_ERROR',playlist_id,err));
			} else {
				if (row) {
					callback(row);
				} else {
					callback(null,__('DB_PLAYLIST_GET_INFO_UNKNOWN_ERROR',playlist_id,err));
				}
			}
		})
	},
	/**
	* @function {Checks for a current playlist}
	* @return {boolean} {Promise}
	*/
	isACurrentPlaylist:function()
	{
		return new Promise(function(resolve,reject){
			if(!module.exports.isReady())
			{
				reject(__('DBI_NOT_READY'));
			}
			var sqlTestCurrentPlaylistExists = fs.readFileSync(path.join(__dirname,'../../_common/db/test_current_playlist_exists.sql'),'utf-8');
				module.exports._user_db_handler.get(sqlTestCurrentPlaylistExists,
					function (err, row)
					{
						if (err)
						{
							logger.error(__('DB_PLAYLIST_TEST_CURRENT_EXISTS_ERROR',err));
							reject();									
						} else {
							if (row) {
								resolve(row.pk_id_playlist);
							} else {
								reject();
							}

						}
					})


		})
	},
	/**
	* @function {Checks for a public playlist}
	* @return {number} {Playlist ID or rejection}
	*/
	isAPublicPlaylist:function()
	{
		return new Promise(function(resolve,reject){
			if(!module.exports.isReady())
			{
				reject(__('DBI_NOT_READY'));
			}
			var sqlTestPublicPlaylistExists = fs.readFileSync(path.join(__dirname,'../../_common/db/test_public_playlist_exists.sql'),'utf-8');
				module.exports._user_db_handler.get(sqlTestPublicPlaylistExists,
					function (err, row)
					{
						if (err)
						{
							logger.error(__('DB_PLAYLIST_TEST_CURRENT_EXISTS_ERROR',err));
							reject();									
						} else {
							if (row) {
								resolve(row.pk_id_playlist);
							} else {
								reject();
							}

						}
					})


		})
	},
	isPublicPlaylist:function(playlist_id,callback)
	{
		//TODO : transformer en promesse
		var sqlIsPlaylistPublic = fs.readFileSync(path.join(__dirname,'../../_common/db/select_playlist_public_flag.sql'),'utf-8');
		module.exports._user_db_handler.get(sqlIsPlaylistPublic,
		{
			$playlist_id: playlist_id
		}, function (err, row)
		{
				if (err)
				{					
					callback(null,__('DB_PLAYLIST_TEST_PUBLIC_ERROR',playlist_id,err));
				} else {
					if (row) {
						if (row.flag_public == 1) {
							callback(true);
						} else {
							callback(false);
						}
					} else {						
						callback(null,__('DB_PLAYLIST_UNKNOWN',playlist_id));
					}
				}
		})
	},
	isCurrentPlaylist:function(playlist_id,callback)
	{
		//TODO : transformer en promesse
		var sqlIsPlaylistCurrent = fs.readFileSync(path.join(__dirname,'../../_common/db/select_playlist_current_flag.sql'),'utf-8');
		module.exports._user_db_handler.get(sqlIsPlaylistCurrent,
		{
			$playlist_id: playlist_id
		}, function (err, row)
		{
				if (err)
				{
					callback(null,__('DB_PLAYLIST_TEST_CURRENT_ERROR',playlist_id,err));					
				} else {
					if (row) {
						if (row.flag_current == 1) {
							callback(true);
						} else {
							callback(false);
						}
					} else {
						callback(null,__('DB_PLAYLIST_UNKNOWN',playlist_id));					}
				}
		})
	},
	/**
	* @function {is it a kara?}
	* @param  {number} kara_id {Karaoke ID to check for existence}
	* @return {type} {Returns true or false}
	*/
	isKara:function(kara_id,callback)
	{
		//TODO : transformer en promesse
		var sqlIsKara = fs.readFileSync(path.join(__dirname,'../../_common/db/test_kara.sql'),'utf-8');
		module.exports._db_handler.get(sqlIsKara,
		{
			$kara_id: kara_id
		}, function (err, row)
		{
				if (err)
				{					
					callback(null,__('DB_KARA_TEST_ERROR',kara_id,err));
				} else {
					if (row) {
						callback(true);
					} else {
						callback(false);
					}
				}
		})
	},
	/**
	* @function {is blacklist criteria?}
	* @param  {number} blc_id {BL criteria ID to check}
	* @return {type} {Returns true or false}
	*/
	isBLCriteria:function(blc_id)
	{
		return new Promise(function(resolve,reject){
			var sqlIsBLC = fs.readFileSync(path.join(__dirname,'../../_common/db/test_blacklist_criteria.sql'),'utf-8');
			module.exports._user_db_handler.get(sqlIsBLC,
			{
				$blc_id: blc_id
			}, function (err, row)
			{
					if (err)
					{						
						reject(__('DB_BLACKLIST_TEST_CRITERIA_ERROR',blc_id,err));									
					} else {
						if (row) {
							resolve()
						} else {
							reject();
						}
					}
			});
		});
	},
	/**
	* @function {Is the kara in the playlist?}
	* @param  {number} kara_id {ID of karaoke to search for}
	* @param  {number} playlist_id {ID of playlist to search in}
	* @return {boolean} {Promise}
	*/
	isKaraInPlaylist:function(kara_id,playlist_id)
	{
		return new Promise(function(resolve,reject){
			var sqlIsKaraInPlaylist = fs.readFileSync(path.join(__dirname,'../../_common/db/test_kara_in_playlist.sql'),'utf-8');
			module.exports._user_db_handler.get(sqlIsKaraInPlaylist,
			{
				$kara_id: kara_id,
				$playlist_id: playlist_id
			}, function (err, row)
			{
					if (err)
					{
						reject(__('DB_PLAYLIST_SEARCH_KARA_ERROR',kara_id,playlist_id,err));									
					} else {						
						if (row) {
							resolve(true);
						} else {
							resolve(false);
						}
					}
			});
		});
	},
	/**
	* @function {Is the kara in the whitelist?}
	* @param  {number} kara_id {ID of karaoke to search for}
	* @return {boolean} {Promise}
	*/
	isKaraInWhitelist:function(kara_id)
	{
		return new Promise(function(resolve,reject){
			var sqlIsKaraInWhitelist = fs.readFileSync(path.join(__dirname,'../../_common/db/test_kara_in_whitelist.sql'),'utf-8');
			module.exports._user_db_handler.get(sqlIsKaraInWhitelist,
			{
				$kara_id: kara_id
			}, function (err, row)
			{
					if (err)
					{
						reject(__('DB_WHITELIST_SEARCH_KARA_ERROR',kara_id,err));									
					} else {						
						if (row) {
							resolve(true);
						} else {
							resolve(false);
						}
					}
			});
		});
	},
	/**
	* @function {is it a playlist?}
	* @param  {number} playlist_id {Playlist ID to check for existence}
	* @return {type} {Returns true or false}
	*/
	isPlaylist:function(playlist_id,callback)
	{
		//TODO : transformer en promesse
		var sqlIsPlaylist = fs.readFileSync(path.join(__dirname,'../../_common/db/test_playlist.sql'),'utf-8');
		module.exports._user_db_handler.get(sqlIsPlaylist,
		{
			$playlist_id: playlist_id
		}, function (err, row)
		{
				if (err)
				{
					callback(null,__('DB_PLAYLIST_TEST_ERROR',playlist_id,err));
				} else {
					if (row) {
						callback(true);
					} else {
						callback(false);
					}
				}
		})
	},
	setCurrentPlaylist:function(playlist_id,callback)
	{
		//TODO : transformer en promesse
		var sqlSetCurrentPlaylist = fs.readFileSync(path.join(__dirname,'../../_common/db/update_playlist_set_current.sql'),'utf-8');
		module.exports._user_db_handler.run(sqlSetCurrentPlaylist,
		{
			$playlist_id: playlist_id
		}, function (err, rep)
		{
			if (err)
			{
				callback(null,__('DB_PLAYLIST_SET_CURRENT_ERROR',playlist_id,err));
			} else {
				callback(rep);
			}			
		});
	},
	/**
	* @function {setVisiblePlaylist}
	* @param  {number} playlist_id {ID of playlist to make visible}
	* @return {string} {error}
	*/
	setVisiblePlaylist:function(playlist_id,callback)
	{
		//TODO : transformer en promesse
		var sqlSetVisiblePlaylist = fs.readFileSync(path.join(__dirname,'../../_common/db/update_playlist_set_visible.sql'),'utf-8');
		module.exports._user_db_handler.run(sqlSetVisiblePlaylist,
		{
			$playlist_id: playlist_id
		}, function (err, rep)
		{
			if (err)
			{
				callback(null,__('DB_PLAYLIST_SET_VISIBLE_ERROR',playlist_id,err));
			} else {
				callback(rep);
			}
			
		});
	},
	/**
	* @function {unsetVisiblePlaylist}
	* @param  {number} playlist_id {ID of playlist to make invisible}
	* @return {string} {error}
	*/
	unsetVisiblePlaylist:function(playlist_id,callback)
	{
		//TODO : transformer en promesse
		var sqlUnsetVisiblePlaylist = fs.readFileSync(path.join(__dirname,'../../_common/db/update_playlist_unset_visible.sql'),'utf-8');
		module.exports._user_db_handler.run(sqlSetCurrentPlaylist,
		{
			$playlist_id: playlist_id
		}, function (err, rep)
		{
			if (err)
			{
				callback(null,__('DB_PLAYLIST_UNSET_VISIBLE_ERROR',playlist_id,err));
			} else {
				callback(rep);
			}
			
		});
	},
	setPublicPlaylist:function(playlist_id,callback)
	{
		//TODO : transformer en promesse
		var sqlSetPublicPlaylist = fs.readFileSync(path.join(__dirname,'../../_common/db/update_playlist_set_public.sql'),'utf-8');
		module.exports._user_db_handler.run(sqlSetPublicPlaylist,
		{
			$playlist_id: playlist_id
		}, function (err, rep)
		{
			if (err)
			{
				callback(null,__('DB_PLAYLIST_SET_PUBLIC_ERROR',playlist_id,err));
			} else {
				callback(rep);
			}				
		});
	},
	unsetPublicAllPlaylists:function(callback)
	{
		return new Promise(function(resolve,reject){
			if(!module.exports.isReady())
			{
				reject(__('DBI_NOT_READY'));
			}

			var sqlUpdatePlaylistsUnsetPublic = fs.readFileSync(path.join(__dirname,'../../_common/db/update_playlist_unset_public.sql'),'utf-8');
			module.exports._user_db_handler.exec(sqlUpdatePlaylistsUnsetPublic, function (err, rep)
			{
				if (err)
				{
					reject(__('DB_PLAYLIST_UNSET_PUBLIC_ALL_ERROR',err));														
				} else {
					resolve();
				}
			});
		});
	},
	unsetCurrentAllPlaylists:function()
	{
		return new Promise(function(resolve,reject){
			if(!module.exports.isReady())
			{
				reject(__('DBI_NOT_READY'));
			}

			var sqlUpdatePlaylistsUnsetCurrent = fs.readFileSync(path.join(__dirname,'../../_common/db/update_playlist_unset_current.sql'),'utf-8');
			module.exports._user_db_handler.exec(sqlUpdatePlaylistsUnsetCurrent, function (err, rep)
			{
				if (err)
				{
					reject(__('DB_PLAYLIST_UNSET_CURRENT_ALL_ERROR',err));									
				} else {
					resolve();
				}
			});
		});
	},
	emptyPlaylist:function(playlist_id)
	{
		//TODO : transformer en promesse
		// Vidage de playlist. Sert aussi à nettoyer la table playlist_content en cas de suppression de PL
		var sqlEmptyPlaylist = fs.readFileSync(path.join(__dirname,'../../_common/db/empty_playlist.sql'),'utf-8');
		module.exports._user_db_handler.run(sqlEmptyPlaylist,
		{
			$playlist_id: playlist_id
		}, function(err) {
			if (err)
			{
				logger.error(__('DB_PLAYLIST_EMPTY_ERROR',playlist_id,err));									
				
			}
		})
	},
	deletePlaylist:function(playlist_id,callback)
	{
		//TODO : transformer en promesse
		var sqlDeletePlaylist = fs.readFileSync(path.join(__dirname,'../../_common/db/delete_playlist.sql'),'utf-8');
		module.exports._user_db_handler.run(sqlDeletePlaylist,
		{
			$playlist_id: playlist_id
		}, function(err) {
			if (err)
			{
				logger.error(__('DB_PLAYLIST_DELETE',playlist_id,err));
			}
			callback(true);
		})
	},
	/**
	* @function {Edit Playlist query function}
	* @param  {number} playlist_id   {Playlist ID}
	* @param  {string} name          {Name of playlist}
	* @param  {string} NORM_name     {Normalized name of playlist (without accents)}
	* @param  {number} lastedit_time {Last modification date in Unix timestamp}
	* @param  {number} flag_visible  {Is the playlist visible?}
	* @param  {number} flag_current  {Is the playlist the current one?}
	* @param  {number} flag_public   {Is the playlist the public one?}
	* @return {boolean} {true if created succesfully, false otherwise}
	*/
	editPlaylist:function(playlist_id,name,NORM_name,lastedit_time,flag_visible,flag_current,flag_public,callback)
	{
		//TODO : transformer en promesse
		if(!module.exports.isReady())
		{
			logger.error(__('DBI_NOT_READY'));
			return false;
		}

		// Création de la playlist
		// Prend en entrée name, NORM_name, creation_time, lastedit_time, flag_visible, flag_current, flag_public
		// Retourne l'ID de la playlist nouvellement crée.

		var sqlEditPlaylist = fs.readFileSync(path.join(__dirname,'../../_common/db/edit_playlist.sql'),'utf-8');
		module.exports._user_db_handler.run(sqlEditPlaylist,
		{
			$playlist_id: playlist_id,
			$name: name,
			$NORM_name: NORM_name,
			$lastedit_time: lastedit_time,
			$flag_visible: flag_visible,
			$flag_current: flag_current,
			$flag_public: flag_public
		}, function (err, rep)
		{
				if (err)
				{
					logger.error(__('DB_PLAYLIST_EDIT_ERROR',playlist_id,err));
					callback({
						error:true,
						error_msg:err
					});
				} else {
					callback({
						error:false
					});
				}
		})
	},
	createPlaylist:function(name,NORM_name,creation_time,lastedit_time,flag_visible,flag_current,flag_public,callback)
	{
		//TODO : transformer en promesse
		if(!module.exports.isReady())
		{
			logger.error(__('DBI_NOT_READY'));
			return false;
		}

		// Création de la playlist
		// Prend en entrée name, NORM_name, creation_time, lastedit_time, flag_visible, flag_current, flag_public
		// Retourne l'ID de la playlist nouvellement crée.

		var new_playlist_id = 0;
		var sqlCreatePlaylist = fs.readFileSync(path.join(__dirname,'../../_common/db/create_playlist.sql'),'utf-8');
		module.exports._user_db_handler.run(sqlCreatePlaylist,
		{
			$name: name,
			$NORM_name: NORM_name,
			$creation_time: creation_time,
			$lastedit_time: lastedit_time,
			$flag_visible: flag_visible,
			$flag_current: flag_current,
			$flag_public: flag_public
		}, function (err, rep)
		{
				if (err)
				{
					logger.error(__('DB_PLAYLIST_CREATE_ERROR',name,err));					
					callback({
						id:0,
						error:true,
						error_msg:err
					});
				} else {
					callback({
						id:this.lastID,
						error:false
					});
				}
		})
	},

	/**
	* @function {Add Kara To Playlist}
	* @param  {number} kara_id        {ID of karaoke song to add to playlist}
	* @param  {string} requester      {Name of person requesting the song}
	* @param  {string} NORM_requester {Normalized name (without accents)}
	* @param  {number} playlist_id    {ID of playlist to add the song to}
	* @param  {number} pos            {Position in the playlist}
	* @param  {number} date_add       {UNIX timestap of the date and time the song was added to the list}
	* @param  {number} flag_playing   {Is the song playing?}
	* @return {promise} {Promise}
	*/
	addKaraToPlaylist:function(kara_id,requester,NORM_requester,playlist_id,pos,date_added,flag_playing)
	{
		return new Promise(function(resolve,reject){
			if(!module.exports.isReady())
			{
				reject(__('DBI_NOT_READY'));
			}

			//We need to get the KID of the karaoke we're adding.

			var sqlGetKID = fs.readFileSync(path.join(__dirname,'../../_common/db/select_kid.sql'),'utf-8');
			module.exports._db_handler.get(sqlGetKID,
			{
				$kara_id: kara_id
			}, function (err, row)
			{
					if (err)
					{
						reject(__('DB_KARA_GET_KID_ERROR',kara_id,err));
					} else {
						if (row) {
							var kid = row.kid
							var sqlAddKaraToPlaylist = fs.readFileSync(path.join(__dirname,'../../_common/db/add_kara_to_playlist.sql'),'utf-8');
							module.exports._user_db_handler.run(sqlAddKaraToPlaylist,
							{
								$playlist_id: playlist_id,
								$pseudo_add: requester,
								$NORM_pseudo_add: NORM_requester,
								$kara_id: kara_id,
								$kid: kid,
								$date_added: date_added,
								$pos: pos,
								$flag_playing: flag_playing
							}, function (err, rep)
							{
									if (err)
									{
										reject(__('DB_PLAYLIST_ADD_KARA_ERROR',kara_id,playlist_id,err));
									} else {
										//We return the playlist_content ID of the kara we just added.
										resolve(this.lastID);
									}
							})
						} else {
							reject(__('DB_KARA_NO_KID',kara_id));
						}

					}
			})
		})
	},
	/**
	* @function {Add Kara To whitelist}
	* @param  {number} kara_id        {ID of karaoke song to add to playlist}
	* @param  {string} reason      {Reason for adding the karaoke}
	* @param  {number} date_add       {UNIX timestap of the date and time the song was added to the list}
	* @return {promise} {Promise}
	*/
	addKaraToWhitelist:function(kara_id,reason,date_added)
	{
		return new Promise(function(resolve,reject){
			if(!module.exports.isReady())
			{
				reject(__('DBI_NOT_READY'));
			}

			//We need to get the KID of the karaoke we're adding.

			var sqlGetKID = fs.readFileSync(path.join(__dirname,'../../_common/db/select_kid.sql'),'utf-8');
			module.exports._db_handler.get(sqlGetKID,
			{
				$kara_id: kara_id
			}, function (err, row)
			{
					if (err)
					{
						reject(__('DB_KARA_GET_KID_ERROR',kara_id,err));
					} else {
						if (row) {
							var kid = row.kid
							var sqlAddKaraToWhitelist = fs.readFileSync(path.join(__dirname,'../../_common/db/add_kara_to_whitelist.sql'),'utf-8');
							module.exports._user_db_handler.run(sqlAddKaraToWhitelist,
							{
								$reason: reason,
								$kara_id: kara_id,
								$kid: kid,
								$date_added: date_added,
							}, function (err, rep)
							{
									if (err)
									{
										reject(__('DB_WHITELIST_ADD_KARA_ERROR',kara_id,err));
									} else {
										//We return the whitelist_content ID of the kara we just added.
										resolve(this.lastID);
									}
							})
						} else {
							reject(__('DB_KARA_NO_KID',kara_id));						}

					}
			})
		})
	},
	/**
	* @function {Remove kara from playlist}
	* @param  {number} playlistcontent_id        {ID of karaoke song to remove from playlist}
	* @return {promise} {Promise}
	*/
	removeKaraFromPlaylist:function(playlistcontent_id)
	{
		return new Promise(function(resolve,reject){
			if(!module.exports.isReady())
			{
				reject(__('DBI_NOT_READY'));
			}

			var sqlRemoveKaraFromPlaylist = fs.readFileSync(path.join(__dirname,'../../_common/db/delete_kara_from_playlist.sql'),'utf-8');
			module.exports._user_db_handler.run(sqlRemoveKaraFromPlaylist,
			{
				$playlistcontent_id: playlistcontent_id				
			}, function (err, rep)
			{
				if (err)
				{					
					reject(__('DB_PLAYLIST_REMOVE_KARA_ERROR',playlistcontent_id,err));
				} else {
					resolve(true);
				}
			});
		});
	},
	/**
	* @function {Remove kara from whitelist}
	* @param  {number} whitelistcontent_id        {ID of karaoke song to remove from playlist}
	* @return {promise} {Promise}
	*/
	removeKaraFromWhitelist:function(wlc_id)
	{
		return new Promise(function(resolve,reject){
			if(!module.exports.isReady())
			{
				reject(__('DBI_NOT_READY'));
			}

			var sqlRemoveKaraFromWhitelist = fs.readFileSync(path.join(__dirname,'../../_common/db/delete_kara_from_whitelist.sql'),'utf-8');
			module.exports._user_db_handler.run(sqlRemoveKaraFromWhitelist,
			{
				$wlc_id: wlc_id
			}, function (err, rep)
			{
				if (err)
				{
					reject(__('DB_WHITELIST_REMOVE_KARA_ERROR',wlc_id,err));
					reject(err);
				} else {
					resolve(true);
				}
			});
		});
	},
	/**
	* @function {Raises position of a song in playlist}
	* @param  {number} playlist_id        {ID of playlist to modify}
	* @param  {number} pos        {Position to modify}
	* @return {promise} {Promise}
	*/
	raisePosInPlaylist:function(pos,playlist_id)
	{
		return new Promise(function(resolve,reject){
			if(!module.exports.isReady())
			{
				reject(__('DBI_NOT_READY'));
			}

			var newpos = pos + 0.1;			
			var sqlRaisePosInPlaylist = fs.readFileSync(path.join(__dirname,'../../_common/db/update_raise_pos_in_playlist.sql'),'utf-8');
			module.exports._user_db_handler.run(sqlRaisePosInPlaylist,
			{
				$newpos: newpos,
				$playlist_id: playlist_id,
				$pos: pos
			}, function (err, rep)
			{
				if (err)
				{
					reject(__('DB_PLAYLIST_UPDATE_POS_ERROR',playlist_id,err));
				} else {
					resolve();
				}
			});
		});
	},
	/**
	* @function {Get biggest position in playlist}
	* @param  {number} playlist_id        {ID of playlist to modify}
	* @return {promise} {Promise}
	*/
	getMaxPosInPlaylist:function(playlist_id)
	{
		return new Promise(function(resolve,reject){
			if(!module.exports.isReady())
			{
				reject(__('DBI_NOT_READY'));
			}

			var sqlGetMaxPosInPlaylist = fs.readFileSync(path.join(__dirname,'../../_common/db/select_max_pos_in_playlist.sql'),'utf-8');
			module.exports._user_db_handler.get(sqlGetMaxPosInPlaylist,
			{
				$playlist_id: playlist_id			
			}, function (err, row)
			{
				if (err)
				{
					reject(__('DB_PLAYLIST_GET_MAXPOS_ERROR',playlist_id,err));
				} else {
					resolve(row.maxpos);
				}
			});
		});
	},
	get_next_kara:function()
	{
		if(!module.exports.isReady())
		{
			logger.error('DB_INTERFACE is not ready to work');
			return false;
		}

		return {
			uuid:'0000-0000-0000-0000',
			kara_id:1,
			title:'Nom du Kara',
			video:'chemin vers la vidéo',
			subtitle:'chemin vers la vidéo',
			requester:'pseudonyme',
		}
	}
}