'use strict';

function getUsers(component) {
	let req = component.req;

	return bolt.getDocs({
		query: {},
		projection: ['_id', 'userName', 'accountEmail'],
		req,
		collection: 'users',
		filterByVisibility: false
	}).then(
		docs => docs.sort((a,b)=>((a.name>b.name)?1:((a.name<b.name)?-1:0)))
	).map(
		constructPagesAdminMenuData
	).then(
		menu => component.res.json({title: 'Users', menu})
	);
}

function getUser(component) {
	let req = component.req;
	let doc = component.doc = component.doc || {};

	if ((req.method.toLowerCase() === 'post') && req.body && req.body.data) {
		let id = req.body.data;
		return bolt.getDoc({
			req,
			id,
			accessLevel:'edit',
			collection:'users',
			filterByVisibility: false
		}).then(user =>{
			if (!user) return component;
			doc.user = user;
			doc.user.name = doc.user.name || '';

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

function userUpdate(component) {
	let req = component.req;
	if ((req.method.toLowerCase() === 'post') && req.body && req.body._id) {
		let id = req.body._id;
		let doc = Object.assign({}, req.body);

		return bolt.isAuthorised({
			id,
			req,
			accessLevel: 'edit',
			collection: 'users',
		}).then(isAuthorised=>{
			if (!isAuthorised) return component;
			let _doc = bolt.removeUnauthorisedFields({doc, req, accessLevel:'edit'});
			delete _doc._id;

			return req.app.db.collection('users').update({
				_id: bolt.mongoId(id)
			}, {
				$set: _createUpdateSet(_doc)
			});
		}).then(result=>component);
	}

	return component;
}

function constructPagesAdminMenuData(doc) {
	return {
		title: doc.name || doc.userName,
		action: "EditorPanelOpen",
		data: doc._id,
		subTitle: doc.accountEmail,
		src: "/admin/users/getUser"
	};
}

module.exports = {
	getUsers, getUser, userUpdate
};