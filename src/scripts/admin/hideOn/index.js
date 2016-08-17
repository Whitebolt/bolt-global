!function(directiveName="hideOn") {
	"use strict";

	angular.module("bolt.admin").directive(directiveName, [
		"boltDirective",
		"boltUiEvents",
		"boltUiState",
	($directive, $events, $state) => {

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
			$directive.report(controller, directiveName, onHideChange);
		}

		function onHideChange(eventNames, controller) {
			if (controller._unwatch) controller._unwatch.forEach(unwatch=>unwatch());
			if (eventNames.toString().trim() !== "") {
				controller._unwatch = eventNames.toString().split(",").map(
					eventName => $events.on(eventName.trim(), ()=>hide(controller))
				);
			}
		}

		function hide(controller) {
			if (controller.stateHide && (controller.stateHide.trim() !== "")) $state.set(controller.stateHide, true);
		}


		function hideOnController() {
			let controller = this;
			controller._name = directiveName + "Controller";
		}

		return {
			restrict: "A",
			controllerAs: directiveName,
			scope: true,
			controller: [hideOnController],
			bindToController: {
				hideOn: "@",
				stateHide: "@"
			},
			link
		};
	}]);
}();
