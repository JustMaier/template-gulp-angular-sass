'use strict';

angular.module('app')
.controller('dashboard', ['$scope', 'orders', function($scope, orders){
	// Private variables
	//------------------------

	// Public variables
	//------------------------
	$scope.orders = orders;

	// Public methods
	//------------------------

	// Private methods
	//------------------------

	// Watchers
	//------------------------
}])