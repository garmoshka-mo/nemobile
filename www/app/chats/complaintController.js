angular.module('angControllers').controller('complaintController', ['$scope', '$mdDialog', 'SpamFilter', 'notification',
    function($scope, $mdDialog, SpamFilter, notification) {

        var originatorEv;
        $scope.openMenu = function($mdOpenMenu, ev) {
            originatorEv = ev;
            $mdOpenMenu(ev);
        };

        $scope.complaints = [
            {
                name: 'spam',
                title: 'Спам/реклама'
            },
            {
                name: 'ignorance',
                title: 'Грубое нарушение заданных критериев беседы'
            },
            {
                name: 'insult',
                title: 'Оскорбления без причины'
            }
        ];

        var filter = new SpamFilter();

        $scope.reportComplaint = function(complaintName) {
            filter.complain(complaintName);
            notification.chatDisconnect();
            notification.showToast('Модератор проверит чат и проучит негодяев, спасибо за уведомление!')
        };

    }]);