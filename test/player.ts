import { expect } from 'chai';

import { uuidRegexp } from '../src/lib/utils/constants';
import { getToken, request } from './util/util';

describe('Player', () => {
	let token: string;
	before(async () => {
		token = await getToken();
	});
	it('Get player status', () => {
		return request
			.get('/api/player')
			.set('Accept', 'application/json')
			.set('Authorization', token)
			.expect('Content-Type', /json/)
			.expect(200)
			.then(res => {
				expect(res.body.currentRequester).to.satisfy((e:any) => typeof e === 'string' || e === null);
				expect(res.body.currentSessionID).to.be.a('string').and.match(new RegExp(uuidRegexp));
				expect(res.body.currentSong).to.satisfy((e:any) => typeof e === 'object' || e === null);
				expect(res.body.defaultLocale).to.be.a('string').and.have.lengthOf(2);
				expect(res.body.currentlyPlaying).to.satisfy((e:any) => typeof e === 'string' || e === null);
				expect(res.body.duration).to.be.a('number');
				expect(res.body.onTop).to.be.a('boolean');
				expect(res.body.stopping).to.be.a('boolean');
			});
	});
});
