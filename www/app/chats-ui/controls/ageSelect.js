angular.module("angApp")
.directive('ageSelect', function() {
    return {
        restrict: 'AE',
        scope: {
            ngModel: '=',
            values: '=',
            titles: '='
        },

        link: function(scope, elem, attr) {
            var allowMultiple = attr.multiple === "true";

            scope.handleItemClick = function(value) {
                if (allowMultiple) {
                    var indexOfValue = scope.ngModel.indexOf(value);
                    if (indexOfValue == -1) {
                        scope.ngModel.push(value);
                    }
                    else {
                        scope.ngModel = scope.ngModel.slice(0, indexOfValue);
                    }

                    //'не важно' can not be ngModel with other values
                    //code below makes it possible
                    if (value != 0) {
                        _.remove(scope.ngModel, function(e) {return e == 0;});
                    }
                    else {
                        scope.ngModel = [0];
                    }

                    var min = _.min(scope.ngModel);
                    var max = _.max(scope.ngModel);
                    scope.ngModel = _.filter(scope.values, function(e) {
                        return e >= min && e <= max;
                    });

                    if (_.isEmpty(scope.ngModel)) {
                        scope.ngModel = [0];
                    }
                }
                else {
                    scope.ngModel = [value];
                }
            };
        },

        templateUrl: "app/chats-ui/controls/ageSelect.html"
    };
});