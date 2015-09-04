angular.module("angControllers")
.controller("randomController", [
         'user', '$scope', 'externalChat', 'updates', '$state', 'notification', 'membership', 'random',
    function(user, $scope, externalChat, updates, $state, notification, membership, random) {

        $scope.updates = updates;
        updates.check();
        
        membership.getCategory(function(category) {
            externalChat.category = category;
        }, function notActive() {
            console.log('here redirect to payment page');
        });
        
        $scope.showHelpText = false;
        $scope.waitingServer = random.waitingServer;
        $scope.lookupInProgress = random.lookupInProgress;
        $scope.notification = notification;

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

        function saveFilterState() {
            localStorage.randomFilter = JSON.stringify($scope.filter);
        }

        function prepareAgeRange(arrayOfIndexes) {
            var resultArray = [];
            arrayOfIndexes.forEach(function(index) {
                resultArray = resultArray.concat(ageRanges[index]);
            });
            return [_.min(resultArray), _.max(resultArray)];
        }

        $scope.lookForChat = function() {
            var preferences = prepareDataForServer();
            googleAnalytics.event('random', 'start');
            notification.asked = 0;

            random.lookForChat();
        };

        $scope.setDefaultFilterParams = function() {
            $scope.filter.iam = {
                sex: '-',
                age: [0],
                intro: '',
                location: ''
            };

            $scope.filter.another = {
                sex: '-',
                age: [0]
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
            random.cancelLookingFor();
        };

        var helpClickCounter = 0;
        $scope.helpClick = function() {
            $scope.showHelpText = !$scope.showHelpText;
            if (helpClickCounter == 0) {
                setTimeout(function() {
                    helpClickCounter = 0;
                }, 2500)
            } else if (helpClickCounter == 10) {
                $state.go('localForage');
            }
            helpClickCounter++;
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
                    age_range: prepareAgeRange($scope.filter.iam.age)
                },
                look_for: {
                    gender: $scope.filter.another.sex,
                    age_range: prepareAgeRange($scope.filter.another.age)
                }
            };
        }

        var storedFilterParams = localStorage.randomFilter;
        if (storedFilterParams) {
            log('filter params were taken from storage');
            var filter = JSON.parse(storedFilterParams);
            if (!filter.another || !(filter.another.age instanceof Array)) filter.another.age = [0];
            if (!filter.iam || !(filter.iam.age instanceof Array)) filter.iam.age = [0];

            $scope.filter = filter;
            extendFilterObject();
        }
        else {
            $scope.setDefaultFilterParams();
            extendFilterObject();
        }
    }
]);
