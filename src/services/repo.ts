import { basename,resolve } from 'path';

import { deleteRepo, insertRepo,selectRepos, updateRepo } from '../dao/repo';
import { Repository } from '../lib/types/repo';
import { deleteOldPaths, getConfig, resolvedPathRepos,setConfig } from '../lib/utils/config';
import { asyncCheckOrMkdir, asyncCopy,asyncExists, asyncMoveAll, asyncReadDir, extractAllFiles, relativePath, resolveFileInDirs } from '../lib/utils/files';
import { getState } from '../utils/state';
import cloneDeep = require('lodash.clonedeep');
import { compareKarasChecksum, generateDB } from '../dao/database';
import { editKaraInStore } from '../dao/dataStore';
import { refreshKaras } from '../lib/dao/kara';
import { writeKara } from '../lib/dao/karafile';
import { readAllKaras,readAllTags } from '../lib/services/generation';
import { Kara,KaraTag } from '../lib/types/kara';
import { Tag } from '../lib/types/tag';
import { tagTypes } from '../lib/utils/constants';
import logger from '../lib/utils/logger';
import Task from '../lib/utils/taskManager';
import { DifferentChecksumReport } from '../types/repo';
import sentry from '../utils/sentry';
import { getRemoteKaras } from './download';
import { editKaraInDB } from './kara';
import { getTag } from './tag';

type UUIDSet = Set<string>

/** Get all repositories in database */
export function getRepos() {
	return selectRepos();
}

/** Get single repository */
export function getRepo(name: string) {
	return selectRepos()
		.filter((r: Repository) => r.Name === name)[0];
}

/** Remove a repository */
export function removeRepo(name: string) {
	if (!getRepo(name)) throw {code: 404};
	deleteRepo(name);
	logger.info(`Removed ${name}`, {service: 'Repo'});
}

/** Add a repository. Folders will be created if necessary */
export async function addRepo(repo: Repository) {
	if (repo.Online) {
		// Testing if repository is reachable
		const karas = await getRemoteKaras(repo.Name, {from: 1, size: 1});
		if (karas.content.length === 0) throw {code: 404, msg: 'Repository unreachable. Did you mispell its name?'};
	}
	insertRepo(repo);
	await checkRepoPaths(repo);
	logger.info(`Added ${repo.Name}`, {service: 'Repo'});
}

/** Edit a repository. Folders will be created if necessary */
export async function editRepo(name: string, repo: Repository) {
	const oldRepo = getRepo(name);
	if (!oldRepo) throw {code: 404};
	if (!oldRepo.Online && repo.Online) {
		// Testing if repository is reachable
		const karas = await getRemoteKaras(repo.Name, {from: 1, size: 1});
		if (karas.content.length === 0) throw {code: 404, msg: 'Repository unreachable. Did you mispell its name?'};
	}
	updateRepo(repo, name);
	await checkRepoPaths(repo);
	if (oldRepo.Enabled !== repo.Enabled) {
		if (await compareKarasChecksum()) generateDB();
	}
	logger.info(`Updated ${name}`, {service: 'Repo'});
}

export async function compareLyricsChecksums(repo1Name: string, repo2Name: string): Promise<DifferentChecksumReport[]> {
	if (!getRepo(repo1Name) || !getRepo(repo2Name)) throw {code: 404};
	// Get all files
	const task = new Task({
		text: 'COMPARING_LYRICS_IN_REPOS'
	});
	try {
		const [repo1Files, repo2Files] = await Promise.all([
			extractAllFiles('Karas', repo1Name),
			extractAllFiles('Karas', repo2Name)
		]);
		const [karas1, karas2] = await Promise.all([
			readAllKaras(repo1Files, false, task),
			readAllKaras(repo2Files, false, task)
		]);
		type KaraMap = Map<string, Kara>;
		const karas1Map: KaraMap = new Map();
		const karas2Map: KaraMap = new Map();
		karas1.forEach(k => karas1Map.set(k.kid, k));
		karas2.forEach(k => karas2Map.set(k.kid, k));
		const differentChecksums = [];
		karas1Map.forEach(kara1 => {
			const kara2 = karas2Map.get(kara1.kid);
			if (kara2) {
				if (kara2.subchecksum !== kara1.subchecksum) differentChecksums.push({
					kara1: kara1,
					kara2: kara2
				});
			}
		});
		return differentChecksums;
	} catch(err) {
		const error = new Error(err);
		sentry.error(error);
		throw error;
	} finally {
		task.end();
	}
}

