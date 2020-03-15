//Node modules
import i18n from 'i18next';

//Utils
import {getConfig, setConfig} from '../lib/utils/config';
import {profile, enableWSLogging} from '../lib/utils/logger';
import readlineSync from 'readline-sync';
import logger from 'winston';
import {getState, setState} from '../utils/state';
import { killPG, dumpPG, restorePG, checkPG} from '../utils/postgresql';
import {emit} from '../lib/utils/pubsub';

//KM Modules
import {initUserSystem} from '../services/user';
import {initDBSystem, getStats, generateDB, compareKarasChecksum} from '../dao/database';
import {closeDB, getSettings, vacuum} from '../lib/dao/database';
import {initFrontend} from './frontend';
import {initOnlineURLSystem} from '../services/online';
import {initPlayer, quitmpv} from '../services/player';
import {initDownloader, updateAllBases, updateAllMedias, downloadTestSongs, downloadRandomSongs} from '../services/download';
import {initStats} from '../services/stats';
import {welcomeToYoukousoKaraokeMugen} from '../services/welcome';
import {initPlaylistSystem, testPlaylists} from '../services/playlist';
import { generateDatabase as generateKaraBase } from '../lib/services/generation';
import { initTwitch, stopTwitch, getTwitchClient } from '../utils/twitch';
import { initSession } from '../services/session';
import { updatePlaylistMedias, buildAllMediasList } from '../services/medias';
import { initStep, errorStep } from '../electron/electronLogger';
import { app } from 'electron';
import { generateBlacklist } from '../dao/blacklist';
import { duration } from '../lib/utils/date';
import { DBStats } from '../types/database/database';

let shutdownInProgress = false;

export async function initEngine() {
	profile('Init');
	const conf = getConfig();
	const state = getState();
	setState({
		fullscreen: conf.Player.FullScreen,
		ontop: conf.Player.StayOnTop,
		private: conf.Karaoke.Private,
	});
	if (state.opt.validate) {
		try {
			initStep(i18n.t('INIT_VALIDATION'));
			await generateKaraBase(true, true);
			await exit(0);
		} catch(err) {
			logger.error(`[Engine] Validation error : ${err}`);
			await exit(1);
		}
	} else if (state.opt.mediaUpdate) {
		try {
			initStep(i18n.t('INIT_UPDATEMEDIAS'));
			await updateAllMedias();
			await exit(0);
		} catch(err) {
			logger.error(`[Engine] Updating medias failed : ${err}`);
			await exit(1);
		}
	} else if (state.opt.dumpDB) {
		try {
			initStep(i18n.t('INIT_DB'));
			await initDBSystem();
			initStep(i18n.t('INIT_DUMPDB'));
			await dumpPG();
			await exit(0);
		} catch(err) {
			await exit(1);
		}
	} else if (state.opt.restoreDB) {
		try {
			initStep(i18n.t('INIT_DB'));
			await initDBSystem();
			initStep(i18n.t('INIT_RESTOREDB'));
			await restorePG();
			await exit(0);
		} catch(err) {
			await exit(1);
		}
	} else if (state.opt.baseUpdate) {
		try {
			initStep(i18n.t('INIT_DB'));
			await initDBSystem();
			initStep(i18n.t('INIT_BASEUPDATE'));
			await updateAllBases();
			logger.info('[Engine] Done updating karaoke base');
			await exit(0);
		} catch (err) {
			logger.error(`[Engine] Update failed : ${err}`);
			await exit(1);
		}
	} else if (state.opt.generateDB) {
		try {
			initStep(i18n.t('INIT_DB'));
			await initDBSystem();
			initStep(i18n.t('INIT_GEN'));
			await generateDB();
			await exit(0);
		} catch(err) {
			logger.error(`[Engine] Generation failed : ${err}`);
			await exit(1);
		}
	} else {
		initStep(i18n.t('INIT_DB'));
		await initDBSystem();
		const stats = await preFlightCheck();
		initStep(i18n.t('INIT_USER'));
		await initUserSystem();
		if (conf.Online.URL) try {
			initStep(i18n.t('INIT_ONLINEURL'));
			await initOnlineURLSystem();
		} catch(err) {
			//Non-blocking
			logger.error(`[Engine] Failed to init online system : ${err}`);
		}
		let inits = [];
		if (conf.Karaoke.StreamerMode.Twitch.Enabled) initTwitch();
		inits.push(initPlaylistSystem());
		if (!state.isDemo && !state.isTest && !state.opt.noPlayer) inits.push(initPlayer());
		inits.push(initFrontend());
		inits.push(initSession());
		testPlaylists();
		initDownloader();
		if (conf.Online.Stats === true) inits.push(initStats(false));
		try {
			initStep(i18n.t('INIT_LAST'), true);
			await Promise.all(inits);
			enableWSLogging();
			//Easter egg
			let ready = 'READY';
			if (Math.floor(Math.random() * Math.floor(10)) >= 9) ready = 'LADY';
			logger.info(`[Engine] Karaoke Mugen is ${ready}`);
			if (!state.isTest && !state.electron) welcomeToYoukousoKaraokeMugen();
			setState({ ready: true });
			// This is done later because it's not important.
			initStep(i18n.t('INIT_DONE'), true);
			emit('KMReady');
			if (conf.App.FirstRun && stats.karas === 0 && !state.isTest) {
				downloadRandomSongs();
			}
			if (state.isTest) downloadTestSongs();
			if (!state.isTest && !state.isDemo) {
				await updatePlaylistMedias();
				await buildAllMediasList();
			}
		} catch(err) {
			logger.error(`[Engine] Karaoke Mugen IS NOT READY : ${JSON.stringify(err)}`);
		} finally {
			profile('Init');
		}
	}
}

