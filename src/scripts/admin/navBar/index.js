!function(directiveName="navBar") {
	"use strict";

	angular.module("bolt.admin").directive(directiveName, [
		"$bolt",
		"boltAjax",
		"boltDirective",
		"boltUiEvents",
	($bolt, $ajax, $directive, $events) => {

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
			initDom(controller);
		}

		function initDom(controller) {
			applyFoundation(controller);
		}

		function applyFoundation(controller) {
			controller.parent.$watch(
				()=>controller.root.html(),
				()=>controller.root.foundation()
			);
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

		function getData(item) {
			let data = {
				data: item.data
			};
			if (item.src) data.src = item.src;
			return data;
		}

		function doAction(item, controller=this) {
			if (item.action) $events.fire(item.action, getData(item), controller);
		}



		function navBarController() {
			let controller = this;
			controller._name = directiveName + "Controller";
			controller._src = "";
			controller.doAction = doAction.bind(controller);
		}

		return {
			restrict: "AE",
			controllerAs: directiveName,
			scope: true,
			templateUrl: "navBar/index.html",
			controller: [navBarController],
			bindToController: {
				src: "@"
			},
			link
		};
	}]);
}();
