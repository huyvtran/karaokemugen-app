// KM Imports
import {asyncCheckOrMkdir, asyncExists, asyncRemove,  asyncCopyAlt} from './lib/utils/files';
import {getConfig, setConfig, resolvedPathTemp, resolvedPathAvatars} from './lib/utils/config';
import {initConfig} from './utils/config';
import {parseCommandLineArgs} from './args';
import logger, { configureLogger } from './lib/utils/logger';
import {exit, initEngine} from './services/engine';
import {logo} from './logo';
import { setState, getState } from './utils/state';
import { version } from './version';
import { migrateOldFoldersToRepo, addRepo, getRepo } from './services/repo';

// Types
import {Config} from './types/config';

// Node modules
import {moveSync} from 'fs-extra';
import {mkdirSync, existsSync} from 'fs';
import {join, resolve} from 'path';
import minimist from 'minimist';
import chalk from 'chalk';
import {createInterface} from 'readline';
import { getPortPromise } from 'portfinder';
import cloneDeep from 'lodash.clonedeep';

process.on('uncaughtException', exception => {
	console.log('Uncaught exception:', exception);
});

process.on('unhandledRejection', (error) => {
	console.log('Unhandled Rejection at:', error);
});

process.on('SIGINT', () => {
	exit('SIGINT');
});

process.on('SIGTERM', () => {
	exit('SIGTERM');
});

// CTRL+C for Windows :

if (process.platform === 'win32' ) {
	const rl = createInterface({
	  input: process.stdin,
	  output: process.stdout
	});

	rl.on('SIGINT', () => {
	  exit('SIGINT');
	});
}

// Main app begins here.
// Testing if we're in a packaged version of KM or not.
const appPath = ('pkg' in process)
	? join(process['execPath'], '../')
	: join(__dirname, '../');
const resourcePath = appPath;
let dataPath = resolve(appPath, 'app/');

// Testing if we're in portable mode or not
if (!existsSync(resolve(appPath, 'portable'))) {
	// Rewriting dataPath to point to user home directory
	dataPath = resolve(process.env.HOME, 'KaraokeMugen/');
}

if (!existsSync(dataPath)) mkdirSync(dataPath);

// Move config file if it's in appPath to dataPath
if (existsSync(resolve(appPath, 'config.yml')) && !existsSync(resolve(dataPath, 'config.yml'))) {
	moveSync(resolve(appPath, 'config.yml'), resolve(dataPath, 'config.yml'));
}
if (existsSync(resolve(appPath, 'database.json')) && !existsSync(resolve(dataPath, 'database.json'))) {
	moveSync(resolve(appPath, 'database.json'), resolve(dataPath, 'database.json'));
}

setState({appPath: appPath, dataPath: dataPath, resourcePath: resourcePath});

process.env['NODE_ENV'] = 'production'; // Default

main()
	.catch(err => {
		logger.error(`[Launcher] Error during launch : ${err}`);
		console.log(err);
		exit(1);
	});

