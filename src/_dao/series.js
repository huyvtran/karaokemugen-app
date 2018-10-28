import {langSelector, paramWords, getUserDb} from './database';
import deburr from 'lodash.deburr';
import { sanitizeFile } from '../_common/utils/files';

const sql = require('../_common/db/series');

export function buildClausesSeries(words) {
	const params = paramWords(words);
	let sql = [];
	for (const i in words.split(' ').filter(s => !('' === s))) {
		sql.push(`s.NORM_name LIKE $word${i} OR
		s.NORM_altname LIKE $word${i} OR
		NORM_i18n_name LIKE $word${i}`);
	}
	return {
		sql: sql,
		params: params
	};
}

export async function selectAllSeries(filter, lang) {
	const filterClauses = filter ? buildClausesSeries(filter) : {sql: [], params: {}};const query = sql.getSeries(filterClauses.sql, langSelector(lang));

	let series = await getUserDb().all(query, filterClauses.params);
	series.forEach((serie, i) => {
		if (!series[i].aliases) series[i].aliases = [];
		if (!Array.isArray(series[i].aliases)) series[i].aliases = series[i].aliases.split(',');
		series[i].i18n = JSON.parse(serie.i18n);
	});
	return series;
}

export async function selectSerieByName(name) {
	return await getUserDb().get(sql.getSerieByName, {$name: name});
}

export async function insertSerie(serieObj) {
	let aliases;
	Array.isArray(serieObj.aliases) ? aliases = serieObj.aliases.join(',') : aliases = null;
	const res = await getUserDb().run(sql.insertSerie, {
		$name: serieObj.name,
		$NORM_name: deburr(serieObj.name),
		$altname: aliases,
		$NORM_altname: deburr(aliases),
		$seriefile: `${sanitizeFile(serieObj.name)}.series.json`
	});
	return res.lastID;
}

export async function insertSeriei18n(serie_id, serieObj) {
	for (const lang of Object.keys(serieObj.i18n)) {
		await getUserDb().run(sql.insertSeriei18n, {
			$id_serie: serie_id,
			$lang: lang,
			$name: serieObj.i18n[lang],
			$NORM_name: deburr(serieObj.i18n[lang])
		});
	}
}

export async function updateSerie(serie_id, serie) {
	let aliases;
	Array.isArray(serie.aliases) ? aliases = serie.aliases.join(',') : aliases = null;
	console.log(serie);
	await getUserDb().run(sql.updateSerie, {
		$serie_id: serie_id,
		$name: serie.name,
		$NORM_name: deburr(serie.name),
		$altname: aliases,
		$NORM_altname: deburr(aliases),
		$seriefile: `${sanitizeFile(serie.name)}.series.json`
	});
	await getUserDb().run(sql.deleteSeriesi18n, {$serie_id: serie_id});
	return await insertSeriei18n(serie_id, serie);
}

export async function checkOrCreateSerie(serie,lang) {
	const serieDB = await getUserDb().get(sql.getSerieByName, {
		$name: serie
	});
	if (serieDB) return serieDB.serie_id;
	//Series does not exist, create it.
	const res = await getUserDb().run(sql.insertSerie, {
		$name: serie,
		$NORM_name: deburr(serie)
	});
	await getUserDb().run(sql.insertSeriei18nDefault, {
		$id_serie: res.lastID,
		$lang: lang,
		$name: serie,
		$NORM_name: deburr(serie)
	});
	return res.lastID;
}

export async function updateKaraSeries(kara_id, series) {
	await getUserDb().run(sql.deleteSeriesByKara, { $kara_id: kara_id });
	for (const serie of series) {
		await getUserDb().run(sql.insertKaraSeries, {
			$kara_id: kara_id,
			$serie_id: serie
		});
	}
}

export async function selectSerie(serie_id, lang) {
	const query = sql.getSerieByID(langSelector(lang));
	let series = await getUserDb().get(query, {$serie_id: serie_id});
	series.i18n = JSON.parse(series.i18n);
	if (!series.aliases) series.aliases = [];
	if (!Array.isArray(series.aliases)) series.aliases = series.aliases.split(',');
	return series;
}

export async function removeSerie(serie_id) {
	return await Promise.all([
		getUserDb().run(sql.deleteSeries, {$serie_id: serie_id}),
		getUserDb().run(sql.deleteSeriesi18n, {$serie_id: serie_id})
	]);
}