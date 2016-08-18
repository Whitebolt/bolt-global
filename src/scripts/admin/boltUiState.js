angular.module("bolt.admin").factory("boltUiState", [
	"$timeout",
	"$rootScope",
	"$location",
($timeout, $rootScope, $location) => {
	"use strict";

	const state = new Map();
	const watchers = new Map();

	function randomId(length=32) {
		let id = "";
		for (let n=1; n<=length; n++) {
			id += parseInt(Math.random() * 16, 10).toString(16);
		}
		return id.toUpperCase();
	}

	function get(key) {
		return (state.has(key) ? state.get(key) : undefined);
	}

	function save() {
		let historyState = {};
		state.forEach((value, key) => {historyState[key] = value});
		$location.state(historyState);
		$location.hash(randomId());
	}

	function set(key, value) {
		state.set(key, value);
		if (getWatchCount(key)) $timeout(()=>$rootScope.$apply());
		return get(key);
	}

	function has(key) {
		return state.has(key);
	}

	function getWatchCount(key) {
		return (watchers.has(key) ? watchers.get(key) : 0);
	}

	function decWatchCount(key) {
		let count = getWatchCount(key);
		count--;
		watchers.set(key, (count>=0)?count:0);
	}

	function incWatchCount(key) {
		let count = getWatchCount(key);
		count++;
		watchers.set(key, count);
	}

	function watch(key, callback) {
		let unwatch = $rootScope.$watch(()=>get(key), callback);
		incWatchCount(key);
		return ()=>{
			decWatchCount(key);
			unwatch();
		}
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