import {getUserDb} from './database';
const sql = require('./sql/stats');

export async function exportViewcounts() {
	return await getUserDb().all(sql.exportViewcounts);
}

export async function exportRequests() {
	return await getUserDb().all(sql.exportRequests);
}

export async function exportFavorites() {
	return await getUserDb().all(sql.exportFavorites);
}