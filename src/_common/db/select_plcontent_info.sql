SELECT fk_id_playlist AS playlist_id,
       fk_id_kara AS kara_id,
       pos       
FROM   playlist_content
WHERE  pk_id_plcontent = $playlistcontent_id