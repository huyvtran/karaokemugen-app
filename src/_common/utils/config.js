/** Centralized configuration management for Karaoke Mugen. */

import {resolve} from 'path';
import {parse, stringify} from 'ini';
import {sync} from 'os-locale';
import i18n from 'i18n';
import {address} from 'ip';
import logger from 'winston';
require('winston-daily-rotate-file');
import {asyncWriteFile, asyncExists, asyncReadFile, asyncRequired} from './files';
import {checkBinaries} from './binchecker.js';

/** Object containing all config */
let config = {};
let defaultConfig = {};

/**
 * We return a copy of the configuration data so the original one can't be modified
 * without passing by this module's fonctions.
 */
export function getConfig() {
	return {...config};
}

/** Initializing configuration */
export async function initConfig(appPath, argv) {

	configureLogger(appPath, !!argv.debug);

	config = {...config, appPath: appPath};
	config = {...config, isTest: !!argv.isTest};
	config = {...config, os: process.platform};

	configureLocale();
	await loadConfigFiles(appPath);
	configureHost();

	return getConfig();
}

function configureLogger(appPath, debug) {
	const tsFormat = () => (new Date()).toLocaleTimeString();
	const consoleLogLevel = debug ? 'debug' : 'info';

	logger.configure({
		transports: [
			new (logger.transports.Console)({
				timestamp: tsFormat,
				level: consoleLogLevel,
				colorize: true
			}),
			new (logger.transports.DailyRotateFile)({
				timestap: tsFormat,
				filename: resolve(appPath, 'karaokemugen'),
				datePattern: '.yyyy-MM-dd.log',
				zippedArchive: true,
				level: 'debug',
				handleExceptions: true
			})
		]
	});
}

async function loadConfigFiles(appPath) {
	const defaultConfigFile = resolve(appPath, 'config.ini.default');
	const overrideConfigFile = resolve(appPath, 'config.ini');
	const versionFile = resolve(__dirname, '../../VERSION');

	await loadConfig(defaultConfigFile);
	defaultConfig = config;
	if (await asyncExists(overrideConfigFile)) {
		await loadConfig(overrideConfigFile);
		config = {...config, appFirstRun: true};
	}
	if (await asyncExists(versionFile)) {
		await loadConfig(versionFile);
	}
}


async function loadConfig(configFile) {
	logger.debug(`[Config] Reading configuration file ${configFile}`);
	await asyncRequired(configFile);
	const content = await asyncReadFile(configFile, 'utf-8');
	const parsedContent = parse(content);
	config = {...config, ...parsedContent};
}

function configureLocale() {
	i18n.configure({
		directory: resolve(__dirname, '../locales'),
		defaultLocale: 'en',
		cookie: 'locale',
		register: global
	});
	const detectedLocale = sync().substring(0, 2);
	i18n.setLocale(detectedLocale);
	config = {...config, EngineDefaultLocale: detectedLocale };
}

export async function configureBinaries(config) {
	logger.info('[Launcher] Checking if binaries are available');
	const binaries = await checkBinaries(config);
	setConfig(binaries);
}

export function configureHost() {
	if (config.EngineDisplayConnectionInfoHost === '') {
		config = {...config, osHost: address()};
	} else {
		config = {...config, osHost: config.EngineDisplayConnectionInfoHost};
	}
}

export async function setConfig(configPart) {
	config = {...config, ...configPart};
	await updateConfig(config);
	return getConfig();
}

export async function updateConfig(newConfig) {
	const forbiddenConfigPrefix = ['opt','Admin','BinmpvPath','BinffprobePath','BinffmpegPath','Version','isTest','app','os','EngineDefaultLocale'];
	const filteredConfig = {};
	Object.entries(newConfig).forEach(([k, v]) => {		
		forbiddenConfigPrefix.every(prefix => !k.startsWith(prefix))            
			&& (newConfig[k] !== defaultConfig[k])
            && (filteredConfig[k] = v);		
	});
	await asyncWriteFile(resolve(config.appPath, 'config.ini'), stringify(filteredConfig), 'utf-8');	
}

/**
 * Functions used to manipulate configuration. We can pass a optional config object.
 * In this case, the method works with the configuration passed as argument rather than the current 
 * configuration.
 */

export function resolvedPathKaras(overrideConfig) {
	const conf = overrideConfig ? overrideConfig : config;
	return conf.PathKaras.split('|').map(path => resolve(conf.appPath, path));
}

export function resolvedPathJingles(overrideConfig) {
	const conf = overrideConfig ? overrideConfig : config;
	return conf.PathJingles.split('|').map(path => resolve(conf.appPath, path));
}

export function resolvedPathBackgrounds(overrideConfig) {
	const conf = overrideConfig ? overrideConfig : config;
	return conf.PathBackgrounds.split('|').map(path => resolve(conf.appPath, path));
}

export function resolvedPathSubs(overrideConfig) {
	const conf = overrideConfig ? overrideConfig : config;
	return conf.PathSubs.split('|').map(path => resolve(conf.appPath, path));
}

export function resolvedPathVideos(overrideConfig) {
	const conf = overrideConfig ? overrideConfig : config;
	return conf.PathVideos.split('|').map(path => resolve(conf.appPath, path));
}

export function resolvedPathImport(overrideConfig) {
	const conf = overrideConfig ? overrideConfig : config;
	return resolve(conf.appPath, conf.PathImport);
}

export function resolvedPathTemp(overrideConfig) {
	const conf = overrideConfig ? overrideConfig : config;
	return resolve(conf.appPath, conf.PathTemp);
}

export function resolvedPathPreviews(overrideConfig) {
	const conf = overrideConfig ? overrideConfig : config;
	return resolve(conf.appPath, conf.PathPreviews);
}