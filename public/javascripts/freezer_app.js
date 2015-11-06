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
      resolve: {
    	freezerPromise: ['freezers', function(freezers){
      return freezers.getAll();
    		}]
  		}
      
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



	 o.create_freezer = function(freezer) {
	  return $http.post('/freezers', freezer).success(function(data){
	    o.freezers.push(data);
	  });
	};


	o.update_freezer = function(freezer) {
	  return $http.post('/update_freezers', freezer).success(function(data){

	  	console.log(data.ok);

	  	
	  	

	    
	  });
	};

	o.delete_freezer = function(freezer) {
	  return $http.post('/delete_freezers', freezer).success(function(data){


	  	
	  	if (data.ok === 1 && data.n === 1){



	  		

	  		var index = o.freezers.indexOf(freezer);
	  		o.freezers.splice(index,1);

	  		
	  	}

	  	
	  	


	  	
	  	
	  	
	    
	  });
	};

	

 

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

	$scope.default_freezer = $scope.freezers[0];

$scope.add_freezer = function() {
	
	freezers.create_freezer($scope.freezer);





};

$scope.delete_freezer = function() {
	
	freezers.delete_freezer($scope.default_freezer);





};


$scope.update_freezer = function() {
	
	freezers.update_freezer($scope.default_freezer);





};

  
    


    



  

  

  

  
}]);







