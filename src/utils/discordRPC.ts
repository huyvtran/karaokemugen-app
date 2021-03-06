import discordRPC from 'discord-rpc';
import i18next from 'i18next';
import sample from 'lodash.sample';

import { getConfig } from '../lib/utils/config';
import { version } from '../version';

const clientId = '718211141033263145';

let rpc: any;

discordRPC.register(clientId);

export async function setDiscordActivity(activityType: 'song' | 'idle', activityData?: any) {
	try {
		if (!getConfig().Online.Discord.DisplayActivity || !rpc || !rpc?.clientId) {
			if (!rpc || !rpc?.clientId) startCheckingDiscordRPC();
			return;
		}
		const startTimestamp = new Date();
		let activity: string;
		let activityDetail = 'Zzz...';
		if (activityType === 'idle') {
			activity = sample(i18next.t('DISCORD.IDLING', {returnObjects: true}));
		}
		if (activityType === 'song') {
			activity = activityData.title + '        ';
			activityDetail = activityData.singer;
		}
		await rpc.setActivity({
			details: activity.substring(0, 128),
			state: activityDetail.substring(0, 128),
			startTimestamp,
			largeImageKey: 'nanami-smile',
			largeImageText: 'Karaoke Mugen',
			smallImageKey: activityType === 'song' ? 'play' : 'pause',
			smallImageText: `Version ${version.number} - ${version.name}`,
			instance: false,
		});
	} catch(err) {
		// Non-fatal
	}
}

export async function stopDiscordRPC() {
	if (rpc) {
		try {
			await rpc.destroy();
		} catch(err) {
			//Non fatal
		}
		rpc = null;
	}
	if (!getConfig().Online.Discord.DisplayActivity) stopCheckingDiscordRPC();
}

let intervalIDDiscordRPCSetup: any;

export function initDiscordRPC() {
	startCheckingDiscordRPC();
	setupDiscordRPC();
}

function startCheckingDiscordRPC() {
	if (!intervalIDDiscordRPCSetup) intervalIDDiscordRPCSetup = setInterval(setupDiscordRPC, 15000);
}

/** Stop displaying the Add a song to the list */
function stopCheckingDiscordRPC() {
	if (intervalIDDiscordRPCSetup) clearInterval(intervalIDDiscordRPCSetup);
	intervalIDDiscordRPCSetup = undefined;
}


export function setupDiscordRPC() {
	if (rpc || !getConfig().Online.Discord.DisplayActivity) return;
	rpc = new discordRPC.Client({ transport: 'ipc' });

	rpc.on('ready', () => {
		setDiscordActivity('idle');
		stopCheckingDiscordRPC();
		// activity can only be set every 15 seconds
	});
	rpc.on('disconnected', () => {
		stopDiscordRPC();
		startCheckingDiscordRPC();
	});
	rpc.login({ clientId }).catch(() => {
		stopDiscordRPC();
		if (getConfig().Online.Discord.DisplayActivity) startCheckingDiscordRPC();
	});
}
