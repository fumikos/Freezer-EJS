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

    $stateProvider
    .state('login', {
  url: '/login',
  templateUrl: '/partials/login.html',
  controller: 'AuthCtrl',
  onEnter: ['$state', 'auth', function($state, auth){
    if(auth.isLoggedIn()){
      $state.go('home');
    }
  }]
})
.state('register', {
  url: '/register',
  templateUrl: '/partials/register.html',
  controller: 'AuthCtrl',
  onEnter: ['$state', 'auth', function($state, auth){
    if(auth.isLoggedIn()){
      $state.go('home');
    }
  }]
});




  $urlRouterProvider.otherwise('home');
}]);



freezerApp.factory('freezers', ['$http', 'auth', function($http,auth){
  var o = {
    freezers: []
  };


  


  o.getAll = function() {
    return $http.get('/freezers').success(function(data){
      angular.copy(data, o.freezers);
    });
  }; 



	 o.create_freezer = function(freezer) {
	  return $http.post('/freezers', freezer, {
    headers: {Authorization: 'Bearer '+auth.getToken()}
  }).success(function(data){
	    o.freezers.push(data);
	  });
	};


	o.update_freezer = function(freezer) {
	  return $http.post('/update_freezers', freezer, {
    headers: {Authorization: 'Bearer '+auth.getToken()}
  }).success(function(data){

	  	console.log(data.ok);

	  	
	  	

	    
	  });
	};

	o.delete_freezer = function(freezer) {
	  return $http.post('/delete_freezers', freezer, {
    headers: {Authorization: 'Bearer '+auth.getToken()}
  }).success(function(data){


	  	
	  	if (data.ok === 1 && data.n === 1){



	  		

	  		var index = o.freezers.indexOf(freezer);
	  		o.freezers.splice(index,1);

	  		
	  	}

	  	
	  	


	  	
	  	
	  	
	    
	  });
	};

	

 

return o;

}]);



freezerApp.factory('auth', ['$http', '$window', function($http, $window){
   var auth = {};

   auth.saveToken = function (token){
  $window.localStorage['freezer-app-token'] = token;
};

auth.getToken = function (){
  return $window.localStorage['freezer-app-token'];
};

auth.isLoggedIn = function(){
  var token = auth.getToken();

  if(token){
    var payload = JSON.parse($window.atob(token.split('.')[1]));

    return payload.exp > Date.now() / 1000;
  } else {
    return false;
  }
};


auth.currentUser = function(){
  if(auth.isLoggedIn()){
    var token = auth.getToken();
    var payload = JSON.parse($window.atob(token.split('.')[1]));

    return payload.username;
  }
};


auth.register = function(user){
  return $http.post('/register', user).success(function(data){
    auth.saveToken(data.token);
  });
};


auth.logIn = function(user){
  return $http.post('/login', user).success(function(data){
    auth.saveToken(data.token);
  });
};

auth.logOut = function(){
  $window.localStorage.removeItem('freezer-app-token');
};



  return auth;
}])



freezerApp.controller('AuthCtrl', [
'$scope',
'$state',
'auth',
function($scope, $state, auth){
  $scope.user = {};

  $scope.register = function(){
    auth.register($scope.user).error(function(error){
      $scope.error = error;
    }).then(function(){
      $state.go('home');
    });
  };

  $scope.logIn = function(){
    auth.logIn($scope.user).error(function(error){
      $scope.error = error;
    }).then(function(){
      $state.go('home');
    });
  };
}])


freezerApp.controller('freezerCtrl', ['$scope', '$http', 'freezers', 'auth', function ($scope,$http,freezers,auth) {

	$scope.isLoggedIn = auth.isLoggedIn;
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



freezerApp.controller('NavCtrl', ['$scope', 'auth',
function($scope, auth) {
	$scope.isLoggedIn = auth.isLoggedIn;
	$scope.currentUser = auth.currentUser;
	$scope.logOut = auth.logOut;
}]);



