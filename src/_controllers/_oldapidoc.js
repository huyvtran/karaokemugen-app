/**
 * @api {get} admin/playlists/:pl_id/karas/:plc_id Get song info from a playlist
 * @apiName GetPlaylistPLC
 * @apiVersion 2.0.0
 * @apiGroup Playlists
 * @apiPermission admin
 * 
 * @apiParam {Number} pl_id Target playlist ID. **Note :** Irrelevant since PLCIDs are unique in the table.
 * @apiParam {Number} plc_id Playlist content ID. 
 * @apiSuccess {String} data/NORM_author Normalized karaoke's author name
 * @apiSuccess {String} data/NORM_creator Normalized creator's name
 * @apiSuccess {String} data/NORM_pseudo_add Normalized name of person who added the karaoke to the playlist
 * @apiSuccess {String} data/NORM_serie Normalized name of series the karaoke is from
 * @apiSuccess {String} data/NORM_serie_altname Normalized names of alternative names to the series the karaoke is from. When there are more than one alternative name, they're separated by forward slashes (`/`)
 * @apiSuccess {String} data/NORM_singer Normalized name of singer.
 * @apiSuccess {String} data/NORM_songwriter Normalized name of songwriter.
 * @apiSuccess {String} data/NORM_title Normalized song title
 * @apiSuccess {String} data/author Karaoke author's name
 * @apiSuccess {Number} data/created_at UNIX timestamp of the karaoke's creation date in the base
 * @apiSuccess {String} data/creator Show's creator name
 * @apiSuccess {Number} data/duration Song duration in seconds
 * @apiSuccess {Number} data/flag_blacklisted Is the song in the blacklist ?
 * @apiSuccess {Number} data/flag_playing Is the song the one currently playing ?
 * @apiSuccess {Number} data/flag_whitelisted Is the song in the whitelist ?
 * @apiSuccess {Number} data/gain Calculated audio gain for the karaoke's video, in decibels (can be negative)
 * @apiSuccess {Number} data/kara_id Karaoke's ID in the main database
 * @apiSuccess {String} data/kid Karaoke's unique ID (survives accross database generations)
 * @apiSuccess {String} data/language Song's language in ISO639-2B format, separated by commas when a song has several languages
 * @apiSuccess {String} data/language_i18n Song's language translated in the client's native language
 * @apiSuccess {String} data/misc Internal tag list (`TAG_VIDEOGAME`, etc.)
 * @apiSuccess {String} data/misc_i18n Translated tag list
 * @apiSuccess {Number} data/playlist_id ID of playlist this song belongs to
 * @apiSuccess {Number} data/playlistcontent_ID PLC ID of this song.
 * @apiSuccess {Number} data/pos Position in the playlist. First song has a position of `1`
 * @apiSuccess {String} data/pseudo_add User who added/requested the song
 * @apiSuccess {String} data/serie Name of series/show the song belongs to
 * @apiSuccess {String} data/serie_altname Alternative name(s) of series/show this song belongs to. Names are separated by forward slashes (`/`)
 * @apiSuccess {String} data/singer Singer's name, if known.
 * @apiSuccess {Number} data/songorder Song's order, relative to it's type. Opening 1, Opening 2, Ending 1, Ending 2, etc.
 * @apiSuccess {String} data/songtype Song's type internal tag (`TYPE_OP`, `TYPE_ED`, `TYPE_IN` ...)
 * @apiSuccess {String} data/songtype_i18n Translated song's type (`Opening`, `Ending`, `Insert Song`...)
 * @apiSuccess {String} data/songtype_i18n_short Short translated version of the song's type (`OP`, `ED`, `IN`, ...)
 * @apiSuccess {Number} data/time_before_play Estimated time remaining before the song is going to play (in seconds). `0` if the song is currently playing or if there is no song selected as currently playing in the playlist (thus making this estimate impossible)
 * @apiSuccess {String} data/title Song's title
 * @apiSuccess {String} data/videofile Video's filename
 * @apiSuccess {Number} data/viewcount Counts how many times the song has been played
 * @apiSuccess {String} data/year Song's creation year. Empty string is returned if no year is known.
 * @apiSuccessExample Success-Response:
 * HTTP/1.1 200 OK
 * {
 *   "data": [
 *       {
 *           "NORM_author": null,
 *           "NORM_creator": null,
 *           "NORM_pseudo_add": "Axel",
 *           "NORM_serie": "C3 ~ Cube X Cursed X Curious",
 *           "NORM_serie_altname": "C-Cube/CxCxC",
 *           "NORM_singer": null,
 *           "NORM_songwriter": null,
 *           "NORM_title": "Hana",
 *           "author": null,
 *           "created_at": 1508427958,
 *           "creator": null,
 *           "duration": 0,
 *           "flag_blacklisted": 0,
 *           "flag_playing": 0,
 *           "flag_whitelisted": 0,
 *           "gain": 0,
 *           "kara_id": 1007,
 *           "kid": "c05e24eb-206b-4ff5-88d4-74e8d5ad6f75",
 *           "language": "jpn",
 *           "language_i18n": "Japonais",
 *           "misc": null,
 *           "misc_i18n": null,
 *           "playlist_id": 2,
 *           "playlistcontent_id": 4961,
 *           "pos": 12,
 *           "pseudo_add": "Axel",
 *           "serie": "C3 ~ Cube X Cursed X Curious",
 *           "serie_altname": "C-Cube/CxCxC",
 *           "singer": null,
 *           "songorder": 1,
 *           "songtype": "TYPE_ED",
 *           "songtype_i18n": "Ending",
 *           "songtype_i18n_short": "ED",
 *           "songwriter": null,
 *           "time_before_play": 0,
 *           "title": "Hana",
 *           "videofile": "JAP - C3 ~ Cube X Cursed X Curious - ED1 - Hana.avi",
 *           "viewcount": 0,
 *           "year": ""
 *       }
 *   ]
 * }
 * @apiError PL_VIEW_CONTENT_ERROR Unable to fetch playlist's content information 
 *
 * @apiErrorExample Error-Response:
 * HTTP/1.1 500 Internal Server Error
 * {
 *   "code": "PL_VIEW_CONTENT_ERROR",
 *   "message": "PLCID unknown!"
 * }
 */

/**
 * @api {get} admin/settings Get settings
 * @apiName GetSettings
 * @apiVersion 2.0.0
 * @apiGroup Main
 * @apiPermission admin
 * 
 * @apiSuccess {Object} data Contains all configuration settings. See example or documentation for what each setting does.
 *
 * @apiSuccessExample Success-Response:
 * HTTP/1.1 200 OK
 * {
 *   "data": {
 *       "AdminPassword": "xxxx",
 *       "BinPlayerLinux": "/usr/bin/mpv",
 *       "BinPlayerOSX": "app/bin/mpv.app/Contents/MacOS/mpv",
 *       "BinPlayerWindows": "app/bin/mpv.exe",
 *       "BinffmpegLinux": "/usr/bin/ffmpeg",
 *       "BinffmpegOSX": "app/bin/ffmpeg",
 *       "BinffmpegPath": "D:\\perso\\toyundamugen-app\\app\\bin\\ffmpeg.exe",
 *       "BinffmpegWindows": "app/bin/ffmpeg.exe",
 *       "BinffprobeLinux": "/usr/bin/ffprobe",
 *       "BinffprobeOSX": "app/bin/ffprobe",
 *       "BinffprobePath": "D:\\perso\\toyundamugen-app\\app\\bin\\ffprobe.exe
 *       "BinffprobeWindows": "app/bin/ffprobe.exe",
 *       "BinmpvPath": "D:\\perso\\toyundamugen-app\\app\\bin\\mpv.exe",
 *       "EngineAllowNicknameChange": "1",
 *       "EngineAllowViewBlacklist": "1",
 *       "EngineAllowViewBlacklistCriterias": "1",
 *       "EngineAllowViewWhitelist": "1",
 *       "EngineAutoPlay": "0",
 *       "EngineDefaultLocale": "fr",
 *       "EngineDisplayConnectionInfo": "1",
 *       "EngineDisplayConnectionInfoHost": "",
 *       "EngineDisplayConnectionInfoMessage": "",
 *       "EngineDisplayConnectionInfoQRCode": "1",
 *       "EngineDisplayNickname": "1",
 *       "EngineJinglesInterval": "1",
 *       "EnginePrivateMode": "1",
 *       "EngineRepeatPlaylist": "0",
 *       "EngineSongsPerUser": "10000",
 *       "PathAltname": "../times/series_altnames.csv",
 *       "PathBackgrounds": "app/backgrounds",
 *       "PathBin": "app/bin",
 *       "PathDB": "app/db",
 *       "PathDBKarasFile": "karas.sqlite3",
 *       "PathDBUserFile": "userdata.sqlite3",
 *       "PathJingles": "app/jingles",
 *       "PathKaras": "../times/karas",
 *       "PathSubs": "../times/lyrics",
 *       "PathTemp": "app/temp",
 *       "PathVideos": "app/data/videos",
 *       "PathVideosHTTP": "",
 *       "PlayerBackground": "",
 *       "PlayerFullscreen": "0",
 *       "PlayerNoBar": "1",
 *       "PlayerNoHud": "1",
 *       "PlayerPIP": "1",
 *       "PlayerPIPPositionX": "Left",
 *       "PlayerPIPPositionY": "Bottom",
 *       "PlayerPIPSize": "30",
 *       "PlayerScreen": "0",
 *       "PlayerStayOnTop": "1",
 *       "VersionName": "Finé Fiévreuse",
 *       "VersionNo": "v2.0 Release Candidate 1",
 *       "appPath": "F:\\karaokemugen-app\\",
 *       "isTest": false,
 *       "mpvVideoOutput": "direct3d",
 *       "os": "win32",
 *       "osHost": "10.202.40.43"
 *   }
 * }
 */

/**
 * @api {put} admin/settings Update settings
 * @apiName PutSettings
 * @apiVersion 2.0.0
 * @apiPermission admin
 * @apiGroup Main
 * @apiDescription **Note :** All settings must be sent at once in a single request.
 * @apiParam {String} AdminPassword Administrator's password.
 * @apiParam {Boolean} EngineAllowNicknameChange Allow/disallow users to change their nickname once set.
 * @apiParam {Boolean} EngineAllowViewBlacklist Allow/disallow users to view blacklist contents from the guest interface
 * @apiParam {Boolean} EngineAllowViewWhitelist Allow/disallow users to view whitelist contents from the guest interface
 * @apiParam {Boolean} EngineAllowViewBlacklistCriterias Allow/disallow users to view blacklist criterias list from the guest interface
 * @apiParam {Boolean} EngineAllowAutoPlay Enable/disable AutoPlay feature (starts playing once a song is added to current playlist)
 * @apiParam {Boolean} EngineDisplayConnectionInfo Show/hide connection info during jingles or pauses (the "Go to http://" message) 
 * @apiParam {String} EngineDisplayConnectionInfoHost Force IP/Hostname displayed during jingles or pauses in case autodetection returns the wrong IP
 * @apiParam {String} EngineDisplayConnectionInfoMessage Add a small message before the text showing the URL to connect to
 * @apiParam {Boolean} EngineDisplayConnectionInfoQRCode Enable/disable QR Code during pauses inbetween two songs.
 * @apiParam {Boolean} EngineDisplayNickname Enable/disable displaying the username who requested a song.
 * @apiParam {Number} EngineJinglesInterval Interval in number of songs between two jingles. 0 to disable entirely.
 * @apiParam {Boolean} EnginePrivateMode `false` = Public Karaoke mode, `true` = Private Karaoke Mode. See documentation.
 * @apiParam {Boolean} EngineRepeatPlaylist Enable/disable auto repeat playlist when at end.
 * @apiParam {Number} EngineSongsPerUser Number of songs allowed per person.
 * @apiParam {Boolean} PlayerFullscreen Enable/disable full screen mode
 * @apiParam {Boolean} PlayerNoBar `true` = Hide progress bar / `false` = Show progress bar
 * @apiParam {Boolean} PlayerNoHud `true` = Hide HUD / `false` = Show HUD
 * @apiParam {Boolean} PlayerPIP Enable/disable Picture-in-picture mode
 * @apiParam {String=Left,Center,Right} PlayerPIPPositionX Horizontal position of PIP screen 
 * @apiParam {String=Top,Center,Bottom} PlayerPIPPositionY Vertical position of PIP screen
 * @apiParam {Number} PlayerPIPSize Size in percentage of the PIP screen
 * @apiParam {Number} PlayerScreen Screen number to display the videos on. If screen number is not available, main screen is used. `9` means autodetection.
 * @apiParam {Boolean} PlayerStayOnTop Enable/disable stay on top of all windows.  
 * @apiSuccess {Object} data Contains all configuration settings. See example or documentation for what each setting does.
 *
 * @apiSuccessExample Success-Response:
 * HTTP/1.1 200 OK
 */

/**
 * @api {get} public/settings Get settings (public)
 * @apiName GetSettingsPublic
 * @apiVersion 2.0.0
 * @apiGroup Main
 * @apiPermission public
 * @apiDescription Contrary to `admin/settings` path, this one doesn't return things like paths, binaries or admin password information.
 * @apiSuccess {Object} data Contains all configuration settings. See example or documentation for what each setting does.
 *
 * @apiSuccessExample Success-Response:
 * HTTP/1.1 200 OK
 * {
 *   "data": {
 *       "EngineAllowNicknameChange": "1",
 *       "EngineAllowViewBlacklist": "1",
 *       "EngineAllowViewBlacklistCriterias": "1",
 *       "EngineAllowViewWhitelist": "1",
 *       "EngineAutoPlay": "0",
 *       "EngineDefaultLocale": "fr",
 *       "EngineDisplayConnectionInfo": "1",
 *       "EngineDisplayConnectionInfoHost": "",
 *       "EngineDisplayConnectionInfoMessage": "",
 *       "EngineDisplayConnectionInfoQRCode": "1",
 *       "EngineDisplayNickname": "1",
 *       "EngineJinglesInterval": "1",
 *       "EnginePrivateMode": "1",
 *       "EngineRepeatPlaylist": "0",
 *       "EngineSongsPerUser": "10000",
 *       "PlayerBackground": "",
 *       "PlayerFullscreen": "0",
 *       "PlayerNoBar": "1",
 *       "PlayerNoHud": "1",
 *       "PlayerPIP": "1",
 *       "PlayerPIPPositionX": "Left",
 *       "PlayerPIPPositionY": "Bottom",
 *       "PlayerPIPSize": "30",
 *       "PlayerScreen": "0",
 *       "PlayerStayOnTop": "1",
 *       "VersionName": "Finé Fiévreuse",
 *       "VersionNo": "v2.0 Release Candidate 1",
 *       "mpvVideoOutput": "direct3d",
 *   }
 * }
 */

/**
 * @api {post} public/karas/:kara_id Add karaoke to current/public playlist
 * @apiName PostKaras
 * @apiVersion 2.0.0
 * @apiGroup Playlists
 * @apiPermission public
 * @apiDescription Contrary to the admin route, this adds a single karaoke song to either current or public playlist depending on private/public mode selected by admin in configuration.
 * @apiParam {Number} kara_id Karaoke ID to add to current/public playlist
 * @apiParam {String} requestedby Name of user who added the song.
 * @apiSuccess {String} args/kara Karaoke title added
 * @apiSuccess {Number} args/kara_id Karaoke ID added.
 * @apiSuccess {String} args/playlist Name of playlist the song was added to
 * @apiSuccess {Number} args/playlist_id Playlist ID the song was added to
 * @apiSuccess {String} code Message to display
 * @apiSuccess {String} data See `args` above.
 *
 * @apiSuccessExample Success-Response:
 * HTTP/1.1 200 OK
 * {
 *   "args": {
 *       "kara": "Dragon Screamer",
 *       "kara_id": "1029",
 *       "playlist": "Courante",
 *       "playlist_id": 1
 *   },
 *   "code": "PLAYLIST_MODE_SONG_ADDED",
 *   "data": {
 *       "kara": "Dragon Screamer",
 *       "kara_id": "1029",
 *       "playlist": "Courante",
 *       "playlist_id": 1
 *   }
 * }

* @apiError PLAYLIST_MODE_ADD_SONG_ERROR_QUOTA_REACHED User asked for too many karaokes already.
* @apiError PLAYLIST_MODE_ADD_SONG_ERROR Karaoke already present in playlist
*
* @apiErrorExample Error-Response:
* HTTP/1.1 500 Internal Server Error
* {
*   "args": {
*       "kara": "1033",
*       "playlist": 1,
*       "user": "Axel"
*   },
*   "code": "PLAYLIST_MODE_ADD_SONG_ERROR_QUOTA_REACHED",
*   "message": "User quota reached"
* }
*/

