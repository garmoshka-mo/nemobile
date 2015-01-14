angular.module("angControllers").controller("localForageController", function($scope, $http, $location, $state, $localForage, notification){  
    $scope.uploadFromGallery = function uploadFromGallery() {

        // Retrieve image file location from specified source
        navigator.camera.getPicture(uploadPhoto,
                                    function(message) { alert('get picture failed'); },
                                    { quality: 50, 
                                    destinationType: navigator.camera.DestinationType.FILE_URI,
                                    sourceType: navigator.camera.PictureSourceType.PHOTOLIBRARY }
                                    );

    }

    function uploadPhoto(imageURI) {
        console.log(imageURI);
        var options = new FileUploadOptions();
        options.fileKey="file";
        options.fileName=imageURI.substr(imageURI.lastIndexOf('/')+1)+'.png';
        options.mimeType="text/plain";

        var params = new Object();

        options.params = params;

        var ft = new FileTransfer();
        ft.upload(imageURI, encodeURI("http://some.server.com/upload.php"), win, fail, options);
    }

    function win(r) {
        console.log("Code = " + r.responseCode);
        console.log("Response = " + r.response);
        console.log("Sent = " + r.bytesSent);
    }

    function fail(error) {
        alert("An error has occurred: Code = " + error.code);
        console.log("upload error source " + error.source);
        console.log("upload error target " + error.target);
    }
});