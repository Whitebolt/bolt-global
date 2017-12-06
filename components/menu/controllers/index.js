'use strict';

function setActive(doc, items) {
	return !!(items || []).find(item=>{
		if (!item.path && !doc.path) return undefined;

		let itemPath = item.path.toLowerCase().trim();
		let docPath = doc.path.toLowerCase().trim();

		item.active = (setActive(doc, item.items) || (itemPath === docPath) || (itemPath === doc._parentPagePath));

		return item.active;
	});
}

function filterUndef(items) {
	return items.filter(item=>item);
}

async function filterMenu(menu, db, session) {
	const items = await Promise.all((menu.items || []).map(async (item)=>{
		const itemDoc = bolt.getDoc({query: {path: item.path}, db, accessLevel:'read', session});
		if (itemDoc === undefined) return undefined;
		if (!item.items) return item;
		item.items = await filterMenu(item, db, session);
	}));

	return filterUndef(items);
}

async function getMenu(menuName, doc, db, session) {
	doc.menu = await db.collection('menus').findOne({"name": menuName});
	doc.menu.items = await filterMenu(doc.menu, db, session);
	setActive(doc, doc.menu.items);
}

let exported = {
	index: async function(view, doc, parent, req, app, db, session) {
		if (!doc.menu || parent._reloadMenu) await getMenu(parent.menu || "main", doc, db, session);
		return view(parent.subMenu?"menu/sub":"menu/index", doc, req, parent)
	}
};

Object.keys(exported).forEach(methodName => {
	exported[methodName].root = "Global";
});

module.exports = exported;