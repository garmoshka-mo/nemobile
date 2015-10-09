angular.module("angControllers")
.controller("randomController", [
         'user', '$scope', 'updates', '$state', 'notification', 'separator',
        'membership', 'random', 'timer', 'router', 'googleAnalytics',
        'bubble',
function(user, $scope, updates, $state, notification, separator,
         membership, random, timer, router, googleAnalytics,
        bubble) {

        $scope.updates = updates;
        updates.check();

        timer.reset();

        //ensure has membership / needs activation / etc
        
        $scope.showHelpText = false;
        $scope.random = random;
        $scope.notification = notification;
        $scope.isRestart = router.top.name == 'randomRestart';

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

        $scope.filterSettings = function() {
            $scope.isRestart = false;
            router.openOnTop("randomFull");
        };

    var test = 2;
        $scope.lookForChat = function() {
            //return bubble.show(test++);
            var preferences = prepareDataForServer();
            googleAnalytics.event('random', 'start');
            separator.resize('comfortChat');
            notification.asked = 0;

            saveFilterState();
            random.lookForChat(preferences);
        };

        $scope.$on('new random chat', function() {
            setTimeout(function() {
                $scope.$apply(function() {
                    $scope.leaving = true;
                });
            },1);
        });

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

        $scope.helpClick = function() {
            $scope.showHelpText = !$scope.showHelpText;
            debugPanel();
        };

        var debugClickCounter = 0;
        function debugPanel() {
            if (debugClickCounter == 0) {
                setTimeout(function() {
                    debugClickCounter = 0;
                }, 2500)
            } else if (debugClickCounter == 10) {
                $state.go('localForage');
            }
            debugClickCounter++;
        }

        $scope.suggestUserGender = function(){
            var anotherSex = $scope.filter.another.sex;
            //If the user did not select his gender but selected a gender of a preferred chat partner instead
            if($scope.filter.iam.sex === "-" && anotherSex !== "-") {
                //Choose the opposite to preferred chat partner's gender
                $scope.filter.iam.sex = anotherSex === "w"? "m" : "w";
            }
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
                    gender: $scope.filter.another.sex === 'mw'? '-' : $scope.filter.another.sex,
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
