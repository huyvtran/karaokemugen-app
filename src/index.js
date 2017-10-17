/**
 * @fileoverview Launcher source file
 */
import {asyncCheckOrMkdir, asyncExists, asyncRemove, asyncRename, asyncUnlink} from './_common/utils/files';
import {initConfig, setConfig} from './_common/utils/config';

import clc from 'cli-color' ;
import {copy} from 'fs-extra';
import path from 'path';
import argv from 'minimist';

import i18n from 'i18n';

import net from 'net';
import logger from './_common/utils/logger';
import engine from './_engine/index';
import resolveSysPath from './_common/utils/resolveSyspath';

process.on('uncaughtException', function (exception) {
	console.log(exception); // to see your exception details in the console
	// if you are on production, maybe you can send the exception details to your
	// email as well ?
});

/**
 * Clear console - and welcome message
 * Node does not like the octal clear screen sequence.
 * So we wrote it in hexa (1B)
 */
process.stdout.write('\x1Bc');
console.log(clc.greenBright('+------------------------------------------------------------------+'));
console.log(clc.greenBright('| Project Karaoke Mugen                                            |'));
console.log(clc.greenBright('+------------------------------------------------------------------+'));
console.log('\n');

argv(process.argv.slice(2));

if (argv.help) {
	console.log(__('HELP_MSG'));
	process.exit(0);
}

const appPath = resolveSysPath('config.ini.default',__dirname,['./','../']);

if(appPath) {
	main()
		.then(() => logger.info('[Launcher] Async launch done'))
		.catch(err => {
			logger.error('[Launcher] Error during async launch : ' + err);
			process.exit(1);
		});
} else {
	logger.error('[Launcher] Unable to detect SysPath !');
	process.exit(1);
}

async function main() {
	logger.debug('[Launcher] SysPath detected : ' + appPath);

	// Note : !!argv.test assure la conversion en booléen.
	let config = await initConfig(appPath, !!argv.test);

	if (argv.version) {
		console.log('Karaoke Mugen '+ config.VersionNo + ' - ' + config.VersionName);
		process.exit(0);
	}

	logger.info('[Launcher] Locale detected : ' + config.EngineDefaultLocale);
	logger.debug('[Launcher] Detected OS : ' + config.os);

	logger.info('[Launcher] Loaded configuration file');
	logger.debug('[Launcher] Loaded configuration : ' + JSON.stringify(config, null, '\n'));

	// Vérification de l'existence des répertoires, sinon les créer.
	await checkPaths(config);

	// Copy the input.conf file to modify mpv's default behaviour, namely with mouse scroll wheel
	logger.debug('[Launcher] Copying input.conf into ' + path.resolve(appPath, config.PathTemp));
	await copy(
		path.join(__dirname, '/_player/assets/input.conf'),
		path.resolve(appPath, config.PathTemp, 'input.conf'),
		{ overwrite: true }
	);

	/**
	 * Test if network ports are available
	 */
	[1337, 1338, 1339, 1340].forEach(port => verifyOpenPort(port));

	await restoreKaraBackupFolders(config);

	/**
	 * Calling engine.
	 */
	engine.SYSPATH = appPath;
	engine.SETTINGS = config;
	engine.i18n = i18n;
	engine.run();
}

/**
 * Checking if application paths exist.
 * The app needs :
 * app/bin
 * app/data
 * app/db
 * app/temp
 */
async function checkPaths(config) {

	const appPath = config.appPath;

	logger.info('[Launcher] Checking data folders');
	let checks = [];
	config.PathKaras.split('|').forEach(dir => checks.push(asyncCheckOrMkdir(appPath, dir)));
	config.PathSubs.split('|').forEach(dir => checks.push(asyncCheckOrMkdir(appPath, dir)));
	config.PathVideos.split('|').forEach(dir => checks.push(asyncCheckOrMkdir(appPath, dir)));
	config.PathJingles.split('|').forEach(dir => checks.push(asyncCheckOrMkdir(appPath, dir)));
	config.PathBackgrounds.split('|').forEach(dir => checks.push(asyncCheckOrMkdir(appPath, dir)));
	checks.push(asyncCheckOrMkdir(appPath, config.PathDB));
	checks.push(asyncCheckOrMkdir(appPath, config.PathBin));
	checks.push(asyncCheckOrMkdir(appPath, config.PathTemp));

	await Promise.all(checks);
	logger.info('[Launcher] All folders checked');
}

function verifyOpenPort(port) {
	const server = net.createServer();
	server.once('error', err => {
		if (err.code === 'EADDRINUSE') {
			logger.error('[Launcher] Port '+port+' is already in use.');
			logger.error('[Launcher] If another Karaoke Mugen instance is running, please kill it (process name is "node")');
			logger.error('[Launcher] Then restart the app.');
			process.exit(1);
		}
	});
	server.once('listening', () => server.close());
	server.listen(port);
}

/**
 * Check if backup folder for karaokes exists. If it does, it means previous generation aborted.
 * Backup folder is restored.
 */
async function restoreKaraBackupFolders(config) {
	const restores = [];
	config.PathKaras.split('|').forEach(pathKara => restores.push(restoreBackupFolder(pathKara, config)));
	await Promise.all(restores);
}

async function restoreBackupFolder(pathKara, config) {
	const karasDbFile = path.resolve(appPath, config.PathDB, config.PathDBKarasFile);
	const karasDir = path.resolve(appPath, pathKara);
	const karasDirBackup = karasDir+'_backup';
	if (await asyncExists(karasDirBackup)) {
		logger.info('[Launcher] Mahoro Mode : Backup folder ' + karasDirBackup + ' exists, replacing karaokes folder with it.');
		await asyncRemove(karasDir);
		await asyncRename(karasDirBackup, karasDir);
		if (await asyncExists(karasDbFile)) {
			logger.info('[Launcher] Mahoro Mode : clearing karas database : generation will occur shortly');
			await asyncUnlink(karasDbFile);
		}
	}
}