'use strict';

const Promise = module.parent.require("bluebird");

let exported = {
	index: function(component) {
		let req = component.req;
		let doc = component.doc = component.doc || {};
		let parent = component.parent = component.parent || {};

		doc.view = '/admin/users/selector';

		return req.app.db.collection('users').find().toArray().then(docs => {
			doc.users = docs;

			return component;
		});
	}
};

module.exports = exported;