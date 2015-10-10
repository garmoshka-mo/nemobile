'use strict';
(function(){
    angular.module("angFactories")
    .factory('ScoreMachine',
        ['$resource',
function($resource) {
    return function(alias, init_score) {
        var self = this,
            updateCallback,
            lastAuthor, startTime,
            rows = 0, hisRows = 0, myRows = 0,
            hisLastMessage,
            myIncentives = 0, myIncentiveValue = 0,

            score = init_score || 1, recentScore = 0;

        // External behavior events:

        this.myIncentive = function(text) {
            rows++;
            myRows++;
            myIncentiveValue += getValueOfText(text);
            lastAuthor = 'me';
        };

        this.iTyping = function() {

        };

        this.partnerReacted = function() {
            rows++;
            hisRows++;
            hisLastMessage = Date.now();
            if (lastAuthor == 'me') {
                myIncentives++;
                incrementMyScore();
            }
            lastAuthor = 'he';
        };

        this.addSessionScore = function(value) {
            if (value > 1 || value < 0)
            applyToScore(value);
        };

        this.began = function() {
            startTime = Date.now();
        };

        this.finished = function(byPartner) {

        };



        // PRIVATE:

        function incrementMyScore() {
            if (myIncentiveValue < 1 && score < 10) myIncentiveValue = 1;
            applyToScore(myIncentiveValue);
            updateUI();
            myIncentiveValue = 0;
        }

        function bestrafeMich(dieStrafe) {
            myIncentiveValue = 0;
            if (score == 1) score = 0; // Сбрасываем подарочный очек
            applyToScore(-dieStrafe);
            updateUI();
        }

        function applyToScore(value) {
            score += value;
            recentScore += value;
            log(alias, score, recentScore);
        }

        function updateUI() {
            if (updateCallback)
                updateCallback(Math.round(score), Math.round(recentScore));
            recentScore = 0;
        }

        function loadScore() {
            score = null;
        }

        function getValueOfText(text) {
            var longWords = 0;
            var words = text.split(" ");
            words.map(function (w) {
                if (w.length > 3) longWords++;
            });
            return longWords / 3;
        }

        function getDuration(from) {
            return (Date.now() - from)/1000;
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

