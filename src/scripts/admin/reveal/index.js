!function(directiveName="reveal") {
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
			$directive.report(controller, directiveName, onRevealChange);
		}

		function onRevealChange(eventNames, controller) {
			if (controller._unwatchOpen) controller._unwatchOpen.forEach(unwatch=>unwatch());
			if (eventNames.toString().trim() !== "") {
				controller._unwatchOpen = eventNames.toString().split(",").map(
					eventName => $events.on(eventName.trim(), data=>loadContent(data, controller))
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
			showHide(value, controller);
			$bolt.apply({controller, value}).then(()=>{
				controller._revealPreviousValue = value;
			});
		}

		function showHide(value, controller) {
			if (value) {
				show(controller);
			} else {
				hide (controller);
			}
		}

		function show(controller) {
			controller.root.removeClass("ng-hide");
		}

		function hide(controller) {
			controller.root.addClass("ng-hide");
		}


		function revealController() {
			let controller = this;
			controller._name = directiveName + "Controller";
		}

		return {
			restrict: "A",
			controllerAs: directiveName,
			scope: true,
			controller: [revealController],
			bindToController: {
				reveal: "@",
				revealSrc: "@"
			},
			link
		};
	}]);
}();
