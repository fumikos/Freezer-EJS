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

  o.add_sample = function(freezer,sample) {

    
    freezer.sample = sample;


    return $http.post('/add_sample', freezer, {
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
    'shelf_name': "",
    'rack_index':0




  };




  //Watches when rack/column model of rack object changes

  $scope.$watchCollection('[rack_index,rack_shelf]', function(){

    
    $scope.rack.shelf_name = $scope.rack_shelf.shelf_name;
    $scope.rack.rack_index = $scope.rack_index

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



  //slide box model
  $scope.box = {'box_name':'box_name',

  'box_ID' : {}



};

//query model
$scope.query = "";


$scope.sample_box = {};

$scope.sample_box_contents = {};


//search results model
$scope.search_results = [];













  $scope.sample = {

  'box_ID' : $scope.sample_box.boxID,
  'group_name': "",
  'subgroup_name': "",
  'sample_name' : "",
  'slices_per_slide': "",
  'slice_spacing': "",
  'slice_thickness': "",
  'date_sectioned': "",
  'date_created': "",
  'author': "",
  'quantity': "",
  'start_space': ""




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

    //Recursively find location of sample box in freezer
      $scope.$watchCollection('[sample_shelf,sample_rack,sample_row,sample_column]', function(){




        
        var freezer = $scope.default_freezer;

        var level_names = ["shelf_name", "rack_name", "row_name", "column_name"]
        var sample_names = [$scope.sample_shelf.shelf_name, $scope.sample_rack.rack_name, $scope.sample_row.row_name, $scope.sample_column.column_name];

       


        
        
        var i = 0;
        
  


                    var findBox = function(obj){



                      

                     
                      for (var key in obj){

                        if (typeof obj[key] === 'object') {

                          

                          for (var subkey in obj[key]){

                           

                            var current_place = level_names[i]
                            
                            
                           


                            if(obj[key][subkey][current_place] === sample_names[i]){

                              if(key === "box"){

                                var box = (obj[key]);
                                $scope.sample.box_ID = box.box_ID;

                              

                                return box;

                                
                              }

                              
                              


                              
                              
                              else{
                              i++;

                              return findBox(obj[key][subkey]);

                            };

                            }

                          }

                        
                          

                        

                          }



                    }

                  

                  }
   
$scope.sample_box = findBox($scope.default_freezer);






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

$scope.add_sample = function() {
  
  freezers.add_sample($scope.default_freezer,$scope.sample);





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


$scope.boxContents = function(box_ID) {
    return $http.get('/box_contents?box_ID=' +  box_ID , {
    headers: {Authorization: 'Bearer '+auth.getToken()}
  }).success(function(data){
      angular.copy(data, $scope.sample_box_contents);
    });
  }; 

//Find box locations from search results
$scope.search_results_boxes = function(search_results){}


//search /search REST route
$scope.search = function(query) {
  
  return $http.get('/search?query=' + query, {

    headers: {Authorization: 'Bearer ' + auth.getToken()}


  }).success(function(data){
   
    angular.copy(data, $scope.search_results);

    angular.copy($scope.getSearchLocation($scope.search_results, $scope.freezers), $scope.box_locations);
    
    


  })

};


//get box locations of search_results boxes by ID
$scope.getSearchLocation = function(search_results,freezers){


  var unique_ids = [];

 
  unique_ids.push(search_results[0].box_ID)



  var box_locations = [];



  var freezers = freezers;

 

for (var i = 0; i < search_results.length; i++){

  var found = false;

  for (var j = 0; j < unique_ids.length; j++){

    if(unique_ids[j] === search_results[i].box_ID){

     

      found = true;


    }

    if(j === (unique_ids.length - 1) && found === false){

      unique_ids.push(search_results[i].box_ID)
    }

  

};
};


  var location = {};
    var freezerSearch = function(obj,box_ID){

      

      var box_ID = box_ID;
      
      for(key in obj){
     


        if(typeof(obj[key]) !== 'object' && key !== "$$hashKey" && key !=="__v" && key !=="author"){
           
            
            location[key] = obj[key];
           
        }

        if(typeof(obj[key]) == 'object' && key !== 'box'){

     

          if(obj[key].constructor === Array){console.log("WE FOUND ARRAY")}

           for(var i = 0; i < obj[key].length; i++){

          



              for(subkey in obj[key][i]){

                console.log("faskldfjkl")
                console.log(typeof(obj[key][i][subkey]))



                if(typeof(obj[key][i][subkey]) !== 'object' && subkey !=="$$hashKey"){



                  console.log("subkey: ",subkey)
                  console.log(typeof(obj[key][i][subkey]))
                  console.log(JSON.stringify(obj[key][i][subkey]))

                  location[subkey] = obj[key][i][subkey]

                  console.log(location)

                
                }


                else if(typeof(obj[key][i][subkey]) == 'object' && subkey !=='box'){

                  console.log("object subkey: ",subkey)

                  for(var j = 0; j < obj[key][i][subkey].length; j++){

                    for(subsubkey in obj[key][i][subkey][j]){

                      if(typeof(obj[key][i][subkey][j][subsubkey]) !== 'object' && subsubkey !=="$$hashKey" && obj[key][i][subkey][j][subsubkey] !== 'EMPTY'){


                        console.log("subsubkey: ", subsubkey);
                        console.log(obj[key][i][subkey][j][subsubkey])
                        location[subsubkey] = obj[key][i][subkey][j][subsubkey]
                        console.log(location)


                      }

                      else if(typeof(obj[key][i][subkey][j][subsubkey]) == 'object'){


                        //return freezerSearch(obj[key][i][subkey][j][subsubkey],box_ID)
                      }





                    }



                  }






                }

                else if(typeof(obj[key][i][subkey]) == 'object' && subkey == 'box'){

                  console.log("box found here")
                  console.log(obj[key][i][subkey])

                  return location;

                }




              }



          }

        }

        
      }
      
    }

console.log(JSON.stringify(freezerSearch(freezers[0],unique_ids[0])));









return unique_ids




};


$scope.box_locations = [];









  

  
}]);




freezerApp.controller('NavCtrl', ['$scope', 'auth',
function($scope, auth) {
  $scope.isLoggedIn = auth.isLoggedIn;
  $scope.currentUser = auth.currentUser;
  $scope.logOut = auth.logOut;
  $scope.isAdmin = auth.isAdmin;

}]);


//Controller for the administration page
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


$scope.active_item = "placeholder";

//set active menu item

$scope.setActiveItem = function(item){

  $scope.active_item = item;



};

$scope.isActiveItem = function(item){

  if($scope.active_item === item){

    return true;
  }

  else{

    return false;
  }

};





}]);


