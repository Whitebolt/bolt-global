!function(directiveName="panel") {
	"use strict";

	angular.module("bolt.admin").directive(directiveName, [
		"$bolt",
		"boltAjax",
		"boltDirective",
		"boltUiEvents",
		"$window",
		"boltUiState",
	($bolt, $ajax, $directive, $events, $win, $state) => {

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
			hide(controller);
			applyFoundation(controller);
			applyDimensions(controller);
		}

		function hide(controller) {
			if (controller.stateHide && (controller.stateHide.trim() !== "")) $state.set(controller.stateHide, true);
		}

		function getDimensions(node) {
			return {
				width: node.width() || 0,
				height: node.height() || 0
			};
		}

		function applyDimensions(controller) {
			let win = angular.element($win);
			controller.parent.$watch(()=>getDimensions(win), dimensions=>{
				let width = dimensions.width;
				if (controller.width) width *= (controller.width/100);
				let height = dimensions.height;
				if (controller.height) height *= (controller.height/100);

				controller.root.height(parseInt(height, 10));
				controller.root.width(parseInt(width, 10));
			}, true);
			win.on("resize", ()=>$bolt.apply({controller}));
		}

		function applyFoundation(controller) {
			controller.parent.$watch(
				()=>controller.root.html(),
				()=>controller.root.foundation()
			);
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


		function panelController() {
			let controller = this;
			controller._name = directiveName + "Controller";
			controller.doAction = doAction.bind(controller);
		}

		return {
			restrict: "AE",
			controllerAs: directiveName,
			scope: true,
			controller: [panelController],
			bindToController: {
				width: "@",
				height: "@",
				hide: "@",
				stateHide: "@"
			},
			link
		};
	}]);
}();
