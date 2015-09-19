angular.module("angControllers")
    .controller("pubController", [
        '$scope', 'posts',
        function($scope, posts) {

            $scope.page = 1;
            var isLastPage = false;

            $scope.getPostsList = function(page) {
                posts.getPostsList(page).then(function(data){
                    $scope.postsList = data.list;
                    isLastPage = data.is_last_page;
                });
            };

            $scope.getPostsList(1);

            $scope.getNextLimit = function() {
                if(!isLastPage) {
                    posts.getPostsList(page).then(function(data){
                        $scope.postsList.push.apply(data.list);
                        isLastPage = data.is_last_page;
                    });
                }
            }
        }
    ]);
