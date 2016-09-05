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

function pageUpdate(component) {
	let req = component.req;
	if ((req.method.toLowerCase() === 'post') && req.body && req.body._id) {
		let id = req.body._id;
		let doc = Object.assign({}, req.body);

		return bolt.isAuthorised({id, req, accessLevel: 'edit'}).then(isAuthorised=>{
			if (isAuthorised) {
				let _doc = bolt.authorisedFieldsMap(doc, req.session, 'edit');
				delete doc._id;

				return req.app.db.collection('pages').update({
					_id: bolt.mongoId(id)
				}, _doc).then(result=>{
					console.log(result);
					return component;
				});
			} else {
				return component;
			}
		});
	}

	return component;
}


let exported = {
	getPages, getPage, pageUpdate
};

module.exports = exported;