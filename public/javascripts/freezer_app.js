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
      //Does not work
      /*resolve: {
    	freezerPromise: ['$scope',function($scope){
      return $scope.getAll();
      }]*/
      
    });




   $stateProvider
    .state('freezer', {
      url: '/freezers',
      templateUrl: 'partials/freezers.html',
      controller: 'freezerCtrl'
    });


  $urlRouterProvider.otherwise('home');
}]);







freezerApp.controller('freezerCtrl', ['$scope', '$http', function ($scope,$http) {

	$scope.freezer = 
	{'freezername':'Freezer Name',
    'building':'Building',
    'floor':'Floor',
    'room':'Room',
    'shelves': 0,
    'racks': 0


	};

	$scope.add_freezer = function() {
	
		


	$scope.freezers.push(

	{'freezername': $scope.freezer.freezername,
    'building':$scope.freezer.building,
    'floor':$scope.freezer.floor,
    'room':$scope.freezer.room,
    'shelves': $scope.freezer.shelves,
    'racks': $scope.freezer.racks


	}




		);



};

  $scope.freezers = [
    {
    }
   

    ];



  $scope.default_freezer = $scope.freezers[0];

  $scope.getAll = function() {
    return $http.get('/freezers').success(function(data){
      angular.copy(data, $scope.freezers);
    });
  }; 

  

  
}]);







