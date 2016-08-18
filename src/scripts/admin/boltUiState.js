angular.module("bolt.admin").factory("boltUiState", [
	"$timeout",
	"$rootScope",
	"$location",
($timeout, $rootScope, $location) => {
	"use strict";

	const state = new Map();
	const watchers = new Map();


	function get(key) {
		return (state.has(key) ? state.get(key) : undefined);
	}

	function save() {
		let historyState = {};
		state.forEach((value, key) => {historyState[key] = value});
		$location.state(historyState);
		$location.hash(_randomId());
	}

	function set(key, value, controller={_name:"unknown"}) {
		state.set(key, value);
		if (_getWatchCount(key)) $timeout(()=>$rootScope.$apply());
		return get(key);
	}

	function has(key) {
		return state.has(key);
	}

	function watch(key, callback) {
		let unwatch = $rootScope.$watch(()=>get(key), callback);
		_incWatchCount(key);
		return ()=>{
			_decWatchCount(key);
			unwatch();
		}
	}

	function _randomId(length=32) {
		let id = "";
		for (let n=1; n<=length; n++) {
			id += parseInt(Math.random() * 16, 10).toString(16);
		}
		return id.toUpperCase();
	}

	function _getWatchCount(key) {
		return (watchers.has(key) ? watchers.get(key) : 0);
	}

	function _decWatchCount(key) {
		let count = _getWatchCount(key);
		count--;
		watchers.set(key, (count>=0)?count:0);
	}

	function _incWatchCount(key) {
		let count = _getWatchCount(key);
		count++;
		watchers.set(key, count);
	}


	$rootScope.$on("$locationChangeSuccess", (event, url, oldUrl, newState, oldState)=>{
		newState = newState?newState:{};
		Object.keys(newState).forEach(key=>set(key, newState[key]));
		state.forEach((value, key)=>{
			if (!newState.hasOwnProperty(key)) state.delete(key);
		});
		$timeout(()=>$rootScope.$apply());
	});

	return {
		get, set, has, watch, save
	};
}]);