angular.module("angControllers")
    .controller("pubController", [
        '$scope', 'posts',
        function($scope, posts) {

            $scope.page = 1;
            $scope.posts = [];

            $scope.loadMore = function() {
                $scope.disableAutoload = true;
                $scope.loading = true;
                load($scope.page++);
            };

            function load(page) {
                posts.getPostsList(page).then(function(data){
                    Array.prototype.push.apply($scope.posts, data.list);
                    $scope.disableAutoload = data.is_last_page;
                    $scope.loading = false;
                });
            }
        }
    ]);
