'use strict';

const Promise = module.parent.require("bluebird");

function getPages(component) {
	let req = component.req;

	return req.app.db.collection('pages').find({}, {_id:1, title:1, path:1}).toArray().then(docs => {
		component.done = true;
		component.sent = true;

		docs = docs.concat(docs).concat(docs).concat(docs).concat(docs).concat(docs).concat(docs);

		component.res.json({
			data: docs,
			title: "Please select a page to edit"
		});
		return component;
	});
}

let exported = {
	index: function(component) {
		component.template = "admin";
		component.done = true;

		return Promise.resolve(component);
	},

	getCollection: function(component) {
		let req = component.req;
		if ((req.method.toLowerCase() === 'post') && req.body && req.body.collection) {
			if (req.body.collection === 'pages') {
				return getPages(component);
			}
		}



		return Promise.resolve(component);
	}
};

module.exports = exported;