(function(){

services
    .service('membership',
    ['$q', '$resource',
function ($q, $resource) {

    var Membership = $resource('/users/:user_safe_id/membership');

    this.getCategory = function() {
      var deferred = $q.defer();

      // todo: replace user_uuid to use user injection after refactoring of user
      Membership.get({user_safe_id: user_uuid}, function(data) {
        if (data.active)
          deferred.resolve(data.type);
        else
          deferred.reject();
      });

        return deferred.promise;
    }
    
}]);
}

)();