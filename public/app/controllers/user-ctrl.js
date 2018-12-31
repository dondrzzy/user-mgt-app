angular.module('userControllers', ['userService', 'authService'])
.controller('regCtrl', function($http, $location, $timeout, User) {
  var app = this;
  this.loading = false;
  this.x = 'hsbdcsd';
  this.registerUser = function(user, valid) {
    app.loading = true;
    app.message = '';
    app.messageClass = '';

    console.log('user', user);

    if (valid) {
      User.createUser(user)
        .then(function(res) {
          app.messageClass = 'success';
          app.message = `${res.data.message}, Redirecting...`;
          app.loading = false;
          $timeout(function() {
            $location.path('/');
          }, 2000);
        })
        .catch((error) => {
          console.log('error', error);
          app.messageClass = 'danger';
          app.message = error.data.message;
          app.loading = false;
        })
    } else {
      app.messageClass = 'danger';
      app.message = 'Please fill all form fields correctly';
      app.loading = false;
    }
  }

  this.checkUsername = function(username, valid) {
    if (valid) {
      User.checkUsername({username})
        .then(res => {
          app.usernameExists = false;
          app.usernameMessage = res.data.message
        })
        .catch(error => {
          app.usernameExists = true;
          app.usernameMessage = error.data.message
        })
    }
  }

  this.checkEmail = function(email, valid) {
    if (valid) {
      User.checkEmail({email})
        .then(res => {
          app.emailExists = false;
          app.emailMessage = res.data.message
        })
        .catch(error => {
          app.emailExists = true;
          app.emailMessage = error.data.message
        })
    }
  }
})

.controller('googleCtrl', function($window, $routeParams, $location, Auth) {
  console.log('google controller');
  var app = this;

  if ($window.location.pathname == '/google-error') {
    app.messageClass = 'danger';
    app.message = 'Google email not found in database';
  } else {
    Auth.google($routeParams.token)
    $location.path('/')
  }
})

.directive('match', function() {

  var controller = function($scope) {
    $scope.doConfirm = function(values) {
      values.forEach(function(elem) {
        if ($scope.confirmPassword === elem) {
          console.log('equal');
          console.log('match', elem);
          console.log('confim', $scope.confirmPassword);
          $scope.confirmed = true;
        } else {
          console.log('unequal');
          console.log('match', elem);
          console.log('confim', $scope.confirmPassword);
          $scope.confirmed = false;
        }
      })

    }
  }

  var linker = function(scope, element, attrs) {
    attrs.$observe('match', function() {
      scope.matches = JSON.parse(attrs.match);
      scope.doConfirm(scope.matches)
    })

    scope.$watch('confirmPassword', function() {
      scope.matches = JSON.parse(attrs.match);
      scope.doConfirm(scope.matches);
    })
  }

  return {
    restrict: 'A',
    link: linker,
    controller,
  }
})
