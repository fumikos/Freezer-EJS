var freezerApp = angular.module('freezerApp', ['ui.router']);



freezerApp.config([
'$stateProvider',
'$urlRouterProvider',
function($stateProvider, $urlRouterProvider) {

	$stateProvider
    .state('home', {
      url: '/home',
      templateUrl: '/partials/home.html',
      controller: 'freezerCtrl',
      resolve: {
    	freezerPromise: ['freezers', function(freezers){
      return freezers.getAll();
    		}]
  		}
      
      
    });




   $stateProvider
    .state('freezer', {
      url: '/freezers',
      templateUrl: 'partials/freezers.html',
      controller: 'freezerCtrl',
      
    });


  $urlRouterProvider.otherwise('home');
}]);



freezerApp.factory('freezers', ['$http',function($http){
  var o = {
    freezers: []
  };
  


  o.getAll = function() {
    return $http.get('/freezers').success(function(data){
      angular.copy(data, o.freezers);
    });
  }; 

  /*o.create = function(post) {
	  return $http.post('/posts', post, {
	    headers: {Authorization: 'Bearer '+auth.getToken()}
	  }).success(function(data){
	    o.posts.push(data);
	  });
	};*/

 

return o;

}]);




freezerApp.controller('freezerCtrl', ['$scope', '$http', 'freezers', function ($scope,$http,freezers) {

	$scope.freezers = freezers.freezers;

	$scope.freezer = 
	{'freezername':'Freezer Name',
    'building':'Building',
    'floor':'Floor',
    'room':'Room',
    'shelves': 0,
    'racks': 0


	};

	$scope.add_freezer = function() {
	
		


	freezers.freezers.push(

	{'freezername': $scope.freezer.freezername,
    'building':$scope.freezer.building,
    'floor':$scope.freezer.floor,
    'room':$scope.freezer.room,
    'shelves': $scope.freezer.shelves,
    'racks': $scope.freezer.racks


	}




		);



};

  
    



  $scope.default_freezer = $scope.freezers[0];

  

  

  
}]);







