angular.module("bolt.admin").directive("navBar", [
	"$bolt",
	"boltAjax",
	"boltDirective",
	"boltUiEvents",
($bolt, $ajax, $directive, $events) => {
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
		$directive.report(controller, "src", onSrcChange);
	}

	function onSrcChange(src, controller) {
		if (src && (src !== controller._src)) {
			controller._src = src;
			$ajax.post({
				src: src
			}).then(
				value => $bolt.apply({controller, value})
			);
		}
	}

	function doAction(item, controller=this) {
		if (item.action) $events.fire(item.action, item.data, controller);
	}



	function navBarController() {
		let controller = this;
		controller._name = controllerAs + "Controller";
		controller._src = "";
		controller.doAction = doAction.bind(controller);
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
