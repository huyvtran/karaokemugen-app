import configure from '@jimp/custom';
import jpeg from '@jimp/jpeg';
import circle from '@jimp/plugin-circle';
import png from '@jimp/png';

import { convertAvatar } from '../lib/utils/ffmpeg';
import { asyncUnlink,replaceExt } from '../lib/utils/files';
import sentry from '../utils/sentry';

const j = configure({
	plugins: [circle],
	types: [png, jpeg]
});

export async function createCircleAvatar(file: string) {
	try {
		const convertedFile = await convertAvatar(file);
		// Load the jpg converted file
		const image = await j.read(convertedFile);
		await image.circle().writeAsync(replaceExt(file, '.circle.png'));
		// Delete the converted file
		// Failure is non fatal.
		asyncUnlink(convertedFile).catch(() => {});
	} catch(err) {
		sentry.error(err);
		throw err;
	}
}
