function PubnubCordova() {
}

PubnubCordova.prototype.getRegId = function(successCallback, errorCallback){
  cordova.exec(successCallback, errorCallback, "PubnubCordova", "getRegId", []);
};


PubnubCordova.install = function () {
  if (!window.plugins) {
    window.plugins = {};
  }

  window.plugins.PubnubCordova = new PubnubCordova();
  return window.plugins.PubnubCordova;
};

cordova.addConstructor(PubnubCordova.install);