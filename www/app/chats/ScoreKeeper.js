'use strict';
(function(){
    angular.module("angFactories")
    .factory('ScoreKeeper',
        ['$resource',
function($resource) {
    return function(alias) {
        var self = this,
            updateCallback,;

        this.addSessionScore = function(value) {
            if (value > 1 || value < 0)
            applyToScore(value);
        };


        // PRIVATE:

        function updateUI() {
            if (updateCallback)
                updateCallback(Math.round(score), Math.round(recentScore));
            recentScore = 0;
        }

        // Utils:

        this.getScore = function() {
            return score;
        };

        this.onUpdate = function(callback) {
            updateCallback = callback;
            updateUI();
        };

        this.sendScoresToUI = function() {
            updateUI();
        };

        this.getLog = function() {
            return {
                rows: rows,
                incentives: myIncentives,
                duration: getDuration(startTime)
            };
        };
    }

}]);

})();

