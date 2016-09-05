!function(directiveName="loadContentOn") {
	"use strict";

	angular.module("bolt.admin").directive(directiveName, [
		"$bolt",
		"boltAjax",
		"boltDirective",
		"boltUiEvents",
		"boltUiState",
		"$compile",
	($bolt, $ajax, $directive, $events, $state, $compile) => {

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

		function rndId() {
			return (!Date.now ? (new Date()).getTime() : Date.now()).toString();
		}

		function _addQueryParam(queryString, pkey, pvalue) {
			let query = {};
			let order = queryString.split('&').map(param=>{
				let pparts = param.split('=');
				let key = pparts.shift();
				query[key] = ((pparts.length > 0) ? pparts.join('=') : undefined);
				return key;
			});
			if (!query.hasOwnProperty(pkey)) order.push(pkey);
			query[pkey] = pvalue;

			return order
				.map(key=>(key + ((query[key] !== undefined) ? "=" + query[key] : "")))
				.join("&");
		}

		function addQueryParam(url, pkey, pvalue) {
			let parts = url.split("?");
			if (parts.length > 1) {
				parts[1] = _addQueryParam(parts[1], pkey, pvalue);
				return parts.join('?');
			} else {
				let parts = url.split("#");
				if (parts.length > 1) {
					parts[0] += '?' + _addQueryParam("", pkey, pvalue);
					return parts.join('#');
				} else {
					return url + '?' + _addQueryParam("", pkey, pvalue);
				}
			}
		}

		function loadContent(data, controller) {
			let src = addQueryParam(data.src || controller.src, 'cacheBust', rndId());

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
			if (angular.isString(value)) return {content: value};
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
			if (value && value.content) updateHtmlContent(value.content, controller);
		}

		function updateHtmlContent(content, controller) {
			if (controller.current) controller.current.$destroy();
			let target = controller.root.find("[load-content-on-target]");
			target = (target.length?angular.element(target.get(0)):controller.root);

			$directive.destroyChildren(controller.root);
			target.empty().html(content);
			controller.current = controller.parent.$new(false, controller.parent);
			$compile(target.contents())(controller.current);
			controller._previous = content;
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
