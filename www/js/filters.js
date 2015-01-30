app.filter('orderObjectBy', function() {
  return function(items, field, reverse) {
    var filtered = [];
    angular.forEach(items, function(item) {
      filtered.push(item);
    });
    filtered.sort(function (a, b) {
      if (a.isRead === true && b.isRead === false) {
        return -1;
      }
      if (a.isRead === false && b.isRead === true) {
        return 1;
      }
      else {
        return -1;
      }
    });
    if(reverse) filtered.reverse();
    return filtered;
  };
});
