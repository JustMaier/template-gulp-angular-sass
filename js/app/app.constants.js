'use strict';

angular.module('app')
.constant('$', window.jQuery)
.constant('Constants', (function(){
	var constants = {
		apiEndpoint: window.apiEndpoint
	};

	angular.forEach(constants, function(constant, key){
		if(key.indexOf('Array') == -1) return;
		var obj = {};
		angular.forEach(constant, function(value, index){
			obj[value] = index;
		});
		constants[key.replace('Array','')] = obj;
	});

	return constants;
})())
.run(['Constants', '$rootScope', '$window', function(Constants, $rootScope, $window){
	Constants.cratejoyIds = $window.products;
	angular.forEach(Constants, function(constant, key){
		$rootScope[key] = constant;
	});
}])