angular.module("angControllers").controller("stickersGalleryController", ['$scope', 'stickersGallery', '$timeout', 
    function($scope, stickersGallery, $timeout) {
        
        $scope.stickersGallery = stickersGallery;
        $scope.isNewCategoryBlockVisible = false;
        $scope.isAddingNewCategory = false;

        $scope.toggleCategory = function(category) {
            if ($scope.stickersGallery.currentCategory == category.name) {
                $scope.stickersGallery.currentCategory = "";
            }
            else {
                $scope.stickersGallery.currentCategory = category.name;
            }
            $scope.isNewCategoryBlockVisible = false;
        }

        $scope.changeCategoryName = function(category, event) {
            category.isCategoryNameChanging = true;
            category.newName = category.name;
            $timeout(function(){$("." + category.name + "-input")[0].focus();},301);
        }

        $scope.applyNewName = function(category) {
            if (category.newName != category.name) {
                stickersGallery.updateCategory(category.id, category.newName);
            }
            $scope.cancelNewName(category);
        }

        $scope.cancelNewName = function(category) {
            category.newName = "";
            category.isCategoryNameChanging = false;
        }

        $scope.showNewCategoryBlock = function() {
            $scope.isNewCategoryBlockVisible = true;
            $scope.stickersGallery.currentCategory = "";
        }
        
        $scope.hideNewCategoryBlock = function() {
            $scope.isNewCategoryBlockVisible = false;
            $scope.newCategoryName = "";
        }

        $scope.addNewCategory = function() {
            if ($scope.newCategoryName) {
                $scope.isAddingNewCategory = true;
                stickersGallery.addNewCategory($scope.newCategoryName)
                .then(
                    function() {
                        $scope.isAddingNewCategory = false;                        
                    },
                    function() {
                        $scope.isAddingNewCategory = false;    
                    }
                )
                $scope.newCategoryName = "";
            }
        }

        $scope.removeCategory = function(category) {
            stickersGallery.removeCategory(category);
        }

        $scope.removeSticker = function(category, image) {
            stickersGallery.removeSticker(category.id, image.id);
        }

        $scope.changeImageCategory = function(image, category) {
            image.isCategoryChanging = true;
            image.newCategoryId = category.id;
            image.categoryId = category.id;
        }

        $scope.applyNewImageCategory = function(image) {
            if (image.categoryId != image.newCategoryId) {
                stickersGallery.moveSticker(image.categoryId, image.id, image.newCategoryId)
            }
            $scope.cancelNewImageCategory(image);
        }

        $scope.cancelNewImageCategory = function(image) {
            image.isCategoryChanging = false;
        }
}])
    