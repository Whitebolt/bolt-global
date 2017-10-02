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

function filterMenu(doc, db, session) {
	return Promise.all((doc.items || []).map(item=>{
		return bolt.getDoc({query: {path: item.path}, db, accessLevel:'read', session}).then(doc=>{
			if (doc === undefined) return undefined;
			return ((item.items) ? filterMenu(item, db, session).then(items=>{
				item.items = items;
				return item;
			}) : item);
		});
	})).then(filterUndef);
}

function getMenu(menuName, app, doc, db, session) {
	return db.collection('menus')
		.findOne({"name": menuName})
		.then(_doc=>{
			doc.menu = _doc;
			return doc;
		}).then(
			doc=>filterMenu(doc, db, session)
		).then(items=>{
			doc.menu.items = items;
			setActive(doc, items);
			return {};
		}).error(err=>{
			return {};
		});
}

let exported = {
	index: async function(view, doc, parent, req, app, db, session) {
		const menuName = parent.menu || "main";
		const viewName = parent.subMenu?"menu/sub":"menu/index";

		if (!doc.menu || parent._reloadMenu) {
			return getMenu(menuName, app, doc, db, session).then(()=>view(viewName, doc, req, parent));
		} else {
			return view(viewName, doc, req, parent)
		}
	}
};

Object.keys(exported).forEach(methodName => {
	exported[methodName].root = "Global";
});

module.exports = exported;