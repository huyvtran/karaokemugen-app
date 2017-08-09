SELECT wl.pk_id_whitelist AS id_whitelist, 
      ak.pk_id_kara AS id_kara,
      ak.kid AS kid,
      ak.title AS title,
      ak.NORM_title AS NORM_title,
      ak.viewcount AS viewcount,
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
      ak.videolength AS duration,  
      wl.wl_date AS date_add,
      wl.wl_reason AS reason_add,
      ak.subfile AS subfile,
      ak.videofile AS videofile
 FROM karasdb.all_karas AS ak 
INNER JOIN whitelist AS wl ON wl.fk_id_kara = ak.pk_id_kara
ORDER BY ak.language, ak.serie IS NULL, ak.serie, ak.songtype, ak.songorder, ak.title