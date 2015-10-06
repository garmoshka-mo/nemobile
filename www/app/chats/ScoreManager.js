(function(){
    angular.module("angFactories")
    .factory('ScoreManager',
        ['$resource',
function($resource) {

    return function(alias) {
        var lastAuthor, startTime,
            rows = 0, incentives = 0;

        this.score = 0;
        this.recentScore = 0;

        this.incentive = function() {
            lastAuthor = 'me';
            swap();
        };

        this.reaction = function() {
            if (lastAuthor == 'me') {
                incentives++;
                calculateScore();
            }
            lastAuthor = 'he';
            swap();
        };

        function swap() {
            rows++;
            if (!startTime) startTime = Date.now();
        }

        function calculateScore() {
            self.score = incentives;
            self.recentScore = incentives;
            log(alias, self.score, self.recentScore);
        }

        this.getLog = function() {
            return {
                rows: rows,
                incentives: incentives,
                duration: (Date.now() - startTime)/1000
            };
        };
    }

}]);

})();

