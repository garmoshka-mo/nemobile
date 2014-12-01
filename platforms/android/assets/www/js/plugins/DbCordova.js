function DbCordova() {
}

DbCordova.prototype.removeAllRecentMessages = function(successCallback, errorCallback){
  cordova.exec(successCallback, errorCallback, "DbCordova", "removeAllRecentMessages", []);
};


DbCordova.install = function () {
  if (!window.plugins) {
    window.plugins = {};
  }

  window.plugins.DbCordova = new DbCordova();
  return window.plugins.DbCordova;
};

cordova.addConstructor(DbCordova.install);