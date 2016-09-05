'use strict';

const xGetXxlTags = /<[^>]*>/g;

function getPages(component) {
	let req = component.req;
	let dbConditions = {_id: true, title: true, path: true};

	return req.app.db.collection('pages').find({}, dbConditions).toArray()
		.then(docs => docs.sort((a,b)=>((a.title>b.title)?1:((a.title<b.title)?-1:0))))
		.map(constructPagesAdminMenuData)
		.then(menu => component.res.json({
			title: "Pages",
			menu
		}));
}

function constructPagesAdminMenuData(doc) {
	return {
		title: doc.title.replace(xGetXxlTags, ''),
		action: "EditorPanelOpen",
		data: doc._id,
		subTitle: doc.path,
		src: "/admin/pages/getPage"
	};
}

function getPage(component) {
	let req = component.req;
	let doc = component.doc = component.doc || {};

	if ((req.method.toLowerCase() === 'post') && req.body && req.body.data) {
		return req.app.db.collection('pages').findOne({
			_id: bolt.mongoId(req.body.data)
		}).then(page => {
			doc.page = page;
			component.view = 'editor';
			component.done = true;

			return component;
		});
	}

	return component;
}

function _createUpdateSet(doc, tag='') {
	let setter = {};
	Object.keys(doc).forEach(fieldName=>{
		if (!bolt.isPlainObject(doc[fieldName])) {
			setter[fieldName] = doc[fieldName];
		} else {
			setter[fieldName] = createUpdateSet(setter[fieldName], tag + '.' + fieldName);
		}
	});
	return setter;
}

function pageUpdate(component) {
	let req = component.req;
	if ((req.method.toLowerCase() === 'post') && req.body && req.body._id) {
		let id = req.body._id;
		let doc = Object.assign({}, req.body);

		return bolt.isAuthorised({id, req, accessLevel: 'edit'}).then(isAuthorised=>{
			if (!isAuthorised) return component;
			let _doc = bolt.removeUnauthorisedFields({doc, req, accessLevel:'edit'});
			delete _doc._id;

			return req.app.db.collection('pages').update({
				_id: bolt.mongoId(id)
			}, {
				$set: _createUpdateSet(_doc)
			});
		}).then(result=>component);
	}

	return component;
}


let exported = {
	getPages, getPage, pageUpdate
};

module.exports = exported;