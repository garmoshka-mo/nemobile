angular.module("angControllers").controller("randomController", [
         'user', '$scope',
    function(user, $scope) {

        $scope.showHelpText = false;
        $scope.waitingServer = false;
        $scope.lookupInProgress = false;

        var ageRanges = [[0, 100], [0, 17], [18, 21], [22, 25], [26, 35], [35, 100]];

        $scope.iam = {
            sex: '-',
            age: 0,
            intro: '',
            location: ''
        };

        $scope.another = {
            sex: '-',
            age: 0
        };

        function selectValue(value) {
            this.isOpened = false;
            this.value = value;
        }

        $scope.theme = {
            isOpened: false,
            value: -1,
            selectValue: selectValue
        };

        $scope.geo = {
            isOpened: false,
            value: -1,
            selectValue: selectValue
        };

        $scope.sex = {
            isOpened: false,
            value: -1,
            selectValue: selectValue
        };

        $scope.video = {
            isOpened: false,
            value: -1,
            selectValue: selectValue
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

        function onSuccessChatRequest() {
            $scope.waitingServer = false;
            $scope.lookupInProgress = true;
        }

        function onErrorChatRequest() {
            $scope.waitingServer = false;
            $scope.lookupInProgress = false;
        }

        $scope.lookForChat = function() {
            var data = prepareDataForServer();
            $scope.waitingServer = true;
            ga('send', 'event', 'random', 'start');

            if (user.isLogged()) {
                api.randomChatRequest(data)
                .then(
                    onSuccessChatRequest,
                    onErrorChatRequest
                );
            }
            else {
                user.signinAsVirtualUser()
                .then(
                    function() {
                        api.randomChatRequest(data)
                        .then(
                            onSuccessChatRequest,
                            onErrorChatRequest
                        );
                    }
                );
            } 
        };

        $scope.cancelLookingFor = function() {
            $scope.waitingServer = true;
            api.cancelRandomRequest()
            .then(
                function() {
                    $scope.waitingServer = false;
                    $scope.lookupInProgress = false;
                }
            );
        };

        function prepareDataForServer() {
            return {
                subjects: {
                    free_talk: $scope.theme.value,
                    real: $scope.geo.value,
                    sexual: $scope.sex.value,
                    video: $scope.video.value
                },
                intro: $scope.iam.intro,
                location: $scope.iam.location, 
                me: {
                    gender: $scope.iam.sex,
                    age_range: ageRanges[$scope.iam.age]
                },
                look_for: {
                    gender: $scope.another.sex,
                    age_range: ageRanges[$scope.another.age]
                }
            };
        }
    }
]);
