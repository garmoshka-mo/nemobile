angular.module("angControllers").controller("showImageController", [
    'user', '$scope', '$http', '$state', 'api', '$stateParams', '$sce', 'separator', 'router',
    function(user, $scope, $http, $state, api, $stateParams, $sce, separator, router){
        $scope.router = router;
        $scope.isOffensive = false;
        separator.resize('comfortChat');

        if ($stateParams.link) {
            //we call atob, because link is base64-encoded
            $scope.linkToShow = atob($stateParams.link);
        }
        else {
            $scope.error = "отсутствует ссылка на изображение";
        }

        $scope.makeItOffensive = function() {
            $scope.isOffensive = true;
            user.forbidImage();
        };
}]);