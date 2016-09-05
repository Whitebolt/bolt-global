'use strict';

function setActive(doc, items) {
  let itemSet = false;
  (items || []).forEach(item => {
    if (item.path === doc.path) {
      item.active = true;
      itemSet = true;
    } else {
      item.active = false;
    }

    if (setActive(doc, item.items)) {
      item.active = true;
    }
  });
  return itemSet;
}

function filterUndef(items) {
	return items.filter(item=>{
		if (!item) return false;
		return true;
	});
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
	})).then(items=>filterUndef(items));
}

function getMenu(menuName, req) {
	return req.app.db.collection('menus')
		.findOne({"name": menuName})
		.then(doc=>{
			return filterMenu(doc, req.app.db, req.session).then(items=>{
				doc.items = items;
				return doc;
			});
		})
		.then(doc=>{
			if (doc) {
				req.doc.menu = doc;
				setActive(req.doc, doc.items)
			}

			return {};
		}, err => {
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