export async function exit(rc: any) {
	if (shutdownInProgress) return;
	logger.info('[Engine] Shutdown in progress');
	shutdownInProgress = true;
	emit('exiting-app');
	if (getState().player.ready) {
		try {
			await quitmpv();
		} catch(err) {
			logger.warn(`[Engine] mpv error : ${err}`);
		} finally {
			logger.info('[Engine] Player has shutdown');
		}
	}
	if (getTwitchClient()) await stopTwitch();
	await closeDB();
	if (getTwitchClient() || (getConfig() && getConfig().Karaoke.StreamerMode.Twitch.Enabled)) await stopTwitch();
	//CheckPG returns if postgresql has been started by Karaoke Mugen or not.
	try {
		// Let's try to kill PGSQL anyway, not a problem if it fails.
		if (getConfig().Database.prod.bundledPostgresBinary && await checkPG()) {
			try {
				await killPG();
				logger.info('[Engine] PostgreSQL has shutdown');
				mataNe(rc);
			} catch(err) {
				logger.warn(`[Engine] PostgreSQL could not be stopped! : ${JSON.stringify(err)}`);
				mataNe(rc);
			}
		} else {
			mataNe(rc);
		}
	} catch(err) {
		logger.error(`[Engine] Failed to shutdown PostgreSQL : ${err}`);
		mataNe(1);
	}
}

function mataNe(rc: any) {
	console.log('\nMata ne !\n');
	//Exiting on Windows will require a keypress from the user to avoid the window immediately closing on an error.
	//On other systems or if terminal is not a TTY we exit immediately.
	// non-TTY terminals have no stdin support.
	if ((process.platform !== 'win32' || !process.stdout.isTTY) && !app) process.exit(rc);
	if (rc !== 0 && !app) readlineSync.question('Press enter to exit', {hideEchoBack: true});
	if (!app) {
		process.exit(rc);
	} else {
		app.exit();
	}
}

export function shutdown() {
	logger.info('[Engine] Dropping the mic, shutting down!');
	exit(0);
}

export async function getKMStats() {
	return await getStats();
}

async function preFlightCheck(): Promise<DBStats> {
	const state = getState();
	const conf = getConfig();
	let doGenerate = false;
	if (!state.opt.noBaseCheck && !conf.App.QuickStart) {
		const filesChanged = await compareKarasChecksum();
		if (filesChanged === true) {
			logger.info('[DB] Data files have changed: database generation triggered');
			doGenerate = true;
		}
		// If karasChecksum returns null, it means there were no files to check. We run generation anyway (it'll return an empty database) to avoid making the current startup procedure any more complex.
		if (filesChanged === undefined) doGenerate = true;
	}
	const settings = await getSettings();
	if (!doGenerate && !settings.lastGeneration) {
		setConfig({ App: { FirstRun: true }});
		logger.info('[DB] Unable to tell when last generation occured: database generation triggered');
		doGenerate = true;
	}
	if (doGenerate) try {
		initStep(i18n.t('INIT_GEN'));
		await generateDB();
	} catch(err) {
		logger.error(`[DB] Generation failed : ${err}`);
		errorStep(i18n.t('ERROR_GENERATION'));
		throw 'Generation failure';
	}
	// Run this in the background
	vacuum();
	generateBlacklist();
	const stats = await getStats();
	logger.info(`Songs        : ${stats.karas} (${duration(+stats.duration)})`);
	logger.info(`Playlists    : ${stats.playlists}`);
	logger.info(`Songs played : ${stats.played}`);
	return stats;
}