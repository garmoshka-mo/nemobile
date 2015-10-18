angular.module('angControllers').controller('closedController',
    ['$scope', 'separator', 'guestRequest', 'sound', 'router',
function($scope, separator, guestRequest, sound, router) {

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

    $scope.calEvent = function () {
        router.openExternalURL(config('msgServer') + '/event.vcs');
    };

    $scope.openAt = watches.openAt;

    var dots = true, timer;
    timer = setInterval(function() {
        $scope.$apply(function() {
            dots = !dots;
            $scope.left = watches.left(dots);
            if ($scope.left == '0:00:00') {
                clearInterval(timer);
                sound.play('newConversation');
                setTimeout(function () {
                    location.reload();
                }, 1000);
            }
        });
    }, 1000);

}]);