'use strict';


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
				component.template = ((doc.view && req.app.templates[doc.view]) ? doc.view : 'index');
				req.doc = doc;
				component.done = true;
			}

			return component;
		});
	}
};

module.exports = exported;