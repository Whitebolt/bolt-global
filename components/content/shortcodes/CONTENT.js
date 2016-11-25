'use strict';

const controller = require('../controllers/');

function index(tag, component) {
	if (tag.attributes.path) {
		return bolt.getDoc({
			query: {path:tag.attributes.path}, req:component.req
		}).then(doc=>{
			if (doc) {
				return controller.index(component, doc);
			}
		});
	}
}

module.exports = index;