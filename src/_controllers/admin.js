import {getConfig} from '../_common/utils/config';
import {run} from '../_admin/generate_karasdb';
import {requireAuth, requireValidUser, requireAdmin} from './passport_manager.js';
import {editUser, createUser, findUserByID, listUsers} from '../_services/user';
import {runBaseUpdate} from '../_updater/karabase_updater';
import {resetViewcounts} from '../_dao/kara.js';
import {createUser} from '../_services/user';

module.exports = function adminController(router) {

	router.get('/config', requireAuth, requireValidUser, requireAdmin, (req, res) => {
		res.json(getConfig());
	});

	router.post('/db/regenerate', requireAuth, requireValidUser, requireAdmin, (req, res) => {
		run()
			.then(() => res.status(200).send('DB successfully regenerated'))
			.catch(err => res.status(500).send('Error while regenerating DB: ' + err));
	});

	router.post('/kara/generate-all', requireAuth, requireAdmin, (req, res) => {
		run()
			.then(() => res.status(200).send('Karas successfully generated'))
			.catch(err => res.status(500).send('Error while regenerating karas: ' + err));
	});

	router.get('/users', requireAuth, requireValidUser, requireAdmin, (req, res) => {
		listUsers()
			.then(users => res.json(users))
			.catch(err => res.status(500).send('Error while fetching users: ' + err));

	});

	router.get('/users/:userId', requireAuth, requireValidUser, requireAdmin, (req, res) => {
		findUserByID(req.params.userId)
			.then(user => res.json(user))
			.catch(err => res.status(500).send('Error while fetching user: ' + err));

	});

	router.post('/users/create', requireAuth, requireAdmin, (req, res) => {
		createUser(req.body)
			.then(res.send('OK'))
			.catch(err => res.status(500).send('Error while creating user: ' + err));
	});

	router.put('/users/:userId', requireAuth, requireValidUser, requireAdmin, (req, res) => {		
		editUser(req.body.login,req.body,req.body.avatar,req.authToken.role)
			.then(() => res.status(200).send('User edited'))
			.catch(err => res.status(500).send('Error editing user: ' + err));			
	});


	router.post('/db/resetviewcounts', requireAuth, requireValidUser, requireAdmin, (req, res) => {
		resetViewcounts()
			.then(() => res.status(200).send('Viewcounts successfully reset'))
			.catch(err => res.status(500).send('Error resetting viewcounts: ' + err));

	});

	router.post('/karas/update', requireAuth, requireAdmin, (req, res) => {
		runBaseUpdate()
			.then(() => res.status(200).send('Karas successfully updated'))
			.catch(err => res.status(500).send('Error while updating karas: ' + err));

	});
};
