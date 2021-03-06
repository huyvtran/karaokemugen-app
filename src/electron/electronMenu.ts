import openAboutWindow from 'about-window';
import { clipboard,dialog } from 'electron';
import {autoUpdater} from 'electron-updater';
import i18next from 'i18next';
import open from 'open';
import { resolve } from 'path';

import {exit} from '../components/engine';
import { getConfig, setConfig } from '../lib/utils/config';
import logger from '../lib/utils/logger';
import { getState } from '../utils/state';
import {handleFile,win} from './electron';
import { setManualUpdate } from './electronAutoUpdate';

const isMac = process.platform === 'darwin';

let menuItems: any;

export function getMenu() {
	return menuItems;
}

export function initMenu() {
	const port = getConfig().Frontend.Port;
	const base = 'http://localhost';
	const urls = {
		operatorOptions: `${base}:${port}/admin?config`,
		systemOptions: `${base}:${port}/system/km/options`,
		home: `${base}:${port}/welcome`,
		operator: `${base}:${port}/admin`,
		public: `${base}:${port}/`,
		system: `${base}:${port}/system`,
		logs: `${base}:${port}/system/km/log`,
		download: `${base}:${port}/system/km/karas/download`,
		karas: `${base}:${port}/system/km/karas`,
		database: `${base}:${port}/system/km/db`
	};
	menuItems = [
		/**
		 *
		 * MAIN MENU / FILE MENU
		 *
		 */
		{
			label: isMac ? 'Karaoke Mugen' : i18next.t('MENU_FILE'),
			submenu: [
				{
					label: i18next.t('MENU_FILE_ABOUT'),
					click: displayAbout
				},
				{ type: 'separator', visible: isMac },
				{
					label: i18next.t('MENU_OPTIONS_OPERATORCONFIG_OSX'),
					accelerator: 'CmdOrCtrl+F',
					visible: isMac,
					click: () => {
						openURL(urls.operatorOptions);
					}
				},
				{
					label: i18next.t('MENU_OPTIONS_SYSTEMCONFIG_OSX'),
					accelerator: 'CmdOrCtrl+G',
					visible: isMac,
					click: () => {
						openURL(urls.systemOptions);
					}
				},
				{ type: 'separator', visible: isMac },
				{
					// Updater menu disabled on macs until we can sign our code
					label: i18next.t('MENU_FILE_UPDATE'),
					visible: !isMac && !getState().forceDisableAppUpdate,
					click: checkForUpdates
				},
				{ role: 'services', visible: isMac },
				{
					label: i18next.t('MENU_FILE_IMPORT'),
					type: 'submenu',
					submenu: [
						{
							label: i18next.t('MENU_FILE_IMPORT_PLAYLIST'),
							click: importFile
						},
						{
							label: i18next.t('MENU_FILE_IMPORT_FAVORITES'),
							click: importFile
						},
						{
							label: i18next.t('MENU_FILE_IMPORT_KARABUNDLE'),
							click: importFile
						},
						{
							label: i18next.t('MENU_FILE_IMPORT_BLCSET'),
							click: importFile
						},
					]
				},
				{ type: 'separator'},
				{
					label: isMac ? i18next.t('MENU_FILE_QUIT_OSX') : i18next.t('MENU_FILE_QUIT'),
					accelerator: 'CmdOrCtrl+Q',
					click: exit
				}
			]
		},
		/**
		*
		* SECURITY CODE MENU
		*
		*/
		{
			label: i18next.t('MENU_SECURITYCODE'),
			submenu: [
				{
					label: i18next.t('MENU_SECURITYCODE_SHOW'),
					click: getSecurityCode
				}
			]
		},
		/**
		*
		* VIEW MENU
		*
		*/
		{
			label: i18next.t('MENU_VIEW'),
			submenu: [
				{ label: i18next.t('MENU_VIEW_RELOAD'), role: 'reload' },
				{ label: i18next.t('MENU_VIEW_RELOADFORCE'), role: 'forcereload' },
				{ label: i18next.t('MENU_VIEW_TOGGLEDEVTOOLS'), role: 'toggledevtools' },
				{ type: 'separator' },
				{ label: i18next.t('MENU_VIEW_RESETZOOM'), role: 'resetzoom' },
				{ label: i18next.t('MENU_VIEW_ZOOMIN'), role: 'zoomin' },
				{ label: i18next.t('MENU_VIEW_ZOOMOUT'), role: 'zoomout' },
				{ type: 'separator' },
				{ label: i18next.t('MENU_VIEW_FULLSCREEN'), role: 'togglefullscreen' }
			]
		},
		/**
		*
		* GO TO MENU
		*
		*/
		{
			label: isMac ? i18next.t('MENU_GOTO_OSX') : i18next.t('MENU_GOTO'),
			submenu: [
				{
					label: i18next.t('MENU_GOTO_HOME'),
					accelerator: 'CmdOrCtrl+H',
					click: () => {
						openURL(urls.home);
					}
				},
				{
					label: i18next.t('MENU_GOTO_OPERATOR'),
					accelerator: 'CmdOrCtrl+O',
					click: () => {
						openURL(urls.operator);
					}
				},
				{
					label: i18next.t('MENU_GOTO_SYSTEM'),
					accelerator: 'CmdOrCtrl+S',
					click: () => {
						openURL(urls.system);
					}
				},
				{
					label: i18next.t('MENU_GOTO_PUBLIC'),
					accelerator: 'CmdOrCtrl+P',
					click: () => {
						openURL(urls.public);
					}
				},
			]
		},
		/**
		*
		* TOOLS MENU
		*
		*/
		{
			label: i18next.t('MENU_TOOLS'),
			submenu: [
				{
					label: i18next.t('MENU_TOOLS_LOGS'),
					accelerator: 'CmdOrCtrl+L',
					click: () => {
						openURL(urls.logs);
					}
				},
				{
					label: i18next.t('MENU_TOOLS_DOWNLOADS'),
					accelerator: 'CmdOrCtrl+D',
					click: () => {
						openURL(urls.download);
					}
				},
				{
					label: i18next.t('MENU_TOOLS_KARAOKES'),
					accelerator: 'CmdOrCtrl+K',
					click: () => {
						openURL(urls.karas);
					}
				},
				{
					label: i18next.t('MENU_TOOLS_DATABASE'),
					accelerator: 'CmdOrCtrl+B',
					click: () => {
						openURL(urls.database);
					}
				},
			]
		},
		/**
		*
		* OPTIONS
		*
		*/
		{
			label: i18next.t('MENU_OPTIONS'),
			visible: !isMac,
			submenu: [
				{
					label: i18next.t('MENU_OPTIONS_OPENINELECTRON'),
					type: 'checkbox',
					checked: getConfig().GUI.OpenInElectron,
					click: () => {
						setConfig({ GUI: {OpenInElectron: !getConfig().GUI.OpenInElectron}});
					}
				},
				{
					label: i18next.t('MENU_OPTIONS_CHECKFORUPDATES'),
					type: 'checkbox',
					checked: getConfig().Online.Updates.App,
					visible: !getState().forceDisableAppUpdate,
					click: () => {
						setConfig({Online: {Updates: { App: !getConfig().Online.Updates.App}}});
					}
				},
				{ type: 'separator' },
				{
					label: i18next.t('MENU_OPTIONS_OPERATORCONFIG'),
					accelerator: 'CmdOrCtrl+F',
					click: () => {
						openURL(urls.operatorOptions);
					}
				},
				{
					label: i18next.t('MENU_OPTIONS_SYSTEMCONFIG'),
					accelerator: 'CmdOrCtrl+G',
					click: () => {
						openURL(urls.systemOptions);
					}
				},
			]
		},
		/**
		*
		* WINDOW MENU
		*
		*/
		{
			label: i18next.t('MENU_WINDOW'),
			submenu: [
				{ label: i18next.t('MENU_WINDOW_MINIMIZE'), role: 'minimize' },
				{ type: 'separator', visible: isMac },
				{
					label: i18next.t('MENU_OPTIONS_OPENINELECTRON'),
					type: 'checkbox',
					visible: isMac,
					checked: getConfig().GUI.OpenInElectron,
					click: () => {
						setConfig({GUI: {OpenInElectron: !getConfig().GUI.OpenInElectron}});
					}
				}
			]
		},
		/**
		*
		* HELP MENU
		*
		*/
		{
			label: i18next.t('MENU_HELP'),
			role: 'help',
			submenu: [
				{
					label: i18next.t('MENU_HELP_GUIDE'),
					click: () => {
						open(`https://docs.karaokes.moe/${getState().defaultLocale}/user-guide/getting-started/`);
					}
				},
				{
					label: i18next.t('MENU_HELP_WEBSITE'),
					click: () => {
						open('https://karaokes.moe');
					}
				},
				{
					label: i18next.t('MENU_HELP_TWITTER'),
					click: () => {
						open('https://twitter.com/KaraokeMugen');
					}
				},
				{
					label: i18next.t('MENU_HELP_DISCORD'),
					click: () => {
						open('https://karaokes.moe/discord');
					}
				},
				{
					label: i18next.t('MENU_HELP_GITLAB'),
					click: () => {
						open('https://lab.shelter.moe/karaokemugen/karaokemugen-app');
					}
				},
				{ type: 'separator'},
				{
					label: i18next.t('MENU_HELP_CHANGELOG'),
					click: () => {
						open('https://lab.shelter.moe/karaokemugen/karaokemugen-app/-/releases');
					}
				},
				{ type: 'separator'},
				{
					label: i18next.t('MENU_HELP_CONTRIB_DOC'),
					click: () => {
						open(`https://docs.karaokes.moe/${getState().defaultLocale}/contrib-guide/base/`);
					}
				},
				{
					label: i18next.t('MENU_HELP_SEND_KARAOKE'),
					click: () => {
						open('https://kara.moe/import/');
					}
				},
				{ type: 'separator'},
				{
					label: i18next.t('MENU_HELP_REPORT_BUG'),
					click: () => {
						open('https://lab.shelter.moe/karaokemugen/karaokemugen-app/-/issues');
					}
				}
			]
		}
	];
	if (isMac) {
		menuItems.splice(2, 0,
			/**
			*
			* EDIT MENU
			*
			*/
			{
				label: i18next.t('MENU_EDIT'),
				submenu: [
					{ label: i18next.t('MENU_EDIT_UNDO'), role: 'undo' },
					{ label: i18next.t('MENU_EDIT_REDO'), role: 'redo' },
					{ type: 'separator' },
					{ label: i18next.t('MENU_EDIT_CUT'), role: 'cut' },
					{ label: i18next.t('MENU_EDIT_COPY'), role: 'copy' },
					{ label: i18next.t('MENU_EDIT_PASTE'), role: 'paste' },
					{ label: i18next.t('MENU_EDIT_DELETE'), role: 'delete' },
					{ label: i18next.t('MENU_EDIT_SELECT_ALL'), role: 'selectAll' },
					{ type: 'separator' },
					{
						label: i18next.t('MENU_EDIT_SPEECH'),
						submenu: [
							{ label: i18next.t('MENU_EDIT_STARTSPEECH'), role: 'startspeaking' },
							{ label: i18next.t('MENU_EDIT_STOPSPEECH'), role: 'stopspeaking' }
						]
					}
				]
			});
	}
}

