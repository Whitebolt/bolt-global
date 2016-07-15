'use strict';

const Promise = module.parent.require("bluebird");

let exported = {
	index: function(component) {
		component.template = "admin";
		component.done = true;

		return Promise.resolve(component);
	}
};

module.exports = exported;