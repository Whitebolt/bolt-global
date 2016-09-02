!function(directiveName="boltApp") {
	angular.module("bolt.admin", ["bolt", "auto-value", "ui.tinymce"]).directive(directiveName, [
		"boltDirective",
	($directive)=>{
		"use strict";

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
		}

		function boltAppController() {
			let controller = this;
			controller._name = directiveName + "Controller";
			controller.tinymceOptions = {
				theme: "modern",
				skin: "light",
				plugins: "code image imagetools",
				menubar: "",
				toolbar1: "undo redo code image link",
				toolbar2: "styleselect bold italic alignleft aligncenter alignright bullist numlist outdent indent",
				browser_spellcheck: true,
				contextmenu: false
			};
		}

		return {
			restrict: "A",
			controllerAs: directiveName,
			scope: true,
			controller: [boltAppController],
			link
		};
	}]);
}();