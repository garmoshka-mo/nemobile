'use strict';
(function(){
    angular.module("angFactories")
    .factory('ScoreKeeper',
        ['$resource',
function($resource) {
    return function(alias, init_score) {

        var score = init_score, recentScore = 0,
            isActive = true, updateCallback;

        this.turnOn = function() {
            isActive = true;
            updateUI();
        };

        this.turnOff = function() {
            isActive = false;
        };

        this.update = function(scores) {
            if (scores) {
                score = scores.score;
                if (scores.recentScore)
                    recentScore += scores.recentScore;
            }
            updateUI();
        };

        function updateUI() {
            if (!isActive) return;

            if (updateCallback) {
                var v = typeof score == 'undefined' ? '...' : Math.round(score);
                updateCallback(v, Math.round(recentScore));
            }

            recentScore = 0;
        }

        this.onUpdate = function(callback) {
            updateCallback = callback;
            updateUI();
        };

    }

}]);

})();

