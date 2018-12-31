angular.module('mainController', ['authService'])

.controller('mainCtrl', function(Auth, $location, $timeout, $rootScope, $window, User) {

  var app = this;

  app.loadMe = false;
  $rootScope.$on('$routeChangeStart', function() {
    // check if user is logged in and get their data
    if(Auth.isLoggedIn()) {
      app.isLoggedIn = true;
      Auth.getUser()
        .then(res => {
          app.username = res.data.user.username;
          app.name = res.data.user.name;
          app.email = res.data.user.email;

          console.log('checking permission');
          
          User.getPermission()
            .then(res => {
              console.log(res);
              if(res.data.permission == 'admin' || res.data.permission == 'moderator'){
                app.adminAuth = true
              } else {
                app.adminAuth = false;
              }
              app.loadMe = true;
            })
        })
        .catch(error => {

          app.username = '';
          app.email = '';
          app.loadMe = true;
          Auth.logout();
          console.log('error', error);
          $location.path('/login');
        })
    } else {
      app.isLoggedIn = false;
      app.username = '';
      app.email = '';
      app.loadMe = true;
    }
  })

  // login user on submit
  this.loginUser = function(userData) {
    console.log('form submitted');
    app.loading = true;
    app.message = '';
    app.messageClass = '';
    Auth.loginUser(userData)
      .then(res => {
        app.loading = false;
        if (res.data.success) {
          app.user = {};
          app.message = res.data.message;
          app.messageClass = 'success';
          $timeout(function() {
            app.message = '';
            app.messageClass = '';
            $location.path('/');
          }, 2000)
        }
      })
      .catch(error => {
        app.loading = false;
        app.message = error.data.message;
        app.messageClass = 'danger';
      });
  }

  // google login
  this.google = function() {
    $window.location = $window.location.protocol + '//' + $window.location.host + '/auth/google';
  }

  // logout user
  this.logout = function() {
    Auth.logout();
    $location.path('/logout');
    $timeout(function() {
      $location.path('/');
    }, 2000)
  }
});
