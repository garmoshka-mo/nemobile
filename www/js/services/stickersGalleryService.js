services
.service('stickersGallery', ['api', '$rootScope', '$q', function(api, $rootScope, $q) {

    console.log("stickersGalleryService is enabled");
    
    var self = this;
    this.categories = null;
    this.isUpdating = false;
    
    //public methods
    this.getCurrentUserCategories = function() {
        self.isUpdating = true;
        api.getCategories()
        .then(
            function(res) {
                self.isUpdating = false;
                self.categories = res;
                console.log("Stickers gallery is updated"); 
            }
        );  
    };

    this.addNewCategory = function(name) {
        return api.addNewCategory(name)
        .then(
            function() {
                self.getCurrentUserCategories();
            }
        );
    };

    this.removeCategory = function(category) {
        return api.removeCategory(category.id)
        .then(
            function() {
                self.getCurrentUserCategories();
            }
        );
    };

    this.updateCategory = function(categoryId, name) {
        return api.updateCategory(categoryId, name)
        .then(
            function() {
                self.getCurrentUserCategories();
            }
        );
    };

    this.addStickerURL = function(categoryId, imageURL) {
        return api.addStickerURL(categoryId, imageURL)
        .then(
            function() {
                self.getCurrentUserCategories();
            }
        );
    };

    this.addStickerFile = function(categoryId, file) {
        return api.addStickerFile(categoryId, file)
        .then(
            function() {
                self.getCurrentUserCategories();
            },
            function() {
                return $q.reject();
            }
        );
    };

    this.removeSticker = function(categoryId, imageId) {
        return api.removeSticker(categoryId, imageId)
        .then(
            function() {
                self.getCurrentUserCategories();
            }
        );
    };

    this.moveSticker = function(categoryId, imageId, newCategoryId) {
        api.moveSticker(categoryId, imageId, newCategoryId)
        .then(
            function() {
                self.getCurrentUserCategories();
            }
        );
    };

}]);