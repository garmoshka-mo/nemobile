services
.service('stickersGallery', ['api', function(api) {

    console.log("stickersGalleryService is enabled");
    
    var self = this;
    this.categories = null;
    this.isUpdating = false;
    
    //private methods    
    function getCurrentUserCategories() {
        self.isUpdating = true;
        api.getCategories()
        .then(
            function(res) {
                self.isUpdating = false;
                self.categories = res; 
            }
        )
    }



    //public methods
    this.addNewCategory = function(name) {
        return api.addNewCategory(name)
        .then(
            function() {
                getCurrentUserCategories();
            }
        )
    }

    this.removeCategory = function(category) {
        return api.removeCategory(category.id)
        .then(
            function() {
                getCurrentUserCategories();
            }
        )
    }

    this.updateCategory = function(categoryId, name) {
        return api.updateCategory(categoryId, name)
        .then(
            function() {
                getCurrentUserCategories();
            }
        )
    }

    this.addStickerURL = function(categoryId, imageURL) {
        return api.addStickerURL(categoryId, imageURL)
        .then(
            function() {
                getCurrentUserCategories();
            }
        )
    }

    this.addStickerFile = function(categoryId, imageFile) {
        return api.addStickerFile(categoryId, imageFile)
        .then(
            function() {
                getCurrentUserCategories();
            }
        )
    }

    this.removeSticker = function(categoryId, imageId) {
        return api.removeSticker(categoryId, imageId)
        .then(
            function() {
                getCurrentUserCategories();
            }
        )
    }

    this.moveSticker = function(categoryId, imageId, newCategoryId) {
        api.moveSticker(categoryId, imageId, newCategoryId)
        .then(
            function() {
                getCurrentUserCategories();
            }
        )
    }

    getCurrentUserCategories();
}])