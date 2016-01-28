'use strict';

angular.module('mock')
.run(['$httpBackend', function($httpBackend){
	var orders = [
		{id: 123, name: 'test'}
	];

	$httpBackend.whenGET(/\/api\?orderType=(.+)/).respond(function(method, url, data, headers, params) {
		console.log("Getting orders with type: "+params.orderType);
		return [200, orders, {}];
	});

	$httpBackend.whenGET(/\/api\?orderEmail=(.+)/).respond(function(method, url, data, headers, params) {
		console.log("Getting orders with email: "+params.orderEmail);
		return [200, orders, {}];
	});
}]);