'use strict';

let exported = {
	index: function(component, doc=component.doc||component.req.doc||{}) {
		return bolt.parseShortcodes(component, doc, ['content']).then(()=>{
			if (doc._component) return component.component(doc._component, doc, component.req, component.parent);
			return component.view(doc._view || "content/index", doc, component.req, component.parent);
		});
	}
};

module.exports = exported;