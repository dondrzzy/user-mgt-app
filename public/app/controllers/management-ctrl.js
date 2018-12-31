angular.module('managementController', [])

.controller('managementCtrl', function(User) {
  var app = this;
  app.limit = 10;
  app.loading = 'true';
  app.editAccess = false;
  app.deleteAccess = false;
  User.getUsers().then(res => {
    app.loading = 'false';
    app.users = res.data.users;
    if (res.data.permission === 'admin') {
      app.editAccess = true;
      app.deleteAccess = true;
    } else if (res.data.permission === 'moderator') {
      app.editAccess = true;
    }
  })
  .catch(error => {
    app.loading = 'false';
    app.message = error.data.message;
    app.messageClass = 'danger';
    console.log('error', error);
  })
})