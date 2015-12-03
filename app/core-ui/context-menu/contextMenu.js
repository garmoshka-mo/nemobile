(function() {
angular.module("angApp")
    
.service('messageMenu', 
function () {
    var self = this;
    
    this.showMenu = function(items, event, messageIndex) {

        self.items = items;
        
        if ($(event.srcElement).hasClass('message-image')) {
            router.goto('showImage', {link: btoa(event.srcElement.src)});
            return;
        }

        if ($(event.srcElement).hasClass('message-link')) {
            return;
        }

        self.lastMessageIndex = messageIndex;
        
        setTimeout(function () {
            openMenu(event);
        },0);
    };
        
    function openMenu(event) {
        $(document).foundation('dropdown', 'openMenu',
            {event: event, target: event.target, menu: '#context-menu'});
    }
})    
    
.directive('messageMenu', function() {
return {
    scope: {items: '=', api: '='},
    templateUrl: "app/core-ui/context-menu/textItemsMenu.html?"+version,
    controller: ['$scope', 'messageMenu', 
function ($scope, messageMenu) {
    
    $scope.messageMenu = messageMenu;
    
    $scope.onMenuItemClick = function(item) {
        item.handler(messageMenu.lastMessageIndex);
    };

    $(document).foundation('dropdown', 'reflow');
}]
};
});

    
})();