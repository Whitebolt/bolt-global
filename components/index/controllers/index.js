'use strict';

function addTemplate(component) {
	component.template = (
		(component.req.doc.view && component.req.app.templates[doc.view]) ?
			component.req.doc.view :
			'index'
	);
}

function assignDoc(req, doc) {
	if (req.doc) {
		Object.assign(req.doc, doc);
	} else {
		req.doc = doc;
	}
}

let exported = {
	index: function(component) {
		const req = component.req;
		const app = req.app;
		const path = bolt.getPathFromRequest(req);

		return bolt.getDoc({
			query: {path}, req
		}).then(doc=>{
			if (!doc && !app.config.proxy) throw "Document not found in Database";
			if (doc) {
				assignDoc(req, doc);
				if (!component.template) addTemplate(component);
				component.done = true;
			}

			return component;
		});
	}
};

module.exports = exported;