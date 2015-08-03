angular.module("angControllers").controller("randomController", [
         'user', '$scope',
    function(user, $scope) {

        $scope.showHelpText = false;

        $scope.iam = {
            sex: 'man',
            age: '1'
        };

        $scope.another = {
            sex: 'woman',
            age: '2'
        };

        function selectValue(value) {
            this.isOpened = false;
            this.value = value;
        }

        $scope.theme = {
            isOpened: false,
            value: 'none',
            selectValue: selectValue
        };

        $scope.geo = {
            isOpened: false,
            value: 'none',
            selectValue: selectValue
        };

        $scope.sex = {
            isOpened: false,
            value: 'none',
            selectValue: selectValue
        };

        $scope.video = {
            isOpened: false,
            value: 'none',
            selectValue: selectValue
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
