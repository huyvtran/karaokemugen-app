import {expect} from 'chai';
import langs from 'langs';
import supertest from 'supertest';

import { DBTag } from '../../src/lib/types/database/tag';
import { md5Regexp,tagTypes, uuidPlusTypeRegexp,uuidRegexp } from '../../src/lib/utils/constants';
import {Config} from '../../src/types/config';
import { testDownloads } from '../../src/utils/constants';

export const request = supertest('http://localhost:1337');
export const usernameAdmin = 'adminTest';
export const passwordAdmin = 'ceciestuntest';
export const allLangs = langs.codes('2B');
export const allKIDs = testDownloads.map(d => d.kid);
const tokens = new Map();

export async function getToken(username = usernameAdmin): Promise<string> {
	if (!tokens.has(username)) {
		const res = await request
			.post('/api/auth/login')
			.set('Accept', 'application/json')
			.send({
				username: username,
				password: passwordAdmin
			})
			.expect(200);
		tokens.set(username, res.body.token);
	}
	return tokens.get(username);
}


let config: Config;

export function getConfig(): Config {
	return config;
}

export function setConfig(newConfig: Config) {
	config = newConfig;
}

interface TestDetails {
	tagDetails: 'short'|'full',
	kara?: boolean
	plc?: boolean
	plcDetail?: boolean
}

export function testKara(kara: any, details: TestDetails) {
	for (const tagType of Object.keys(tagTypes)) {
		expect(kara[tagType]).to.be.an('array');
		for (const tag of kara[tagType]) {
			testTag(tag as any, details.tagDetails);
		}
	}
	if (details.kara) expect(kara.created_at).to.be.a('string');
	expect(kara.duration).to.be.a('number').and.at.least(0);
	if (details.plc) expect(kara.flag_blacklisted).to.be.a('boolean');
	expect(kara.flag_dejavu).to.be.a('boolean');
	expect(kara.flag_favorites).to.be.a('boolean');
	if (details.plc) expect(kara.flag_free).to.be.a('boolean');
	if (details.kara) expect(kara.flag_inplaylist).to.be.a('boolean');
	expect(kara.flag_upvoted).to.be.a('boolean');
	if (details.plc) expect(kara.flag_visible).to.be.a('boolean');
	if (details.plc) expect(kara.flag_whitelisted).to.be.a('boolean');
	if (details.kara || details.plcDetail) expect(kara.gain).to.be.a('number');
	if (details.plcDetail) expect(kara.kara_created_at).to.be.a('string');
	if (details.plcDetail) expect(kara.kara_modified_at).to.be.a('string');
	expect(kara.karafile).to.be.a('string');
	expect(kara.kid).to.be.a('string').and.match(new RegExp(uuidRegexp));
	if (details.kara || details.plcDetail) expect(kara.lastplayed_ago).to.satisfy((e:any) => typeof e === 'string' || e === null);
	if (details.kara) expect(kara.lastrequested_at).to.satisfy((e:any) => typeof e === 'string' || e === null);
	expect(kara.lastplayed_at).to.satisfy((e:any) => typeof e === 'string' || e === null);
	expect(kara.mediafile).to.be.a('string');
	expect(kara.mediasize).to.be.a('number').and.at.least(0);
	if (details.kara) expect(kara.modified_at).to.be.a('string');
	if (details.kara) {
		expect(kara.my_public_plc_id).to.be.an('array');
		for (const plcid of kara.my_public_plc_id) {
			expect(plcid).to.satisfy((p:any) => typeof p === 'number' || p === null);
		}
	}
	if (details.plc) {
		expect(kara.nickname).to.be.a('string');
	}
	expect(kara.played).to.be.a('number').and.at.least(0);
	if (details.plcDetail) expect(kara.playlist_id).to.be.a('number').and.at.least(0);
	if (details.plc) expect(kara.playlistcontent_id).to.be.a('number').and.at.least(0);
	if (details.plc) expect(kara.pos).to.be.a('number').and.at.least(0);
	expect(kara.requested).to.be.a('number').and.at.least(0);
	expect(kara.songorder).to.satisfy((s:any) => typeof s === 'number' || s === null);
	if (details.kara) expect(kara.subchecksum).to.satisfy((s:any) => (typeof s === 'string' && new RegExp(md5Regexp).test(s)) || s === null);
	expect(kara.subfile).to.satisfy((s:any) => typeof s === 'string' || s === null);
	if (details.kara) {
		expect(kara.tid).to.be.an('array');
		for (const tid of kara.tid) {
			expect(tid).to.be.a('string').and.match(new RegExp(uuidPlusTypeRegexp));
		}
	}
	if (details.plcDetail) expect(kara.time_before_play).to.satisfy((s:any) => typeof s === 'number' || s === null);
	expect(kara.title).to.be.a('string');
	if (details.plc) expect(kara.upvotes).to.be.a('number').and.at.least(0);
	if (details.plc) expect(kara.username).to.be.a('string');
	expect(kara.year).to.be.a('number');
}

export function testTag(tag: DBTag, type: 'short'|'full'|'tag') {
	expect(tag.name).to.be.a('string');
	expect(tag.problematic).to.be.a('boolean');
	if (tag.noLiveDownload) expect(tag.noLiveDownload).to.be.a('boolean');
	expect(tag.short).to.satisfy((val: any) => typeof val === 'string' || val === null);
	expect(tag.tid).to.be.a('string').and.match(new RegExp(uuidRegexp));
	if (type === 'full' || type === 'tag') {
		if (tag.aliases) expect(tag.aliases).to.satisfy((e:any) => e === undefined || Array.isArray(e));
		expect(tag.i18n).to.be.an('object');
		for (const val of Object.values(tag.i18n)) {
			expect(val).to.be.a('string');
		}
		const langs = Object.keys(tag.i18n);
		// Langs should be included in all Langs
		for (const lang of langs) {
			expect(allLangs).to.include(lang);
		}
		expect(tag.types).to.be.an('array');
		for (const type of tag.types) {
			expect(type).to.be.a('number').and.at.least(1);
		}
	}
	if (type === 'tag') {
		expect(tag.modified_at).to.be.a('string');
		expect(tag.repository).to.be.a('string');
		expect(tag.tagfile).to.be.a('string');
		if (tag.karacount) expect(tag.karacount).to.satisfy((karacounts: any) => {
			if (karacounts === null) return true;
			if (Array.isArray(karacounts)) {
				return karacounts.every(kc => typeof kc.count === 'number' && typeof kc.type === 'number');
			}
			return false;
		});
	}
}