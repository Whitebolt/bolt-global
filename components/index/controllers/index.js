'use strict';

const Promise = module.parent.require('bluebird');

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

function assignDoc(req, doc) {
	if (req.doc) {
		Object.assign(req.doc, doc);
	} else {
		req.doc = doc;
	}
}

function ok(component, doc, req, done, app) {
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

	return component;
}

function set404(component) {
	component.res.status(404);
	component.res.body = "Page not found";
	return component;
}

let exported = {
	error: function(component, res, done, req, app) {
		// @annotation accept-errors true

		let doc = {};
		doc.title = res.statusCode.toString();
		doc.content = res.statusMessage;

		return ok(component, doc, req, done, app);
	},

	index: function(component, req, res, app, path, config, done) {
		return bolt.getDoc({
			query: {path}, req
		}).then(doc=>exported.indexDisplay(component, doc, req, done, app, config));
	},

	indexDisplay: function(component, doc, req, done, app, config){
		// @annotation visibility private

		if (!doc && !config.proxy) return set404(component);
		if (doc) ok(component, doc, req, done, app);
		return component;
	}
};

module.exports = exported;