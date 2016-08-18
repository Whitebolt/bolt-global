!function(directiveName="stateHide") {
	"use strict";

	angular.module("bolt.admin").directive(directiveName, [
		"boltDirective",
		"boltUiState",
	($directive, $state) => {

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
			$directive.report(controller, directiveName, onStateHideChange);
		}

		function onStateHideChange(stateName, controller) {
			if (controller._unwatch) controller._unwatch();
			if (stateName && (stateName.trim() !== "")) {
				controller._unwatch = $state.watch(stateName.trim(), value=>showHide(value, controller));
			}
		}

		function showHide(value, controller) {
			if (value || (value === undefined)) {
				hide (controller);
			} else {
				show(controller);
			}
		}

		function hide(controller) {
			controller.root.addClass("ng-hide");
		}

		function show(controller) {
			controller.root.removeClass("ng-hide");
		}


		function stateHide() {
			let controller = this;
			controller._name = directiveName + "Controller";
		}

		return {
			restrict: "A",
			controllerAs: directiveName,
			scope: true,
			controller: [stateHide],
			bindToController: {
				stateHide: "@"
			},
			link
		};
	}]);
}();
