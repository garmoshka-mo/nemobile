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
            navigator.camera.getPicture(
                function(imageURL) {
                    console.log(arguments);
                    $scope.isImageUploading = true;
                    stickersGallery.addStickerFile($scope.newImage.categoryId, imageURL)
                    .then(
                        function() {
                            $scope.isImageUploading = false;
                        },
                        function() {
                            $scope.isImageUploading = false;
                            alert("Ошибка при загрузке картинки");
                        }
                    )
                },
                function(message) { alert('get picture failed'); },
                { quality: 50, 
                destinationType: navigator.camera.DestinationType.NATIVE_URI,
                sourceType: navigator.camera.PictureSourceType.PHOTOLIBRARY }
            );
        }

}])
    