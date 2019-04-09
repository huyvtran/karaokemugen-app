import {toFile} from 'qrcode';
import {getConfig} from '../_utils/config';
import {getState} from '../_utils/state';
import {resolve} from 'path';
import logger from 'winston';

export async function buildQRCode(url) {
	const conf = getConfig();
	const qrcodeImageFile = resolve(getState().appPath,conf.System.Path.Temp, 'qrcode.png');
	logger.debug(`[QRCode] URL detected : ${url}`);
	return new Promise((OK, NOK) => {
		toFile(qrcodeImageFile, url, {}, err => {
			if (err) {
				NOK(`Error generating QR Code : ${err}`);
			} else {
				OK(true);
			}
		});
	});
}



