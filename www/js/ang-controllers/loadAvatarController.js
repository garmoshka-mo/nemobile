angular.module("angControllers").controller("loadAvatarController", ['$scope', '$stateParams', 'stickersGallery', 'notification', 'user', 
    function($scope, $stateParams, stickersGallery, notification, user) {
        
        $scope.stickersGallery = stickersGallery;
        $scope.isImageUploading = false;

        function handleSuccessUploading() {
            $scope.isImageUploading = false;
            // stickersGallery.currentCategory = $scope.selectedCategory.name;
            // window.history.back();
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

        $scope.updateAvatarUrl = function() {
            // console.log($scope.newImage);
            $scope.isImageUploading = true;
            user.updateAvatarURL($scope.newImage.url)
            .then(
                function () {
                    $scope.isImageUploading = false;
                    user.save();
                },
                function () {
                    $scope.isImageUploading = false;
                }
            );
        };

        $scope.uploadPhoto = function() {
            $scope.isImageUploading = true;
            user.updateAvatarFile($scope.newImage.file[0])
            .then(
                function() {
                    handleSuccessUploading();
                }
            );
        };

}]);
    