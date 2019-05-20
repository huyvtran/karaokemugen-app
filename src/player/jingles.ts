import {isMediaFile, asyncReadDir} from '../utils/files';
import {resolve} from 'path';
import {resolvedPathJingles} from '../utils/config';
import {getMediaInfo} from '../utils/ffmpeg';
import logger from 'winston';
import sample from 'lodash.sample';
import { Jingle } from '../types/jingles';

let allJingles = [];
let currentJingles = [];

async function extractAllJingleFiles(): Promise<string[]> {
	let jingleFiles = [];
	for (const resolvedPath of resolvedPathJingles()) {
		jingleFiles = jingleFiles.concat(await extractJingleFiles(resolvedPath));
	}
	return jingleFiles;
}

async function extractJingleFiles(jingleDir: string): Promise<string[]> {
	const jingleFiles = [];
	const dirListing = await asyncReadDir(jingleDir);
	for (const file of dirListing) {
		if (isMediaFile(file)) {
			jingleFiles.push(resolve(jingleDir, file));
		}
	}
	return jingleFiles;
}

async function getAllVideoGains(jingleFiles: string[]): Promise<Jingle[]> {
	let jinglesList = [];
	for (const jinglefile of jingleFiles) {
		const videodata = await getMediaInfo(jinglefile);
		jinglesList.push(
			{
				file: jinglefile,
				gain: videodata.gain
			});
		logger.debug(`[Jingles] Computed jingle ${jinglefile} audio gain at ${videodata.gain} dB`);
	}
	return jinglesList;
}

export async function buildJinglesList(): Promise<Jingle[]> {
	const jingleFiles = await extractAllJingleFiles();
	const list = await getAllVideoGains(jingleFiles);
	currentJingles = currentJingles.concat(list);
	allJingles = allJingles.concat(list);
	return list;
}

export function getJingles(): Jingle[] {
	return currentJingles;
}

export function removeJingle(jingle: string) {
	currentJingles = currentJingles.filter(e => e.file !== jingle);
}

export function getSingleJingle(): Jingle {
	const jingles = getJingles();
	if (jingles.length > 0) {
		logger.info('[Player] Jingle time !');
		const jingle = sample(jingles);
		//Let's remove the jingle we just selected so it won't be picked again next time.
		removeJingle(jingle.file);
		//If our current jingle files list is empty after the previous removal
		//Fill it again with the original list.
		if (currentJingles.length === 0) currentJingles = currentJingles.concat(allJingles);
		return jingle;
	}
}