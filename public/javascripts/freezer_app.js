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


  o.add_box = function(freezer,shelf,rack,box) {

    freezer.shelf = shelf;
    freezer.rack = rack;
    freezer.box = box;


    return $http.post('/add_box', freezer, {
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

    'shelf_name':'name'
  };

  $scope.rack = {

    'rows':{},
    'row_count':0,
    'column_count':0,



  };

  //Watches when rack/column model of rack object changes, and updates the spaces object to reflect this


  $scope.$watchCollection('[rack.row_count,rack.column_count]', function(){
    
    $scope.rack.rows = {};

    for(var i = 0; i < $scope.rack.row_count; i++){

  var rowName = "row" + String.fromCharCode(i+65);

  $scope.rack.rows[rowName] = {};

  $scope.rack.rows[rowName]["row_name"] = rowName;

  $scope.rack.rows[rowName]["columns"] = {};

  

  for(var j = 0; j < $scope.rack.column_count; j++){

    var columnName = "column_" + (j + 1);


    $scope.rack.rows[rowName]["columns"][columnName] = {};
    $scope.rack.rows[rowName]["columns"][columnName]["column_name"] = columnName;
   


  };

  };

  });



  //new slide box model
  $scope.box = {'box_name':'box_name'};


  $scope.freezer = 
  {'freezername':'Freezer Name',
    'building':'Building',
    'floor':'Floor',
    'room':'Room',
    'shelves': {},
    'author':"author"


  };








  //watch add box attributes
   $scope.$watchCollection('[box_shelf,box_rack,box_row,box_column]', function(){
    
    $scope.box.shelf_name = "";
    $scope.box.rack_name = "";
    $scope.box.row_name = "";
    $scope.box.shelf_name = "";
    $scope.box.column_name = "";


    $scope.box.shelf_name = $scope.box_shelf.shelf_name;
    $scope.box.rack_name = $scope.box_rack.rack_name;
    $scope.box.row_name = $scope.box_row.row_name;
    $scope.box.column_name = $scope.box_column.column_name;



  });






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

//add box to freezer, shelf, and rack
$scope.add_box = function() {
  
  freezers.add_box($scope.default_freezer,$scope.shelf,$scope.rack, $scope.box);





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