function openURL(url: string) {
	getConfig().GUI.OpenInElectron
		? win.loadURL(url)
		: open(url);
}

async function checkForUpdates() {
	setManualUpdate(true);
	logger.info('Checking for updates manually', {service: 'AppUpdate'});
	await autoUpdater.checkForUpdates();
	setManualUpdate(false);
}

async function importFile() {
	const files = await dialog.showOpenDialog({
		properties: ['openFile', 'multiSelections']
	});
	if (!files.canceled) {
		for (const file of files.filePaths) {
			await handleFile(file);
		}
	}
}

function displayAbout() {
	{
		const version = getState().version;
		const versionSHA = version.sha
			? `version ${version.sha}`
			: '';
		openAboutWindow({
			icon_path: resolve(getState().resourcePath, 'build/icon.png'),
			product_name: `Karaoke Mugen "${version.name}"`,
			bug_link_text: i18next.t('ABOUT.BUG_REPORT'),
			bug_report_url: 'https://lab.shelter.moe/karaokemugen/karaokemugen-app/issues/new?issue%5Bassignee_id%5D=&issue%5Bmilestone_id%5D=',
			homepage: 'https://mugen.karaokes.moe',
			description: versionSHA,
			copyright: 'by Karaoke Mugen Dev Team, under MIT license',
			use_version_info: true,
			css_path: resolve(getState().resourcePath, 'build/electronAboutWindow.css')
		});
	}
}

async function getSecurityCode() {
	const state = getState();
	const buttons = await dialog.showMessageBox({
		type: 'none',
		title: i18next.t('SECURITY_CODE_TITLE'),
		message: `${i18next.t('SECURITY_CODE_MESSAGE')} ${state.securityCode}`,
		buttons: [i18next.t('COPY_TO_CLIPBOARD'), i18next.t('IT_IS_IN_MY_HEAD')],
	});
	if (buttons.response === 0) {
		clipboard.writeText(state.securityCode.toString());
	}
}