import { dialog } from 'electron';
import { autoUpdater } from 'electron-updater';
import i18next from 'i18next';

import { getConfig } from '../lib/utils/config';
import logger from '../lib/utils/logger';
import sentry from '../utils/sentry';
import {win} from './electron';

let manualUpdate = false;

export function initAutoUpdate() {
	autoUpdater.logger = logger;
	autoUpdater.autoDownload = false;
	autoUpdater.on('error', (error) => {
		logger.error('', {service: 'AppUpdate', obj: error});
		dialog.showErrorBox(`${i18next.t('ERROR')}: `, error === null ? 'unknown' : (error.stack || error).toString());
	});
	autoUpdater.on('update-available', async () => {
		logger.info('Update detected', {service: 'AppUpdate'});
		const buttonIndex = await dialog.showMessageBox(win, {
			type: 'info',
			title: i18next.t('UPDATE_FOUND'),
			message: i18next.t('UPDATE_PROMPT'),
			buttons: [i18next.t('YES'), i18next.t('NO')],
			cancelId: 1
		});
		if (buttonIndex.response === 0) {
			try {
				await autoUpdater.downloadUpdate();
			} catch(err) {
				sentry.error(new Error(err));
				await dialog.showMessageBox(win, {
					type: 'info',
					title: i18next.t('UPDATE_FOUND'),
					message: i18next.t('UPDATE_ERROR') + err
				});
			}
		}
	});

	autoUpdater.on('update-not-available', () => {
		logger.info('Update not available', {service: 'AppUpdate'});
		if (manualUpdate) dialog.showMessageBox({
			title: i18next.t('UPDATE_NOT_AVAILABLE'),
			message: i18next.t('CURRENT_VERSION_OK')
		});
	});

	autoUpdater.on('update-downloaded', async () => {
		logger.info('Update downloaded', {service: 'AppUpdate'});
		await dialog.showMessageBox(win, {
			title: i18next.t('UPDATE_DOWNLOADED'),
			message: i18next.t('UPDATE_READY_TO_INSTALL_RESTARTING')
		});
		try {
			autoUpdater.quitAndInstall();
		} catch(err) {
			sentry.error(new Error(err));
			logger.error('Failed to quit and install', {service: 'AppUpdate', obj: err});
		}
	});

	if (getConfig().Online.Updates.App && process.platform !== 'darwin') {
		try {
			logger.info('Checking for updates and notify', {service: 'AppUpdate'});
			autoUpdater.checkForUpdatesAndNotify();
		} catch(err) {
			//Non fatal, just report it
			sentry.error(new Error(err), 'Warning');
			logger.warn('Unable to check for app updates', {service: 'AppUpdate', obj: err});
		}
	}
}

export function setManualUpdate(state: boolean) {
	manualUpdate = state;
}