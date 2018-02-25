// SQL for kara management

export const addKaraToPlaylist = `INSERT INTO playlist_content(
									fk_id_playlist,
									fk_id_kara,
									kid,
									created_at,
									fk_id_user,									
									pos,
									flag_playing,
									pseudo_add,
									NORM_pseudo_add) 
								SELECT $playlist_id,$kara_id,k.kid,$created_at,$user_id,$pos,0,u.nickname,u.NORM_nickname
								FROM karasdb.kara AS k,
								     user AS u							
								WHERE pk_id_kara = $kara_id
									AND u.pk_id_user = $user_id;
								`;

export const addKaraToWhitelist = `INSERT INTO whitelist(fk_id_kara,kid,created_at)
								SELECT $kara_id,kid,$created_at
								FROM karasdb.kara
								WHERE PK_id_kara = $kara_id;
								`;

export const addViewcount = `INSERT INTO viewcount(
								fk_id_kara,
								kid,
								modified_at) 
							VALUES($kara_id,$kid,$modified_at);
							`;

export const getAllKaras = `SELECT ak.kara_id AS kara_id,
      							ak.kid AS kid,
      							ak.title AS title,
								ak.NORM_title AS NORM_title,
      							ak.songorder AS songorder,
      							ak.serie AS serie,
      							ak.NORM_serie AS NORM_serie,
      							ak.serie_altname AS serie_altname,
      							ak.NORM_serie_altname AS NORM_serie_altname,
      							ak.singer AS singer,
      							ak.NORM_singer AS NORM_singer,
      							ak.songtype AS songtype,      
      							ak.creator AS creator,
	  							ak.songwriter AS songwriter,
	  							ak.NORM_songwriter AS NORM_songwriter,
	  							ak.year AS year,
	  							ak.NORM_creator AS NORM_creator,
      							ak.language AS language,
      							ak.author AS author,
      							ak.NORM_author AS NORM_author,
      							ak.misc AS misc,
								ak.viewcount AS viewcount,      
      							ak.videofile AS videofile,
      							ak.videolength AS duration,
								ak.gain AS gain,
								(CASE WHEN $dejavu_time > (SELECT max(modified_at) FROM viewcount WHERE fk_id_kara = ak.kara_id)
	     							THEN 1
        							ELSE 0
      							END) AS flag_dejavu,
								(SELECT max(vc.modified_at) FROM viewcount AS vc WHERE vc.fk_id_kara = ak.kara_id) AS lastplayed_at
							FROM karasdb.all_karas AS ak							
 							WHERE ak.kara_id NOT IN (SELECT fk_id_kara FROM blacklist)
							ORDER BY ak.language, ak.serie IS NULL, ak.serie, ak.songtype, ak.songorder, ak.title
							`;

export const getKaraByKID = `SELECT ak.kara_id AS kara_id,
								ak.kid AS kid,
      							ak.title AS title,
      							ak.NORM_title AS NORM_title,
      							ak.songorder AS songorder,
      							ak.serie AS serie,
      							ak.NORM_serie AS NORM_serie,
      							ak.serie_altname AS serie_altname,
      							ak.NORM_serie_altname AS NORM_serie_altname,
      							ak.singer AS singer,
      							ak.NORM_singer AS NORM_singer,
      							ak.songtype AS songtype,      
      							ak.creator AS creator,
      							ak.NORM_creator AS NORM_creator,
      							ak.language AS language,
      							ak.author AS author,
      							ak.NORM_author AS NORM_author,
      							ak.misc AS misc,
	  							ak.viewcount AS viewcount,      
      							ak.videofile AS videofile,
	  							ak.videolength AS duration,
		  						ak.gain AS gain,
								(CASE WHEN $dejavu_time > (SELECT max(modified_at) FROM viewcount WHERE fk_id_kara = ak.kara_id)
	     							THEN 1
        							ELSE 0
      							END) AS flag_dejavu,
								(SELECT max(vc.modified_at) FROM viewcount AS vc WHERE vc.fk_id_kara = ak.kara_id) AS lastplayed_at
							FROM all_karas AS ak
							WHERE ak.kid = $kid;
							`;

export const getKara = `SELECT ak.kara_id AS kara_id,
    						ak.kid AS kid,
      						ak.title AS title,
      						ak.NORM_title AS NORM_title,
      						ak.songorder AS songorder,
      						ak.serie AS serie,
      						ak.NORM_serie AS NORM_serie,
      						ak.serie_altname AS serie_altname,
      						ak.NORM_serie_altname AS NORM_serie_altname,
      						ak.singer AS singer,
      						ak.NORM_singer AS NORM_singer,
      						ak.songtype AS songtype,
	  						ak.songwriter AS songwriter,
	  						ak.NORM_songwriter AS NORM_songwriter,
	  						ak.year AS year,  
      						ak.creator AS creator,
      						ak.NORM_creator AS NORM_creator,
      						ak.language AS language,
      						ak.author AS author,
      						ak.NORM_author AS NORM_author,
      						ak.misc AS misc,
	  						ak.viewcount AS viewcount,      
      						ak.videofile AS videofile,
	  						ak.videolength AS duration,
	  						ak.gain AS gain,
							(CASE WHEN $dejavu_time > (SELECT max(modified_at) FROM viewcount WHERE fk_id_kara = ak.kara_id)
	     						THEN 1
        						ELSE 0
      						END) AS flag_dejavu,
							(SELECT max(vc.modified_at) FROM viewcount AS vc WHERE vc.fk_id_kara = ak.kara_id) AS lastplayed_at
 						FROM karasdb.all_karas AS ak
						WHERE ak.kara_id = $kara_id  						  
  						`;

export const getASS = `SELECT a.ass AS ass
  					FROM karasdb.ass AS a
 					WHERE a.fk_id_kara = $kara_id;
					 `;

export const isKara = `SELECT pk_id_kara 
					FROM karasdb.kara 
					WHERE pk_id_kara = $kara_id;
					`;

export const isKaraInPlaylist = `SELECT fk_id_kara 
							FROM playlist_content 
							WHERE fk_id_playlist = $playlist_id 
							  AND fk_id_kara = $kara_id;
								`;

export const updateTotalViewcounts = `UPDATE karasdb.kara SET viewcount = 
									(SELECT COUNT(kid) FROM viewcount WHERE kid=$kid)
									WHERE kid=$kid;
									`;

export const removeKaraFromPlaylist = `DELETE FROM playlist_content 
									WHERE pk_id_plcontent IN ($playlistcontent_id);
									`;

export const removeKaraFromWhitelist = `DELETE FROM whitelist 
									WHERE pk_id_whitelist = $wlc_id;
									`;

export const getSongCountPerUser = `SELECT COUNT(1) AS count
									FROM playlist_content AS pc, user AS u
									WHERE u.login = $username
									  AND u.pk_id_user = pc.fk_id_user
									  AND pc.fk_id_playlist = $playlist_id
									  AND pc.pos > IFNULL((select pos from playlist_content WHERE flag_playing  = 1),0)
									`;

