(function() {
    angular.module("angApp").service('messageMenu', ['$mdDialog', function($mdDialog) {
        
        this.show = function(buttons) {
            var parentEl = angular.element(document.body);
            $mdDialog.show({
                parent: parentEl,
                 template:
                   '<md-dialog aria-label="List dialog">' +
                   '  <md-dialog-content class="ta-center">'+
                   '    <button ng-repeat="button in buttons" ng-click="onButtonClick(button)"> ' +
                   '  <span ng-bind="button.name"></span></button>' + 
                   '  </md-dialog-content>' +
                   '  <div class="md-actions">' +
                   '    <md-button ng-click="closeDialog()" class="md-primary">' +
                   '      Готово' +
                   '    </md-button>' +
                   '  </div>' +
                   '</md-dialog>',
                 locals: {
                   buttons: buttons
                 },
                 controller: DialogController 
            });
        };

        function DialogController($scope, $mdDialog, buttons) {
            $scope.buttons = buttons;

            $scope.onButtonClick = function(button) {
                button.handler();
                $scope.closeDialog();
            };

            $scope.closeDialog = function() {
              $mdDialog.hide();
            };
        }

    }]);
})();