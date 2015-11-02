angular.module("angServices")
.directive('pedobearAlert', function() {
    return {
    restrict: 'E',
    scope: {filter: '='},
    controller: ['$scope', 'router',
        function($scope, router) {
            
            var initialAnotherAge, ignore = false;
            
            $scope.close = function () {
                $('#pedobear-alert').foundation('reveal', 'close');
            };

            $scope.resume = function () {
                ignore = true;
                console.log(initialAnotherAge);
                $scope.filter.another.age = initialAnotherAge;
                $scope.close(); 
            };
            
            $scope.$watch('filter.sex.value', autoAgeLimits);
            $scope.$watch('filter.iam.age', autoAgeLimits);
            $scope.$watch('filter.another.age', checkAgeLimits);

            function autoAgeLimits() {
                if (ignore) return;
                var f = $scope.filter;
                if (f.sex.value > 0) {
                    if (f.iam.age[0] == 1)
                        f.another.age = [1];
                    else if (f.iam.age[0] > 1)
                        f.another.age = [2,3,4,5];
                }
            }

            function checkAgeLimits() {
                if (ignore) return;
                var f = $scope.filter;
                if (f.another.age && f.sex.value > 0) {
                    if (f.iam.age[0] == 1 &&
                            f.another.age.some(function(i) { return i != 1 })) {
                        
                        $scope.ageAlertTo = 'lolicon';
                        initialAnotherAge = f.another.age;
                        f.another.age = [1];
                        ageAlert();
                    } 
                    else if (f.iam.age[0] > 1 &&
                            f.another.age.some(function(i) { return i < 2 })) {

                        $scope.ageAlertTo = 'pedobear';
                        initialAnotherAge = f.another.age;
                        f.another.age = [2,3,4,5];
                        ageAlert();
                    }
                }
            }

            function ageAlert() {
                $('#pedobear-alert').foundation('reveal', 'open');
                
                var $e = $('[external-url]');
                $e.unbind('click', openExternalURL);
                $e.bind('click', openExternalURL);
            }

            function openExternalURL() {
                router.openExternalURL($(this).attr('external-url'));
            }
            
        }],

    templateUrl: "app/chats-ui/dialogs/pedobearAlert.html?"+version
    };
});