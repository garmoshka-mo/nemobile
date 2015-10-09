angular.module("angServices")

.service('bubble',
['$q', function ($q) {

    var levels = {
        2: {
            title: 'Неплохо для начала',
            text: 'Вы уже набрали более 10 очков. Посмотрим, что будет дальше.',
            videos: ['SpectacularLinearGannet', 'OddSandyAllosaurus', 'ConcernedInformalCopepod', 'AggressiveHighHyena', 'GregariousHeartyCrownofthornsstarfish']},
        3: {
            title: 'Вау, более 25 очков!',
            text: 'Надо признать, неслабый напор',
            videos: ['QuarrelsomeConcreteCurlew','GreatJubilantBluetonguelizard','HardSecondIguana','PhysicalMistyBorzoi','ElementaryWeeGonolek'] },
        4: {
            title: 'За сотэн',
            text: 'Это движение к небесам - to the moon, определенно',
            videos:['WiltedSplendidBoutu','ForkedIcyDromaeosaur', 'GrandioseDetailedItaliangreyhound', 'NaughtyDelightfulIbex'] },
        5: {
            title: 'За 250!',
            text: 'Это адский успех!',
            videos: ['CooperativeMeagerBlesbok','GrayImmaculateDouglasfirbarkbeetle','DiligentGiftedCottontail', 'ZigzagResponsibleFirecrest'] }
    };

    this.show = function(level) {
        this.render(levels[level]);
    };

}])

.directive('bubble', function() {
    return {
        restrict: 'E',

        controller: ['$scope', 'bubble', function($scope, bubble) {
            var $container = $('#gfy-container');
            $scope.hide = true;

            bubble.render = function(o) {
                $scope.title = o.title;
                $scope.text = o.text;

                var v = o.videos,
                    gfy = v[Math.floor(Math.random()*v.length)];
                gfyCollection.get().length = 0;
                $container.empty();
                $container.append("<img class='gfyitem' data-id='"+gfy+"'/>");
                gfyCollection.init();
                $scope.hide = false;
            };

            $scope.close = function() {
                $scope.hide = true;
            }

        }],

        templateUrl: "app/utils/bubble.html?"+version
    };
});