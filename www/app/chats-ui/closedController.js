angular.module('angControllers').controller('closedController',
    ['$scope', 'separator', 'guestRequest',
function($scope, separator, guestRequest) {

    $scope.expand = function() {
        separator.resize('full');
    };

    $scope.reminder = function() {
        if (!$scope.contact){
            alert('Нужно указать контакты');
            return
        }
        guestRequest.send('post', '/reminders',
            {contact: $scope.contact})
            .then(function () {
                $scope.contact = '';
                alert('Готово! Мы отправим уведомление в 18:00');
            });
    };

    $scope.openAt = watches.openAt;

    var dots = true;
    setInterval(function() {
        $scope.$apply(function() {
            dots = !dots;
            $scope.left = watches.left(dots);
        });
    }, 1000);

}]);