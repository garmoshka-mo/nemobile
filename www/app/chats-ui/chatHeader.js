angular.module('angControllers')
    .service('chatHeader',
    ['notification', 'Avatar',
function(notification, Avatar) {

    // Сервис, который управляется из чата

    this.test = function() {
        // Todo: переделать это:
        notification.setTitleAttributes("кто-то", Avatar.fromId('ada').urlMini);
    }

}]);


angular.module('angControllers')
    .controller('chatHeaderController',
    ['$scope', 'chatHeader',
function($scope, chatHeader) {

    $scope.service = chatHeader;

    // Весь HTML должен быть в chatHeader.jade
    // отсюда управление его элементами


}]);