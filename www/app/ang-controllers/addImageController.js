angular.module("angControllers").controller("addImageController",
    ['$scope', '$stateParams', 'stickersGallery',
    function($scope, $stateParams, stickersGallery) {
        
        $scope.stickersGallery = stickersGallery;
        $scope.isImageUploading = false;

        function handleSuccessUploading() {
            $scope.isImageUploading = false;
            stickersGallery.currentCategory = $scope.selectedCategory.name;
            window.history.back();
        }

        if ($stateParams.categoryId) {
            for (var i = 0; i < stickersGallery.categories.length; i++) {
                if (stickersGallery.categories[i].id == $stateParams.categoryId) {
                    $scope.selectedCategory = stickersGallery.categories[i];
                    break;
                }
            }
        }

        $scope.newImage = {
            url: $stateParams.imageURL == "null" ? null : $stateParams.imageURL,
        };

        $scope.addStickerURL = function() {
            $scope.newImage.categoryId = $scope.selectedCategory.id;
            log($scope.newImage);
            $scope.isImageUploading = true;
            stickersGallery.addStickerURL($scope.newImage.categoryId, $scope.newImage.url)
            .then(
                function() {
                    handleSuccessUploading();
                }
            );
        };

        $scope.addStickerFile = function() {
            $scope.newImage.categoryId = $scope.selectedCategory.id;
            $scope.isImageUploading = true;
            stickersGallery.addStickerFile($scope.newImage.categoryId, $scope.newImage.file[0])
            .then(
                function() {
                    handleSuccessUploading();
                }
            );
        };

}]);
    