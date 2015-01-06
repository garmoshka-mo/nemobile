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

    getCurrentUserCategories();
}])