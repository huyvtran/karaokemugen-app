import { checksum, extractAllFiles, asyncStat } from "../lib/utils/files";
import logger, { profile } from "../lib/utils/logger";
import Bar from "../lib/utils/bar";
import parallel from 'async-await-parallel';

let dataStore = {
	karas: new Map(),
	series: new Map(),
	tags: new Map()
};

export async function addKaraToStore(file: string) {
	const stats = await asyncStat(file);
	dataStore.karas.set(file, stats.mtimeMs);
}

export async function addSeriesToStore(file: string) {
	const stats = await asyncStat(file);
	dataStore.series.set(file, stats.mtimeMs);
}

export async function addTagToStore(file: string) {
	const stats = await asyncStat(file);
	dataStore.tags.set(file, stats.mtimeMs);
}

export function sortKaraStore() {
	dataStore.karas = new Map([...dataStore.karas.entries()].sort());
}

export function sortSeriesStore() {
	dataStore.series = new Map([...dataStore.series.entries()].sort());
}

export function sortTagsStore() {
	dataStore.tags = new Map([...dataStore.tags.entries()].sort());
}

export function getStoreChecksum() {
	const store = JSON.stringify({
		karas: [...dataStore.karas.entries()],
		tags: [...dataStore.tags.entries()],
		series: [...dataStore.series.entries()]
	}, null, 2);
	return checksum(store);
}

export async function editKaraInStore(file: string) {
	const stats = await asyncStat(file);
	dataStore.karas.set(file, stats.mtimeMs);
}

export function removeKaraInStore(file: string) {
	dataStore.karas.delete(file);
}

export async function editSeriesInStore(file: string) {
	const stats = await asyncStat(file);
	dataStore.series.set(file, stats.mtimeMs);
}

export async function editTagInStore(file: string) {
	const stats = await asyncStat(file);
	dataStore.tags.set(file, stats.mtimeMs);
}

export function removeTagInStore(tid: string) {
	dataStore.tags.delete(tid);
}

export function removeSeriesInStore(sid: string) {
	dataStore.series.delete(sid);
}

async function processDataFile(file: string, silent?: boolean, bar?: any) {
	if (file.endsWith('kara.json')) await addKaraToStore(file);
	if (file.endsWith('series.json')) await addSeriesToStore(file);
	if (file.endsWith('tag.json')) await addTagToStore(file);
	if (!silent) bar.incr();
}

export async function baseChecksum(silent?: boolean) {
	profile('baseChecksum');
	try {
		let bar: any;
		const [karaFiles, seriesFiles, tagFiles] = await Promise.all([
			extractAllFiles('Karas'),
			extractAllFiles('Series'),
			extractAllFiles('Tags')
		]);
		const fileCount = karaFiles.length + seriesFiles.length + tagFiles.length
		if (karaFiles.length === 0) return null;
		logger.info(`[Store] Found ${karaFiles.length} karas, ${seriesFiles.length} series and ${tagFiles.length} tags`)
		if (!silent) bar = new Bar({
			message: 'Checking files...    '
		}, fileCount);
		const files = [].concat(karaFiles, seriesFiles, tagFiles);
		const promises = [];
		files.forEach(f => promises.push(() => processDataFile(f, silent, bar)));
		await parallel(promises, 32);
		sortKaraStore();
		sortSeriesStore();
		sortTagsStore();
		if (!silent) bar.stop();
		const checksum = getStoreChecksum();
		logger.debug(`[Store] Store checksum : ${checksum}`);
		return checksum;
	} catch(err) {
		logger.warn(`[Store] Unable to browse through your data files : ${err}`)
	} finally {
		profile('baseChecksum');
	}

}