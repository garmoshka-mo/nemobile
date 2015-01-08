angular.module("angControllers").controller("addImageController", ['$scope', '$stateParams', 'stickersGallery', 
    function($scope, $stateParams, stickersGallery) {
        
        $scope.stickersGallery = stickersGallery;
        $scope.isImageUploading = false;

        $scope.newImage = {
            url: $stateParams.imageURL == "null" ? null : $stateParams.imageURL,
            categoryId: $stateParams.categoryId 
        }

        $scope.addStickerURL = function() {
            $scope.isImageUploading = true;
            stickersGallery.addStickerURL($scope.newImage.categoryId, $scope.newImage.url)
            .then(
                function() {
                    $scope.isImageUploading = false;
                }
            )
        }

        $scope.addStickerFile = function() {
            $scope.isImageUploading = true;
            stickersGallery.addStickerFile($scope.newImage.categoryId, $scope.newImage.file[0])
            .then(
                function() {
                    $scope.isImageUploading = false;
                }
            )
        }

}])
    