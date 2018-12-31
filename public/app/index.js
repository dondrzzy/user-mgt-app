angular.module(
  'userApp',
  [
    'appRoutes',
    'userControllers',
    'userService',
    'authService',
    'ngAnimate',
    'mainController',
    'managementController'
  ]
)
.config(function($httpProvider) {
  $httpProvider.interceptors.push('AuthInterceptors')
});