/**
 * @api {post} admin/playlists/:pl_id/karas Add karaokes to playlist
 * @apiName PatchPlaylistKaras
 * @apiVersion 2.0.0
 * @apiGroup Playlists
 * @apiPermission admin
 * 
 * @apiParam {Number} pl_id Target playlist ID.
 * @apiParam {Number[]} kara_id List of `kara_id` separated by commas (`,`). Example : `1021,2209,44,872`
 * @apiParam {Number} [pos] Position in target playlist where to copy the karaoke to. If not specified, will place karaokes at the end of target playlist. `-1` adds karaokes after the currently playing song in target playlist.
 * @apiParam {String} requestedby Name of user who added the song.
 * @apiSuccess {String[]} args/plc_ids IDs of playlist contents copied
 * @apiSuccess {String} args/playlist_id ID of destinaton playlist
 * @apiSuccess {String} code Message to display
 *
 * @apiSuccessExample Success-Response:
 * HTTP/1.1 200 OK
 * {
 *   "args": {
 *       "playlist": 2,
 *       "plc_ids": [
 * 			"4946",
 * 			"639"
 * 		 ]
 *   },
 *   "code": "PL_SONG_MOVED",
 *   "data": null
 * }
 * @apiError PL_ADD_SONG_ERROR Unable to add songs to the playlist
 *
 * @apiErrorExample Error-Response:
 * HTTP/1.1 500 Internal Server Error
 * {
 *   "args": "Liste de lecture publique",
 *   "code": "PL_ADD_SONG_ERROR",
 *   "message": "No karaoke could be added, all are in destination playlist already (PLID : 2)"
 * }
 */

/**
 * @api {get} admin/playlists/:pl_id/karas Get list of karaokes in a playlist
 * @apiName GetPlaylistKaras
 * @apiVersion 2.0.0
 * @apiGroup Playlists
 * @apiPermission admin
 * 
 * @apiParam {Number} pl_id Target playlist ID.
 * @apiParam {String} [filter] Filter list by this string. 
 * @apiParam {String} [lang] ISO639-2B code of client's language (to return translated text into the user's language) Defaults to engine's locale.
 * @apiParam {Number} [from=0] Return only the results starting from this position. Useful for continuous scrolling. 0 if unspecified
 * @apiParam {Number} [size=999999] Return only x number of results. Useful for continuous scrolling. 999999 if unspecified.
 * 
 * @apiSuccess {Object[]} data/content/karas Array of `kara` objects 
 * @apiSuccess {Number} data/infos/count Number of karaokes in playlist
 * @apiSuccess {Number} data/infos/from Starting position of listing
 * @apiSuccess {Number} data/infos/to End position of listing
 *
 * @apiSuccessExample Success-Response:
 * HTTP/1.1 200 OK
 * {
 *   "data": {
 *       "content": [
 *           {
 *               "NORM_author": null,
 *               "NORM_creator": null,
 *               "NORM_pseudo_add": "Administrateur",
 *               "NORM_serie": "Dynasty Warriors 3",
 *               "NORM_serie_altname": "DW3/DW 3",
 *               "NORM_singer": null,
 *               "NORM_songwriter": null,
 *               "NORM_title": "Circuit",
 *               "author": null,
 *               "created_at": 1508423806,
 *               "creator": null,
 *               "duration": 0,
 *               "flag_blacklisted": 0,
 *               "flag_playing": 1,
 *               "flag_whitelisted": 0,
 *               "gain": 0,
 *               "kara_id": 176,
 *               "kid": "b0de301c-5756-49fb-b019-85a99a66586b",
 *               "language": "chi",
 *               "language_i18n": "Chinois",
 *               "misc": "TAG_VIDEOGAME",
 *               "misc_i18n": "Jeu vidéo",
 *               "playlistcontent_id": 4946,
 *               "pos": 1,
 *               "pseudo_add": "Administrateur",
 *               "serie": "Dynasty Warriors 3",
 *               "serie_altname": "DW3/DW 3",
 *               "singer": null,
 *               "songorder": 0,
 *               "songtype": "TYPE_ED",
 *               "songtype_i18n": "Ending",
 *               "songtype_i18n_short": "ED",
 *               "songwriter": null,
 *               "title": "Circuit",
 *               "videofile": "CHI - Dynasty Warriors 3 - GAME ED - Circuit.avi"
 *               "viewcount": 0,
 *               "year": ""
 *           },
 *           ...
 *       ],
 *       "infos": {
 *           "count": 3,
 * 			 "from": 0,
 * 			 "to": 120
 *       }
 *   }
 * }
 * @apiError PL_VIEW_SONGS_ERROR Unable to fetch list of karaokes in a playlist
 *
 * @apiErrorExample Error-Response:
 * HTTP/1.1 500 Internal Server Error
 */
/**
=======
>>>>>>> next
 * @api {get} public/playlists/:pl_id/karas Get list of karaokes in a playlist (public)
 * @apiName GetPlaylistKarasPublic
 * @apiVersion 2.0.0
 * @apiGroup Playlists
 * @apiPermission public
 * @apiDescription Contrary to the `/admin/playlists/` path, this one will not return playlists which have the `flag_visible` set to `0`.
 * @apiParam {Number} pl_id Target playlist ID.
 * @apiParam {String} [filter] Filter list by this string. 
 * @apiParam {String} [lang] ISO639-2B code of client's language (to return translated text into the user's language) Defaults to engine's locale.
 * @apiParam {Number} [from=0] Return only the results starting from this position. Useful for continuous scrolling. 0 if unspecified
 * @apiParam {Number} [size=999999] Return only x number of results. Useful for continuous scrolling. 999999 if unspecified.
 * 
 * @apiSuccess {Object[]} data/content/karas Array of `kara` objects 
 * @apiSuccess {Number} data/infos/count Number of karaokes in playlist
 * @apiSuccess {Number} data/infos/from Starting position of listing
 * @apiSuccess {Number} data/infos/to End position of listing
 *
 * @apiSuccessExample Success-Response:
 * HTTP/1.1 200 OK
 * {
 *   "data": {
 *       "content": [
 *           {
 *               "NORM_author": null,
 *               "NORM_creator": null,
 *               "NORM_pseudo_add": "Administrateur",
 *               "NORM_serie": "Dynasty Warriors 3",
 *               "NORM_serie_altname": "DW3/DW 3",
 *               "NORM_singer": null,
 *               "NORM_songwriter": null,
 *               "NORM_title": "Circuit",
 *               "author": null,
 *               "created_at": 1508423806,
 *               "creator": null,
 *               "duration": 0,
 *               "flag_blacklisted": 0,
 *               "flag_playing": 1,
 *               "flag_whitelisted": 0,
 *               "gain": 0,
 *               "kara_id": 176,
 *               "kid": "b0de301c-5756-49fb-b019-85a99a66586b",
 *               "language": "chi",
 *               "language_i18n": "Chinois",
 *               "misc": "TAG_VIDEOGAME",
 *               "misc_i18n": "Jeu vidéo",
 *               "playlistcontent_id": 4946,
 *               "pos": 1,
 *               "pseudo_add": "Administrateur",
 *               "serie": "Dynasty Warriors 3",
 *               "serie_altname": "DW3/DW 3",
 *               "singer": null,
 *               "songorder": 0,
 *               "songtype": "TYPE_ED",
 *               "songtype_i18n": "Ending",
 *               "songtype_i18n_short": "ED",
 *               "songwriter": null,
 *               "title": "Circuit",
 *               "videofile": "CHI - Dynasty Warriors 3 - GAME ED - Circuit.avi"
 *               "viewcount": 0,
 *               "year": ""
 *           },
 *           ...
 *       ],
 *       "infos": {
 *           "count": 3,
 * 			 "from": 0,
 * 			 "to": 120
 *       }
 *   }
 * }
 * @apiError PL_VIEW_SONGS_ERROR Unable to fetch list of karaokes in a playlist
 *
 * @apiErrorExample Error-Response:
 * HTTP/1.1 500 Internal Server Error
 */
/**
 * @api {get} public/playlists/:pl_id/karas/:plc_id Get song info from a playlist (public)
 * @apiName GetPlaylistPLCPublic
 * @apiVersion 2.0.0
 * @apiGroup Playlists
 * @apiPermission public
 * @apiDescription Contrary to the `admin/playlists` path, this one won't return any karaoke info from a playlist the user has no access to.
 * @apiParam {Number} pl_id Target playlist ID. **Note :** Irrelevant since PLCIDs are unique in the table.
 * @apiParam {Number} plc_id Playlist content ID. 
 * @apiSuccess {String} data/NORM_author Normalized karaoke's author name
 * @apiSuccess {String} data/NORM_creator Normalized creator's name
 * @apiSuccess {String} data/NORM_pseudo_add Normalized name of person who added the karaoke to the playlist
 * @apiSuccess {String} data/NORM_serie Normalized name of series the karaoke is from
 * @apiSuccess {String} data/NORM_serie_altname Normalized names of alternative names to the series the karaoke is from. When there are more than one alternative name, they're separated by forward slashes (`/`)
 * @apiSuccess {String} data/NORM_singer Normalized name of singer.
 * @apiSuccess {String} data/NORM_songwriter Normalized name of songwriter.
 * @apiSuccess {String} data/NORM_title Normalized song title
 * @apiSuccess {String} data/author Karaoke author's name
 * @apiSuccess {Number} data/created_at UNIX timestamp of the karaoke's creation date in the base
 * @apiSuccess {String} data/creator Show's creator name
 * @apiSuccess {Number} data/duration Song duration in seconds
 * @apiSuccess {Number} data/flag_blacklisted Is the song in the blacklist ?
 * @apiSuccess {Number} data/flag_playing Is the song the one currently playing ?
 * @apiSuccess {Number} data/flag_whitelisted Is the song in the whitelist ?
 * @apiSuccess {Number} data/gain Calculated audio gain for the karaoke's video, in decibels (can be negative)
 * @apiSuccess {Number} data/kara_id Karaoke's ID in the main database
 * @apiSuccess {String} data/kid Karaoke's unique ID (survives accross database generations)
 * @apiSuccess {String} data/language Song's language in ISO639-2B format, separated by commas when a song has several languages
 * @apiSuccess {String} data/language_i18n Song's language translated in the client's native language
 * @apiSuccess {String} data/misc Internal tag list (`TAG_VIDEOGAME`, etc.)
 * @apiSuccess {String} data/misc_i18n Translated tag list
 * @apiSuccess {Number} data/playlist_id ID of playlist this song belongs to
 * @apiSuccess {Number} data/playlistcontent_ID PLC ID of this song.
 * @apiSuccess {Number} data/pos Position in the playlist. First song has a position of `1`
 * @apiSuccess {String} data/pseudo_add User who added/requested the song
 * @apiSuccess {String} data/serie Name of series/show the song belongs to
 * @apiSuccess {String} data/serie_altname Alternative name(s) of series/show this song belongs to. Names are separated by forward slashes (`/`)
 * @apiSuccess {String} data/singer Singer's name, if known.
 * @apiSuccess {Number} data/songorder Song's order, relative to it's type. Opening 1, Opening 2, Ending 1, Ending 2, etc.
 * @apiSuccess {String} data/songtype Song's type internal tag (`TYPE_OP`, `TYPE_ED`, `TYPE_IN` ...)
 * @apiSuccess {String} data/songtype_i18n Translated song's type (`Opening`, `Ending`, `Insert Song`...)
 * @apiSuccess {String} data/songtype_i18n_short Short translated version of the song's type (`OP`, `ED`, `IN`, ...)
 * @apiSuccess {Number} data/time_before_play Estimated time remaining before the song is going to play (in seconds). `0` if the song is currently playing or if there is no song selected as currently playing in the playlist (thus making this estimate impossible)
 * @apiSuccess {String} data/title Song's title
 * @apiSuccess {String} data/videofile Video's filename
 * @apiSuccess {Number} data/viewcount Counts how many times the song has been played
 * @apiSuccess {String} data/year Song's creation year. Empty string is returned if no year is known.
 * @apiSuccessExample Success-Response:
 * HTTP/1.1 200 OK
 * {
 *   "data": [
 *       {
 *           "NORM_author": null,
 *           "NORM_creator": null,
 *           "NORM_pseudo_add": "Axel",
 *           "NORM_serie": "C3 ~ Cube X Cursed X Curious",
 *           "NORM_serie_altname": "C-Cube/CxCxC",
 *           "NORM_singer": null,
 *           "NORM_songwriter": null,
 *           "NORM_title": "Hana",
 *           "author": null,
 *           "created_at": 1508427958,
 *           "creator": null,
 *           "duration": 0,
 *           "flag_blacklisted": 0,
 *           "flag_playing": 0,
 *           "flag_whitelisted": 0,
 *           "gain": 0,
 *           "kara_id": 1007,
 *           "kid": "c05e24eb-206b-4ff5-88d4-74e8d5ad6f75",
 *           "language": "jpn",
 *           "language_i18n": "Japonais",
 *           "misc": null,
 *           "misc_i18n": null,
 *           "playlist_id": 2,
 *           "playlistcontent_id": 4961,
 *           "pos": 12,
 *           "pseudo_add": "Axel",
 *           "serie": "C3 ~ Cube X Cursed X Curious",
 *           "serie_altname": "C-Cube/CxCxC",
 *           "singer": null,
 *           "songorder": 1,
 *           "songtype": "TYPE_ED",
 *           "songtype_i18n": "Ending",
 *           "songtype_i18n_short": "ED",
 *           "songwriter": null,
 *           "time_before_play": 0,
 *           "title": "Hana",
 *           "videofile": "JAP - C3 ~ Cube X Cursed X Curious - ED1 - Hana.avi",
 *           "viewcount": 0,
 *           "year": ""
 *       }
 *   ]
 * }
 * @apiError PL_VIEW_CONTENT_ERROR Unable to fetch playlist's content information 
 *
 * @apiErrorExample Error-Response:
 * HTTP/1.1 500 Internal Server Error
 * {
 *   "code": "PL_VIEW_CONTENT_ERROR",
 *   "message": "PLCID unknown!"
 * }
 */

/**
 * @api {get} /public/karas Get complete list of karaokes
 * @apiName GetKaras
 * @apiVersion 2.0.0
 * @apiGroup Karaokes
 * @apiPermission public
 * 
 * @apiParam {String} [filter] Filter list by this string. 
 * @apiParam {String} [lang] ISO639-2B code of client's language (to return translated text into the user's language) Defaults to engine's locale.
 * @apiParam {Number} [from=0] Return only the results starting from this position. Useful for continuous scrolling. 0 if unspecified
 * @apiParam {Number} [size=999999] Return only x number of results. Useful for continuous scrolling. 999999 if unspecified.
 * 
 * @apiSuccess {Object[]} data/content/karas Array of `kara` objects 
 * @apiSuccess {Number} data/infos/count Number of karaokes in playlist
 * @apiSuccess {Number} data/infos/from Starting position of listing
 * @apiSuccess {Number} data/infos/to End position of listing
 *
 * @apiSuccessExample Success-Response:
 * HTTP/1.1 200 OK
 * {
 *   "data": {
 *       "content": [
 *           {
 *               "NORM_author": null,
 *               "NORM_creator": null,
 *               "NORM_pseudo_add": "Administrateur",
 *               "NORM_serie": "Dynasty Warriors 3",
 *               "NORM_serie_altname": "DW3/DW 3",
 *               "NORM_singer": null,
 *               "NORM_songwriter": null,
 *               "NORM_title": "Circuit",
 *               "author": null,
 *               "created_at": 1508423806,
 *               "creator": null,
 *               "duration": 0,
 *               "gain": 0,
 *               "kara_id": 176,
 *               "kid": "b0de301c-5756-49fb-b019-85a99a66586b",
 *               "language": "chi",
 *               "language_i18n": "Chinois",
 *               "misc": "TAG_VIDEOGAME",
 *               "misc_i18n": "Jeu vidéo",
 *               "serie": "Dynasty Warriors 3",
 *               "serie_altname": "DW3/DW 3",
 *               "singer": null,
 *               "songorder": 0,
 *               "songtype": "TYPE_ED",
 *               "songtype_i18n": "Ending",
 *               "songtype_i18n_short": "ED",
 *               "songwriter": null,
 *               "title": "Circuit",
 *               "videofile": "CHI - Dynasty Warriors 3 - GAME ED - Circuit.avi"
 *               "viewcount": 0,
 *               "year": ""
 *           },
 *           ...
 *       ],
 *       "infos": {
 *           "count": 3,
 * 			 "from": 0,
 * 			 "to": 120
 *       }
 *   }
 * }
 * @apiError SONG_LIST_ERROR Unable to fetch list of karaokes
 *
 * @apiErrorExample Error-Response:
 * HTTP/1.1 500 Internal Server Error
 */

