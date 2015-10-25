var app = angular.module('oduacm', ['firebase', 'ngMaterial']);

app.factory('Auth', function($firebaseAuth) {
  var endPoint = "https://oduacm.firebaseio.com/";
  var usersRef = new Firebase(endPoint);
  return $firebaseAuth(usersRef);
});

app.controller('MainCtrl', function($scope, Auth, $mdSidenav){

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

app.controller('EventsCtrl', function($scope, $firebaseObject, $firebaseArray) {
  var endPoint = "https://oduacm.firebaseio.com/events";
  var ref = new Firebase(endPoint);

  $scope.isLoading = true;

  $scope.events = $firebaseArray(ref);

  $scope.joinEvent = function(id) {
    var attendeesStr = $firebaseObject(ref.child(id).child('attendeesStr'));
    attendeesStr.$loaded().then(function(){
      var attendees = attendeesStr.$value.split(',');
      if(attendees.length === 1 && attendees[0] === "") {
        attendees = [];
      }
      var email = $scope.authData.google.email;

      if(attendees.indexOf(email) === -1) {
        attendees.push(email);
        attendeesStr.$value = attendees.join();
        attendeesStr.$save();
        console.log(attendeesStr.$value);
        console.log('You have joined the event');
      } else {
        console.log(attendeesStr.$value);
        console.log('You have already joined this event');
      }
    })
  }

  $scope.cancelEvent = function(id) {
    var attendeesStr = $firebaseObject(ref.child(id).child('attendeesStr'));
    attendeesStr.$loaded().then(function() {
      var attendees = attendeesStr.$value.split(',');
      var email = $scope.authData.google.email;

      var emailPos = attendees.indexOf(email);
      if(emailPos !== -1) {
        attendees.splice(emailPos, 1);
        attendeesStr.$value = attendees.join();
        attendeesStr.$save();
        console.log(attendeesStr.$value);
        console.log('Sad to see you canceled');
      } else {
        console.log(attendeesStr.$value);
        console.log('You have not rsvp\'d for this event');
      }
    })
  }


  navigator.geolocation.getCurrentPosition(function(position) {
    console.log(position);
  });

  $scope.events.$loaded().then(function(events){
    $scope.isLoading = false;
  });

});
