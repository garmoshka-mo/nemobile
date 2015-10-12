angular.module("angServices").service('bubble',
        ['$postpone',
function ($postpone) {

    var self = this,
        bubbleTimeout, queuedBubbleSide;

    this.reward = function(level) {
        self.schedule(levels[level], 'me');
    };

    this.checkForStrafe = function(scores, side) {
        if (!scores['strafe']) return;

        self.schedule(vegetability[side], side, scores['flags']);
    };

    this.schedule = function(bub, side, flags) {
        // Уведомление о нас имеет приоритет
        if (side == 'he' && queuedBubbleSide == 'me') return;

        queuedBubbleSide = side;
        clearTimeout(bubbleTimeout);
        bubbleTimeout = $postpone(1500, function() {
            queuedBubbleSide = null;
            self.render(bub, flags);
        });
    };

    this.render = function(){
        console.error('Bubble Directive is not attached');
    };


    var vegetability = {
        'me': {
            title: 'Ваше Овощевание,',
            text: 'Вы демонстрируете овощное поведение. Это не айс не айс и не бейби.',
            videos: ['ShoddyDelectableBufeo', 'ComplexJampackedGalah', 'CavernousLargeBoar',
                'UnlawfulGreedyHummingbird', 'MeaslyDiscreteElephant', 'FlamboyantMediumBoaconstrictor']},
        'he': {
            partnerSide: true,
            title: 'Овощность',
            text: 'Собеседник демонстрирует овощное поведение. Так не надо делать.',
            videos: ['ShoddyDelectableBufeo', 'ComplexJampackedGalah', 'CavernousLargeBoar',
                'UnlawfulGreedyHummingbird', 'MeaslyDiscreteElephant', 'FlamboyantMediumBoaconstrictor']}
    };

    var levels = {
        2: {
            title: 'Неплохо для начала',
            text: 'Вы уже набрали более 10 очков. Посмотрим, что будет дальше.',
            videos: ['SpectacularLinearGannet', 'OddSandyAllosaurus', 'ConcernedInformalCopepod',
                'AggressiveHighHyena', 'GregariousHeartyCrownofthornsstarfish']},
        3: {
            title: 'Вау, более 25 очков!',
            text: 'Надо признать, неслабый напор',
            videos: ['QuarrelsomeConcreteCurlew','GreatJubilantBluetonguelizard','HardSecondIguana',
                'PhysicalMistyBorzoi','ElementaryWeeGonolek'] },
        4: {
            title: 'За сотэн',
            text: 'Это движение к небесам - to the moon, определенно',
            videos:['WiltedSplendidBoutu','ForkedIcyDromaeosaur', 'GrandioseDetailedItaliangreyhound',
                'NaughtyDelightfulIbex'] },
        5: {
            title: 'За 250!',
            text: 'Это адский успех!',
            videos: ['CooperativeMeagerBlesbok','GrayImmaculateDouglasfirbarkbeetle','DiligentGiftedCottontail',
                'ZigzagResponsibleFirecrest'] }
    };

}]);
