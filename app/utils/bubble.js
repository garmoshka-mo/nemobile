angular.module("angServices").service('bubble',
        ['$postpone',
function ($postpone) {

    var self = this,
        bubbleTimeout, queuedBubbleSide;

    this.reward = function(level) {
        self.schedule(levels[level], 'me');
    };

    this.checkForStrafe = function(scores, side) {
        if (scores['strafe'] != 'vegetability') return;

        self.schedule(vegetability[side], side, scores['flags']);
        return true;
    };

    this.schedule = function(bub, side, flags) {
        // не показываем про него вообще
        if (side == 'he') return;
        
        
        // Уведомление о нас имеет приоритет
        //if (side == 'he' && queuedBubbleSide == 'me') return;

        queuedBubbleSide = side;
        clearTimeout(bubbleTimeout);
        bubbleTimeout = $postpone(1500, function() {
            queuedBubbleSide = null;
            self.render(bub, flags);
        });
    };

    this.render = function(){
        error('Bubble Directive is not attached');
    };


    var vegetability = {
        'me': {
            title: 'bubble.vegetable.me.title',
            text: 'bubble.vegetable.me.text',
            videos: ['ShoddyDelectableBufeo', 'ComplexJampackedGalah', 'CavernousLargeBoar',
                'UnlawfulGreedyHummingbird', 'MeaslyDiscreteElephant', 'FlamboyantMediumBoaconstrictor']},
        'he': {
            partnerSide: true,
            title: 'bubble.vegetable.partner.title',
            text: 'bubble.vegetable.partner.text',
            videos: ['ShoddyDelectableBufeo', 'ComplexJampackedGalah', 'CavernousLargeBoar',
                'UnlawfulGreedyHummingbird', 'MeaslyDiscreteElephant', 'FlamboyantMediumBoaconstrictor']}
    };

    var levels = {
        2: {
            title: 'bubble.level2.title',
            text: 'bubble.level2.text',
            videos: ['SpectacularLinearGannet', 'OddSandyAllosaurus', 'ConcernedInformalCopepod',
                'AggressiveHighHyena', 'GregariousHeartyCrownofthornsstarfish']},
        3: {
            title: 'bubble.level3.title',
            text: 'bubble.level3.text',
            videos: ['QuarrelsomeConcreteCurlew','GreatJubilantBluetonguelizard','HardSecondIguana',
                'PhysicalMistyBorzoi','ElementaryWeeGonolek'] },
        4: {
            title: 'bubble.level4.title',
            text: 'bubble.level4.text',
            videos:['WiltedSplendidBoutu','ForkedIcyDromaeosaur', 'GrandioseDetailedItaliangreyhound',
                'NaughtyDelightfulIbex'] },
        5: {
            title: 'bubble.level5.title',
            text: 'bubble.level5.text',
            videos: ['CooperativeMeagerBlesbok','GrayImmaculateDouglasfirbarkbeetle','DiligentGiftedCottontail',
                'ZigzagResponsibleFirecrest'] }
    };

}]);
