'use strict';

angular.module('app')
.service('Order', ['$http', '$q', 'Constants', function($http, $q, Constants){
	function httpRequestHandler(httpRequest){
		var deferred = $q.defer();
		
		httpRequest.success(function(data){
			deferred.resolve(data);
		}).error(function(data){
			deferred.reject(data);
		});

		return deferred.promise;
	}

	return {
		ofType: function(orderType){
			return httpRequestHandler($http.get(Constants.apiEndpoint+'?orderType='+orderType));
		},
		forEmail: function(email){
			return httpRequestHandler($http.get(Constants.apiEndpoint+'?orderEmail='+encodeURIComponent(email)));
		}
	}
}])