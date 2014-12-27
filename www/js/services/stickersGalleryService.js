services
.service('stickersGallery', ['api', function(api) {

    console.log("stickersGalleryService is enabled");

    this.categories = null;
    
    this.getCurrentUserCategories = function() {
        var self = this;
        api.getCategories()
        .then(
            function(res) {
                self.categories = res; 
            }
        )
    }

    this.getCurrentUserCategories();
}])