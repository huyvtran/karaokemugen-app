import {getConfig} from '../_common/utils/config';
import {editUser} from '../_services/user';
import randomstring from 'randomstring';
import opn from 'opn';

function generateAdminPassword() {
	const adminPassword = randomstring.generate(8);
	editUser('admin',{ 
		password: adminPassword,
		nickname: 'Dummy Plug System'});
	return adminPassword;
}

export async function welcomeToYoukousoKaraokeMugen(port) {	
	const conf = getConfig();
	if (conf.appFirstRun) {
		const adminPassword = generateAdminPassword();
		opn('http://localhost:' + port + '/ressources/views/welcome.html?admpwd=' + adminPassword);
	} else {
		if (!conf.optNoBrowser) {
			opn('http://localhost:' + port + '/admin');
		}
	}
}