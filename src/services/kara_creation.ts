import {dirname, basename, resolve} from 'path';
import {createKaraInDB, editKaraInDB, getKara} from './kara';
import { addKaraToStore, editKaraInStore, sortKaraStore, getStoreChecksum, removeKaraInStore } from '../dao/dataStore';
import { saveSetting } from '../lib/dao/database';
import { Kara, NewKara } from '../lib/types/kara';
import { resolvedPathRepos, resolvedPathTemp } from '../lib/utils/config';
import { asyncUnlink, asyncExists, asyncCopy, resolveFileInDirs } from '../lib/utils/files';
import {generateKara} from '../lib/services/kara_creation';
import logger from '../lib/utils/logger';

export async function editKara(kara: Kara) {
	let newKara: NewKara;
	let karaFile: string;
	try {
		const oldKara = await getKara(kara.kid, {role: 'admin', username: 'admin'});
		let mediaFile: string;
		let mediaDir: string;
		if (kara.mediafile_orig) {
			mediaFile = resolve(resolvedPathTemp(), kara.mediafile);
			const mediaPaths = (await resolveFileInDirs(oldKara.mediafile, resolvedPathRepos('Medias', kara.repository)))[0];
			mediaDir = dirname(mediaPaths);
		} else {
			try {
				mediaFile = (await resolveFileInDirs(kara.mediafile, resolvedPathRepos('Medias', kara.repository)))[0];
				mediaDir = dirname(mediaFile);
			} catch(err) {
				// Non fatal.
			}
		}
		let subFile = kara.subfile;
		let subDir: string;
		if (kara.subfile) {
			if (kara.subfile_orig) {
				subFile = resolve(resolvedPathTemp(), kara.subfile);
				if (oldKara.subfile) {
					subDir = dirname((await resolveFileInDirs(oldKara.subfile, resolvedPathRepos('Lyrics', kara.repository)))[0]);
				} else {
					subDir = resolvedPathRepos('Lyrics', kara.repository)[0];
				}
			} else {
				subFile = (await resolveFileInDirs(kara.subfile, resolvedPathRepos('Lyrics', kara.repository)))[0];
				subDir = dirname(subFile);
			}
		};
		karaFile = (await resolveFileInDirs(kara.karafile, resolvedPathRepos('Karas', kara.repository)))[0];
		const karaDir = dirname(karaFile);

		// Removing useless data
		delete kara.karafile;
		// Copying already present files in temp directory to be worked on with by generateKara
		if (!kara.mediafile_orig) {
			kara.noNewVideo = true;
			kara.mediafile_orig = kara.mediafile;
		}
		if (!kara.subfile_orig) {
			kara.subfile_orig = kara.subfile;
			if (kara.subfile) {
				if (!await asyncExists(subFile)) throw `Subfile ${subFile} does not exist! Check your base files or upload a new subfile`;
				await asyncCopy(subFile, resolve(resolvedPathTemp(), kara.subfile), {overwrite: true});
			}
		}
		// Treat files
		newKara = await generateKara(kara, karaDir, mediaDir, subDir, oldKara);

		//Removing previous files if they're different from the new ones (name changed, etc.)
		if (newKara.file.toLowerCase() !== karaFile.toLowerCase() && await asyncExists(karaFile)) {
			logger.info(`[KaraGen] Removing ${karaFile}`);
			await asyncUnlink(karaFile);
		}
		if (newKara.data.subfile && oldKara.subfile && newKara.data.subfile.toLowerCase() !== oldKara.subfile.toLowerCase()) {
			const oldSubFiles = await resolveFileInDirs(oldKara.subfile, resolvedPathRepos('Lyrics', kara.repository));
			if (await asyncExists(oldSubFiles[0])) {
				logger.info(`[KaraGen] Removing ${oldSubFiles[0]}`);
				await asyncUnlink(oldSubFiles[0]);
			}
		}
		if (newKara.data.mediafile.toLowerCase() !== oldKara.mediafile.toLowerCase()) {
			try {
				const oldMediaFiles = await resolveFileInDirs(oldKara.mediafile, resolvedPathRepos('Medias', kara.repository));
				logger.info(`[KaraGen] Removing ${oldMediaFiles[0]}`);
				await asyncUnlink(oldMediaFiles[0]);
			} catch(err) {
				logger.warn(`[KaraGen] Unable to remove old mediafile ${oldKara.mediafile}: ${err}`);
				// Non-fatal
			}
		}
	} catch(err) {
		logger.error(`[KaraGen] Error while editing kara : ${err}`);
		throw err;
	}
	if (karaFile === newKara.file) {
		await editKaraInStore(newKara.file);
	} else {
		removeKaraInStore(karaFile);
		await addKaraToStore(newKara.file);
		sortKaraStore();
	}
	saveSetting('baseChecksum', getStoreChecksum());
	newKara.data.karafile = basename(newKara.file);
	// Update in database
	try {
		await editKaraInDB(newKara.data);
	} catch(err) {
		const errMsg = `${newKara.data.karafile} file generation is OK, but unable to edit karaoke in live database. Please regenerate database entirely if you wish to see your modifications : ${err}`;
		logger.warn(`[KaraGen] ${errMsg}`);
		throw errMsg;
	}
}

export async function createKara(kara: Kara) {
	const newKara = await generateKara(kara, resolvedPathRepos('Karas', kara.repository)[0], resolvedPathRepos('Medias', kara.repository)[0], resolvedPathRepos('Lyrics', kara.repository)[0]);
	await addKaraToStore(newKara.file);
	sortKaraStore();
	saveSetting('baseChecksum', getStoreChecksum());
	try {
		newKara.data.karafile = basename(newKara.file);
		await createKaraInDB(newKara.data);
	} catch(err) {
		const errMsg = `.kara.json file is OK, but unable to add karaoke in live database. Please regenerate database entirely if you wish to see your modifications : ${err}`;
		logger.warn(`[KaraGen] ${errMsg}`);
		throw errMsg;
	}
	return newKara;
}
