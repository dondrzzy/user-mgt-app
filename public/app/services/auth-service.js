angular.module('authService', [])

.factory('Auth', function($http, AuthToken, $q) {
  var authFactory = {};

  authFactory.loginUser = function(userData) {
    return $http.post('/api/v1/authenticate', userData)
      .then(res => {
        AuthToken.setToken(res.data.token);
        return res;
      });
  }

  authFactory.google = function(token) {
    AuthToken.setToken(token);
  }

  authFactory.isLoggedIn = function() {
    if(AuthToken.getToken())
      return true;
    else
      return false;
  }

  authFactory.logout = function() {
    AuthToken.removeToken();
  }

  authFactory.getUser = function() {
    if (AuthToken.getToken())
      return $http.get('/api/v1/me');
    else
      $q.reject({message: 'User has no token'});
  }

  return authFactory;
})

.factory('AuthToken', function($window) {
  var authTokenFactory = {};

  authTokenFactory.setToken = function(token) {
    $window.localStorage.setItem('token', token);
  }

  authTokenFactory.removeToken = function() {
    $window.localStorage.removeItem('token');
  }

  authTokenFactory.getToken = function() {
    return $window.localStorage.getItem('token');
  }
  return authTokenFactory;
})

.factory('AuthInterceptors', function(AuthToken) {
  var authInterceptorsFactory = {};

  authInterceptorsFactory.request = function(config) {
    var token = AuthToken.getToken()
    if(token) config.headers['x-access-token'] = token;
    return config
  }

  return authInterceptorsFactory;
})