async function main() {
	const argv = minimist(process.argv.slice(2));
	setState({ os: process.platform, version: version });
	const state = getState();
	console.log(chalk.white(logo));
	console.log('Karaoke Player & Manager - http://karaokes.moe');
	console.log(`Version ${chalk.bold.green(state.version.number)} (${chalk.bold.green(state.version.name)})`);
	console.log('================================================================================');
	await configureLogger(dataPath, !!argv.debug, true);
	await initConfig(argv);
	const publicConfig = cloneDeep(getConfig());
	publicConfig.Karaoke.StreamerMode.Twitch.OAuth = 'xxxxx';
	publicConfig.App.JwtSecret = 'xxxxx';
	publicConfig.App.InstanceID = 'xxxxx';
	await parseCommandLineArgs(argv);
	logger.debug(`[Launcher] AppPath : ${appPath}`);
	logger.debug(`[Launcher] DataPath : ${dataPath}`);
	logger.debug(`[Launcher] Locale : ${state.EngineDefaultLocale}`);
	logger.debug(`[Launcher] OS : ${state.os}`);
	logger.debug(`[Launcher] Loaded configuration : ${JSON.stringify(publicConfig, null, 2)}`);
	logger.debug(`[Launcher] Initial state : ${JSON.stringify(state, null, 2)}`);

	// Checking paths, create them if needed.
	await checkPaths(getConfig());

	// Copying files from the app's sources to the app's working folder.
	// This is an ugly hack : we could use fs.copy but due to a bug in pkg,
	// using a writeFile/readFile combination is making it work with recent versions
	// of pkg, thus allowing us to build for Node 10
	// See https://github.com/zeit/pkg/issues/420

	// Copy the input.conf file to modify mpv's default behaviour, namely with mouse scroll wheel
	const tempInput = resolve(resolvedPathTemp(), 'input.conf');
	logger.debug(`[Launcher] Copying input.conf to ${tempInput}`);
	await asyncCopyAlt(join(__dirname, '../assets/input.conf'), tempInput);

	const tempBackground = resolve(resolvedPathTemp(), 'default.jpg');
	logger.debug(`[Launcher] Copying default background to ${tempBackground}`);
	await asyncCopyAlt(join(__dirname, `../assets/${state.version.image}`), tempBackground);

	// Copy avatar blank.png if it doesn't exist to the avatar path
	logger.debug(`[Launcher] Copying blank.png to ${resolvedPathAvatars()}`);
	await asyncCopyAlt(join(__dirname, '../assets/blank.png'), resolve(resolvedPathAvatars(), 'blank.png'));

	/**
	 * Test if network ports are available
	 */
	verifyOpenPort(getConfig().Frontend.Port, getConfig().App.FirstRun);

	/**
	 * Gentlemen, start your engines.
	 */
	try {
		await initEngine();
	} catch(err) {
		console.log(err);
		logger.error(`[Launcher] Karaoke Mugen initialization failed : ${err}`);
		exit(1);
	}
}

/**
 * Checking if application paths exist.
 */
async function checkPaths(config: Config) {
	// Migrate old folder config to new repository one :
	await migrateOldFoldersToRepo();
	const conf = getConfig();
	const appPath = getState().appPath;
	const dataPath = getState().dataPath;
	// If no karaoke is found, copy the samples directory if it exists
	if (!await asyncExists(resolve(dataPath, conf.System.Repositories[0].Path.Karas[0])) && await asyncExists(resolve(appPath, 'samples/')) && !getRepo('Samples')) {
		try {
			await addRepo({
				Name: 'Samples',
				Online: false,
				Path: {
					Lyrics: [resolve(appPath, 'samples/lyrics')],
					Medias: [resolve(appPath, 'samples/medias')],
					Karas: [resolve(appPath, 'samples/karaokes')],
					Tags: [resolve(appPath, 'samples/tags')],
					Series: [resolve(appPath, 'samples/series')]
				}
			});
		} catch (err) {
			// Non-fatal
			logger.warn(`[Launcher] Unable to add samples repository : ${err}`);
		}
	}

	// Emptying temp directory
	if (await asyncExists(resolvedPathTemp())) await asyncRemove(resolvedPathTemp());
	// Checking paths
	let checks = [];
	const paths = config.System.Path;
	for (const item of Object.keys(paths)) {
		Array.isArray(paths[item]) && paths[item]
			? paths[item].forEach((dir: string) => checks.push(asyncCheckOrMkdir(resolve(dataPath, dir))))
			: checks.push(asyncCheckOrMkdir(resolve(dataPath, paths[item])));
	}
	for (const repo of config.System.Repositories) {
		for (const paths of Object.keys(repo.Path)) {
			repo.Path[paths].forEach((dir: string) => checks.push(asyncCheckOrMkdir(resolve(dataPath, dir))));
		}
	}
	checks.push(asyncCheckOrMkdir(resolve(dataPath, 'logs/')));

	await Promise.all(checks);
	logger.debug('[Launcher] Directory checks complete');
}

async function verifyOpenPort(portConfig: number, firstRun: boolean) {
	try {
		const port = await getPortPromise({
			port: portConfig,
			stopPort: 7331
		});
		if (firstRun && port !== portConfig) {
			logger.warn(`[Launcher] Port ${portConfig} is already in use. Switching to ${port} and saving configuration`);
			setConfig({Frontend: {Port: port}});
		}
	} catch(err) {
		throw 'Failed to find a free port to use';
	}
}
