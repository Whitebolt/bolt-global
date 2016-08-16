angular.module("bolt.admin", ["bolt"]).directive("boltApp", [
	"boltDirective",
($directive) => {
	"use strict";

	let controllerAs = "bolt";

	function link(scope, root, attributes, controller) {
		$directive.link({scope, root, controller});
	}

	function boltAppController() {
		let controller = this;
	}


	return {
		restrict: "A",
		controllerAs,
		scope: true,
		controller: [boltAppController],
		link
	};
}]);