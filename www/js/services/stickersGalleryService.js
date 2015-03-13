services
.service('stickersGallery', ['api', '$rootScope', '$q', function(api, $rootScope, $q) {

    console.log("stickersGalleryService is enabled");
    
    var self = this;
    this.categories = null;
    this.isUpdating = false;
    
    function makeDictionary() {
        self.dictionary = {};
        if (self.categories) {
            self.categories.forEach(function(category) {
                category.associated_words.forEach(function(word){
                    self.dictionary[word] = category;
                });    
            }); 
        }
        console.log("dictionary is made", self.dictionary);
    }

    //public methods
    this.getCurrentUserCategories = function() {
        self.isUpdating = true;
        api.getCategories()
        .then(
            function(res) {
                self.isUpdating = false;
                self.categories = res;
                if (res) {
                    makeDictionary();
                }
                console.log("Stickers gallery is updated", self.categories); 
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

    this.getCurrentUserCategories();

}]);