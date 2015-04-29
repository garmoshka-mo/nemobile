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

app.filter('orderByName', function() {
  return function(items, field, reverse) {
    var filtered = [];
    angular.forEach(items, function(item) {
      filtered.push(item);
    });
    filtered.sort(function (a, b) {
      if (a.displayName < b.displayName) {
        return -1;
      }
      else {
        return 1;
      }
    });
    if(reverse) filtered.reverse();
    return filtered;
  };
});

app.filter('filterNewFriends', function() {
  return function(items, field, reverse) {
    var MAX_DIFFERENCE_MSEC = 120000; //two minutes
    var filtered = [];
    var currentTimestump = new Date().getTime();
    angular.forEach(items, function(item) {
      filtered.push(item);
    });
    // filtered = filtered.filter(function (friend) {
    //   return  currentTimestump - friend.created < MAX_DIFFERENCE_MSEC;
    // });
    filtered.sort(function(a, b) {
      return a.created > b.created ? -1 : 1;
    });
    if(reverse) filtered.reverse();
    return filtered;
  };
});


app.filter('htmlToPlaintext', function() {
    return function(text) {
      return String(text).replace(/<[^>]+>/gm, '');
    };
  }
);
