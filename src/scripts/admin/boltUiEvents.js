angular.module("bolt.admin").factory("boltUiEvents", [
() => {
	"use strict";

	const events = new Map();

	let id = 0;

	function on(eventName, callback, context) {
		if (!events.has(eventName)) events.set(eventName, []);
		let event = createOnOptions(callback, context);
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

	function createOnOptions(callback, context) {
		id++;
		return {callback, id, context};
	}

	function once(eventName, callback, context) {
		let unreg = on(eventName, (...params) => {
			unreg();
			return callback.apply(context || {}, params);
		}, params);
	}

	function fire(eventName, data, controller) {
		if (events.has(eventName)) events.get(eventName).forEach(
			event => event.callback.call(event.context || {}, data, controller)
		);
	}

	return {
		on, fire, once
	};
}]);