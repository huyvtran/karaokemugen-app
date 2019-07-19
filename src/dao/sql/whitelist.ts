import { LangClause } from "../../types/database";

// SQL for whitelist management

export const emptyWhitelist = 'DELETE FROM whitelist;';

export const addKaraToWhitelist = `
INSERT INTO whitelist(
	fk_kid,
	created_at,
	reason
)
VALUES (
	$1,
	$2,
	$3
) ON CONFLICT DO NOTHING;
`;

export const getWhitelistContents = (filterClauses: string[], lang: LangClause, limitClause: string, offsetClause: string) => `
SELECT
  ak.kid AS kid,
  ak.title AS title,
  ak.songorder AS songorder,
  COALESCE(
	  (SELECT array_to_string (array_agg(name), ', ') FROM all_kara_serie_langs WHERE kid = ak.kid AND lang = ${lang.main}),
	  (SELECT array_to_string (array_agg(name), ', ') FROM all_kara_serie_langs WHERE kid = ak.kid AND lang = ${lang.fallback}),
	  ak.serie) AS serie,
  ak.serie AS serie_orig,
  ak.serie_altname AS serie_altname,
  ak.sid AS sid,
  ak.seriefiles AS seriefiles,
  COALESCE(ak.singers, '[]'::jsonb) AS singers,
  COALESCE(ak.songtypes, '[]'::jsonb) AS songtypes,
  COALESCE(ak.creators, '[]'::jsonb) AS creators,
  COALESCE(ak.songwriters, '[]'::jsonb) AS songwriters,
  ak.year AS year,
  COALESCE(ak.languages, '[]'::jsonb) AS langs,
  COALESCE(ak.authors, '[]'::jsonb) AS authors,
  COALESCE(ak.groups, '[]'::jsonb) AS groups,
  COALESCE(ak.misc, '[]'::jsonb) AS misc,
  COALESCE(ak.origins, '[]'::jsonb) AS origins,
  COALESCE(ak.platforms, '[]'::jsonb) AS platforms,
  COALESCE(ak.families, '[]'::jsonb) AS families,
  COALESCE(ak.genres, '[]'::jsonb) AS genres,  ak.created_at AS created_at,
  ak.modified_at AS modified_at,
  wl.created_at AS whitelisted_at,
  wl.reason AS reason
  FROM all_karas AS ak
  INNER JOIN whitelist AS wl ON wl.fk_kid = ak.kid
  WHERE 1 = 1
  ${filterClauses.map(clause => 'AND (' + clause + ')').reduce((a, b) => (a + ' ' + b), '')}
ORDER BY ak.languages_sortable, ak.serie_singer_sortable, ak.songtypes_sortable DESC, ak.songorder, lower(unaccent(ak.title))
${limitClause}
${offsetClause}
`;

export const removeKaraFromWhitelist = `
DELETE FROM whitelist
WHERE fk_kid = $1;
`;

