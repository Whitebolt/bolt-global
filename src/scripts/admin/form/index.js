!function(directiveName="boltForm") {
	"use strict";

	angular.module("bolt.admin").directive(directiveName, [
		"boltDirective",
		"$injector",
	($directive, $injector) => {

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
			initController(controller);
		}

		function initController(controller) {
			let formScope = controller.parent[controller.root.attr("name")];
			formScope.root = controller.root;

			controller.root.find("script[type='controller/method']").each((n, script)=>{
				script = angular.element(script);
				let injection = script.attr("inject");
				if (injection) {
					injection = injection.split(',').map(inject=>inject.trim()).filter(inject=>inject);
					if (injection.length) {
						injection.push((...injectArgs)=>{
							let method = new Function(script.attr("params"), script.text());
							formScope[script.attr("name")] = (...calledArgs )=>{
								let allArgs = injectArgs.concat(calledArgs);
								method.apply(formScope, allArgs);
							};
						});
						$injector.invoke(injection);
						return;
					}
				}

				let method = new Function(script.attr("params"), script.text()).bind(formScope);
				formScope[script.attr("name")] = method;
			});
		}


		function boltFormController() {
			let controller = this;
			controller._name = directiveName + "Controller";
		}

		return {
			restrict: "A",
			controllerAs: directiveName,
			scope: true,
			controller: [boltFormController],
			bindToController: {
			},
			link
		};
	}]);
}();
