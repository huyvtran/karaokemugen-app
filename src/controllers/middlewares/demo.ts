import {getState} from '../../utils/state';

export function requireNotDemo(_req: any, res: any, next: any) {
	!getState().isDemo
		? next()
		: res.status(503).send('Not allowed in demo mode');
}
