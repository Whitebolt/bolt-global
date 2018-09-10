'use strict';

function addTemplate(component, isJson=false) {
	let template;

	const doc = bolt.get(component, 'res.locals.doc', {});
	const templates = bolt.get(component, 'req.app.templates', {});
	const {view, viewContentOnly} = doc;

	if (isJson) {
		if (viewContentOnly && templates[viewContentOnly]) {
			template = viewContentOnly;
		} else if (doc.view && templates[`${view}ContentOnly`]) {
			template = `${view}ContentOnly`
		} else if (templates["indexContentOnly"]) {
			template = "indexContentOnly"
		}
	} else if (view && templates[view]) {
		template = templates[view];
	} else {
		template = "index";
	}

	component.template = template;
}

function ok(component, req, done, app, instructions) {
	let isCsv = (instructions('global-index').get('format') === "csv");
	let isJson = ((!!((req.method.toLowerCase() === 'post') && req.is('application/json') && req.body) || (instructions('global-index').get('format') === 'json')) && !isCsv);

	const controllerExports = instructions('global-index').get('exports');

	let jsonExports = (controllerExports ?
		{index: controllerExports} :
		(app.components.index.controllers.index._jsonExports || {})
	);
	if (isJson && jsonExports.index && jsonExports.index.length ) component.sendFields = bolt.clone(jsonExports.index);

	if (!component.template) addTemplate(component, isJson);

	if (isCsv) {
		bolt.set(req, 'res.locals.doc._responseMimeType', 'text/csv');
		if (instructions('global-index').get('attachment')) {
			bolt.set(req, 'res.locals.doc._responseAttachmentName', instructions('global-index').get('attachment'));
		}
		component.mime('csv');
	} else if (isJson) {
		component.mime('json');
	} else {
		component.mime(bolt.get(req, 'res.locals.doc.mime', 'html'));
	}

	done();
}

function set404(res) {
	res.status(404);
	res.body = 'Page not found';
}

let exported = {
	error: function(component, res, done, req, app) {
		// @annotation accept-errors true

		let doc = {};
		doc.title = res.statusCode.toString();
		doc.content = res.statusMessage;

		return ok(component, doc, req, done, app);
	},

	index: async function(path, doc, db, instructions) {
		const controllerDone = !!instructions('global-index').get('done');
		if (!controllerDone) Object.assign(doc, await db.getDoc({query: {path}}));
		return this.indexDisplay();
	},

	indexDisplay: function(component, doc, req, done, app, config, res, instructions){
		// @annotation visibility private
		if (!doc && !config.proxy) return set404(res);
		if (doc) ok(component, req, done, app, instructions);
	}
};

module.exports = exported;