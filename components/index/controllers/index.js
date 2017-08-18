'use strict';

function addTemplate(component, isJson=false) {
	let template;

	if (isJson) {
		if (component.req.doc.viewContentOnly && component.req.app.templates[doc.viewContentOnly]) {
			template = component.req.doc.viewContentOnly
		} else if (component.req.doc.view && component.req.app.templates[doc.view + "ContentOnly"]) {
			template = component.req.doc.view + "ContentOnly"
		} else if (component.req.app.templates["indexContentOnly"]) {
			template = "indexContentOnly"
		}
	} else if (component.req.doc.view && component.req.app.templates[doc.view]) {
		template = component.req.app.templates[doc.view];
	} else {
		template = "index";
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
	index: function(component, req, app, path, config, done) {
		return bolt.getDoc({
			query: {path}, req
		}).then(doc=>{
			if (!doc && !config.proxy) throw "Document not found in Database";

			if (doc) {
				let isJson = !!((req.method.toLowerCase() === "post") && req.is('application/json') && req.body);
				let jsonExports = (app.components.index.controllers.index._jsonExports || {});

				assignDoc(req, doc);
				if (isJson && jsonExports.index && jsonExports.index.length ) {
					component.sendFields = bolt.clone(jsonExports.index);
				}

				if (!component.template) addTemplate(component, isJson);

				if (isJson) {
					component.mime("json");
				} else {
					component.mime(req.doc.mime || "html");
				}

				done();
			}

			return component;
		});
	},
	index2: function(){
		// @annotation visibility private
		console.log("HELLO2");
	}
};

module.exports = exported;