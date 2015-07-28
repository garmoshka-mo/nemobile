angular.module("angControllers").controller("randomController", [
         'user', '$scope',
    function(user, $scope) {
        $scope.opened = true;

        $scope.iam = {
            sex: 'man',
            age: '1'
        }

        $scope.another = {
            sex: 'woman',
            age: '2'
        }
    }
]);
