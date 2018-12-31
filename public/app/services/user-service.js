angular.module('userService', [])

.factory('User', function($http) {
  var userFactory = {}

  userFactory.checkEmail = function(userData) {
    return $http.post('/api/v1/checkemail', userData)
  }

  userFactory.checkUsername = function(userData) {
    return $http.post('/api/v1/checkusername', userData)
  }

  userFactory.createUser = function(user) {
    return $http.post('/api/v1/users', user)
  }

  userFactory.getPermission = function() {
    return $http.get('/api/v1/permission'); 
  }

  userFactory.getUsers = function() {
    return $http.get('/api/v1/users'); 
  }

  return userFactory;
});