export async function copyLyricsRepo(report: DifferentChecksumReport[]) {
	const task = new Task({
		text: 'COPYING_LYRICS_IN_REPOS',
		total: report.length
	});
	try {
		for (const karas of report) {
			task.update({
				subtext: karas.kara2.subfile
			});
			// Copying kara1 data to kara2
			karas.kara2.subchecksum = karas.kara1.subchecksum;
			karas.kara2.isKaraModified = true;
			const writes = [];
			writes.push(writeKara(karas.kara2.karafile, karas.kara2));
			const sourceLyrics = await resolveFileInDirs(karas.kara1.subfile, resolvedPathRepos('Lyrics', karas.kara1.repository));
			const destLyrics = await resolveFileInDirs(karas.kara2.subfile, resolvedPathRepos('Lyrics', karas.kara2.repository));
			writes.push(asyncCopy(sourceLyrics[0], destLyrics[0], { overwrite: true }));
			writes.push(editKaraInDB(karas.kara2, { refresh: false }));
			await Promise.all(writes);
			editKaraInStore(karas.kara2.karafile);
			task.incr();
		}
		refreshKaras();
	} catch(err) {
		const error = new Error(err);
		sentry.error(error);
		throw error;
	} finally {
		task.end();
	}
}

function checkRepoPaths(repo: Repository) {
	const checks = [];
	for (const path of Object.keys(repo.Path)) {
		repo.Path[path].forEach((dir: string) => checks.push(asyncCheckOrMkdir(resolve(getState().dataPath, dir))));
	}
	return Promise.all(checks);
}

/** Find any unused medias in a repository */
export async function findUnusedMedias(repo: string): Promise<string[]> {
	if (!getRepo(repo)) throw {code: 404};
	const task = new Task({
		text: 'FINDING_UNUSED_MEDIAS'
	});
	try {
		const [karaFiles, mediaFiles] = await Promise.all([
			extractAllFiles('Karas', repo),
			extractAllFiles('Medias', repo)
		]);
		let mediaFilesFiltered: string[];
		const karas = await (readAllKaras(karaFiles, false, task));
		karas.forEach(k => {
			mediaFilesFiltered = mediaFiles.filter(file => basename(file) !== k.mediafile);
		});
		return mediaFilesFiltered;
	} catch(err) {
		const error = new Error(err);
		sentry.error(error);
		throw error;
	} finally {
		task.end();
	}
}

/** Find any unused tags in a repository */
export async function findUnusedTags(repo: string): Promise<Tag[]> {
	if (!getRepo(repo)) throw {code: 404};
	const task = new Task({
		text: 'FINDING_UNUSED_TAGS'
	});
	try {
		const [karaFiles, tagFiles] = await Promise.all([
			extractAllFiles('Karas', repo),
			extractAllFiles('Tags', repo)
		]);
		task.update({
			total: karaFiles.length + tagFiles.length
		});
		const karas = await readAllKaras(karaFiles, false, task);
		const tags = await readAllTags(tagFiles, task);
		task.update({
			total: 0
		});
		const tids: UUIDSet = new Set();
		tags.forEach(t => tids.add(t.tid));
		for (const kara of karas) {
			for (const tagType of Object.keys(tagTypes)) {
				if (kara[tagType]) kara[tagType].forEach((t: KaraTag) => tids.delete(t.tid));
			}
		}
		// Now tids only has tag IDs which aren't used anywhere
		const tagsToDelete: Tag[] = [];
		for (const tid of tids) {
			tagsToDelete.push(await getTag(tid));
		}
		return tagsToDelete;
	} catch(err) {
		const error = new Error(err);
		sentry.error(error);
		throw error;
	} finally {
		task.end();
	}
}

