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
			$directive.report(controller, "reveal", onRevealChange);
			$directive.report(controller, "hide", onHideChange);
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

		function onRevealChange(reveal, controller) {
			if (controller._unwatchOpen) controller._unwatchOpen.forEach(unwatch=>unwatch());
			if (reveal) {
				controller._unwatchOpen = reveal.split(",").map(
					reveal => $events.on(reveal.trim(), data=>loadContent(data, controller))
				);
			}
		}

		function onHideChange(hide, controller) {
			if (controller._unwatchClose) controller._unwatchClose.forEach(unwatch=>unwatch());
			if (hide) {
				controller._unwatchClose = hide.split(",").map(
					hide => $events.on(hide.trim(), ()=>{
						controller.showing = false;
					})
				);
			}
		}

		function loadContent(data, controller) {
			let src = data.src || controller.revealSrc;

			if (data && src) {
				$ajax
					.post({src: src, data: {data}})
					.then(value => parseContentData(value, controller._revealPreviousValue))
					.then(value => applyContentData(value, controller));
			} else {
				controller.showing = false;
			}
		}

		function parseContentData(value, previous={}) {
			Object.keys(previous).forEach(key=>{
				if (!value.hasOwnProperty(key)) {
					value[key] = undefined;
				} else if ($bolt.isObject(value[key]) && $bolt.isObject(previous[key])) {
					value[key] = parseContentData(value[key], previous[key]);
				}
			});
			return value;
		}

		function applyContentData(value, controller) {
			controller.showing = (value?true:false);
			$bolt.apply({controller, value}).then(()=>{
				controller._revealPreviousValue = value;
			});
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

		function doAction(item, controller=this) {
			if (item.action) $events.fire(item.action, item.data, controller);
		}


		function panelController() {
			let controller = this;
			controller._name = directiveName + "Controller";
			controller.showing = false;
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
				reveal: "@",
				hide: "@",
				revealSrc: "@"
			},
			link
		};
	}]);
}();
