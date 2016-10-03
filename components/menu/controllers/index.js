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

function getMenu(menuName, req) {
	return req.app.db.collection('menus')
		.findOne({"name": menuName})
		.then(doc=>{
			req.doc.menu = doc;
			return doc;
		}).then(
			doc=>filterMenu(doc, req.app.db, req.session)
		).then(items=>{
			req.doc.menu.items = items;
			setActive(req.doc, items);
			return {};
		}).error(err=>{
			return {};
		});
}

let exported = {
	index: function(component) {
		let doc = component.doc || component.req.doc || {};
		let parent = component.parent || {};
		let menuName = parent.menu || "main";
		let viewName = parent.subMenu?"menu/sub":"menu/index";

		if (!doc.menu || parent._reloadMenu) {
			return getMenu(menuName, component.req).then(blah =>
				component.view(viewName, doc, component.req, component.parent)
			);
		} else {
			return component.view(viewName, doc, component.req, component.parent)
		}
	}
};

Object.keys(exported).forEach(methodName => {
	exported[methodName].root = "Global";
});

module.exports = exported;