angular.module("angControllers")
.controller("randomController", [
         'user', '$scope', 'externalChat', 'updates',
    function(user, $scope, externalChat, updates) {

        updates.check();

        $scope.showHelpText = false;
        $scope.waitingServer = false;
        $scope.lookupInProgress = false;

        var ageRanges = [[0, 100], [0, 17], [18, 21], [22, 25], [26, 35], [35, 100]];

        $scope.filter = {};
        
        function selectValue(value) {
            this.isOpened = false;
            this.value = value;
        }

        function extendFilterObject() {
            $scope.filter.theme.selectValue = 
            $scope.filter.geo.selectValue = 
            $scope.filter.sex.selectValue = 
            $scope.filter.video.selectValue =
            selectValue; 
        }

        function onSuccessChatRequest() {
            $scope.waitingServer = false;
            $scope.lookupInProgress = true;
        }

        function onErrorChatRequest() {
            $scope.waitingServer = false;
            $scope.lookupInProgress = false;
        }

        function saveFilterState() {
            localStorage.randomFilter = JSON.stringify($scope.filter);
        }

        $scope.lookForChat = function() {
            var preferences = prepareDataForServer();
            $scope.waitingServer = true;
            ga('send', 'event', 'random', 'start');
            

            if (user.isLogged()) sendRequest();
            else user.signinAsVirtualUser().then(sendRequest);
            saveFilterState();

            function sendRequest() {
                api.randomChatRequest(preferences)
                    .then(
                    onSuccessChatRequest,
                    onErrorChatRequest
                );
            }

            if (App.Settings.externalChat) externalChat.start(preferences);

        };

        $scope.setDefaultFilterParams = function() {
            $scope.filter.iam = {
                sex: '-',
                age: 0,
                intro: '',
                location: ''
            };

            $scope.filter.another = {
                sex: '-',
                age: 0
            };

            $scope.filter.theme = {
                isOpened: false,
                value: 0
            };

            $scope.filter.geo = {
                isOpened: false,
                value: 0
            };

            $scope.filter.sex = {
                isOpened: false,
                value: 0
            };

            $scope.filter.video = {
                isOpened: false,
                value: 0
            };
        };

        $scope.cancelLookingFor = function() {
            $scope.waitingServer = true;
            externalChat.disconnect();
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
                    free_talk: $scope.filter.theme.value,
                    real: $scope.filter.geo.value,
                    sexual: $scope.filter.sex.value,
                    video: $scope.filter.video.value
                },
                intro: $scope.filter.iam.intro,
                location: $scope.filter.iam.location, 
                me: {
                    gender: $scope.filter.iam.sex,
                    age_range: ageRanges[$scope.filter.iam.age]
                },
                look_for: {
                    gender: $scope.filter.another.sex,
                    age_range: ageRanges[$scope.filter.another.age]
                }
            };
        }

        var storedFilterParams = localStorage.randomFilter;
        if (storedFilterParams) {
            console.log('filter params were taken from storage');
            $scope.filter = JSON.parse(storedFilterParams);
            extendFilterObject();
        }
        else {
            $scope.setDefaultFilterParams();
            extendFilterObject();
        }
    }
]);
