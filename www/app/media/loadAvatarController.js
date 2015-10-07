angular.module("angControllers").controller("loadAvatarController",
    ['$scope', '$stateParams', 'stickersGallery', 'user', '$timeout', 'separator', 'router', 'deviceInfo',
    function($scope, $stateParams, stickersGallery, user, $timeout, separator, router, deviceInfo) {
        
        $scope.stickersGallery = stickersGallery;
        $scope.isImageUploading = false;
        $scope.isServerResponseShown = false;
        $scope.deviceInfo = deviceInfo;
        separator.resize('hide');

        function handleSuccessUploading() {
            $scope.isImageUploading = false;
            $scope.serverResponse = "аватарка успешно изменена";
            $scope.isServerResponseShown = true;
            $timeout(function() {
                $scope.isServerResponseShown = false;
                router.goto('pubsList');
            }, 2000);
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
            user.avatar.updateURL($scope.newImage.url)
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
            user.avatar.updateFile($scope.newImage.file)
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

        $scope.isAvaLoading = false;
        $scope.generatedNewAvatar = false;

        $scope.imageLoadedHandler = function() {
            $scope.isAvaLoading = false;
        };


        $scope.generateNewAvatar = function() {
            $scope.initialAvatarUrl = user.avatar.urlMini;
            var newGuid = Math.round(Math.random() * 10000);
            user.avatar.urlMini = config('adorableUrl') + "/40/" + newGuid;
            $scope.isAvaLoading = true;
            $scope.generatedNewAvatar = true;

            $scope.applyCurrentAvatar = function() {
                user.avatar.updateGuid(newGuid);
                user.save();
                $scope.generatedNewAvatar = false;
            };
            $scope.restoreDefaultAvatar = function() {
                user.avatar.urlMini = $scope.initialAvatarUrl;
                $scope.generatedNewAvatar = false;
            };
        };
}]);
    