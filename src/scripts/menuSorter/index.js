angular.module("bolt.admin").directive("menuSorter", [
	"$bolt",
	"boltDirective",
	"boltAjax",
	"$window",
($bolt, $directive, $ajax, $window) => {
	"use strict";

	const controllerAs = "menuSorter";

	const defaultColumnWidth = 200;
	const defaultItemHeight = (defaultColumnWidth / 10) * 1.5;
	const colGap = 0;


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
		$directive.reportEvaluate(controller, "collection", onCollectionChange);
		$directive.reportEvaluate(controller, "data", onDataChange);
		$directive.report(controller, "data", onDataChange);
		scope.$watch(
			()=>root.attr("collection"),
			collection=>onCollectionChange(collection, controller)
		);
	}

	function initDom(controller) {
		controller.root
			.addClass("large reveal menu-sorter")
			.attr("data-reveal", "")
			.foundation();
	}

	function onCollectionChange(collection, controller) {
		if (collection && (collection !== controller.__collection)) {
			controller.__collection = collection;
			$ajax.post({
				src: controller.src,
				data: {collection}
			}).then(value => {
				value.data = parseData(value.data);
				return $bolt.apply({controller, value});
			});
		}
	}

	function getCssValueFromPossibilities(node, defaultValue, ...possibilities) {
		let value = defaultValue;
		possibilities.every(possibility => {
			let _value = parseInt(node.css(possibility), 10);
			if (!isNaN(_value) && (_value !== undefined)) {
				value = _value;
				return false;
			}
			return true;
		});
		return value;
	}

	function getColumnWidth(controller) {
		return getCssValueFromPossibilities(controller.menuNode, defaultColumnWidth, "column-width", "-webkit-column-width", "-moz-column-width");
	}

	function getColumnGapWidth(controller) {
		return getCssValueFromPossibilities(controller.menuNode, 60, "column-gap", "-webkit-column-gap", "-moz-column-gap");
	}

	function getItemHeight(controller) {
		let items = controller.menuNode.find("li");
		if (items.length) {
			return parseInt(angular.element(items.get(0)).css("height"), 10) || defaultItemHeight;
		}
		return defaultItemHeight;
	}

	function parseData(data) {
		return data.map(item => {
			item.title = item.title.replace(/<[^>]*>/g, '');
			return item;
		});
	}

	function onDataChange(data, controller) {
		if (data) {
			let win = angular.element($window);
			let root = controller.root;

			root.offset({left: Math.max(0, ((win.width() - root.outerWidth()) / 2) + win.scrollLeft())});
			root.height(win.height() - ((root.offset().top * 2)));

			let itemHeight = getItemHeight(controller);
			let colCapacity = Math.floor(root.height() / itemHeight) -2;
			let cols = Math.floor(data.length / colCapacity) + 2;
			let colWidth = getColumnWidth(controller);

			controller.menuNode.css({
				"column-count": cols,
				"-webkit-column-count": cols,
				"-moz-column-count": cols,
				"columns": cols,
				"-webkit-columns": cols,
				"-moz-columns": cols,
				"column-width": colWidth + "px",
				"-webkit-column-width": colWidth + "px",
				"-moz-column-width": colWidth + "px",
				"column-gap": colGap + "px",
				"-webkit-column-gap": colGap + "px",
				"-moz-column-gap": colGap + "px",
				"width": ((cols * colWidth) + ((cols - 1) * colGap)).toString() + "px",
				"padding-right": "16px"
			});

			let lis = controller.menuNode.find("li");
			lis.each((n, item)=>{
				if (n < colCapacity) {
					angular.element(item).addClass("first-col");
				}
				if (((n+1)%colCapacity)===0) {
					angular.element(item).addClass("last-row");
				}
				if (n === (lis.length-1)) {
					angular.element(item)
						.addClass("last-row")
						.height(angular.element(item).height() + 1)
				}
			});
		}
	}

	function menuSorterController() {
		let controller = this;
		controller._name = "menuSorterController";
		controller.__collection;
	}

	return {
		restrict: "AE",
		controllerAs,
		scope: true,
		templateUrl: "index.html",
		controller: [menuSorterController],
		bindToController: {
			src: "@src",
			_collection: "@collection",
			_data: "@data"
		},
		link
	};
}]);