/**
 * @api {get} public/karas/:kara_id Get song info from database
 * @apiName GetKaraInfo
 * @apiVersion 2.0.0
 * @apiGroup Karaokes
 * @apiPermission public
 * 
 * @apiParam {Number} kara_id Karaoke ID you want to fetch information from
 * @apiSuccess {String} data/NORM_author Normalized karaoke's author name
 * @apiSuccess {String} data/NORM_creator Normalized creator's name
 * @apiSuccess {String} data/NORM_pseudo_add Normalized name of person who added the karaoke to the playlist
 * @apiSuccess {String} data/NORM_serie Normalized name of series the karaoke is from
 * @apiSuccess {String} data/NORM_serie_altname Normalized names of alternative names to the series the karaoke is from. When there are more than one alternative name, they're separated by forward slashes (`/`)
 * @apiSuccess {String} data/NORM_singer Normalized name of singer.
 * @apiSuccess {String} data/NORM_songwriter Normalized name of songwriter.
 * @apiSuccess {String} data/NORM_title Normalized song title
 * @apiSuccess {String} data/author Karaoke author's name
 * @apiSuccess {Number} data/created_at UNIX timestamp of the karaoke's creation date in the base
 * @apiSuccess {String} data/creator Show's creator name
 * @apiSuccess {Number} data/duration Song duration in seconds
 * @apiSuccess {Number} data/gain Calculated audio gain for the karaoke's video, in decibels (can be negative)
 * @apiSuccess {String} data/kid Karaoke's unique ID (survives accross database generations)
 * @apiSuccess {String} data/language Song's language in ISO639-2B format, separated by commas when a song has several languages
 * @apiSuccess {String} data/language_i18n Song's language translated in the client's native language
 * @apiSuccess {String} data/misc Internal tag list (`TAG_VIDEOGAME`, etc.)
 * @apiSuccess {String} data/misc_i18n Translated tag list
 * @apiSuccess {String} data/serie Name of series/show the song belongs to
 * @apiSuccess {String} data/serie_altname Alternative name(s) of series/show this song belongs to. Names are separated by forward slashes (`/`)
 * @apiSuccess {String} data/singer Singer's name, if known.
 * @apiSuccess {Number} data/songorder Song's order, relative to it's type. Opening 1, Opening 2, Ending 1, Ending 2, etc.
 * @apiSuccess {String} data/songtype Song's type internal tag (`TYPE_OP`, `TYPE_ED`, `TYPE_IN` ...)
 * @apiSuccess {String} data/songtype_i18n Translated song's type (`Opening`, `Ending`, `Insert Song`...)
 * @apiSuccess {String} data/songtype_i18n_short Short translated version of the song's type (`OP`, `ED`, `IN`, ...)
 * @apiSuccess {Number} data/time_before_play Estimated time remaining before the song is going to play (in seconds). `0` if the song is currently playing or if there is no song selected as currently playing in the playlist (thus making this estimate impossible)
 * @apiSuccess {String} data/title Song's title
 * @apiSuccess {String} data/videofile Video's filename
 * @apiSuccess {Number} data/viewcount Counts how many times the song has been played
 * @apiSuccess {String} data/year Song's creation year. Empty string is returned if no year is known.
 * @apiSuccessExample Success-Response:
 * HTTP/1.1 200 OK
 * {
 *   "data": [
 *       {
 *           "NORM_author": null,
 *           "NORM_creator": null,
 *           "NORM_pseudo_add": "Axel",
 *           "NORM_serie": "C3 ~ Cube X Cursed X Curious",
 *           "NORM_serie_altname": "C-Cube/CxCxC",
 *           "NORM_singer": null,
 *           "NORM_songwriter": null,
 *           "NORM_title": "Hana",
 *           "author": null,
 *           "created_at": 1508427958,
 *           "creator": null,
 *           "duration": 0,
 *           "gain": 0,
 *           "kid": "c05e24eb-206b-4ff5-88d4-74e8d5ad6f75",
 *           "language": "jpn",
 *           "language_i18n": "Japonais",
 *           "misc": null,
 *           "misc_i18n": null,
 *           "serie": "C3 ~ Cube X Cursed X Curious",
 *           "serie_altname": "C-Cube/CxCxC",
 *           "singer": null,
 *           "songorder": 1,
 *           "songtype": "TYPE_ED",
 *           "songtype_i18n": "Ending",
 *           "songtype_i18n_short": "ED",
 *           "songwriter": null,
 *           "time_before_play": 0,
 *           "title": "Hana",
 *           "videofile": "JAP - C3 ~ Cube X Cursed X Curious - ED1 - Hana.avi",
 *           "viewcount": 0,
 *           "year": ""
 *       }
 *   ]
 * }
 * @apiError PL_VIEW_CONTENT_ERROR Unable to fetch playlist's content information 
 *
 * @apiErrorExample Error-Response:
 * HTTP/1.1 500 Internal Server Error
 * {
 *   "code": "PL_VIEW_CONTENT_ERROR",
 *   "message": "PLCID unknown!"
 * }
 */

/**
 * @api {get} public/playlists/current/karas Get list of karaokes in the current playlist
 * @apiName GetPlaylistKarasCurrent
 * @apiVersion 2.0.0
 * @apiGroup Playlists
 * @apiPermission public
 * 
 * @apiParam {Number} pl_id Target playlist ID.
 * @apiParam {String} [filter] Filter list by this string. 
 * @apiParam {String} [lang] ISO639-2B code of client's language (to return translated text into the user's language) Defaults to engine's locale.
 * @apiParam {Number} [from=0] Return only the results starting from this position. Useful for continuous scrolling. 0 if unspecified
 * @apiParam {Number} [size=999999] Return only x number of results. Useful for continuous scrolling. 999999 if unspecified.
 * 
 * @apiSuccess {Object[]} data/content/karas Array of `kara` objects 
 * @apiSuccess {Number} data/infos/count Number of karaokes in playlist
 * @apiSuccess {Number} data/infos/from Starting position of listing
 * @apiSuccess {Number} data/infos/to End position of listing
 *
 * @apiSuccessExample Success-Response:
 * HTTP/1.1 200 OK
 * {
 *   "data": {
 *       "content": [
 *           {
 *               "NORM_author": null,
 *               "NORM_creator": null,
 *               "NORM_pseudo_add": "Administrateur",
 *               "NORM_serie": "Dynasty Warriors 3",
 *               "NORM_serie_altname": "DW3/DW 3",
 *               "NORM_singer": null,
 *               "NORM_songwriter": null,
 *               "NORM_title": "Circuit",
 *               "author": null,
 *               "created_at": 1508423806,
 *               "creator": null,
 *               "duration": 0,
 *               "flag_blacklisted": 0,
 *               "flag_playing": 1,
 *               "flag_whitelisted": 0,
 *               "gain": 0,
 *               "kara_id": 176,
 *               "kid": "b0de301c-5756-49fb-b019-85a99a66586b",
 *               "language": "chi",
 *               "language_i18n": "Chinois",
 *               "misc": "TAG_VIDEOGAME",
 *               "misc_i18n": "Jeu vidéo",
 *               "playlistcontent_id": 4946,
 *               "pos": 1,
 *               "pseudo_add": "Administrateur",
 *               "serie": "Dynasty Warriors 3",
 *               "serie_altname": "DW3/DW 3",
 *               "singer": null,
 *               "songorder": 0,
 *               "songtype": "TYPE_ED",
 *               "songtype_i18n": "Ending",
 *               "songtype_i18n_short": "ED",
 *               "songwriter": null,
 *               "title": "Circuit",
 *               "videofile": "CHI - Dynasty Warriors 3 - GAME ED - Circuit.avi"
 *               "viewcount": 0,
 *               "year": ""
 *           },
 *           ...
 *       ],
 *       "infos": {
 *           "count": 3,
 * 			 "from": 0,
 * 			 "to": 120
 *       }
 *   }
 * }
 * @apiError PL_VIEW_SONGS_CURRENT_ERROR Unable to fetch list of karaokes of current playlist
 *
 * @apiErrorExample Error-Response:
 * HTTP/1.1 500 Internal Server Error
 */

/**
 * @api {get} public/playlists/public/karas Get list of karaokes in the public playlist
 * @apiName GetPlaylistKarasPublic
 * @apiVersion 2.0.0
 * @apiGroup Playlists
 * @apiPermission public
 * 
 * @apiParam {Number} pl_id Target playlist ID.
 * @apiParam {String} [filter] Filter list by this string. 
 * @apiParam {String} [lang] ISO639-2B code of client's language (to return translated text into the user's language) Defaults to engine's locale.
 * @apiParam {Number} [from=0] Return only the results starting from this position. Useful for continuous scrolling. 0 if unspecified
 * @apiParam {Number} [size=999999] Return only x number of results. Useful for continuous scrolling. 999999 if unspecified.
 * 
 * @apiSuccess {Object[]} data/content/karas Array of `kara` objects 
 * @apiSuccess {Number} data/infos/count Number of karaokes in playlist
 * @apiSuccess {Number} data/infos/from Starting position of listing
 * @apiSuccess {Number} data/infos/to End position of listing
 *
 * @apiSuccessExample Success-Response:
 * HTTP/1.1 200 OK
 * {
 *   "data": {
 *       "content": [
 *           {
 *               "NORM_author": null,
 *               "NORM_creator": null,
 *               "NORM_pseudo_add": "Administrateur",
 *               "NORM_serie": "Dynasty Warriors 3",
 *               "NORM_serie_altname": "DW3/DW 3",
 *               "NORM_singer": null,
 *               "NORM_songwriter": null,
 *               "NORM_title": "Circuit",
 *               "author": null,
 *               "created_at": 1508423806,
 *               "creator": null,
 *               "duration": 0,
 *               "flag_blacklisted": 0,
 *               "flag_playing": 1,
 *               "flag_whitelisted": 0,
 *               "gain": 0,
 *               "kara_id": 176,
 *               "kid": "b0de301c-5756-49fb-b019-85a99a66586b",
 *               "language": "chi",
 *               "language_i18n": "Chinois",
 *               "misc": "TAG_VIDEOGAME",
 *               "misc_i18n": "Jeu vidéo",
 *               "playlistcontent_id": 4946,
 *               "pos": 1,
 *               "pseudo_add": "Administrateur",
 *               "serie": "Dynasty Warriors 3",
 *               "serie_altname": "DW3/DW 3",
 *               "singer": null,
 *               "songorder": 0,
 *               "songtype": "TYPE_ED",
 *               "songtype_i18n": "Ending",
 *               "songtype_i18n_short": "ED",
 *               "songwriter": null,
 *               "title": "Circuit",
 *               "videofile": "CHI - Dynasty Warriors 3 - GAME ED - Circuit.avi"
 *               "viewcount": 0,
 *               "year": ""
 *           },
 *           ...
 *       ],
 *       "infos": {
 *           "count": 3,
 * 			 "from": 0,
 * 			 "to": 120
 *       }
 *   }
 * }
 * @apiError PL_VIEW_SONGS_PUBLIC_ERROR Unable to fetch list of karaokes of public playlist
 *
 * @apiErrorExample Error-Response:
 * HTTP/1.1 500 Internal Server Error
 */
/**
 * @api {get} public/playlists/:pl_id Get playlist information (public)
 * @apiName GetPlaylistPublic
 * @apiGroup Playlists
 * @apiPermission public
 * @apiVersion 2.0.0
 * @apiDescription Contrary to the `/admin/playlists/` path, this one will not return playlists which have the `flag_visible` set to `0`.
 * @apiParam {Number} pl_id Target playlist ID.
 * @apiSuccess {Number} data/created_at Playlist creation date in UNIX timestamp
 * @apiSuccess {Number} data/flag_current Is playlist the current one? Mutually exclusive with `flag_public`
 * @apiSuccess {Number} data/flag_public Is playlist the public one? Mutually exclusive with `flag_current`
 * @apiSuccess {Number} data/flag_visible Is playlist visible to normal users?
 * @apiSuccess {Number} data/length Duration of playlist in seconds
 * @apiSuccess {Number} data/modified_at Playlist last edit date in UNIX timestamp
 * @apiSuccess {String} data/name Name of playlist
 * @apiSuccess {Number} data/num_karas Number of karaoke songs in the playlist
 * @apiSuccess {Number} data/playlist_id Database's playlist ID
 * @apiSuccess {Number} data/time_left Time left in seconds before playlist ends, relative to the currently playing song's position.
 *
 * @apiSuccessExample Success-Response:
 * HTTP/1.1 200 OK 
 * {
 *   "data": {
 *       "created_at": 1508313440,
 *       "flag_current": 1,
 *       "flag_public": 0,
 *       "flag_visible": 1,
 *       "length": 0,
 *       "modified_at": 1508408078,
 *       "name": "Liste de lecture courante",
 *       "num_karas": 6,
 *       "playlist_id": 1,
 *       "time_left": 0
 *   }
 *}
 * @apiError PL_VIEW_ERROR Unable to fetch info from a playlist
 * @apiErrorExample Error-Response:
 * HTTP/1.1 500 Internal Server Error
 */
/**
 * @api {get} public/playlists/ Get list of playlists (public)
 * @apiName GetPlaylistsPublic
 * @apiGroup Playlists
 * @apiVersion 2.0.0
 * @apiPermission public
 * @apiDescription Contrary to the `/admin/playlists/` path, this one will not return playlists which have the `flag_visible` set to `0`.
 * @apiSuccess {Object[]} playlists Playlists information
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 * {
 *   "data": [
 *       {
 *           "created_at": 1508313440,
 *           "flag_current": 1,
 *           "flag_public": 0,
 *           "flag_visible": 1,
 *           "length": 0,
 *           "modified_at": 1508408078,
 *           "name": "Liste de lecture courante",
 *           "num_karas": 6,
 *           "playlist_id": 1,
 *           "time_left": 0
 *       }
 *   ]
 * }
 * @apiError PL_LIST_ERROR Unable to fetch a list of playlists
 *
 * @apiErrorExample Error-Response:
 * HTTP/1.1 500 Internal Server Error
 */

/**
 * @api {get} public/whitelist Get whitelist (public)
 * @apiName GetWhitelistPublic
 * @apiVersion 2.0.0
 * @apiGroup Whitelist
 * @apiPermission public
 * @apiDescription If `EngineAllowViewWhitelist` is set to `0` in configuration, then returns an error message (see below)
 * @apiParam {String} [filter] Filter list by this string.
 * @apiParam {String} [lang] ISO639-2B code of client's language (to return translated text into the user's language) Defaults to engine's locale
 * @apiParam {Number} [from=0] Return only the results starting from this position. Useful for continuous scrolling. 0 if unspecified
 * @apiParam {Number} [size=999999] Return only x number of results. Useful for continuous scrolling. 999999 if unspecified.* @apiSuccess {String} code Message to display
 * @apiSuccess {Object[]} data/content List of karaoke objects
 * @apiSuccess {Number} data/infos/count Number of items in whitelist no matter which range was requested
 * @apiSuccess {Number} data/infos/from Items listed are from this position
 * @apiSuccess {Number} data/infos/to Items listed end at this position
 *
 * @apiSuccessExample Success-Response:
 * HTTP/1.1 200 OK
 * {
 *   "data": {
 *       "content": [
 *           {
 *               "NORM_author": null,
 *               "NORM_creator": "Eurovision",
 *               "NORM_serie": null,
 *               "NORM_serie_altname": null,
 *               "NORM_singer": "Dschinghis Khan",
 *               "NORM_songwriter": "Ralph Siegel",
 *               "NORM_title": "Moskau",
 *               "author": null,
 *               "created_at": 1508921852,
 *               "creator": "Eurovision",
 *               "duration": 0,
 *               "kara_id": 1,
 *               "kid": "d9bb6a76-2b7d-469e-ba44-6acfc463202e",
 *               "language": "ger",
 *               "language_i18n": "Allemand",
 *               "misc": "TAG_CONCERT,TAG_REAL",
 *               "misc_i18n": "Concert,Non-anime",
 *               "serie": null,
 *               "serie_altname": null,
 *               "singer": "Dschinghis Khan",
 *               "songorder": 0,
 *               "songtype": "TYPE_MUSIC",
 *               "songtype_i18n": "Music Video",
 *               "songtype_i18n_short": "MV",
 *               "songwriter": "Ralph Siegel",
 *               "title": "Moskau",
 *               "videofile": "ALL - Dschinghis Khan - MV - Moskau.avi",
 *               "viewcount": 0,
 *               "whitelist_id": 1,
 *               "year": "1980"
 *           }
 *       ],
 *       "infos": {
 *           "count": 1,
 *           "from": 0,
 *           "to": 999999
 *       }
 *   }
 * }
 * @apiError WL_VIEW_ERROR Whitelist could not be viewed
 * @apiError WL_VIEW_FORBIDDEN Whitelist view is not allowed for users
 * @apiErrorExample Error-Response:
 * HTTP/1.1 500 Internal Server Error
 * {
 *   "code": "WL_VIEW_FORBIDDEN"
 * }
 
 */

