'use strict';

angular.module('app')
.provider('appState', ['$stateProvider', function ($stateProvider) {
	var appStateProvider = {};

	appStateProvider.state = function (state, params) {
		//Setup modal
		if (params.modal) {
			var modal = {
				templateUrl: params.templateUrl,
				controller: params.controller,
				resolve: {}
			};
			delete params.templateUrl;
			delete params.controller;
			var resolve = Object.keys(params.resolve);
			if (typeof params.modal == 'object') {
				modal = angular.extend(modal, params.modal);
			}

			params.modalInstance = null
			params.onEnter = ['$rootScope', '$state', '$stateParams', '$window', '$modal'].concat(resolve).concat([function ($rootScope, $state, $stateParams, $window, $modal) {
				var modalArguments = arguments;
				angular.forEach(resolve, function (name, i) {
					modal.resolve[name] = function () {
						return modalArguments[i + 5];
					}
				});

				$state.modal = $modal.open(modal);
				var returnState = $rootScope.previousState;
				$state.modal.result.then(function (options) {
					if(options.goBack && $window.history.length > 2){
						$window.history.go(-1);
						if(options.reload){
							var reloadWatch = $rootScope.$on('$stateChangeSuccess', function(){
								$state.reload();
								reloadWatch();
							})
							
						}
					} else {
						$state.go(returnState.state, returnState.params, { reload: (options.reload || true) });
					}
				}, function (reason) {
					if (reason != 'exited'){
						if($window.history.length > 2){
							$window.history.go(-1);
						}else{
							$state.go(returnState.state, returnState.params);
						}
					}
				})
			}]);
			params.onExit = ['$state', function ($state) {
				$state.modal.dismiss('exited');
			}];
		}

		$stateProvider.state(state, params);

		return appStateProvider;
	};

	appStateProvider.$get = [function () { }];
	return appStateProvider;
}])
.run(['$rootScope', function($rootScope){
	$rootScope.$on('$stateChangeSuccess', function(e, toState, toParams){
		$rootScope.$state = toState;
	})

	$rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams) {
		$rootScope.previousState = {
			state: fromState.name || '^',
			params: angular.copy(fromParams) || {}
		};
	});

	$rootScope.$on('$stateChangeError', function(e, toState, toParams, fromState, fromParams, error){
		console.log(error);
	})
}])