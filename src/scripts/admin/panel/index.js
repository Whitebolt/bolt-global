!function(directiveName="panel") {
	"use strict";

	angular.module("bolt.admin").directive(directiveName, [
		"$bolt",
		"boltAjax",
		"boltDirective",
		"boltUiEvents",
		"$window",
	($bolt, $ajax, $directive, $events, $win) => {

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
			$directive.report(controller, "open", onOpenChange);
			$directive.report(controller, "close", onCloseChange);
			scope.$watch(()=>controller._data, data=>onDataChange(data, controller));
			initDom(controller);
		}

		function initDom(controller) {
			setShowHide(controller);
			applyFoundation(controller);
			applyDimensions(controller);
		}

		function setShowHide(controller) {
			controller.root.removeClass("ng-hide");
			controller.parent.$watch(()=>controller.showing, showing=>{
				if (showing) {
					controller.root.removeClass("ng-hide");
				} else {
					controller.root.addClass("ng-hide");
				}
			});
		}

		function onOpenChange(open, controller) {
			if (controller._unwatchOpen) controller._unwatchOpen.forEach(unwatch=>unwatch());
			if (open) {
				controller._unwatchOpen = open.split(",").map(
					open => $events.on(open.trim(), data=>{controller._data = data})
				);
			}
		}

		function onCloseChange(close, controller) {
			if (controller._unwatchClose) controller._unwatchClose.forEach(unwatch=>unwatch());
			if (close) {
				controller._unwatchClose = close.split(",").map(
					close => $events.on(close.trim(), data=>{controller._data = data})
				);
			}
		}

		function onSrcChange(src, controller) {
			if (src && controller._data) onDataChange(controller._data, controller);
		}

		function onDataChange(data, controller) {
			if (data && controller.src) {
				$ajax.post({
					src: controller.src,
					data: {data}
				}).then(
					value => {
						if (value) {
							controller.showing = true
						} else {
							controller.showing = false;
						}
						$bolt.apply({controller, value})
					}
				);
			} else {
				controller.showing = false;
			}
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


		function panelController() {
			let controller = this;
			controller._name = directiveName + "Controller";
			controller.showing = false;
		}

		return {
			restrict: "AE",
			controllerAs: directiveName,
			scope: true,
			controller: [panelController],
			bindToController: {
				width: "@",
				height: "@",
				open: "@",
				close: "@",
				src: "@"
			},
			link
		};
	}]);
}();
