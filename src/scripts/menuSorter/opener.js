angular.module("bolt.admin").directive("menuSorterOpener", [
	"$bolt",
	"boltDirective",
($bolt, $directive) => {
	"use strict";

	const controllerAs = "menuSorterOpener";

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
	}

	function initDom(controller) {
		controller.root
			.attr("data-open", controller.id)
			.foundation()
			.on("click", ()=>rootOnClick(controller));
	}

	function rootOnClick(controller) {
		let refNode = angular.element("#"+controller.id);
		if (refNode.length) refNode.attr("collection", controller.root.text().toLowerCase());
		$bolt.apply({controller});
	}

	function menuSorterOpenerController() {
		let controller = this;
		controller._name = "menuSorterOpenerController";
	}

	return {
		restrict: "A",
		controllerAs,
		scope: true,
		controller: [menuSorterOpenerController],
		bindToController: {
			id: "@menuSorterOpener"
		},
		link
	};
}]);
