'use strict';

function addTemplate(component, isJson=false) {
	let template;

	if (isJson) {
		if (component.req.doc.viewContentOnly && component.req.app.templates[component.req.doc.viewContentOnly]) {
			template = component.req.doc.viewContentOnly
		} else if (component.req.doc.view && component.req.app.templates[component.req.doc.view + "ContentOnly"]) {
			template = component.req.doc.view + "ContentOnly"
		} else if (component.req.app.templates["indexContentOnly"]) {
			template = "indexContentOnly"
		}
	} else if (component.req.doc.view && component.req.app.templates[component.req.doc.view]) {
		template = component.req.app.templates[component.req.doc.view];
	} else {
		template = "index";
	}

	component.template = template;
}

function ok(component, req, done, app) {
	let isJson = !!((req.method.toLowerCase() === "post") && req.is('application/json') && req.body);
	let jsonExports = (app.components.index.controllers.index._jsonExports || {});

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

function set404(res) {
	res.status(404);
	res.body = "Page not found";
}

let exported = {
	error: function(component, res, done, req, app) {
		// @annotation accept-errors true

		let doc = {};
		doc.title = res.statusCode.toString();
		doc.content = res.statusMessage;

		return ok(component, doc, req, done, app);
	},

	index: async function(path, req, doc) {
		const _doc = await bolt.getDoc({query: {path}, req});
		Object.assign(doc, _doc);
		return this.indexDisplay();
	},

	indexDisplay: function(component, doc, req, done, app, config, res){
		// @annotation visibility private

		if (!doc && !config.proxy) return set404(res);
		if (doc) ok(component, req, done, app);
	}
};

module.exports = exported;