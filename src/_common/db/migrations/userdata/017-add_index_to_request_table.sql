-- Up

CREATE INDEX index_request_fk_id_kara ON request (
	fk_id_kara
);

-- Down

DROP INDEX index_request_fk_id_kara;