/** Migrate old data architecture to the new one */
export async function migrateOldFoldersToRepo() {
	/* We're assuming that kara.moe is the standard repo everyone has
	1) This instance is fresh : no dataPath/data should exist, exit immediately
	2) There is something in config.Path.Karas, Medias, Lyrics, Series and/or Tags : assume we have a customized install
	3) dataPath/data exists, and there is nothing in config.Path.Karas => this is a standard KM instance, in this case we overwrite the kara.moe paths with these
	*/
	const conf = getConfig();
	const state = getState();
	// Case 1
	if (!await asyncExists(resolve(state.dataPath, 'data/')) &&
		!conf.System.Path.Karas &&
		!conf.System.Path.Medias &&
		!conf.System.Path.Lyrics &&
		!conf.System.Path.Series &&
		!conf.System.Path.Tags) {
		logger.info('Initialization - Fresh start configuration', {service: 'Repo'});
		return;
	}
	// Case 2
	if ((conf.System.Path.Karas && conf.System.Path.Karas.length > 0) ||
		(conf.System.Path.Lyrics && conf.System.Path.Lyrics.length > 0) ||
		(conf.System.Path.Medias && conf.System.Path.Medias.length > 0) ||
		(conf.System.Path.Series && conf.System.Path.Series.length > 0) ||
		(conf.System.Path.Tags && conf.System.Path.Tags.length > 0)
	) {
		logger.info('Initialization - Customized configuration', {service: 'Repo'});
		const repos = cloneDeep(conf.System.Repositories);
		repos[0].Path.Karas = [].concat(conf.System.Path.Karas);
		repos[0].Path.Lyrics = [].concat(conf.System.Path.Lyrics);
		repos[0].Path.Series = [].concat(conf.System.Path.Series);
		repos[0].Path.Tags = [].concat(conf.System.Path.Tags);
		repos[0].Path.Medias = [].concat(conf.System.Path.Medias);

		// Treat all secondary targets as local repository and remove them from first (kara.moe) repository
		for (const type of Object.keys(repos[0].Path)) {
			if (repos[0].Path[type].length > 1) {
				repos[1].Path[type] = repos[0].Path[type].filter((_: any, i: number) => i > 0);
				repos[0].Path[type] = repos[0].Path[type].filter((_: any, i: number) => i === 0);
			}
		}
		deleteOldPaths();
		setConfig({
			System: {
				Repositories: cloneDeep(repos),
			}
		});
	}
	// Case 3
	if (await asyncExists(resolve(state.dataPath, 'data/')) &&
		!await asyncExists(resolve(state.dataPath, conf.System.Repositories[0].Path.Karas[0]))) {
		logger.info('Initialization - KM <3.2 configuration', {service: 'Repo'});
		const repos = cloneDeep(conf.System.Repositories);
		repos[0].Path.Karas = ['data/karaokes'];
		repos[0].Path.Lyrics = ['data/lyrics'];
		repos[0].Path.Series = ['data/series'];
		repos[0].Path.Tags = ['data/tags'];
		repos[0].Path.Medias = ['data/medias'];
		deleteOldPaths();
		setConfig({
			System: {
				Repositories: cloneDeep(repos),
			}
		});
	}
}

export async function consolidateRepo(repoName: string, newPath: string) {
	const task = new Task({
		text: 'CONSOLIDATING_REPO',
		subtext:  repoName
	});
	try {
		const repo = getRepo(repoName);
		const state = getState();
		if (!repo) throw 'Unknown repository';
		if (!await asyncExists(newPath)) throw 'Directory not found';
		logger.info(`Moving ${repoName} repository to ${newPath}...`, {service: 'Repo'});
		const moveTasks = [];
		let files = 0;
		for (const type of Object.keys(repo.Path)) {
			for (const dir of repo.Path[type]) {
				const dirFiles = await asyncReadDir(resolve(state.dataPath, dir));
				files = files + dirFiles.length;
			}
		}
		task.update({
			total: files
		});
		for (const dir of repo.Path.Karas) {
			moveTasks.push(resolve(state.dataPath, dir), resolve(newPath, 'karaokes/'));
		}
		for (const dir of repo.Path.Lyrics) {
			moveTasks.push(asyncMoveAll(resolve(state.dataPath, dir), resolve(newPath, 'lyrics/')));
		}
		for (const dir of repo.Path.Series) {
			moveTasks.push(asyncMoveAll(resolve(state.dataPath, dir), resolve(newPath, 'series/')));
		}
		for (const dir of repo.Path.Tags) {
			moveTasks.push(await asyncMoveAll(resolve(state.dataPath, dir), resolve(newPath, 'tags/')));
		}
		for (const dir of repo.Path.Medias) {
			moveTasks.push(asyncMoveAll(resolve(state.dataPath, dir), resolve(newPath, 'medias/')));
		}
		await Promise.all(moveTasks);
		repo.Path.Karas = [relativePath(state.dataPath, resolve(newPath, 'karaokes/'))];
		repo.Path.Lyrics = [relativePath(state.dataPath, resolve(newPath, 'lyrics/'))];
		repo.Path.Medias = [relativePath(state.dataPath, resolve(newPath, 'medias/'))];
		repo.Path.Series = [relativePath(state.dataPath, resolve(newPath, 'series/'))];
		repo.Path.Tags = [relativePath(state.dataPath, resolve(newPath, 'tags/'))];
		await editRepo(repoName, repo);
	} catch(err) {
		logger.error(`Failed to move repo ${name}`, {service: 'Repo', obj: err});
		throw err;
	} finally {
		task.end();
	}
}
