'use strict';

angular.module('app')
.config(['appStateProvider', '$urlRouterProvider', function(appStateProvider, $urlRouterProvider){
	appStateProvider
		.state('dashboard', {
			url: '/',
			templateUrl: 'pages/dashboard.html',
			controller: 'dashboard',
			resolve: {
				orders: ['Order', function(Order){
					return Order.ofType('all');
				}]
			}
		})

	$urlRouterProvider.otherwise('/');
}])