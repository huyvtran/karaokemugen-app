ALTER TABLE session ADD COLUMN private BOOLEAN DEFAULT FALSE;
UPDATE session SET private = FALSE;