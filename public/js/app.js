var app = angular.module('oduacm', ['firebase', 'ngMaterial']);

app.factory('Auth', function($firebaseAuth) {
  var endPoint = "https://oduacm.firebaseio.com/";
  var usersRef = new Firebase(endPoint);
  return $firebaseAuth(usersRef);
});

app.controller('MainCtrl', function($scope, Auth){

  $scope.login = function(authMethod) {
    Auth.$authWithOAuthRedirect(authMethod, {scope:"email"}).then(function(authData) {
    }).catch(function(error) {
      if (error.code === 'TRANSPORT_UNAVAILABLE') {
        Auth.$authWithOAuthPopup(authMethod).then(function(authData) {
        });
      } else {
        console.log(error);
      }
    });
  };

  Auth.$onAuth(function(authData) {
    if (authData === null) {
      console.log('Not logged in yet');
    } else {
      console.log('Logged in as', authData.uid);
    }
    // This will display the user's name in our view
    $scope.authData = authData;
  });

  $scope.logout = function() {
    Auth.$unauth();
  }
});

app.controller('EventsCtrl', function($scope, $firebaseArray){
  var endPoint = "https://oduacm.firebaseio.com/events";
  var ref = new Firebase(endPoint);

  $scope.events = $firebaseArray(ref);

  $scope.events.$loaded().then(function(events){
    console.log(events);
  });

});
