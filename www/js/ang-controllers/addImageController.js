angular.module("angControllers").controller("addImageController", ['$scope', '$stateParams', 'stickersGallery', 'notification'. 
    function($scope, $stateParams, stickersGallery, notification) {
        
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
                    $scope.$apply();
                    stickersGallery.addStickerFile($scope.newImage.categoryId, imageURL)
                    .then(
                        function() {
                            $scope.isImageUploading = false;
                            notification.setTemporary("картинка добавлена", 2000);
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
                sourceType: navigator.camera.PictureSourceType.SAVEDPHOTOALBUM }
            );
        }

}])
    