/**
 * @api {get} public/blacklist Get blacklist (public)
 * @apiName GetBlacklistPublic
 * @apiVersion 2.0.0
 * @apiGroup Blacklist
 * @apiPermission public
 * @apiDescription If `EngineAllowViewBlacklist` is set to `0` in configuration, then returns an error message (see below)
 * @apiParam {String} [filter] Filter list by this string.
 * @apiParam {String} [lang] ISO639-2B code of client's language (to return translated text into the user's language) Defaults to engine's locale
 * @apiParam {Number} [from=0] Return only the results starting from this position. Useful for continuous scrolling. 0 if unspecified
 * @apiParam {Number} [size=999999] Return only x number of results. Useful for continuous scrolling. 999999 if unspecified.* @apiSuccess {String} code Message to display
 * @apiSuccess {Object[]} data/content List of karaoke objects
 * @apiSuccess {Number} data/infos/count Number of items in whitelist no matter which range was requested
 * @apiSuccess {Number} data/infos/from Items listed are from this position
 * @apiSuccess {Number} data/infos/size How many items listed.
=======
/**
 * @api {get} public/playlists/:pl_id Get playlist information (public)
 * @apiName GetPlaylistPublic
 * @apiGroup Playlists
 * @apiPermission public
 * @apiVersion 2.0.0
 * @apiDescription Contrary to the `/admin/playlists/` path, this one will not return playlists which have the `flag_visible` set to `0`.
 * @apiParam {Number} pl_id Target playlist ID.
 * @apiSuccess {Number} data/created_at Playlist creation date in UNIX timestamp
 * @apiSuccess {Number} data/flag_current Is playlist the current one? Mutually exclusive with `flag_public`
 * @apiSuccess {Number} data/flag_public Is playlist the public one? Mutually exclusive with `flag_current`
 * @apiSuccess {Number} data/flag_visible Is playlist visible to normal users?
 * @apiSuccess {Number} data/length Duration of playlist in seconds
 * @apiSuccess {Number} data/modified_at Playlist last edit date in UNIX timestamp
 * @apiSuccess {String} data/name Name of playlist
 * @apiSuccess {Number} data/num_karas Number of karaoke songs in the playlist
 * @apiSuccess {Number} data/playlist_id Database's playlist ID
 * @apiSuccess {Number} data/time_left Time left in seconds before playlist ends, relative to the currently playing song's position.
 *
 * @apiSuccessExample Success-Response:
 * HTTP/1.1 200 OK 
 * {
 *   "data": {
 *       "created_at": 1508313440,
 *       "flag_current": 1,
 *       "flag_public": 0,
 *       "flag_visible": 1,
 *       "length": 0,
 *       "modified_at": 1508408078,
 *       "name": "Liste de lecture courante",
 *       "num_karas": 6,
 *       "playlist_id": 1,
 *       "time_left": 0
 *   }
 *}
 * @apiError PL_VIEW_ERROR Unable to fetch info from a playlist
 *
 * @apiErrorExample Error-Response:
 * HTTP/1.1 500 Internal Server Error
 */

/**
 * @api {get} /admin/playlists/:pl_id/karas Get list of karaokes in a playlist
 * @apiName GetPlaylistKaras
 * @apiVersion 2.1.0
 * @apiGroup Playlists
 * @apiPermission admin
 * 
 * @apiParam {Number} pl_id Target playlist ID.
 * @apiParam {String} [filter] Filter list by this string. 
 * @apiParam {String} [lang] ISO639-2B code of client's language (to return translated text into the user's language) Defaults to engine's locale.
 * @apiParam {Number} [from=0] Return only the results starting from this position. Useful for continuous scrolling. 0 if unspecified
 * @apiParam {Number} [size=999999] Return only x number of results. Useful for continuous scrolling. 999999 if unspecified.
 * 
 * @apiSuccess {Object[]} data/content/karas Array of `kara` objects 
 * @apiSuccess {Number} data/infos/count Number of karaokes in playlist
 * @apiSuccess {Number} data/infos/from Starting position of listing
 * @apiSuccess {Number} data/infos/to End position of listing
 *
 * @apiSuccessExample Success-Response:
 * HTTP/1.1 200 OK
 * {
 *   "data": {
 *       "content": [
 *           {
 *               "NORM_author": null,
 *               "NORM_creator": "Eurovision",
 *               "NORM_serie": null,
 *               "NORM_serie_altname": null,
 *               "NORM_singer": "Dschinghis Khan",
 *               "NORM_songwriter": "Ralph Siegel",
 *               "NORM_title": "Moskau",
 *               "author": null,
 *               "created_at": 1508921852,
 *               "creator": "Eurovision",
 *               "duration": 0,
 *               "kara_id": 1,
 *               "kid": "d9bb6a76-2b7d-469e-ba44-6acfc463202e",
 *               "language": "ger",
 *               "language_i18n": "Allemand",
 *               "misc": "TAG_CONCERT,TAG_REAL",
 *               "misc_i18n": "Concert,Non-anime",
 *               "serie": null,
 *               "serie_altname": null,
 *               "singer": "Dschinghis Khan",
 *               "songorder": 0,
 *               "songtype": "TYPE_MUSIC",
 *               "songtype_i18n": "Music Video",
 *               "songtype_i18n_short": "MV",
 *               "songwriter": "Ralph Siegel",
 *               "title": "Moskau",
 *               "videofile": "ALL - Dschinghis Khan - MV - Moskau.avi",
 *               "viewcount": 0,
 *               "whitelist_id": 1,
 *               "year": "1980"
 *           }
 *       ],
 *       "infos": {
 *           "count": 1,
 *           "from": 0,
 *           "to": 999999
 *       }
 *   }
 * }
 * @apiError BL_VIEW_ERROR Blacklist could not be viewed
 * @apiError BL_VIEW_FORBIDDEN Blacklist view is not allowed for users
 
 * @apiErrorExample Error-Response:
 * HTTP/1.1 500 Internal Server Error
 * {
 *   "code": "BL_VIEW_FORBIDDEN"
 * }
 */
/**
 * @api {get} public/blacklist/criterias Get list of blacklist criterias (public)
 * @apiName GetBlacklistCriteriasPublic
 * @apiVersion 2.0.0
 * @apiGroup Blacklist
 * @apiPermission public
 * 
 * @apiSuccess {Number} data/blcriteria_id Blacklist criteria's ID.
 * @apiSuccess {Number} data/type Blacklist criteria's type. Refer to dev documentation for more info on BLC types.
 * @apiSuccess {Number} data/value Value associated to balcklist criteria (what is being blacklisted)
 * @apiSuccess {String} data/value_i18n Translated value to display on screen.
 *
 * @apiSuccessExample Success-Response:
 * HTTP/1.1 200 OK
 * {
 *   "data": [
 *       {
 *           "blcriteria_id": 2,
 *           "type": 6,
 *           "value": "241",
 *           "value_i18n": "Jean-Jacques Debout"
 *       }
 *   ]
 * }

* @apiError BLC_VIEW_ERROR Blacklist criterias could not be listed
* @apiError BLC_VIEW_FORBIDDEN Blacklist criterias are not viewable by users.
*
* @apiErrorExample Error-Response:
* HTTP/1.1 500 Internal Server Error
* {
*   "code": "BLC_VIEW_FORBIDDEN"
* }
*/	
/**
 * @api {get} public/player Get player status
 * @apiName GetPlayer
 * @apiVersion 2.0.0
 * @apiGroup Player
 * @apiPermission public
 * @apiDescription Player info is updated very frequently. You can poll it to get precise information from player and engine altogether.
 * @apiSuccess {Number} data/currentlyPlaying Karaoke ID of song being played
 * @apiSuccess {Number} data/duration Current's song duration in seconds
 * @apiSuccess {Boolean} data/fullscreen Player's fullscreen status
 * @apiSuccess {Boolean} data/muteStatus Player's volume mute status
 * @apiSuccess {Boolean} data/onTop Player's Always-on-top status
 * @apiSuccess {String=pause,stop,play} data/playerStatus Player's status (not to mistake with engine's status, see below). Player status is `pause` if displaying a background.
 * @apiSuccess {Boolean} data/private Engine's public/private status
 * @apiSuccess {Boolean} data/showSubs Player's showing subtitles or not
 * @apiSuccess {String=pause,play,stop} data/status Engine's status
 * @apiSuccess {Boolean} data/onTop Player's Always-on-top status
 * @apiSuccess {String} data/subText Text/lyrics being displayed on screen
 * @apiSuccess {Number} data/timePosition Player's current position in the song.
 * @apiSuccess {Number} data/volume Volume (from `0` to `100`)
 * Example Success-Response:
 * HTTP/1.1 200 OK
 * {
 *   "data": {
 *       "currentlyPlaying": 1020,
 *       "duration": 0,
 *       "fullscreen": false,
 *       "muteStatus": false,
 *       "onTop": true,
 *       "playerStatus": "pause",
 *       "private": true,
 *       "showSubs": true,
 *       "status": "stop",
 *       "subText": null,
 *       "timePosition": 0,
 *       "volume": 100
 *   }
 * }
 * @apiError PLAYER_STATUS_ERROR Error fetching player status (is the player running?)
 *
 * @apiErrorExample Error-Response:
 * HTTP/1.1 500 Internal Server Error
 * {
 *   "code": "PLAYER_STATUS_ERROR"
 * }
 

/**
 * @api {get} /public/karas Get complete list of karaokes
 * @apiName GetKaras
 * @apiVersion 2.0.0
 * @apiGroup Karaokes
 * @apiPermission public
 * 
 * @apiParam {String} [filter] Filter list by this string. 
 * @apiParam {String} [lang] ISO639-2B code of client's language (to return translated text into the user's language) Defaults to engine's locale.
 * @apiParam {Number} [from=0] Return only the results starting from this position. Useful for continuous scrolling. 0 if unspecified
 * @apiParam {Number} [size=999999] Return only x number of results. Useful for continuous scrolling. 999999 if unspecified.
 * 
 * @apiSuccess {Object[]} data/content/karas Array of `kara` objects 
 * @apiSuccess {Number} data/infos/count Number of karaokes in playlist
 * @apiSuccess {Number} data/infos/from Starting position of listing
 * @apiSuccess {Number} data/infos/to End position of listing
 *
 * @apiSuccessExample Success-Response:
 * HTTP/1.1 200 OK
 * {
 *   "data": {
 *       "content": [
 *           {
 *               "NORM_author": null,
 *               "NORM_creator": null,
 *               "NORM_pseudo_add": "Administrateur",
 *               "NORM_serie": "Dynasty Warriors 3",
 *               "NORM_serie_altname": "DW3/DW 3",
 *               "NORM_singer": null,
 *               "NORM_songwriter": null,
 *               "NORM_title": "Circuit",
 *               "author": null,
 *               "created_at": 1508423806,
 *               "creator": null,
 *               "duration": 0,
 *               "flag_blacklisted": 0,
 *               "flag_playing": 1,
 *               "flag_whitelisted": 0,
 *               "gain": 0,
 *               "kara_id": 176,
 *               "kid": "b0de301c-5756-49fb-b019-85a99a66586b",
 *               "language": "chi",
 *               "language_i18n": "Chinois",
 *               "misc": "TAG_VIDEOGAME",
 *               "misc_i18n": "Jeu vidéo",
 *               "playlistcontent_id": 4946,
 *               "pos": 1,
 *               "pseudo_add": "Administrateur",
 *               "serie": "Dynasty Warriors 3",
 *               "serie_altname": "DW3/DW 3",
 *               "singer": null,
 *               "songorder": 0,
 *               "songtype": "TYPE_ED",
 *               "songtype_i18n": "Ending",
 *               "songtype_i18n_short": "ED",
 *               "songwriter": null,
 *               "title": "Circuit",
 *               "videofile": "CHI - Dynasty Warriors 3 - GAME ED - Circuit.avi"
 *               "viewcount": 0,
 *               "year": ""
 *           },
 *           ...
 *       ],
 *       "infos": {
 *           "count": 3,
 * 			 "from": 0,
 * 			 "to": 120
 *       }
 *   }
 * }
 * @apiError SONG_LIST_ERROR Unable to fetch list of karaokes
 *
 * @apiErrorExample Error-Response:
 * HTTP/1.1 500 Internal Server Error
 */
/**
 * @api {get} /public/karas/random Get a random karaoke ID
 * @apiName GetKarasRandom
 * @apiVersion 2.0.0
 * @apiGroup Karaokes
 * @apiPermission public
 * @apiDescription This selects a random karaoke from the database. What you will do with it depends entirely on you.
 * @apiSuccess {Number} data Random Karaoke ID
 * @apiSuccessExample Success-Response:
 * HTTP/1.1 200 OK
 * {
 *   "data": 4550
 * }
 * @apiError GET_UNLUCKY Unable to find a random karaoke
 *
 * @apiErrorExample Error-Response:
 * HTTP/1.1 500 Internal Server Error
 */
/**
 * @api {post} public/karas/:kara_id/lyrics Get song lyrics
 * @apiName GetKarasLyrics
 * @apiVersion 2.0.0
 * @apiGroup Karaokes
 * @apiPermission public
 * @apiParam {Number} kara_id Karaoke ID to get lyrics from
 * @apiSuccess {String[]} data Array of strings making the song's lyrics
 * @apiSuccessExample Success-Response:
 * HTTP/1.1 200 OK
 * {
 *   "data": "Lyrics for this song are not available"
 * }

* @apiError LYRICS_VIEW_ERROR Unable to fetch lyrics data
*
* @apiErrorExample Error-Response:
* HTTP/1.1 500 Internal Server Error
* {
*   "code": "PLAYLIST_MODE_ADD_SONG_ERROR_QUOTA_REACHED"
* }
*/			

/**
 * @api {get} public/playlists/current Get current playlist information
 * @apiName GetPlaylistCurrent
 * @apiGroup Playlists
 * @apiPermission public
 * @apiVersion 2.0.0
 * @apiDescription This route allows to check basic information about the current playlist, no matter which ID it has (and without you having to know it)
 * @apiSuccess {Number} data/created_at Playlist creation date in UNIX timestamp
 * @apiSuccess {Number} data/flag_current Is playlist the current one? Mutually exclusive with `flag_public`
 * @apiSuccess {Number} data/flag_public Is playlist the public one? Mutually exclusive with `flag_current`
 * @apiSuccess {Number} data/flag_visible Is playlist visible to normal users?
 * @apiSuccess {Number} data/length Duration of playlist in seconds
 * @apiSuccess {Number} data/modified_at Playlist last edit date in UNIX timestamp
 * @apiSuccess {String} data/name Name of playlist
 * @apiSuccess {Number} data/num_karas Number of karaoke songs in the playlist
 * @apiSuccess {Number} data/playlist_id Database's playlist ID
 * @apiSuccess {Number} data/time_left Time left in seconds before playlist ends, relative to the currently playing song's position.
 *
 * @apiSuccessExample Success-Response:
 * HTTP/1.1 200 OK 
 * {
 *   "data": {
 *       "created_at": 1508313440,
 *       "flag_current": 1,
 *       "flag_public": 0,
 *       "flag_visible": 1,
 *       "length": 0,
 *       "modified_at": 1508408078,
 *       "name": "Liste de lecture courante",
 *       "num_karas": 6,
 *       "playlist_id": 1,
 *       "time_left": 0
 *   }
 *}
 * @apiError PL_VIEW_CURRENT_ERROR Unable to fetch info from current playlist
 *
 * @apiErrorExample Error-Response:
 * HTTP/1.1 500 Internal Server Error
 */

