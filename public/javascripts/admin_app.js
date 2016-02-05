var adminApp = angular.module('adminApp', ['ui.router']);



adminApp.config([
'$stateProvider',
'$urlRouterProvider',
function($stateProvider, $urlRouterProvider) {

    $stateProvider
    .state('login', {
  url: '/login',
  templateUrl: '/partials/login.html',
  controller: 'AuthCtrl',
  onEnter: ['$state', 'auth', function($state, auth){
    if(auth.isLoggedIn()){
      $state.go('edit_users');
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
      $state.go('edit_users');
    }
  }]
});




$stateProvider
.state('edit_users', {
  url: '/edit_users',
  templateUrl: '/partials/admin/edit_users.html',
  controller: 'adminCtrl',
 
});

$stateProvider
.state('edit_freezers', {
  url: '/edit_freezers',
  templateUrl: '/partials/admin/edit_freezers.html',
  controller: 'adminCtrl',
 
});





  $urlRouterProvider.otherwise('edit_users');
}]);






adminApp.factory('freezers', ['$http', 'auth', function($http,auth){
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




adminApp.factory('admin', ['$http', 'auth', function($http, auth){
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



















adminApp.factory('auth', ['$http', '$window', function($http, $window){
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



adminApp.controller('AuthCtrl', [
'$scope',
'$state',
'auth',
function($scope, $state, auth){
  $scope.user = {};

  $scope.register = function(){
    auth.register($scope.user).error(function(error){
      $scope.error = error;
    }).then(function(){
      $state.go('admin');
    });
  };

  $scope.logIn = function(){
    auth.logIn($scope.user).error(function(error){
      $scope.error = error;
    }).then(function(){
      $state.go('admin');
    });
  };
}])


adminApp.controller('freezerCtrl', ['$scope', '$http', 'freezers', 'auth', function ($scope,$http,freezers,auth) {

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
  var nextObj= {};


    var freezerSearch = function(obj,box_ID){

      var obj = obj;
      var box_ID = box_ID
      console.log("obj ",obj)

      


      
    for(key in obj){

      //console.log("key: ", key, "object: ",obj[key])

      if(typeof(obj[key]) !== 'object' && key !== '__v' && key !== '$$hashKey' && obj[key] !=="EMPTY"){

        


        location[key] = obj[key]
      }


      else if(obj[key].constructor === Array){

        for(subkey in obj[key]){


           console.log("WE HAVE ARRAY")

        console.log(JSON.stringify(obj[key][subkey]))

        console.log("now repeating")

        //consle.log freezerSearch(obj[key][subkey],box_ID)




        }
   

      }


      else if(key === 'box' && obj[key]["box_ID"] === box_ID){

        console.log("we found a box")

        console.log(obj[key]["box_ID"])


        return true
      }

      /*else if(key === 'box' && obj[key]["box_ID"] !== box_ID){

        console.log("does not match")

        console.log(obj[key]["box_ID"])


        return(false)
       
      }*/



    }



    
      
    }








 var final_location = ""

var searchAll = function(obj,box_ID, found, location){

  var found = found

  var location = location

 

if(found === false){
  


  for(key in obj){


   
    if(typeof(obj[key]) == 'object'){

     

      
         for(key in obj){



                  if(typeof(obj[key]) !== 'object'){

                  location[key] = obj[key];

                  //console.log("obj key: ", JSON.stringify(obj[key]))
                  // console.log("location: ", JSON.stringify(location))

                  


                   }


        }

        

      

      
          for(key in obj){

             // console.log("KEY: ", key)
              if(typeof(obj[key]) == 'object'){
                
                //console.log("repeating")
                if(key == 'box' && obj[key]["box_ID"] == box_ID){

                  found = true;

                 // for (var i = 0; i < 5; i++){
                //console.log("EUREKA WE FOUND A BOX!")}
               // console.log("LOCATION")
               // console.log(JSON.stringify(location))

                final_location =(JSON.parse(JSON.stringify(location)))

                  
                }
                else{
              // console.log("obj[key] : ",JSON.stringify(obj[key]))
                searchAll(obj[key],box_ID,found,location)}
              }

          }
        
      

      

    }

  }


  }

  

}










var id_locations = {};



for(var i = 0; i < unique_ids.length; i++){
 // console.log("unique id")
 // console.log(unique_ids[i])
  searchAll(freezers,unique_ids[i],false,{})

  delete final_location._id;
  delete final_location.__v;
  delete final_location.date_created;

  id_locations[unique_ids[i]] = final_location



}



//console.log(id_locations)






return id_locations




};


$scope.box_locations = {};









  

  
}]);




adminApp.controller('NavCtrl', ['$scope', 'auth',
function($scope, auth) {
  $scope.isLoggedIn = auth.isLoggedIn;
  $scope.currentUser = auth.currentUser;
  $scope.logOut = auth.logOut;
  $scope.isAdmin = auth.isAdmin;

}]);


//Controller for the administration page
adminApp.controller('adminCtrl', ['$scope', '$http', 'admin', 'auth',
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


