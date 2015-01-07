angular.module("angControllers").controller("addImageController", ['$scope', '$stateParams', 'stickersGallery', 
    function($scope, $stateParams, stickersGallery) {
        
        $scope.stickersGallery = stickersGallery;
        $scope.isImageUploading = false;

        $scope.newImage = {
            url: $stateParams.imageURL == "null" ? null : $stateParams.imageURL,
            categoryId: $stateParams.categoryId 
        }

        $scope.addSticker = function() {
            $scope.isImageUploading = true;
            stickersGallery.addSticker($scope.newImage.categoryId, $scope.newImage.url)
            .then(
                function() {
                    $scope.isImageUploading = false;
                }
            )
        }

}])
    