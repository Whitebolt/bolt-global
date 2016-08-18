angular.module("bolt.admin").factory("boltUiEvents", ["$timeout", ($timeout) => {
	"use strict";

	const events = new Map();

	let id = 0;

	function on(eventName, callback, context) {
		if (!events.has(eventName)) events.set(eventName, []);
		let event = _createOnOptions(callback, context);
		let _events = events.get(eventName);
		_events.push(event);

		return (id=event.id)=>{ //unregister function
			events.get(eventName).every(event => {
				if (event.id === id) {
					_events.splice(index, 1);
				} else {
					return true;
				}
			});
		}
	}

	function once(eventName, callback, context) {
		let unreg = on(eventName, (...params) => {
			unreg();
			return callback.apply(context || {}, params);
		}, params);
	}

	function fire(eventName, data, controller) {
		if (events.has(eventName)) events.get(eventName).forEach(
			event => $timeout(
				()=>event.callback.call(event.context || {}, data, controller)
			)
		);
	}

	function _createOnOptions(callback, context) {
		id++;
		return {callback, id, context};
	}

	return {
		on, fire, once
	};
}]);