/**
 * @api {get} public/playlists/public Get public playlist information
 * @apiName GetPlaylistPublic
 * @apiGroup Playlists
 * @apiPermission public
 * @apiVersion 2.0.0
 * @apiDescription This route allows to check basic information about the public playlist, no matter which ID it has (and without you having to know it)
 * @apiSuccess {Number} data/created_at Playlist creation date in UNIX timestamp
 * @apiSuccess {Number} data/flag_current Is playlist the current one? Mutually exclusive with `flag_public`
 * @apiSuccess {Number} data/flag_public Is playlist the public one? Mutually exclusive with `flag_current`
 * @apiSuccess {Number} data/flag_visible Is playlist visible to normal users?
 * @apiSuccess {Number} data/length Duration of playlist in seconds
 * @apiSuccess {Number} data/modified_at Playlist last edit date in UNIX timestamp
 * @apiSuccess {String} data/name Name of playlist
 * @apiSuccess {Number} data/num_karas Number of karaoke songs in the playlist
 * @apiSuccess {Number} data/playlist_id Database's playlist ID
 * @apiSuccess {Number} data/time_left Time left in seconds before playlist ends, relative to the currently playing song's position.
 *
 * @apiSuccessExample Success-Response:
 * HTTP/1.1 200 OK 
 * {
 *   "data": {
 *       "created_at": 1508313440,
 *       "flag_current": 1,
 *       "flag_public": 0,
 *       "flag_visible": 1,
 *       "length": 0,
 *       "modified_at": 1508408078,
 *       "name": "Liste de lecture courante",
 *       "num_karas": 6,
 *       "playlist_id": 1,
 *       "time_left": 0
 *   }
 *}
 * @apiError PL_VIEW_PUBLIC_ERROR Unable to fetch info from public playlist


/**
 * @api {get} /public/player Get player status
 * @apiName GetPlayer
 * @apiVersion 2.0.0
 * @apiGroup Player
 * @apiPermission public
 * @apiDescription Player info is updated very frequently. You can poll it to get precise information from player and engine altogether.
 * @apiSuccess {Number} data/currentlyPlaying Karaoke ID of song being played
 * @apiSuccess {Number} data/duration Current's song duration in seconds
 * @apiSuccess {Boolean} data/fullscreen Player's fullscreen status
 * @apiSuccess {Boolean} data/muteStatus Player's volume mute status
 * @apiSuccess {Boolean} data/onTop Player's Always-on-top status
 * @apiSuccess {String=pause,stop,play} data/playerStatus Player's status (not to mistake with engine's status, see below). Player status is `pause` if displaying a background.
 * @apiSuccess {Boolean} data/private Engine's public/private status
 * @apiSuccess {Boolean} data/showSubs Player's showing subtitles or not
 * @apiSuccess {String=pause,play,stop} data/status Engine's status
 * @apiSuccess {Boolean} data/onTop Player's Always-on-top status
 * @apiSuccess {String} data/subText Text/lyrics being displayed on screen
 * @apiSuccess {Number} data/timePosition Player's current position in the song.
 * @apiSuccess {Number} data/volume Volume (from `0` to `100`)
 * Example Success-Response:
 * HTTP/1.1 200 OK
 * {
 *   "data": {
 *       "currentlyPlaying": 1020,
 *       "duration": 0,
 *       "fullscreen": false,
 *       "muteStatus": false,
 *       "onTop": true,
 *       "playerStatus": "pause",
 *       "private": true,
 *       "showSubs": true,
 *       "status": "stop",
 *       "subText": null,
 *       "timePosition": 0,
 *       "volume": 100
 *   }
 * } 
 * @apiError PLAYER_STATUS_ERROR Error fetching player status (is the player running?)
 *
 * @apiErrorExample Error-Response:
 * HTTP/1.1 500 Internal Server Error
 * {
 *   "code": "PLAYER_STATUS_ERROR"
 * }
 */		
/**
 * @api {get} admin/playlists/ Get list of playlists
 * @apiName GetPlaylists
 * @apiGroup Playlists
 * @apiVersion 2.0.0
 * @apiPermission admin
 *
 * @apiSuccess {Object[]} playlists Playlists information
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 * {
 *   "data": [
 *       {
 *           "created_at": 1508313440,
 *           "flag_current": 1,
 *           "flag_public": 0,
 *           "flag_visible": 1,
 *           "length": 0,
 *           "modified_at": 1508408078,
 *           "name": "Liste de lecture courante",
 *           "num_karas": 6,
 *           "playlist_id": 1,
 *           "time_left": 0
 *       }
 *   ]
 * }
 * @apiError PL_LIST_ERROR Unable to fetch a list of playlists
 *
 * @apiErrorExample Error-Response:
 * HTTP/1.1 500 Internal Server Error
 */
/**
	* @api {get} public/tags Get tag list
	* @apiName GetTags
	* @apiVersion 2.0.0
	* @apiGroup Karaokes
	* @apiPermission public
	* 
	* @apiSuccess {String} data/name Name of tag
	* @apiSuccess {String} data/name_i18n Translated name of tag
	* @apiSuccess {Number} data/tag_id Tag ID number
	* @apiSuccess {Number} data/type Tag type number
	*
	* @apiSuccessExample Success-Response:
	* HTTP/1.1 200 OK
	* {
	*     "data": [
	*        {
	*          "name": "20th Century",
	*          "name_i18n": "20th Century",
	*          "tag_id": 371,
	*          "type": 2
	*        },
	*        {
	*		   "name": "TYPE_AMV",
	*          "name_i18n": "Anime Music Video",
	*          "tag_id": 15,
	*          "type": 3
	*        },
	*        {
	*          "name": "ita",
	*          "name_i18n": "Italien",
	*          "tag_id": 370,
	*          "type": 5
	*        }
	*		 ...
	*   ]
	* }
	* @apiError TAGS_LIST_ERROR Unable to get list of tags
	*
	* @apiErrorExample Error-Response:
	* HTTP/1.1 500 Internal Server Error
	*/
	
