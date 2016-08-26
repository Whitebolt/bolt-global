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

function getMenu(menuName, req) {
  return req.app.db.collection('menus').findOne({"name": menuName}).then(doc => {
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
		console.log("Calling Global");
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