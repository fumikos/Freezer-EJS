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


  o.add_box = function(freezer,box) {

    freezer.box = box;


    return $http.post('/add_box', freezer, {
    headers: {Authorization: 'Bearer '+auth.getToken()}
  }).success(function(data){
      
    });
  };

  o.add_slide = function(freezer,slide,sample_shelf,sample_rack,sample_row,sample_column,sample_quantity,sample_quantity,sample_start_space) {

    freezer.slide = slide;
    freezer.sample_shelf = sample_shelf;
    freezer.sample_rack = sample_rack;
    freezer.sample_row = sample_row
    freezer.sample_column = sample_column
    freezer.sample_quantity = sample_quantity
    freezer.sample_start_space = sample_start_space


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

    'shelf_name':'name',
    'rack_spaces' :0
  };

  $scope.rack = {

    'rows':{},
    'row_count':0,
    'column_count':0,
    'rack_position': 0,
    'shelf_name': ""



  };

  //Watches when rack/column model of rack object changes

  $scope.$watchCollection('[rack_position, rack_shelf]', function(){

    $scope.rack.rack_position = $scope.rack_position;
    $scope.rack.shelf_name = $scope.rack_shelf.shelf_name;

  });


  $scope.$watchCollection('[rack.row_count,rack.column_count]', function(){
    
    $scope.rack.rows = [];
   

    for(var i = 0; i < $scope.rack.row_count; i++){

  var rowName = "row_" + String.fromCharCode(i+65);

  $scope.rack.rows[i] = {};
  $scope.rack.rows[i]["row_name"] = rowName;

  $scope.rack.rows[i]["columns"] = [];

  

  for(var j = 0; j < $scope.rack.column_count; j++){

    var column_name = "column_" + (j + 1);


    $scope.rack.rows[i]["columns"][j] = {};
    $scope.rack.rows[i]["columns"][j]["column_name"] = column_name;
   


  };

  };

  });



  //new slide box model
  $scope.box = {'box_name':'box_name',

  'box_ID' : {}



};

$scope.sample_box = {};




  $scope.slide = {'box_name':'box_name',

  'box_ID' : {},
  'sample_group_name': "",
  'sample_group_number': 1,
  'sample_name': "String",
  'slices_per_slide': 2,
  'slice_spacing': 100,
  'date_sectioned': "",
  'date_created': "{ type: Date, default: Date.now }",
  'author': "",
  'slide_quantity': 1,
  'slide_start_space': 1




};


  $scope.freezer = 
  {'freezername':'Freezer Name',
    'building':'Building',
    'floor':'Floor',
    'room':'Room',
    'shelves': [],
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

    //Recursively find location of sample box in freezer 12/08/15
      $scope.$watchCollection('[sample_shelf,sample_rack,sample_row,sample_column]', function(){




        
        var freezer = $scope.default_freezer;

        var levels = ['shelves','racks','rows','columns'];
        var level_names = ['shelf_name','rack_name','row_name','column_name'];
        var sample_names = [$scope.sample_shelf.shelf_name, $scope.sample_rack.rack_name, $scope.sample_row.row_name, $scope.sample_column.column_name];

        var current_place = "";

        
      
        var i = 0;
        var j = 0;


                            var findBox = function(current_place){          

                      console.log(current_place)                                               
                                

                      //stopped here. can't figure out how to build address          
                    
                      for(var key in freezer){

                        

                        

                        if (  freezer[levels[j]][i][level_names[j]] = sample_names[j]                   ){

                          console.log(current_place)

                          
                          current_place = current_place + "." + levels[j] + "[" + i + "]";

                          console.log(current_place)

                                                 

                          


                          
                          j++;
                          i = 0;

                          findBox(current_place);
                          
                          

                        }

                        /*else if(current_place[key].box_name){

                          return current_place[key];

                        }


                        else{

                          i++

                          findBox(current_place);

                        }*/


                      };


                      
                    }
        
         
          
      
    
  findBox(current_place);
    
   





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


$scope.add_box = function() {
  
  freezers.add_box($scope.default_freezer,$scope.box);





};

$scope.add_slide = function() {
  
  freezers.add_box($scope.default_freezer,$scope.sample_shelf,$scope.sample_rack,$scope.sample_row,$scope.sample_column);





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


