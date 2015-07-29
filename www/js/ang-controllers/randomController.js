angular.module("angControllers").controller("randomController", [
         'user', '$scope',
    function(user, $scope) {
        $scope.opened = true;

        $scope.iam = {
            sex: 'man',
            age: '1'
        };

        $scope.another = {
            sex: 'woman',
            age: '2'
        };

        $scope.filter = {
            selectedTheme: 'none',
            selectedGeo: 'none',
            selectedSex: 'none',
            selectedVideo: 'none'
        };

        $scope.selectTheme = function(theme) {
            $scope.filter.selectedTheme = theme;
        };

        $scope.selectGeo = function(geo) {
            $scope.filter.selectedGeo = geo;
        };

        $scope.selectSex = function(sex) {
            $scope.filter.selectedSex = sex;
        };

        $scope.selectVideo = function(video) {
            $scope.filter.selectedVideo = video;
        };
    }
]);
