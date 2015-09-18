app.directive('messageMenu', function() {
    return {
        scope: {session: '='},
        template: "<div class='message-menu' ng-show='showingMenu'>Menu</div>",
        link: function(scope, element, attr) {
            
            function isUpSide() {

            }

            function isLeftSide() {

            }

            function getMenuPosition() {

            }
            
            scope.showingMenu = false;
            function showMenu(event) {
                console.log(event);
                scope.showMenu = true;
            }

            angular.element(element).click(showMenu);
        }
    };
});