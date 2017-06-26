'use strict';

const Promise = module.parent.require('bluebird');
const passport = module.parent.require('passport');
const bcrypt = module.parent.require('bcrypt');
const genSalt = Promise.promisify(bcrypt.genSalt);
const compare = Promise.promisify(bcrypt.compare);
const hash = Promise.promisify(bcrypt.hash);
const SALT_WORK_FACTOR = 10;

function loginView(component) {
	if (component.view && ((component.req && component.req.doc) || (component.doc))) {
		let doc = component.doc || component.req.doc || {};
		return component.view(doc._view || "auth/login", doc, component.req, component.parent);
	}

	return component;
}

function login(component) {
	return new Promise(resolve=>{
		passport.authenticate('local')(component.req, {end:()=>{
			component.redirect = '/auth/login?authFailed=1';
			component.req.logout();
			component.res.statusCode = 401;
			return resolve(component);
		}}, ()=>{
			component.redirect = '/';
			return resolve(component);
		});
	});
}

function logout(component) {
	component.req.logout();
	component.redirect = '/';
	return Promise.resolve(component);
}

let exported = {
	login: function(component) {
		return ((component.req.method.toUpperCase() === 'GET') ?
			loginView(component) :
			((component.req.method.toUpperCase() === 'POST') ? login(component) : component)
		);
	},

	logout: logout,

	"change-password": function(component) {
		let req = component.req;

		if (req.method === 'GET') {
			if (component.view) {
				let doc = component.doc || component.req.doc || {};
				return component.view(doc._view || "auth/change-password", doc, component.req, component.parent);
			}
		} else if (req.method === 'POST') {
			return new Promise(resolve => {
				resolve(compare(req.body.password, req.session.password).then(authenticated => {
					if (!authenticated) {
						component.redirect = '/auth/change-password?authFailed=1';
						return component;
					}

					if (req.body.password1 === req.body.password2) {
						return genSalt(SALT_WORK_FACTOR)
							.then(salt => hash(req.body.password1, salt))
							.then(hashedPassword => {
								return req.app.db.collection('users').update({
									_id: bolt.mongoId(req.session._id)
								}, {
									$set: {password: hashedPassword}
								});
							}).then(user => {
								component.redirect = '/';
								return component;
							});
					}
				}));
			});
		}

		return Promise.resolve(component);
	}
};

module.exports = exported;