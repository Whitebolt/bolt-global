angular.module("bolt.admin").directive("navBar", [
	"$bolt",
	"boltAjax",
	"boltDirective",
($bolt, $ajax, $directive) => {
	"use strict";

	const controllerAs = "navBar";


	/**
	 * @description
	 * Setup all the observations and watches in the new directive.
	 *
	 * @private
	 * @param {Object} scope		The directive scope.
	 * @param {Object} root			The directive root element.
	 * @param {Array} attributes	Attributes attached to the directive
	 * 								root element.
	 * @param {Object} controller	The controller instance for this directive.
	 */
	function link(scope, root, attributes, controller) {
		$directive.link({scope, root, controller});
		initDom(controller);
		$directive.report(controller, "src", onSrcChange);
		$directive.report(controller, "data", onDataChange);
	}

	function initDom(controller) {

	}

	function onSrcChange(src, controller) {
		if (src && (src !== controller._src)) {
			controller._src = src;
			$ajax.post({
				src: src
			}).then(value => {
				value.data = parseData(value.data);
				return $bolt.apply({controller, value});
			});
		}
	}

	function onDataChange(data, controller) {
		if (data) {
			console.log(data);
		}
	}

	function parseData(data) {
		return data;
	}

	function navBarController() {
		let controller = this;
		controller._name = controllerAs + "Controller";
		controller._src = "";
	}

	return {
		restrict: "AE",
		controllerAs,
		scope: true,
		templateUrl: "index.html",
		controller: [navBarController],
		bindToController: {
			src: "@src"
		},
		link
	};
}]);
