angular.module("angControllers").controller("loadAvatarController",
    ['$scope', '$stateParams', 'stickersGallery', 'user', '$timeout',
    function($scope, $stateParams, stickersGallery, user, $timeout) {
        
        $scope.stickersGallery = stickersGallery;
        $scope.isImageUploading = false;
        $scope.isServerResponseShown = false;

        function handleSuccessUploading() {
            $scope.isImageUploading = false;
            $scope.serverResponse = "аватарка успешно изменена";
            $scope.isServerResponseShown = true;
            $timeout(function() {
                $scope.isServerResponseShown = false;
            }, 3000);
            user.save();
        }

        function handleFailedUploading () {
            $scope.isImageUploading = false;
            $scope.serverResponse = "произошла ошибка";
            $scope.isServerResponseShown = true;
        }

        function doBeforeUploading() {
            $scope.isImageUploading = true;
            $scope.isServerResponseShown = false;
        }

        $scope.updateAvatarUrl = function() {
            doBeforeUploading();
            user.avatar.updateAvatarURL($scope.newImage.url)
            .then(
                function () {
                    handleSuccessUploading();
                },
                function () {
                    handleFailedUploading();
                }
            );
        };

        $scope.uploadPhoto = function() {
            doBeforeUploading();
            $scope.isServerResponseShown = false;
            user.avatar.updateAvatarFile($scope.newImage.file[0])
            .then(
                function() {
                    handleSuccessUploading();
                },
                function () {
                    handleFailedUploading();
                }
            );
        };

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
}]);
    