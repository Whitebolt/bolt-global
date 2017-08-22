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

/**
 * @todo Perhaps send a 401 with some sort of message instead of a redirect.
 */
function login(component, req) {
	return new Promise(resolve=>{
		passport.authenticate('local')(req, {end: ()=>{
			component.redirect = '/auth/login?authFailed=1';
			req.logout();
			component.res.statusCode = 401;
			return resolve(component);
		}}, ()=>{
			component.redirect = '/';
			return resolve(component);
		});
	});
}

function logout(req, component) {
	if (req.isWebSocket) {
		req.logout();
	} else {
		req.logout();
	}
	component.redirect = '/';
	return component;
}

let exported = {
	login: function(component, method, req) {
		// @annotation schema authLogin

		return ((method === 'get') ?
			loginView(component, req) :
			((method === 'post') ? login(component, req) : component)
		);
	},

	logout: (req, component)=>logout(req, component),

	"change-password": function(component, method, doc, session, body) {
		if (method === 'get') {
			if (component.view) {
				return component.view(doc._view || "auth/change-password", doc, component.req, component.parent);
			}
		} else if (method === 'post') {
			return new Promise(resolve => {
				resolve(compare(body.password, session.password).then(authenticated => {
					if (!authenticated) {
						component.redirect = '/auth/change-password?authFailed=1';
						return component;
					}

					if (body.password1 === body.password2) {
						return genSalt(SALT_WORK_FACTOR)
							.then(salt => hash(body.password1, salt))
							.then(hashedPassword => {
								return req.app.db.collection('users').update({
									_id: bolt.mongoId(session._id)
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

		return component;
	}
};

module.exports = exported;