'use strict';

function getMenus(component) {
	let req = component.req;

	return bolt.getDocs({
		query: {},
		projection: ['_id', 'name', 'items'],
		req,
		collection: 'menus',
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
		subTitle: "No. of items: " + doc.items.length.toString(),
		src: "/admin/menus/getMenu"
	};
}

module.exports = {
	getMenus
};