/**
 * @api {get} /admin/settings Get settings
 * @apiName GetSettings
 * @apiVersion 2.1.0
 * @apiGroup Main
 * @apiPermission admin
 *
 * @apiSuccess {Object} data Contains all configuration settings. See example or documentation for what each setting does.
 *
 * @apiSuccessExample Success-Response:
 * HTTP/1.1 200 OK
 * {
 *   "data": {
 *       "AdminPassword": "xxxx",
 *       "BinPlayerLinux": "/usr/bin/mpv",
 *       "BinPlayerOSX": "app/bin/mpv.app/Contents/MacOS/mpv",
 *       "BinPlayerWindows": "app/bin/mpv.exe",
 *       "BinffmpegLinux": "/usr/bin/ffmpeg",
 *       "BinffmpegOSX": "app/bin/ffmpeg",
 *       "BinffmpegPath": "D:\\perso\\toyundamugen-app\\app\\bin\\ffmpeg.exe",
 *       "BinffmpegWindows": "app/bin/ffmpeg.exe",
 *       "BinffprobeLinux": "/usr/bin/ffprobe",
 *       "BinffprobeOSX": "app/bin/ffprobe",
 *       "BinffprobePath": "D:\\perso\\toyundamugen-app\\app\\bin\\ffprobe.exe
 *       "BinffprobeWindows": "app/bin/ffprobe.exe",
 *       "BinmpvPath": "D:\\perso\\toyundamugen-app\\app\\bin\\mpv.exe",
 *       "EngineAllowViewBlacklist": "1",
 *       "EngineAllowViewBlacklistCriterias": "1",
 *       "EngineAllowViewWhitelist": "1",
 *       "EngineAutoPlay": "0",
 *       "EngineDefaultLocale": "fr",
 *       "EngineDisplayConnectionInfo": "1",
 *       "EngineDisplayConnectionInfoHost": "",
 *       "EngineDisplayConnectionInfoMessage": "",
 *       "EngineDisplayConnectionInfoQRCode": "1",
 *       "EngineDisplayNickname": "1",
 * 		 "EngineFreeUpvotes": "1",
 *       "EngineFreeUpvotesRequiredPercentage": "33",
 *       "EngineFreeUpvotesRequiredMin": "4",
 *       "EngineJinglesInterval": "1",
 *       "EnginePrivateMode": "1",
 *       "EngineRepeatPlaylist": "0",
 *       "EngineSmartInsert": "1",
 *       "EngineSongsPerUser": "10000",
 *       "EngineCreatePreviews": "1",
 *       "PathAltname": "../times/series_altnames.csv",
 *       "PathBackgrounds": "app/backgrounds",
 *       "PathBin": "app/bin",
 *       "PathDB": "app/db",
 *       "PathDBKarasFile": "engine.sqlite3",
 *       "PathDBUserFile": "userdata.sqlite3",
 *       "PathJingles": "app/jingles",
 *       "PathKaras": "../times/karas",
 *       "PathSubs": "../times/lyrics",
 *       "PathTemp": "app/temp",
 *       "PathVideos": "app/data/videos",
 *       "PathVideosHTTP": "",
 *       "PlayerBackground": "",
 *       "PlayerFullscreen": "0",
 *       "PlayerNoBar": "1",
 *       "PlayerNoHud": "1",
 *       "PlayerPIP": "1",
 *       "PlayerPIPPositionX": "Left",
 *       "PlayerPIPPositionY": "Bottom",
 *       "PlayerPIPSize": "30",
 *       "PlayerScreen": "0",
 *       "PlayerStayOnTop": "1",
 *       "VersionName": "Finé Fiévreuse",
 *       "VersionNo": "v2.0 Release Candidate 1",
 *       "appPath": "F:\\karaokemugen-app\\",
 *       "isTest": false,
 *       "mpvVideoOutput": "direct3d",
 *       "os": "win32",
 *       "osHost": "10.202.40.43",
 * 		 "WebappMode": "2"
 *   }
 * }
 */

	/**
 * @api {get} /admin/whitelist Get whitelist
 * @apiName GetWhitelist
 * @apiVersion 2.0.0
 * @apiGroup Whitelist
 * @apiPermission admin
 *
 * @apiParam {String} [filter] Filter list by this string.
 * @apiParam {String} [lang] ISO639-2B code of client's language (to return translated text into the user's language) Defaults to engine's locale
 * @apiParam {Number} [from=0] Return only the results starting from this position. Useful for continuous scrolling. 0 if unspecified
 * @apiParam {Number} [size=999999] Return only x number of results. Useful for continuous scrolling. 999999 if unspecified.* @apiSuccess {String} code Message to display
 * @apiSuccess {Object[]} data/content List of karaoke objects
 * @apiSuccess {Number} data/infos/count Number of items in whitelist no matter which range was requested
 * @apiSuccess {Number} data/infos/from Items listed are from this position
 * @apiSuccess {Number} data/infos/size How many items listed.
 *
 * @apiSuccessExample Success-Response:
 * HTTP/1.1 200 OK
 * {
 *   "data": {
 *       "content": [
 *           {
 *               "NORM_author": null,
 *               "NORM_creator": "Eurovision",
 *               "NORM_serie": null,
 *               "NORM_serie_altname": null,
 *               "NORM_singer": "Dschinghis Khan",
 *               "NORM_songwriter": "Ralph Siegel",
 *               "NORM_title": "Moskau",
 *               "author": null,
 *               "created_at": 1508921852,
 *               "creator": "Eurovision",
 *               "duration": 0,
 *               "kara_id": 1,
 *               "kid": "d9bb6a76-2b7d-469e-ba44-6acfc463202e",
 *               "language": "ger",
 *               "language_i18n": "Allemand",
 *               "misc": "TAG_CONCERT,TAG_REAL",
 *               "misc_i18n": "Concert,Non-anime",
 *               "serie": null,
 *               "serie_altname": null,
 *               "singer": "Dschinghis Khan",
 *               "songorder": 0,
 *               "songtype": "TYPE_MUSIC",
 *               "songtype_i18n": "Music Video",
 *               "songtype_i18n_short": "MV",
 *               "songwriter": "Ralph Siegel",
 *               "title": "Moskau",
 *               "videofile": "ALL - Dschinghis Khan - MV - Moskau.avi",
 *               "viewcount": 0,
 *               "whitelist_id": 1,
 *               "year": "1980"
 *           }
 *       ],
 *       "infos": {
 *           "count": 1,
 *           "from": 0,
 *           "to": 999999
 *       }
 *   }
 * }
 * @apiError WL_VIEW_ERROR Whitelist could not be viewed
 *
 * @apiErrorExample Error-Response:
 * HTTP/1.1 500 Internal Server Error
 * {
 *   "code": "WL_VIEW_ERROR"
 * }
 */

	/**
 * @api {get} /admin/blacklist Get blacklist
 * @apiName GetBlacklist
 * @apiVersion 2.0.0
 * @apiGroup Blacklist
 * @apiPermission admin
 *
 * @apiParam {String} [filter] Filter list by this string.
 * @apiParam {String} [lang] ISO639-2B code of client's language (to return translated text into the user's language) Defaults to engine's locale
 * @apiParam {Number} [from=0] Return only the results starting from this position. Useful for continuous scrolling. 0 if unspecified
 * @apiParam {Number} [size=999999] Return only x number of results. Useful for continuous scrolling. 999999 if unspecified.* @apiSuccess {String} code Message to display
 * @apiSuccess {Object[]} data/content List of karaoke objects
 * @apiSuccess {Number} data/infos/count Number of items in whitelist no matter which range was requested
 * @apiSuccess {Number} data/infos/from Items listed are from this position
 * @apiSuccess {Number} data/infos/size How many items listed.
 *
 * @apiSuccessExample Success-Response:
 * HTTP/1.1 200 OK
 * {
 *   "data": {
 *       "content": [
 *           {
 *               "NORM_author": "Jean-Jacques Debout",
 *               "NORM_creator": null,
 *               "NORM_serie": "Capitaine Flam",
 *               "NORM_serie_altname": "Kyaputen Fyucha",
 *               "NORM_singer": "Richard Simon",
 *               "NORM_songwriter": "Roger Dumas",
 *               "NORM_title": "",
 *               "author": "Jean-Jacques Debout",
 *               "created_at": 1508924354,
 *               "creator": null,
 *               "duration": 0,
 *               "kara_id": 217,
 *               "kid": "1b8bca21-4d26-41bd-90b7-2afba74381ee",
 *               "language": "fre",
 *               "language_i18n": "Français",
 *               "misc": null,
 *               "misc_i18n": null,
 *               "reason_add": "Blacklisted Tag : Jean-Jacques Debout (type 6)",
 *               "serie": "Capitaine Flam",
 *               "serie_altname": "Kyaputen Fyucha",
 *               "singer": "Richard Simon",
 *               "songorder": 0,
 *               "songtype": "TYPE_OP",
 *               "songtype_i18n": "Opening",
 *               "songtype_i18n_short": "OP",
 *               "songwriter": "Roger Dumas",
 *               "title": "",
 *               "videofile": "FR - Capitaine Flam - OP.avi",
 *               "viewcount": 0,
 *               "year": "1981"
 *           }
 *       ],
 *       "infos": {
 *           "count": 1,
 *           "from": 0,
 *           "to": 999999
 *       }
 *   }
 * }
 * @apiError BL_VIEW_ERROR Blacklist could not be viewed
 *
 * @apiErrorExample Error-Response:
 * HTTP/1.1 500 Internal Server Error
 * {
 *   "code": "BL_VIEW_ERROR"
 * }
 */

	/**
 * @api {get} /public/playlists/:pl_id/karas/:plc_id Get song info from a playlist (public)
 * @apiName GetPlaylistPLCPublic
 * @apiVersion 2.1.0
 * @apiGroup Playlists
 * @apiPermission public
 * @apiDescription Contrary to the `admin/playlists` path, this one won't return any karaoke info from a playlist the user has no access to.
 * @apiParam {Number} pl_id Target playlist ID. **Note :** Irrelevant since PLCIDs are unique in the table.
 * @apiParam {Number} plc_id Playlist content ID.
 * @apiSuccess {String} data/NORM_author Normalized karaoke's author name
 * @apiSuccess {String} data/NORM_creator Normalized creator's name
 * @apiSuccess {String} data/NORM_pseudo_add Normalized name of person who added the karaoke to the playlist
 * @apiSuccess {String} data/NORM_serie Normalized name of series the karaoke is from
 * @apiSuccess {String} data/NORM_serie_altname Normalized names of alternative names to the series the karaoke is from. When there are more than one alternative name, they're separated by forward slashes (`/`)
 * @apiSuccess {String} data/NORM_singer Normalized name of singer.
 * @apiSuccess {String} data/NORM_songwriter Normalized name of songwriter.
 * @apiSuccess {String} data/NORM_title Normalized song title
 * @apiSuccess {String} data/author Karaoke author's name
 * @apiSuccess {Number} data/created_at UNIX timestamp of the karaoke's creation date in the base
 * @apiSuccess {String} data/creator Show's creator name
 * @apiSuccess {Number} data/duration Song duration in seconds
 * @apiSuccess {Number} data/flag_blacklisted Is the song in the blacklist ?
 * @apiSuccess {Number} data/flag_favorites 1 = the song is in your favorites, 0 = not.
 * @apiSuccess {Number} data/flag_playing Is the song the one currently playing ?
 * @apiSuccess {Number} data/flag_whitelisted Is the song in the whitelist ?
 * @apiSuccess {Number} data/flag_dejavu Has the song been played in the last hour ? (by default, `EngineMaxDejaVuTime` is at 60 minutes)
 * @apiSuccess {Number} data/gain Calculated audio gain for the karaoke's video, in decibels (can be negative)
 * @apiSuccess {Number} data/kara_id Karaoke's ID in the main database
 * @apiSuccess {String} data/kid Karaoke's unique ID (survives accross database generations)
 * @apiSuccess {String} data/language Song's language in ISO639-2B format, separated by commas when a song has several languages
 * @apiSuccess {String} data/language_i18n Song's language translated in the client's native language
 * @apiSuccess {Number} data/lastplayed_at Time when the song was last played at in UNIX timestamp. `null` if never played before.
 * @apiSuccess {String} data/misc Internal tag list (`TAG_VIDEOGAME`, etc.)
 * @apiSuccess {String} data/misc_i18n Translated tag list
 * @apiSuccess {Number} data/playlist_id ID of playlist this song belongs to
 * @apiSuccess {Number} data/playlistcontent_ID PLC ID of this song.
 * @apiSuccess {Number} data/pos Position in the playlist. First song has a position of `1`
 * @apiSuccess {String} data/pseudo_add Nickname of user who added this song
 * @apiSuccess {String} data/serie Name of series/show the song belongs to
 * @apiSuccess {String} data/serie_altname Alternative name(s) of series/show this song belongs to. Names are separated by forward slashes (`/`)
 * @apiSuccess {String} data/singer Singer's name, if known.
 * @apiSuccess {Number} data/songorder Song's order, relative to it's type. Opening 1, Opening 2, Ending 1, Ending 2, etc.
 * @apiSuccess {String} data/songtype Song's type internal tag (`TYPE_OP`, `TYPE_ED`, `TYPE_IN` ...)
 * @apiSuccess {String} data/songtype_i18n Translated song's type (`Opening`, `Ending`, `Insert Song`...)
 * @apiSuccess {String} data/songtype_i18n_short Short translated version of the song's type (`OP`, `ED`, `IN`, ...)
 * @apiSuccess {Number} data/time_before_play Estimated time remaining before the song is going to play (in seconds). `0` if the song is currently playing or if there is no song selected as currently playing in the playlist (thus making this estimate impossible)
 * @apiSuccess {String} data/title Song's title
 * @apiSuccess {String} data/username Username who added that song
 * @apiSuccess {String} data/videofile Video's filename
 * @apiSuccess {Number} data/viewcount Counts how many times the song has been played
 * @apiSuccess {String} data/year Song's creation year. Empty string is returned if no year is known.
 * @apiSuccessExample Success-Response:
 * HTTP/1.1 200 OK
 * {
 *   "data": [
 *       {
 *           "NORM_author": null,
 *           "NORM_creator": null,
 *           "NORM_pseudo_add": "Axel",
 *           "NORM_serie": "C3 ~ Cube X Cursed X Curious",
 *           "NORM_serie_altname": "C-Cube/CxCxC",
 *           "NORM_singer": null,
 *           "NORM_songwriter": null,
 *           "NORM_title": "Hana",
 *           "author": null,
 *           "created_at": 1508427958,
 *           "creator": null,
 *           "duration": 0,
 *           "flag_blacklisted": 0,
 *           "flag_playing": 0,
 * 			 "flag_favorites": 0,
 *           "flag_whitelisted": 0,
 * 	         "flag_dejavu": 0,
 *           "gain": 0,
 *           "kara_id": 1007,
 *           "kid": "c05e24eb-206b-4ff5-88d4-74e8d5ad6f75",
 *           "language": "jpn",
 *           "language_i18n": "Japonais",
 * 			 "lastplayed_at": null,
 *           "misc": null,
 *           "misc_i18n": null,
 *           "playlist_id": 2,
 *           "playlistcontent_id": 4961,
 *           "pos": 12,
 *           "pseudo_add": "Axel",
 *           "serie": "C3 ~ Cube X Cursed X Curious",
 *           "serie_altname": "C-Cube/CxCxC",
 *           "singer": null,
 *           "songorder": 1,
 *           "songtype": "TYPE_ED",
 *           "songtype_i18n": "Ending",
 *           "songtype_i18n_short": "ED",
 *           "songwriter": null,
 *           "time_before_play": 0,
 *           "title": "Hana",
 * 			 "username": "axelterizaki",
 *           "videofile": "JAP - C3 ~ Cube X Cursed X Curious - ED1 - Hana.avi",
 *           "viewcount": 0,
 *           "year": ""
 *       }
 *   ]
 * }
 * @apiError PL_VIEW_CONTENT_ERROR Unable to fetch playlist's content information 
 * @apiError WEBAPPMODE_CLOSED_API_MESSAGE API is disabled at the moment.
 * 
 * @apiErrorExample Error-Response:
 * HTTP/1.1 500 Internal Server Error
 * {
 *   "code": "PL_VIEW_CONTENT_ERROR",
 *   "message": "PLCID unknown!"
 * }
 * @apiErrorExample Error-Response:
 * HTTP/1.1 403 Forbidden
 */

	/**
 * @api {get} /public/whitelist Get whitelist (public)
 * @apiName GetWhitelistPublic
 * @apiVersion 2.1.0
 * @apiGroup Whitelist
 * @apiPermission public
 * @apiDescription If `EngineAllowViewWhitelist` is set to `0` in configuration, then returns an error message (see below)
 * @apiParam {String} [filter] Filter list by this string.
 * @apiParam {String} [lang] ISO639-2B code of client's language (to return translated text into the user's language) Defaults to engine's locale
 * @apiParam {Number} [from=0] Return only the results starting from this position. Useful for continuous scrolling. 0 if unspecified
 * @apiParam {Number} [size=999999] Return only x number of results. Useful for continuous scrolling. 999999 if unspecified.* @apiSuccess {String} code Message to display
 * @apiSuccess {Object[]} data/content List of karaoke objects
 * @apiSuccess {Number} data/infos/count Number of items in whitelist no matter which range was requested
 * @apiSuccess {Number} data/infos/from Items listed are from this position
 * @apiSuccess {Number} data/infos/to Items listed end at this position
 *
 * @apiSuccessExample Success-Response:
 * HTTP/1.1 200 OK
 * {
 *   "data": {
 *       "content": [
 *           {
 *               "NORM_author": null,
 *               "NORM_creator": "Eurovision",
 *               "NORM_serie": null,
 *               "NORM_serie_altname": null,
 *               "NORM_singer": "Dschinghis Khan",
 *               "NORM_songwriter": "Ralph Siegel",
 *               "NORM_title": "Moskau",
 *               "author": null,
 *               "created_at": 1508921852,
 *               "creator": "Eurovision",
 *               "duration": 0,
 *               "kara_id": 1,
 *               "kid": "d9bb6a76-2b7d-469e-ba44-6acfc463202e",
 *               "language": "ger",
 *               "language_i18n": "Allemand",
 *               "misc": "TAG_CONCERT,TAG_REAL",
 *               "misc_i18n": "Concert,Non-anime",
 *               "serie": null,
 *               "serie_altname": null,
 *               "singer": "Dschinghis Khan",
 *               "songorder": 0,
 *               "songtype": "TYPE_MUSIC",
 *               "songtype_i18n": "Music Video",
 *               "songtype_i18n_short": "MV",
 *               "songwriter": "Ralph Siegel",
 *               "title": "Moskau",
 *               "videofile": "ALL - Dschinghis Khan - MV - Moskau.avi",
 *               "viewcount": 0,
 *               "whitelist_id": 1,
 *               "year": "1980"
 *           }
 *       ],
 *       "infos": {
 *           "count": 1,
 *           "from": 0,
 *           "to": 999999
 *       }
 *   }
 * }
 * @apiError WL_VIEW_ERROR Whitelist could not be viewed
 * @apiError WL_VIEW_FORBIDDEN Whitelist view is not allowed for users
 * @apiError WEBAPPMODE_CLOSED_API_MESSAGE API is disabled at the moment.
 * @apiErrorExample Error-Response:
 * HTTP/1.1 500 Internal Server Error
 * {
 *   "code": "WL_VIEW_FORBIDDEN"
 * }
 * @apiErrorExample Error-Response:
 * HTTP/1.1 403 Forbidden
 */
	/**
 * @api {get} /public/blacklist Get blacklist (public)
 * @apiName GetBlacklistPublic
 * @apiVersion 2.1.0
 * @apiGroup Blacklist
 * @apiPermission public
 * @apiDescription If `EngineAllowViewBlacklist` is set to `0` in configuration, then returns an error message (see below)
 * @apiParam {String} [filter] Filter list by this string.
 * @apiParam {String} [lang] ISO639-2B code of client's language (to return translated text into the user's language) Defaults to engine's locale
 * @apiParam {Number} [from=0] Return only the results starting from this position. Useful for continuous scrolling. 0 if unspecified
 * @apiParam {Number} [size=999999] Return only x number of results. Useful for continuous scrolling. 999999 if unspecified.* @apiSuccess {String} code Message to display
 * @apiSuccess {Object[]} data/content List of karaoke objects
 * @apiSuccess {Number} data/infos/count Number of items in whitelist no matter which range was requested
 * @apiSuccess {Number} data/infos/from Items listed are from this position
 * @apiSuccess {Number} data/infos/size How many items listed.
 *
 * @apiSuccessExample Success-Response:
 * HTTP/1.1 200 OK
 * {
 *   "data": {
 *       "content": [
 *           {
 *               "NORM_author": null,
 *               "NORM_creator": "Eurovision",
 *               "NORM_serie": null,
 *               "NORM_serie_altname": null,
 *               "NORM_singer": "Dschinghis Khan",
 *               "NORM_songwriter": "Ralph Siegel",
 *               "NORM_title": "Moskau",
 *               "author": null,
 *               "created_at": 1508921852,
 *               "creator": "Eurovision",
 *               "duration": 0,
 *               "kara_id": 1,
 *               "kid": "d9bb6a76-2b7d-469e-ba44-6acfc463202e",
 *               "language": "ger",
 *               "language_i18n": "Allemand",
 *               "misc": "TAG_CONCERT,TAG_REAL",
 *               "misc_i18n": "Concert,Non-anime",
 *               "serie": null,
 *               "serie_altname": null,
 *               "singer": "Dschinghis Khan",
 *               "songorder": 0,
 *               "songtype": "TYPE_MUSIC",
 *               "songtype_i18n": "Music Video",
 *               "songtype_i18n_short": "MV",
 *               "songwriter": "Ralph Siegel",
 *               "title": "Moskau",
 *               "videofile": "ALL - Dschinghis Khan - MV - Moskau.avi",
 *               "viewcount": 0,
 *               "whitelist_id": 1,
 *               "year": "1980"
 *           }
 *       ],
 *       "infos": {
 *           "count": 1,
 *           "from": 0,
 *           "to": 999999
 *       }
 *   }
 * }
 * @apiError BL_VIEW_ERROR Blacklist could not be viewed
 * @apiError BL_VIEW_FORBIDDEN Blacklist view is not allowed for users
 * @apiError WEBAPPMODE_CLOSED_API_MESSAGE API is disabled at the moment.
 * @apiErrorExample Error-Response:
 * HTTP/1.1 500 Internal Server Error
 * {
 *   "code": "BL_VIEW_FORBIDDEN"
 * }
 * @apiErrorExample Error-Response:
 * HTTP/1.1 403 Forbidden
 */
	/**
 * @api {get} /public/karas Get complete list of karaokes
 * @apiName GetKaras
 * @apiVersion 2.1.0
 * @apiGroup Karaokes
 * @apiPermission public
 *
 * @apiParam {String} [filter] Filter list by this string.
 * @apiParam {String} [lang] ISO639-2B code of client's language (to return translated text into the user's language) Defaults to engine's locale.
 * @apiParam {Number} [from=0] Return only the results starting from this position. Useful for continuous scrolling. 0 if unspecified
 * @apiParam {Number} [size=999999] Return only x number of results. Useful for continuous scrolling. 999999 if unspecified.
 *
 * @apiSuccess {Object[]} data/content/karas Array of `kara` objects
 * @apiSuccess {Number} data/infos/count Number of karaokes in playlist
 * @apiSuccess {Number} data/infos/from Starting position of listing
 * @apiSuccess {Number} data/infos/to End position of listing
 *
 * @apiSuccessExample Success-Response:
 * HTTP/1.1 200 OK
 * {
 *   "data": {
 *       "content": [
 *           {
 *               "NORM_author": null,
 *               "NORM_creator": null,
 *               "NORM_serie": "Dynasty Warriors 3",
 *               "NORM_serie_altname": "DW3/DW 3",
 *               "NORM_singer": null,
 *               "NORM_songwriter": null,
 *               "NORM_title": "Circuit",
 *               "author": null,
 *               "created_at": 1508423806,
 *               "creator": null,
 *               "duration": 0,
 * 	             "flag_dejavu": 0,
 * 				 "flag_favorites": 1,
 *               "gain": 0,
 *               "kara_id": 176,
 *               "kid": "b0de301c-5756-49fb-b019-85a99a66586b",
 *               "language": "chi",
 *               "language_i18n": "Chinois",
 * 				 "lastplayed_at": null,
 *               "misc": "TAG_VIDEOGAME",
 *               "misc_i18n": "Jeu vidéo",
 *               "serie": "Dynasty Warriors 3",
 *               "serie_altname": "DW3/DW 3",
 *               "singer": null,
 *               "songorder": 0,
 *               "songtype": "TYPE_ED",
 *               "songtype_i18n": "Ending",
 *               "songtype_i18n_short": "ED",
 *               "songwriter": null,
 *               "title": "Circuit",
 *               "videofile": "CHI - Dynasty Warriors 3 - GAME ED - Circuit.avi"
 *               "viewcount": 0,
 *               "year": ""
 *           },
 *           ...
 *       ],
 *       "infos": {
 *           "count": 3,
 * 			 "from": 0,
 * 			 "to": 120
 *       }
 *   }
 * }
 * @apiError SONG_LIST_ERROR Unable to fetch list of karaokes
 * @apiError WEBAPPMODE_CLOSED_API_MESSAGE API is disabled at the moment.
 * @apiErrorExample Error-Response:
 * HTTP/1.1 500 Internal Server Error
 * @apiErrorExample Error-Response:
 * HTTP/1.1 403 Forbidden
 */
	/**
 * @api {get} /public/karas/:kara_id Get song info from database
 * @apiName GetKaraInfo
 * @apiVersion 2.1.0
 * @apiGroup Karaokes
 * @apiPermission public
 *
 * @apiParam {Number} kara_id Karaoke ID you want to fetch information from
 * @apiSuccess {String} data/NORM_author Normalized karaoke's author name
 * @apiSuccess {String} data/NORM_creator Normalized creator's name
 * @apiSuccess {String} data/NORM_serie Normalized name of series the karaoke is from
 * @apiSuccess {String} data/NORM_serie_altname Normalized names of alternative names to the series the karaoke is from. When there are more than one alternative name, they're separated by forward slashes (`/`)
 * @apiSuccess {String} data/NORM_singer Normalized name of singer.
 * @apiSuccess {String} data/NORM_songwriter Normalized name of songwriter.
 * @apiSuccess {String} data/NORM_title Normalized song title
 * @apiSuccess {String} data/author Karaoke author's name
 * @apiSuccess {Number} data/created_at UNIX timestamp of the karaoke's creation date in the base
 * @apiSuccess {String} data/creator Show's creator name
 * @apiSuccess {Number} data/duration Song duration in seconds
 * @apiSuccess {Number} data/flag_dejavu Has the song been played in the last hour ? (by default `EngineMaxDejaVuTime` is at 60 minutes)
 * @apiSuccess {Number} data/flag_favorites 1 = the song is in your favorites, 0 = not.
 * @apiSuccess {Number} data/gain Calculated audio gain for the karaoke's video, in decibels (can be negative)
 * @apiSuccess {String} data/kid Karaoke's unique ID (survives accross database generations)
 * @apiSuccess {String} data/language Song's language in ISO639-2B format, separated by commas when a song has several languages
 * @apiSuccess {String} data/language_i18n Song's language translated in the client's native language
 * @apiSuccess {Number} data/lastplayed_at Last time the song has been played in UNIX timestamp. `null` if never played before
 * @apiSuccess {String} data/misc Internal tag list (`TAG_VIDEOGAME`, etc.)
 * @apiSuccess {String} data/misc_i18n Translated tag list
 * @apiSuccess {String} data/serie Name of series/show the song belongs to
 * @apiSuccess {String} data/serie_altname Alternative name(s) of series/show this song belongs to. Names are separated by forward slashes (`/`)
 * @apiSuccess {String} data/singer Singer's name, if known.
 * @apiSuccess {Number} data/songorder Song's order, relative to it's type. Opening 1, Opening 2, Ending 1, Ending 2, etc.
 * @apiSuccess {String} data/songtype Song's type internal tag (`TYPE_OP`, `TYPE_ED`, `TYPE_IN` ...)
 * @apiSuccess {String} data/songtype_i18n Translated song's type (`Opening`, `Ending`, `Insert Song`...)
 * @apiSuccess {String} data/songtype_i18n_short Short translated version of the song's type (`OP`, `ED`, `IN`, ...)
 * @apiSuccess {Number} data/time_before_play Estimated time remaining before the song is going to play (in seconds). `0` if the song is currently playing or if there is no song selected as currently playing in the playlist (thus making this estimate impossible)
 * @apiSuccess {String} data/title Song's title
 * @apiSuccess {String} data/videofile Video's filename
 * @apiSuccess {Number} data/viewcount Counts how many times the song has been played
 * @apiSuccess {String} data/year Song's creation year. Empty string is returned if no year is known.
 * @apiSuccessExample Success-Response:
 * HTTP/1.1 200 OK
 * {
 *   "data": [
 *       {
 *           "NORM_author": null,
 *           "NORM_creator": null,
 *           "NORM_serie": "C3 ~ Cube X Cursed X Curious",
 *           "NORM_serie_altname": "C-Cube/CxCxC",
 *           "NORM_singer": null,
 *           "NORM_songwriter": null,
 *           "NORM_title": "Hana",
 *           "author": null,
 *           "created_at": 1508427958,
 *           "creator": null,
 *           "duration": 0,
 * 	         "flag_dejavu": 0,
 * 		     "flag_favorites": 0,
 *           "gain": 0,
 *           "kid": "c05e24eb-206b-4ff5-88d4-74e8d5ad6f75",
 *           "language": "jpn",
 *           "language_i18n": "Japonais",
 * 			 "lastplayed_at": null,
 *           "misc": null,
 *           "misc_i18n": null,
 *           "serie": "C3 ~ Cube X Cursed X Curious",
 *           "serie_altname": "C-Cube/CxCxC",
 *           "singer": null,
 *           "songorder": 1,
 *           "songtype": "TYPE_ED",
 *           "songtype_i18n": "Ending",
 *           "songtype_i18n_short": "ED",
 *           "songwriter": null,
 *           "time_before_play": 0,
 *           "title": "Hana",
 *           "videofile": "JAP - C3 ~ Cube X Cursed X Curious - ED1 - Hana.avi",
 *           "viewcount": 0,
 *           "year": ""
 *       }
 *   ]
 * }
 * @apiError SONG_VIEW_ERROR Unable to list songs
 * @apiError WEBAPPMODE_CLOSED_API_MESSAGE API is disabled at the moment.
 * @apiErrorExample Error-Response:
 * HTTP/1.1 500 Internal Server Error
 * {
 *   "code": "SONG_VIEW_ERROR",
 *   "message": null
 * }
 * @apiErrorExample Error-Response:
 * HTTP/1.1 403 Forbidden
 */
	/**
 * @api {get} /public/playlists/current/karas Get list of karaokes in the current playlist
 * @apiName GetPlaylistKarasCurrent
 * @apiVersion 2.1.0
 * @apiGroup Playlists
 * @apiPermission public
 *
 * @apiParam {Number} pl_id Target playlist ID.
 * @apiParam {String} [filter] Filter list by this string.
 * @apiParam {String} [lang] ISO639-2B code of client's language (to return translated text into the user's language) Defaults to engine's locale.
 * @apiParam {Number} [from=0] Return only the results starting from this position. Useful for continuous scrolling. 0 if unspecified
 * @apiParam {Number} [size=999999] Return only x number of results. Useful for continuous scrolling. 999999 if unspecified.
 *
 * @apiSuccess {Object[]} data/content/karas Array of `kara` objects
 * @apiSuccess {Number} data/infos/count Number of karaokes in playlist
 * @apiSuccess {Number} data/infos/from Starting position of listing
 * @apiSuccess {Number} data/infos/to End position of listing
 *
 * @apiSuccessExample Success-Response:
 * HTTP/1.1 200 OK
 * {
 *   "data": {
 *       "content": [
 *           {
 *               "NORM_author": null,
 *               "NORM_creator": null,
 *               "NORM_pseudo_add": "Administrateur",
 *               "NORM_serie": "Dynasty Warriors 3",
 *               "NORM_serie_altname": "DW3/DW 3",
 *               "NORM_singer": null,
 *               "NORM_songwriter": null,
 *               "NORM_title": "Circuit",
 *               "author": null,
 *               "created_at": 1508423806,
 *               "creator": null,
 *               "duration": 0,
 *               "flag_blacklisted": 0,
 *               "flag_playing": 1,
 *               "flag_whitelisted": 0,
 * 	             "flag_dejavu": 0,
 *               "gain": 0,
 *               "kara_id": 176,
 *               "kid": "b0de301c-5756-49fb-b019-85a99a66586b",
 *               "language": "chi",
 *               "language_i18n": "Chinois",
 * 				 "lastplayed_at": null,
 *               "misc": "TAG_VIDEOGAME",
 *               "misc_i18n": "Jeu vidéo",
 *               "playlistcontent_id": 4946,
 *               "pos": 1,
 *               "pseudo_add": "Administrateur",
 *               "serie": "Dynasty Warriors 3",
 *               "serie_altname": "DW3/DW 3",
 *               "singer": null,
 *               "songorder": 0,
 *               "songtype": "TYPE_ED",
 *               "songtype_i18n": "Ending",
 *               "songtype_i18n_short": "ED",
 *               "songwriter": null,
 *               "title": "Circuit",*
 * 				 "username": "admin",
 *               "videofile": "CHI - Dynasty Warriors 3 - GAME ED - Circuit.avi"
 *               "viewcount": 0,
 *               "year": ""
 *           },
 *           ...
 *       ],
 *       "infos": {
 *           "count": 3,
 * 			 "from": 0,
 * 			 "to": 120
 *       }
 *   }
 * }
 * @apiError PL_VIEW_SONGS_CURRENT_ERROR Unable to fetch list of karaokes of current playlist
 * @apiError WEBAPPMODE_CLOSED_API_MESSAGE API is disabled at the moment.
 * @apiErrorExample Error-Response:
 * HTTP/1.1 500 Internal Server Error
 * @apiErrorExample Error-Response:
 * HTTP/1.1 403 Forbidden
 */
	/**
 * @api {get} /public/playlists/public/karas Get list of karaokes in the public playlist
 * @apiName GetPlaylistKarasPublic
 * @apiVersion 2.1.0
 * @apiGroup Playlists
 * @apiPermission public
 *
 * @apiParam {Number} pl_id Target playlist ID.
 * @apiParam {String} [filter] Filter list by this string.
 * @apiParam {String} [lang] ISO639-2B code of client's language (to return translated text into the user's language) Defaults to engine's locale.
 * @apiParam {Number} [from=0] Return only the results starting from this position. Useful for continuous scrolling. 0 if unspecified
 * @apiParam {Number} [size=999999] Return only x number of results. Useful for continuous scrolling. 999999 if unspecified.
 *
 * @apiSuccess {Object[]} data/content/karas Array of `kara` objects
 * @apiSuccess {Number} data/infos/count Number of karaokes in playlist
 * @apiSuccess {Number} data/infos/from Starting position of listing
 * @apiSuccess {Number} data/infos/to End position of listing
 *
 * @apiSuccessExample Success-Response:
 * HTTP/1.1 200 OK
 * {
 *   "data": {
 *       "content": [
 *           {
 *               "NORM_author": null,
 *               "NORM_creator": null,
 *               "NORM_pseudo_add": "Administrateur",
 *               "NORM_serie": "Dynasty Warriors 3",
 *               "NORM_serie_altname": "DW3/DW 3",
 *               "NORM_singer": null,
 *               "NORM_songwriter": null,
 *               "NORM_title": "Circuit",
 *               "author": null,
 *               "created_at": 1508423806,
 *               "creator": null,
 *               "duration": 0,
 *               "flag_blacklisted": 0,
 *               "flag_playing": 1,
 *               "flag_whitelisted": 0,
 * 	             "flag_dejavu": 0,
 *               "gain": 0,
 *               "kara_id": 176,
 *               "kid": "b0de301c-5756-49fb-b019-85a99a66586b",
 *               "language": "chi",
 *               "language_i18n": "Chinois",
 * 				 "lastplayed_at": null,
 *               "misc": "TAG_VIDEOGAME",
 *               "misc_i18n": "Jeu vidéo",
 *               "playlistcontent_id": 4946,
 *               "pos": 1,
 *               "pseudo_add": "Administrateur",
 *               "serie": "Dynasty Warriors 3",
 *               "serie_altname": "DW3/DW 3",
 *               "singer": null,
 *               "songorder": 0,
 *               "songtype": "TYPE_ED",
 *               "songtype_i18n": "Ending",
 *               "songtype_i18n_short": "ED",
 *               "songwriter": null,
 *               "title": "Circuit",
 * 				 "username": "admin",
 *               "videofile": "CHI - Dynasty Warriors 3 - GAME ED - Circuit.avi"
 *               "viewcount": 0,
 *               "year": ""
 *           },
 *           ...
 *       ],
 *       "infos": {
 *           "count": 3,
 * 			 "from": 0,
 * 			 "to": 120
 *       }
 *   }
 * }
 * @apiError PL_VIEW_SONGS_PUBLIC_ERROR Unable to fetch list of karaokes of public playlist
 * @apiError WEBAPPMODE_CLOSED_API_MESSAGE API is disabled at the moment.
 *
 * @apiErrorExample Error-Response:
 * HTTP/1.1 500 Internal Server Error
 * @apiErrorExample Error-Response:
 * HTTP/1.1 403 Forbidden
 */
	/**
 * @api {get} /public/favorites View own favorites
 * @apiName GetFavorites
 * @apiVersion 2.1.0
 * @apiGroup Favorites
 * @apiPermission own
 *
 * @apiParam {String} [filter] Filter list by this string.
 * @apiParam {String} [lang] ISO639-2B code of client's language (to return translated text into the user's language) Defaults to engine's locale.
 * @apiParam {Number} [from=0] Return only the results starting from this position. Useful for continuous scrolling. 0 if unspecified
 * @apiParam {Number} [size=999999] Return only x number of results. Useful for continuous scrolling. 999999 if unspecified.
 *
 * @apiSuccess {Object[]} data/content/karas Array of `kara` objects
 * @apiSuccess {Number} data/infos/count Number of karaokes in playlist
 * @apiSuccess {Number} data/infos/from Starting position of listing
 * @apiSuccess {Number} data/infos/to End position of listing
 *
 * @apiSuccessExample Success-Response:
 * HTTP/1.1 200 OK
 * {
 *   "data": {
 *       "content": [
 *           {
 *               "NORM_author": null,
 *               "NORM_creator": null,
 *               "NORM_pseudo_add": "Administrateur",
 *               "NORM_serie": "Dynasty Warriors 3",
 *               "NORM_serie_altname": "DW3/DW 3",
 *               "NORM_singer": null,
 *               "NORM_songwriter": null,
 *               "NORM_title": "Circuit",
 *               "author": null,
 *               "created_at": 1508423806,
 *               "creator": null,
 *               "duration": 0,
 *               "flag_blacklisted": 0,
 *               "flag_playing": 1,
 *               "flag_whitelisted": 0,
 *               "gain": 0,
 *               "kara_id": 176,
 *               "kid": "b0de301c-5756-49fb-b019-85a99a66586b",
 *               "language": "chi",
 *               "language_i18n": "Chinois",
 *               "misc": "TAG_VIDEOGAME",
 *               "misc_i18n": "Jeu vidéo",
 *               "playlistcontent_id": 4946,
 *               "pos": 1,
 *               "pseudo_add": "Administrateur",
 *               "serie": "Dynasty Warriors 3",
 *               "serie_altname": "DW3/DW 3",
 *               "singer": null,
 *               "songorder": 0,
 *               "songtype": "TYPE_ED",
 *               "songtype_i18n": "Ending",
 *               "songtype_i18n_short": "ED",
 *               "songwriter": null,
 *               "title": "Circuit",
 * 				 "username": "admin",
 *               "videofile": "CHI - Dynasty Warriors 3 - GAME ED - Circuit.avi"
 *               "viewcount": 0,
 *               "year": ""
 *           },
 *           ...
 *       ],
 *       "infos": {
 *           "count": 3,
 * 			 "from": 0,
 * 			 "to": 120
 *       }
 *   }
 * }
 * @apiError FAVORITES_VIEW_ERROR Unable to fetch list of karaokes in favorites
 * @apiError WEBAPPMODE_CLOSED_API_MESSAGE API is disabled at the moment.
 * @apiErrorExample Error-Response:
 * HTTP/1.1 500 Internal Server Error
 * @apiErrorExample Error-Response:
 * HTTP/1.1 403 Forbidden
 */
	/**
 * @api {get} /admin/playlists/:pl_id/karas Get list of karaokes in a playlist
 * @apiName GetPlaylistKaras
 * @apiVersion 2.1.0
 * @apiGroup Playlists
 * @apiPermission admin
 *
 * @apiParam {Number} pl_id Target playlist ID.
 * @apiParam {String} [filter] Filter list by this string.
 * @apiParam {String} [lang] ISO639-2B code of client's language (to return translated text into the user's language) Defaults to engine's locale.
 * @apiParam {Number} [from=0] Return only the results starting from this position. Useful for continuous scrolling. 0 if unspecified
 * @apiParam {Number} [size=999999] Return only x number of results. Useful for continuous scrolling. 999999 if unspecified.
 *
 * @apiSuccess {Object[]} data/content/karas Array of `kara` objects
 * @apiSuccess {Number} data/infos/count Number of karaokes in playlist
 * @apiSuccess {Number} data/infos/from Starting position of listing
 * @apiSuccess {Number} data/infos/to End position of listing
 *
 * @apiSuccessExample Success-Response:
 * HTTP/1.1 200 OK
 * {
 *   "data": {
 *       "content": [
 *           {
 *               "NORM_author": null,
 *               "NORM_creator": null,
 *               "NORM_pseudo_add": "Administrateur",
 *               "NORM_serie": "Dynasty Warriors 3",
 *               "NORM_serie_altname": "DW3/DW 3",
 *               "NORM_singer": null,
 *               "NORM_songwriter": null,
 *               "NORM_title": "Circuit",
 *               "author": null,
 *               "created_at": 1508423806,
 *               "creator": null,
 *               "duration": 0,
 *               "flag_blacklisted": 0,
 *               "flag_playing": 1,
 *               "flag_whitelisted": 0,
 *               "flag_dejavu": 0,
 *               "gain": 0,
 *               "kara_id": 176,
 *               "kid": "b0de301c-5756-49fb-b019-85a99a66586b",
 *               "language": "chi",
 *               "language_i18n": "Chinois",
 * 				 "lastplayed_at": null,
 *               "misc": "TAG_VIDEOGAME",
 *               "misc_i18n": "Jeu vidéo",
 *               "playlistcontent_id": 4946,
 *               "pos": 1,
 *               "pseudo_add": "Administrateur",
 *               "serie": "Dynasty Warriors 3",
 *               "serie_altname": "DW3/DW 3",
 *               "singer": null,
 *               "songorder": 0,
 *               "songtype": "TYPE_ED",
 *               "songtype_i18n": "Ending",
 *               "songtype_i18n_short": "ED",
 *               "songwriter": null,
 *               "title": "Circuit",
 * 				 "username": "admin",
 *               "videofile": "CHI - Dynasty Warriors 3 - GAME ED - Circuit.avi"
 *               "viewcount": 0,
 *               "year": ""
 *           },
 *           ...
 *       ],
 *       "infos": {
 *           "count": 3,
 * 			 "from": 0,
 * 			 "to": 120
 *       }
 *   }
 * }
 * @apiError PL_VIEW_SONGS_ERROR Unable to fetch list of karaokes in a playlist
 *
 * @apiErrorExample Error-Response:
 * HTTP/1.1 500 Internal Server Error
 */
	/**
 * @api {get} /admin/playlists/:pl_id/karas/:plc_id Get song info from a playlist
 * @apiName GetPlaylistPLC
 * @apiVersion 2.1.0
 * @apiGroup Playlists
 * @apiPermission admin
 *
 * @apiParam {Number} pl_id Target playlist ID. **Note :** Irrelevant since PLCIDs are unique in the table.
 * @apiParam {Number} plc_id Playlist content ID.
 * @apiParam {String} lang Lang in ISO639-2B.
 * @apiSuccess {String} data/NORM_author Normalized karaoke's author name
 * @apiSuccess {String} data/NORM_creator Normalized creator's name
 * @apiSuccess {String} data/NORM_pseudo_add Normalized name of person who added the karaoke to the playlist
 * @apiSuccess {String} data/NORM_serie Normalized name of series the karaoke is from
 * @apiSuccess {String} data/NORM_serie_altname Normalized names of alternative names to the series the karaoke is from. When there are more than one alternative name, they're separated by forward slashes (`/`)
 * @apiSuccess {String} data/NORM_singer Normalized name of singer.
 * @apiSuccess {String} data/NORM_songwriter Normalized name of songwriter.
 * @apiSuccess {String} data/NORM_title Normalized song title
 * @apiSuccess {String} data/author Karaoke author's name
 * @apiSuccess {Number} data/created_at UNIX timestamp of the karaoke's creation date in the base
 * @apiSuccess {String} data/creator Show's creator name
 * @apiSuccess {Number} data/duration Song duration in seconds
 * @apiSuccess {Number} data/flag_blacklisted Is the song in the blacklist ?
 * @apiSuccess {Number} data/flag_playing Is the song the one currently playing ?
 * @apiSuccess {Number} data/flag_whitelisted Is the song in the whitelist ?
 * @apiSuccess {Number} data/flag_dejavu Has the song been played in the last hour ? (`EngineMaxDejaVuTime` defaults to 60 minutes)
 * @apiSuccess {Number} data/flag_favorites 1 = the song is in your favorites, 0 = not.
 * @apiSuccess {Number} data/gain Calculated audio gain for the karaoke's video, in decibels (can be negative)
 * @apiSuccess {Number} data/kara_id Karaoke's ID in the main database
 * @apiSuccess {String} data/kid Karaoke's unique ID (survives accross database generations)
 * @apiSuccess {String} data/language Song's language in ISO639-2B format, separated by commas when a song has several languages
 * @apiSuccess {String} data/language_i18n Song's language translated in the client's native language
 * @apiSuccess {Number} data/lastplayed_at When the song has been played last, in unix timestamp
 * @apiSuccess {String} data/misc Internal tag list (`TAG_VIDEOGAME`, etc.)
 * @apiSuccess {String} data/misc_i18n Translated tag list
 * @apiSuccess {Number} data/playlist_id ID of playlist this song belongs to
 * @apiSuccess {Number} data/playlistcontent_ID PLC ID of this song.
 * @apiSuccess {Number} data/pos Position in the playlist. First song has a position of `1`
 * @apiSuccess {String} data/previewfile Filename of the preview file associated with the karaoke. Can be undefined if the preview hasn't been generated yet by the server.
 * @apiSuccess {String} data/pseudo_add Nickname of user who added/requested the song. this nickname can be changed (`username` cannot) hence why it is displayed here.
 * @apiSuccess {String} data/serie Name of series/show the song belongs to
 * @apiSuccess {String} data/serie_altname Alternative name(s) of series/show this song belongs to. Names are separated by forward slashes (`/`)
 * @apiSuccess {String} data/singer Singer's name, if known.
 * @apiSuccess {Number} data/songorder Song's order, relative to it's type. Opening 1, Opening 2, Ending 1, Ending 2, etc.
 * @apiSuccess {String} data/songtype Song's type internal tag (`TYPE_OP`, `TYPE_ED`, `TYPE_IN` ...)
 * @apiSuccess {String} data/songtype_i18n Translated song's type (`Opening`, `Ending`, `Insert Song`...)
 * @apiSuccess {String} data/songtype_i18n_short Short translated version of the song's type (`OP`, `ED`, `IN`, ...)
 * @apiSuccess {Number} data/time_before_play Estimated time remaining before the song is going to play (in seconds). `0` if the song is currently playing or if there is no song selected as currently playing in the playlist (thus making this estimate impossible)
 * @apiSuccess {String} data/title Song's title
 * @apiSuccess {String} data/username Username who submitted this karaoke. Can be different from `pseudo_add`.
 * @apiSuccess {String} data/videofile Video's filename
 * @apiSuccess {Number} data/viewcount Counts how many times the song has been played
 * @apiSuccess {String} data/year Song's creation year. Empty string is returned if no year is known.
 * @apiSuccessExample Success-Response:
 * HTTP/1.1 200 OK
 * {
 *   "data": [
 *       {
 *           "NORM_author": null,
 *           "NORM_creator": null,
 *           "NORM_pseudo_add": "Axel",
 *           "NORM_serie": "C3 ~ Cube X Cursed X Curious",
 *           "NORM_serie_altname": "C-Cube/CxCxC",
 *           "NORM_singer": null,
 *           "NORM_songwriter": null,
 *           "NORM_title": "Hana",
 *           "author": null,
 *           "created_at": 1508427958,
 *           "creator": null,
 *           "duration": 0,
 *           "flag_blacklisted": 0,
 *           "flag_playing": 0,
 *           "flag_whitelisted": 0,
 *           "flag_dejavu": 0,
 * 			 "flag_favorites": 0,
 *           "gain": 0,
 *           "kara_id": 1007,
 *           "kid": "c05e24eb-206b-4ff5-88d4-74e8d5ad6f75",
 *           "language": "jpn",
 *           "language_i18n": "Japonais",
 * 			 "lastplayed_at": null,
 *           "misc": null,
 *           "misc_i18n": null,
 *           "playlist_id": 2,
 *           "playlistcontent_id": 4961,
 *           "pos": 12,
 *           "previewfile": "JAP - C3 ~ Cube X Cursed X Curious.1201230.mp4"
 *           "pseudo_add": "Axel",
 *           "serie": "C3 ~ Cube X Cursed X Curious",
 *           "serie_altname": "C-Cube/CxCxC",
 *           "singer": null,
 *           "songorder": 1,
 *           "songtype": "TYPE_ED",
 *           "songtype_i18n": "Ending",
 *           "songtype_i18n_short": "ED",
 *           "songwriter": null,
 *           "time_before_play": 0,
 *           "title": "Hana",
 * 			 "username": "axelterizaki",
 *           "videofile": "JAP - C3 ~ Cube X Cursed X Curious - ED1 - Hana.avi",
 *           "viewcount": 0,
 *           "year": ""
 *       }
 *   ]
 * }
 * @apiError PL_VIEW_CONTENT_ERROR Unable to fetch playlist's content information
 *
 * @apiErrorExample Error-Response:
 * HTTP/1.1 500 Internal Server Error
 * {
 *   "code": "PL_VIEW_CONTENT_ERROR",
 *   "message": "PLCID unknown!"
 * }
 */
	/**
 * @api {get} /public/playlists/:pl_id/karas Get list of karaokes in a playlist (public)
 * @apiName GetPlaylistKarasPublic
 * @apiVersion 2.1.0
 * @apiGroup Playlists
 * @apiPermission public
 * @apiDescription Contrary to the `/admin/playlists/` path, this one will not return playlists which have the `flag_visible` set to `0`.
 * @apiParam {Number} pl_id Target playlist ID.
 * @apiParam {String} [filter] Filter list by this string.
 * @apiParam {String} [lang] ISO639-2B code of client's language (to return translated text into the user's language) Defaults to engine's locale.
 * @apiParam {Number} [from=0] Return only the results starting from this position. Useful for continuous scrolling. 0 if unspecified
 * @apiParam {Number} [size=999999] Return only x number of results. Useful for continuous scrolling. 999999 if unspecified.
 *
 * @apiSuccess {Object[]} data/content/karas Array of `kara` objects
 * @apiSuccess {Number} data/infos/count Number of karaokes in playlist
 * @apiSuccess {Number} data/infos/from Starting position of listing
 * @apiSuccess {Number} data/infos/to End position of listing
 *
 * @apiSuccessExample Success-Response:
 * HTTP/1.1 200 OK
 * {
 *   "data": {
 *       "content": [
 *           {
 *               "NORM_author": null,
 *               "NORM_creator": null,
 *               "NORM_pseudo_add": "Administrateur",
 *               "NORM_serie": "Dynasty Warriors 3",
 *               "NORM_serie_altname": "DW3/DW 3",
 *               "NORM_singer": null,
 *               "NORM_songwriter": null,
 *               "NORM_title": "Circuit",
 *               "author": null,
 *               "created_at": 1508423806,
 *               "creator": null,
 *               "duration": 0,
 *               "flag_blacklisted": 0,
 *               "flag_playing": 1,
 *               "flag_whitelisted": 0,
 * 	             "flag_dejavu": 0,
 *               "gain": 0,
 *               "kara_id": 176,
 *               "kid": "b0de301c-5756-49fb-b019-85a99a66586b",
 *               "language": "chi",
 *               "language_i18n": "Chinois",
 * 				 "lastplayed_at": null,
 *               "misc": "TAG_VIDEOGAME",
 *               "misc_i18n": "Jeu vidéo",
 *               "playlistcontent_id": 4946,
 *               "pos": 1,
 *               "pseudo_add": "Administrateur",
 *               "serie": "Dynasty Warriors 3",
 *               "serie_altname": "DW3/DW 3",
 *               "singer": null,
 *               "songorder": 0,
 *               "songtype": "TYPE_ED",
 *               "songtype_i18n": "Ending",
 *               "songtype_i18n_short": "ED",
 *               "songwriter": null,
 *               "title": "Circuit",
 * 				 "username": "admin",
 *               "videofile": "CHI - Dynasty Warriors 3 - GAME ED - Circuit.avi"
 *               "viewcount": 0,
 *               "year": ""
 *           },
 *           ...
 *       ],
 *       "infos": {
 *           "count": 3,
 * 			 "from": 0,
 * 			 "to": 120
 *       }
 *   }
 * }
 * @apiError PL_VIEW_SONGS_ERROR Unable to fetch list of karaokes in a playlist
 * @apiError WEBAPPMODE_CLOSED_API_MESSAGE API is disabled at the moment.
 * @apiErrorExample Error-Response:
 * HTTP/1.1 500 Internal Server Error
 * @apiErrorExample Error-Response:
 * HTTP/1.1 403 Forbidden
 */

	/**
 * @api {put} /admin/settings Update settings
 * @apiName PutSettings
 * @apiVersion 2.1.0
 * @apiPermission admin
 * @apiGroup Main
 * @apiDescription **Note :** All settings must be sent at once in a single request.
 * @apiParam {Boolean} EngineAllowViewBlacklist Allow/disallow users to view blacklist contents from the guest interface
 * @apiParam {Boolean} EngineAllowViewWhitelist Allow/disallow users to view whitelist contents from the guest interface
 * @apiParam {Boolean} EngineAllowViewBlacklistCriterias Allow/disallow users to view blacklist criterias list from the guest interface
 * @apiParam {Boolean} EngineAllowAutoPlay Enable/disable AutoPlay feature (starts playing once a song is added to current playlist)
 * @apiParam {Boolean} EngineDisplayConnectionInfo Show/hide connection info during jingles or pauses (the "Go to http://" message)
 * @apiParam {String} EngineDisplayConnectionInfoHost Force IP/Hostname displayed during jingles or pauses in case autodetection returns the wrong IP
 * @apiParam {String} EngineDisplayConnectionInfoMessage Add a small message before the text showing the URL to connect to
 * @apiParam {Boolean} EngineDisplayConnectionInfoQRCode Enable/disable QR Code during pauses inbetween two songs.
 * @apiParam {Boolean} EngineDisplayNickname Enable/disable displaying the username who requested a song.
 * @apiParam {Boolean} EngineFreeUpvotes Enable/disable Free Songs By Upvotes feature
 * @apiParam {Number} EngineFreeUpvotesRequiredMin Minimum number of upvotes required to free a song
 * @apiParam {Number} EngineFreeUpvotesRequiredPercent Minimum percent of upvotes / online users required to free a song
 * @apiParam {Number} EngineJinglesInterval Interval in number of songs between two jingles. 0 to disable entirely.
 * @apiParam {Boolean} EnginePrivateMode `false` = Public Karaoke mode, `true` = Private Karaoke Mode. See documentation.
 * @apiParam {Boolean} EngineRepeatPlaylist Enable/disable auto repeat playlist when at end.
 * @apiParam {Boolean} EngineSmartInsert Enable/disable smart insert of songs in the playlist.
 * @apiParam {Number} EngineSongsPerUser Number of songs allowed per person.
 * @apiParam {Boolean} PlayerFullscreen Enable/disable full screen mode
 * @apiParam {Boolean} PlayerNoBar `true` = Hide progress bar / `false` = Show progress bar
 * @apiParam {Boolean} PlayerNoHud `true` = Hide HUD / `false` = Show HUD
 * @apiParam {Boolean} PlayerPIP Enable/disable Picture-in-picture mode
 * @apiParam {String=Left,Center,Right} PlayerPIPPositionX Horizontal position of PIP screen
 * @apiParam {String=Top,Center,Bottom} PlayerPIPPositionY Vertical position of PIP screen
 * @apiParam {Number} PlayerPIPSize Size in percentage of the PIP screen
 * @apiParam {Number} PlayerScreen Screen number to display the videos on. If screen number is not available, main screen is used. `9` means autodetection.
 * @apiParam {Boolean} PlayerStayOnTop Enable/disable stay on top of all windows.  
 * @apiParam {Number} WebappMode Webapp public mode : `0` = closed, no public action available, `1` = only show song information and playlists, no karaoke can be added by the user, `2` = default, open mode.
 * @apiParam {Boolean} PlayerStayOnTop Enable/disable stay on top of all windows.
 * @apiSuccess {Object} data Contains all configuration settings. See example or documentation for what each setting does.
 *
 * @apiSuccessExample Success-Response:
 * HTTP/1.1 200 OK
 */
	/**
 * @api {get} /public/settings Get settings (public)
 * @apiName GetSettingsPublic
 * @apiVersion 2.1.0
 * @apiGroup Main
 * @apiPermission public
 * @apiDescription Contrary to `admin/settings` path, this one doesn't return things like paths, binaries or admin password information.
 * @apiSuccess {Object} data Contains all configuration settings. See example or documentation for what each setting does.
 *
 * @apiSuccessExample Success-Response:
 * HTTP/1.1 200 OK
 * {
 *   "data": {
 *       "EngineAllowNicknameChange": "1",
 *       "EngineAllowViewBlacklist": "1",
 *       "EngineAllowViewBlacklistCriterias": "1",
 *       "EngineAllowViewWhitelist": "1",
 *       "EngineAutoPlay": "0",
 *       "EngineDefaultLocale": "fr",
 *       "EngineDisplayConnectionInfo": "1",
 *       "EngineDisplayConnectionInfoHost": "",
 *       "EngineDisplayConnectionInfoMessage": "",
 *       "EngineDisplayConnectionInfoQRCode": "1",
 *       "EngineDisplayNickname": "1",
 * 		 "EngineFreeUpvotes": "1",
 * 		 "EngineFreeUpvotesPercent": "33",
 * 		 "EngineFreeUpvotesMin": "4",
 *       "EngineJinglesInterval": "1",
 *       "EnginePrivateMode": "1",
 *       "EngineRepeatPlaylist": "0",
 *       "EngineSmartInsert": "1",
 *       "EngineSongsPerUser": "10000",
 *       "PlayerBackground": "",
 *       "PlayerFullscreen": "0",
 *       "PlayerNoBar": "1",
 *       "PlayerNoHud": "1",
 *       "PlayerPIP": "1",
 *       "PlayerPIPPositionX": "Left",
 *       "PlayerPIPPositionY": "Bottom",
 *       "PlayerPIPSize": "30",
 *       "PlayerScreen": "0",
 *       "PlayerStayOnTop": "1",
 *       "VersionName": "Finé Fiévreuse",
 *       "VersionNo": "v2.0 Release Candidate 1",
 *       "mpvVideoOutput": "direct3d",
 * 		 "WebappMode": "2"
 *   }
 * }
 */
		.get(async (req, res) => {
			//We don't want to return all settings.
			let settings = {};
			const conf = getConfig();
			for (var key in conf) {
				if (conf.hasOwnProperty(key)) {
					if (!key.startsWith('Path') &&
						!key.startsWith('Bin') &&
						!key.startsWith('appPath') &&
						!key.startsWith('Jwt') &&
						!key.startsWith('is') &&
						!key.startsWith('mpv') &&
						!key.startsWith('os')
					) {
						settings[key] = conf[key];
					}
				}
			}
			res.json(OKMessage(settings));
		});				
	router.route('/stats')
	/**
 * @api {get} /public/stats Get statistics
 * @apiName GetStats
 * @apiVersion 2.0.0
 * @apiGroup Main
 * @apiPermission public
 * @apiDescription Returns various stats on the current Karaoke Mugen instance
 * @apiSuccess {Number} totalartists Total number of artists in database
 * @apiSuccess {Number} totalcount Total number of karaokes in database
 * @apiSuccess {Number} totalduration Sum of all karaoke durations in seconds.
 * @apiSuccess {Number} totallanguages Total number of different languages in database
 * @apiSuccess {Number} totalplaylists Total number of playlists in database
 * @apiSuccess {Number} totalseries Total number of series in database
 *
 * @apiSuccessExample Success-Response:
 * HTTP/1.1 200 OK
 * {
 *    "data": {
 *        "totalartists": 542,
 *        "totalcount": 4924,
 *        "totalduration": 0,
 *        "totallanguages": 16,
 *        "totalplaylists": 5,
 *        "totalseries": 2525
 *    }
 * }
 */
