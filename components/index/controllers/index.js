'use strict';

function addTemplate(component, isJson=false) {
	let template = "index";

	if (isJson) {
		if (component.req.doc.viewContentOnly && component.req.app.templates[doc.viewContentOnly]) {
			template = component.req.doc.viewContentOnly
		} else if (component.req.doc.view && component.req.app.templates[doc.view + "ContentOnly"]) {
			template = component.req.doc.view + "ContentOnly"
		} else if (component.req.app.templates[template + "ContentOnly"]) {
			template = template + "ContentOnly"
		}
	} else if (component.req.doc.view && component.req.app.templates[doc.view]) {
		template = component.req.app.templates[doc.view];
	}

	component.template = template;
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
				let isJson = ((req.method.toLowerCase() === "post") && req.is('application/json') && req.body);
				let jsonExports = (app.components.index.controllers.index._jsonExports || {});

				assignDoc(req, doc);
				if (isJson && jsonExports.index) {
					component.data = {};
					jsonExports.index.forEach(fieldName=>{
						component.data[fieldName] = req.doc[fieldName];
					});
				} else {
					if (!component.template) addTemplate(component, isJson);
				}

				if (isJson) {
					component.mime("json");
				} else {
					component.mime(req.doc.mime || "html");
				}

				component.done = true;
			}

			return component;
		});
	}
};

module.exports = exported;