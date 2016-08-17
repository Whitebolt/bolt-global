angular.module("bolt.admin").factory("boltUiState", [
	"$timeout", "$rootScope",
($timeout, $rootScope) => {
	"use strict";

	const state = new Map();
	const watchers = new Map();

	function get(key) {
		return (state.has(key) ? state.get(key) : undefined);
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

	return {
		get, set, has, watch
	};
}]);