'use strict';

function getGroups(component) {
	let req = component.req;

	return bolt.getDocs({
		query: {},
		projection: ['_id', 'name', 'users'],
		req,
		collection: 'groups',
		filterByVisibility: false
	}).then(
		docs => docs.sort((a,b)=>((a.name>b.name)?1:((a.name<b.name)?-1:0)))
	).map(
		constructPagesAdminMenuData
	).then(
		menu => component.res.json({title: 'Groups', menu})
	);
}

function constructPagesAdminMenuData(doc) {
	return {
		title: doc.name,
		action: "EditorPanelOpen",
		data: doc._id,
		subTitle: "No. of users: " + doc.users.length.toString(),
		src: "/admin/users/groups/getGroup"
	};
}

module.exports = {
	getGroups
};