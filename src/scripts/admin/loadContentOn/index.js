!function(directiveName="loadContentOn") {
	"use strict";

	angular.module("bolt.admin").directive(directiveName, [
		"$bolt",
		"boltAjax",
		"boltDirective",
		"boltUiEvents",
		"boltUiState",
	($bolt, $ajax, $directive, $events, $state) => {

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
			$directive.report(controller, "stateData", onStateDataChange);
		}

		function onRevealChange(eventNames, controller) {
			if (controller._unwatch) controller._unwatch.forEach(unwatch=>unwatch());
			if (eventNames && (eventNames.trim() !== "")) {
				controller._unwatch = eventNames.toString().split(",").map(
					eventName => $events.on(eventName.trim(), data=>loadContent(data, controller))
				);
			}
		}

		function onStateDataChange(stateDataId, controller) {
			if (controller._stateDataUnwatch) controller._stateDataUnwatch();
			if (stateDataId && (stateDataId.trim() !== "")) {
				controller._stateDataUnwatch = $state.watch(
					stateDataId, value=>loadContentReady(value, controller)
				);
			}
		}

		function loadContent(data, controller) {
			let src = data.src || controller.src;

			if (data && src) {
				$ajax
					.post({src: src, data: {data: data.data}})
					.then(value => parseContentData(value, controller._previous))
					.then(value => showHide(value, controller))
					.then(value => $bolt.apply({controller, value}))
					.then(value => afterApplyContent(value, controller));
			} else {
				hide(controller);
			}
		}

		function loadContentReady(value, controller) {
			value = parseContentData(value, controller._previous);
			return $bolt.apply({controller, value})
				.then(value => afterApplyContent(value, controller))
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

		function afterApplyContent(value, controller) {
			controller._previous = value;
			if (controller.stateData && (controller.stateData.trim() !== "")) $state.set(controller.stateData, value);
		}

		function showHide(value, controller) {
			if (value || (value === undefined)) {
				show(controller);
			} else {
				hide (controller);
			}
			return value;
		}

		function hide(controller) {
			if (controller.stateHide && (controller.stateHide.trim() !== "")) $state.set(controller.stateHide, true, controller);
		}

		function show(controller) {
			if (controller.stateHide && (controller.stateHide.trim() !== "")) $state.set(controller.stateHide, false, controller);
		}


		function loadContentOnController() {
			let controller = this;
			controller._name = directiveName + "Controller";
		}

		return {
			restrict: "A",
			controllerAs: directiveName,
			scope: true,
			controller: [loadContentOnController],
			bindToController: {
				loadContentOn: "@",
				src: "@",
				stateHide: "@",
				stateData: "@"
			},
			link
		};
	}]);
}();
