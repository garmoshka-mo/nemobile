angular.module("angControllers").controller("stickersGalleryController", ['$scope', 'stickersGallery', 
    function($scope, stickersGallery) {
        
        $scope.stickersGallery = stickersGallery;
        $scope.isNewCategoryBlockVisible = false;
        $scope.isAddingNewCategory = false;

        $scope.setCategory = function(category) {
            $scope.stickersGallery.currentCategory = category.name;
            $scope.isNewCategoryBlockVisible = false;
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
}])
    