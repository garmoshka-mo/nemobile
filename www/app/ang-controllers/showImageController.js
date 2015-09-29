angular.module("angControllers").controller("showImageController", [
    'user', '$scope', '$http', '$state', 'api', '$stateParams', '$sce',
    function(user, $scope, $http, $state, api, $stateParams, $sce){
        $scope.isOffensive = false;
        log(decodeURI($stateParams.link));

        if ($stateParams.link) {
            $scope.linkToShow = $stateParams.link;
        }
        else {
            $scope.error = "отсутствует ссылка на изображение";
        }

        $scope.makeItOffensive = function() {
            $scope.isOffensive = true;
            user.forbidImage();
        };
}]);