var freezerApp = angular.module('freezerApp', ['ui.router']);



freezerApp.config([
'$stateProvider',
'$urlRouterProvider',
function($stateProvider, $urlRouterProvider) {

  $stateProvider
    .state('home', {
      url: '/home',
      templateUrl: '/partials/home.html',
      
      
      
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
      $state.go('freezers');
    }
  }]
})
    $stateProvider
.state('register', {
  url: '/register',
  templateUrl: '/partials/register.html',
  controller: 'AuthCtrl',
  onEnter: ['$state', 'auth', function($state, auth){
    if(auth.isLoggedIn()){
      $state.go('freezers');
    }
  }]
});

$stateProvider
.state('administration', {
  url: '/admin',
  templateUrl: '/partials/admin.html',
  controller: 'adminCtrl',
  resolve: {
      adminPromise: ['admin', function(admin){
      return admin.getAll();
        }]
      }
});




  $urlRouterProvider.otherwise('home');
}]);



freezerApp.factory('freezers', ['$http', 'auth', function($http,auth){
  var o = {
    freezers: []
  };


  


  o.getAll = function() {
    return $http.get('/freezers', {
    headers: {Authorization: 'Bearer '+auth.getToken()}
  }).success(function(data){
      
      angular.copy(data, o.freezers);
    });
  }; 



   o.create_freezer = function(freezer,callback) {
    return $http.post('/freezers', freezer, {
    headers: {Authorization: 'Bearer '+auth.getToken()}
  }).success(function(data){
      o.freezers.push(data);
      callback();
    });
  };

  o.add_shelf = function(freezer,shelf) {

    //add shelf property to freezer object

    freezer.shelf = shelf;
   

    return $http.post('/add_shelf', freezer, {
    headers: {Authorization: 'Bearer '+auth.getToken()}
  }).success(function(data){
      
    });
  };

  o.add_rack = function(freezer,rack) {

    freezer.rack = rack;


    return $http.post('/add_rack', freezer, {
    headers: {Authorization: 'Bearer '+auth.getToken()}
  }).success(function(data){
      
    });
  };





  o.update_freezer = function(freezer) {
    return $http.post('/update_freezers', freezer, {
    headers: {Authorization: 'Bearer '+auth.getToken()}
  }).success(function(data){
  
    });
  };

  o.delete_freezer = function(freezer,callback) {
    return $http.post('/delete_freezers', freezer, {
    headers: {Authorization: 'Bearer '+auth.getToken()}
  }).success(function(data){

    


      
      if (data.ok === 1 && data.n === 1){



        

        var index = o.freezers.indexOf(freezer);
        o.freezers.splice(index,1);

        
      }

      callback();
      


      
      
      
      
    });
  };

  

 

return o;

}]);




freezerApp.factory('admin', ['$http', 'auth', function($http, auth){
   var o = {

    user_list: []


   };

   o.getAll = function() {
    return $http.get('/admin/users', {
    headers: {Authorization: 'Bearer '+auth.getToken()}
  }).success(function(data){
      angular.copy(data, o.user_list);
    });
  }; 


  o.edit_user = function(user) {
    return $http.post('/admin/users', user, {
    headers: {Authorization: 'Bearer '+auth.getToken()}
  }).success(function(data){


  })
};

      o.delete_user = function(user) {
    return $http.post('/admin/delete_users', user, {
    headers: {Authorization: 'Bearer '+auth.getToken()}
  }).success(function(data){

     

      
      if (data.ok === 1 && data.n === 1){



        

        var index = o.user_list.indexOf(user);
        o.user_list.splice(index,1);

        
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

auth.isAdmin = function(){

  var token = auth.getToken();

  if(token){

    var payload = JSON.parse($window.atob(token.split('.')[1]));

    

    if(payload.admin === true){

  return true;
}


  };



















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
      $state.go('freezer');
    });
  };

  $scope.logIn = function(){
    auth.logIn($scope.user).error(function(error){
      $scope.error = error;
    }).then(function(){
      $state.go('freezer');
    });
  };
}])


freezerApp.controller('freezerCtrl', ['$scope', '$http', 'freezers', 'auth', function ($scope,$http,freezers,auth) {

  $scope.isLoggedIn = auth.isLoggedIn;
  $scope.freezers = freezers.freezers;
  
  $scope.shelf = {

    'shelfname':'name'
  };

  $scope.rack = {

    'shelfname':'name',
    'rackname':'name',
    'rows':0,
    'columns':0,
    
    'spaces':  {}


  };

  //Need to implement so that for loop runs when data in $scope.rack changes (two way data binding)


  $scope.$watchCollection('[rack.rows,rack.columns]', function(){
    $scope.rack.spaces = {};

    for(var i = 0; i < $scope.rack.rows; i++){

  var rowName = "row" + String.fromCharCode(i+65);

  $scope.rack.spaces[rowName] = {};

  for(var j = 0; j < $scope.rack.columns; j++){

    var columnName = "column" + (j + 1);


    $scope.rack.spaces[rowName][columnName] = {};


  };

  };






  })
  

  


  $scope.freezer = 
  {'freezername':'Freezer Name',
    'building':'Building',
    'floor':'Floor',
    'room':'Room',
    'shelves': {},
    'author':"author"


  };

  $scope.default_freezer = $scope.freezers[0];

$scope.add_freezer = function() {
  
  freezers.create_freezer($scope.freezer,function(){

    

    $scope.default_freezer = $scope.freezers[$scope.freezers.length-1];
  });

};

  $scope.add_shelf = function() {
  
  freezers.add_shelf($scope.default_freezer,$scope.shelf);





};

$scope.add_rack = function() {
  
  freezers.add_rack($scope.default_freezer,$scope.rack);





};

$scope.delete_freezer = function() {

  var index = $scope.freezers.indexOf($scope.default_freezer);
  console.log(index);
  
  freezers.delete_freezer($scope.default_freezer, function(){

    
   
    if(index===0){
      $scope.default_freezer = $scope.freezers[index]

    }

    else{$scope.default_freezer = $scope.freezers[index-1];}
  });





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
  $scope.isAdmin = auth.isAdmin;

}]);

freezerApp.controller('adminCtrl', ['$scope', '$http', 'admin', 'auth',
function($scope, $http, admin, auth) {
  $scope.user_list = admin.user_list;

  

  $scope.default_user = $scope.user_list[0];

  $scope.edit_user = function() {
  
  admin.edit_user($scope.default_user);





};

$scope.delete_user = function() {
  
  admin.delete_user($scope.default_user);





};


}]);


