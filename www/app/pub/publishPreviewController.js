angular.module("angControllers")
    .controller("publishPreviewController", [
        '$scope', 'posts',
        function($scope, posts) {

            $scope.preview = posts.preview;
            $scope.preview.title = "";
            //Limit title to 140 characters.
            $scope.$watch('preview.title', function(newVal, oldVal) {
                if(newVal.length > 140) {
                    $scope.preview.title = oldVal;
                }
            });
            $(document).foundation('dropdown', 'reflow');
        }
    ]);
