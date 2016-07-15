'use strict';

function getPages(component) {
	let req = component.req;
	let doc = component.doc = component.doc || {};
	let pathParts = bolt.getPathPartsFromRequest(req);

	return req.app.db.collection('pages').find().toArray().then(docs => {
		doc.pages = docs.sort((a,b)=>((a.title>b.title)?1:((a.title<b.title)?-1:0)));
		doc.view = '/admin/pages/selector';

		return ((pathParts.length >= 3) ? getPage(component, pathParts[2]) : component);
	});
}

function getPage(component, id) {
	let req = component.req;
	let doc = component.doc = component.doc || {};

	return req.app.db.collection('pages').findOne({
		_id: bolt.mongoId(id)
	}).then(page => {
		doc.page = page;
		doc.viewEditor = '/admin/pages/editor';

		return component;
	});
}


let exported = {
	index: function(component) {
		return getPages(component);
	}
};

module.exports = exported;