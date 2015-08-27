angular.module("angControllers").controller("stickersGalleryController", ['$scope', 'stickersGallery', '$timeout', '$stateParams', 
    function($scope, stickersGallery, $timeout, $stateParams) {
        
        $scope.stickersGallery = stickersGallery;
        $scope.isNewCategoryBlockVisible = false;
        $scope.isAddingNewCategory = false;
        $scope.fromChat = $stateParams.fromChat;

        $scope.toggleCategory = function(category) {
            if ($scope.stickersGallery.currentCategory == category.name) {
                $scope.stickersGallery.currentCategory = "";
            }
            else {
                $scope.stickersGallery.currentCategory = category.name;
            }
            $scope.isNewCategoryBlockVisible = false;
        };

        $scope.changeCategoryName = function(category, event) {
            category.isCategoryNameChanging = true;
            category.newName = category.name;
            $timeout(function(){$("." + category.name + "-input")[0].focus();},301);
        };

        $scope.applyNewName = function(category) {
            if (category.newName != category.name) {
                stickersGallery.updateCategory(category.id, category.newName);
            }
            $scope.cancelNewName(category);
        };

        $scope.removeAssociatedWord = function(category, wordIndex) {
            category.associated_words.splice(wordIndex, 1);
            category.isTagsChanged = true;
        };

        $scope.addAssociatedWord = function(category) {
            if (!category.tagToAdd) {
                return false;
            }
            category.isTagsChanged = true;
            category.associated_words.push(category.tagToAdd);
            category.associated_words = _.uniq(category.associated_words);
            category.tagToAdd = "";
        };

        $scope.saveAssociatedWords = function(category) {
            stickersGallery.updateCategory(category.id, null, category.associated_words);
            category.isTagsChanged = false;
        };

        $scope.cancelNewName = function(category) {
            category.newName = "";
            category.isCategoryNameChanging = false;
        };

        $scope.showNewCategoryBlock = function() {
            $scope.isNewCategoryBlockVisible = true;
            $scope.stickersGallery.currentCategory = "";
        };
        
        $scope.hideNewCategoryBlock = function() {
            $scope.isNewCategoryBlockVisible = false;
            $scope.newCategoryName = "";
        };

        $scope.scrollToLastAddedImage = function() {
            var $scrollableContainer = $('.main-section');
            var $activeCategory = $(".activeCategory");
            
            if ($activeCategory.length) {
                var lastImageTopCoord = $activeCategory
                                    .children(".stickers-gallery-image-wrapper")
                                    .last()
                                    .offset()
                                    .top;
                $scrollableContainer.scrollTop(lastImageTopCoord);
            }
        };

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
                );
                $scope.newCategoryName = "";
            }
        };

        $scope.removeCategory = function(category) {
            stickersGallery.removeCategory(category);
        };

        $scope.removeSticker = function(category, image) {
            stickersGallery.removeSticker(category.id, image.id);
        };

        $scope.changeImageCategory = function(image, category) {
            image.isCategoryChanging = true;
            image.newCategoryId = category.id;
            image.categoryId = category.id;
        };

        $scope.applyNewImageCategory = function(image) {
            if (image.categoryId != image.newCategoryId) {
                stickersGallery.moveSticker(image.categoryId, image.id, image.newCategoryId);
            }
            $scope.cancelNewImageCategory(image);
        };

        $scope.cancelNewImageCategory = function(image) {
            image.isCategoryChanging = false;
        };

        $scope.$watch("stickersGallery.isUpdating", function() {
            if (!$scope.stickersGallery.isUpdating) {
                $timeout(function(){
                    $scope.scrollToLastAddedImage();
                }, 0);
            }
        });

        $scope.scrollToLastAddedImage();
}]);
    