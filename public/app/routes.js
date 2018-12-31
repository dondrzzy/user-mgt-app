
var app = angular.module('appRoutes', ['ngRoute'])

.config(function($routeProvider, $locationProvider) {
  $routeProvider.when('/', {
    templateUrl: 'app/views/pages/home.html'
  })

  .when('/about', {
    templateUrl: 'app/views/pages/about.html'
  })

  .when('/register', {
    templateUrl: 'app/views/pages/user/register.html',
    controller: 'regCtrl',
    controllerAs: 'register',
    authenticated: false
  })

  .when('/google/:token', {
    templateUrl: 'app/views/pages/user/social/social.html',
    controller: 'googleCtrl',
    controllerAs: 'google',
    authenticated: false
  })

  .when('/google-error', {
    templateUrl: 'app/views/pages/user/login.html',
    controller: 'googleCtrl',
    controllerAs: 'google',
    authenticated: false
  })

  .when('/login', {
    templateUrl: 'app/views/pages/user/login.html',
    authenticated: false
  })

  .when('/logout', {
    templateUrl: 'app/views/pages/user/logout.html',
    authenticated: true
  })

  .when('/profile', {
    templateUrl: 'app/views/pages/user/profile.html',
    authenticated: true
  })

  .when('/management', {
    templateUrl: 'app/views/pages/management/management.html',
    controller: 'managementCtrl',
    controllerAs: 'management',
    authenticated: true,
    permission: ['admin', 'moderator']
  })

  .otherwise({ redirectTo: '/' })

  $locationProvider.html5Mode({
    enabled: true,
    requirebase: false,
  });
});

app.run(['$rootScope', 'Auth', '$location', 'User', function($rootScope, Auth, $location, User) {
  $rootScope.$on('$routeChangeStart', function(event, next, current) {
    if (next.$$route !== undefined) {
      if (next.$$route.authenticated == true) {
        if (!Auth.isLoggedIn()) {
          event.preventDefault();
          $location.path('/login')
        } else if (next.$$route.permission) {
          User.getPermission()
            .then(res => {
              if(next.$$route.permission[0] !== res.data.permission) {
                if(next.$$route.permission[1] !== res.data.permission) {
                  event.preventDefault();
                  $location.path('/');
                }
              }
            });
        }
      } else if (next.$$route.authenticated == false) {
        if (Auth.isLoggedIn()) {
          event.preventDefault();
          $location.path('/profile')
        }
      }
    }
  })
}])
