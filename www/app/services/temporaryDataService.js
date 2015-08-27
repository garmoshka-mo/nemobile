services
.service('temporaryData', [
    'storage',
    function(storage) {
        //service for storing data which should be used only 
        //while app is running and don't appropriate for 
        //other services
}]);