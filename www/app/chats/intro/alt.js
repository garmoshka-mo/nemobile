(function(){

angular.module("angServices")
    .service('altIntro',
    ['$resource',
function ($resource) {

  this.prefix = 'ищу:';
  
  this.compose = function(p) {
      var req = [];
      if (p.subjects.free_talk == -1) req.push('без общ. на св.темы');
      if (p.subjects.free_talk == 1) req.push('общ. на разные темы+');
      if (p.subjects.free_talk == 2) req.push('только общение');
  
      if (p.subjects.sexual == -1) req.push('без интимн.тем');
      if (p.subjects.sexual == 1) req.push('интим. темы+');
      if (p.subjects.sexual == 2) req.push('только интимн.темы');
  
      if (p.subjects.video == -1) req.push('без видео');
      if (p.subjects.video == 1) req.push('с видео+');
      if (p.subjects.video == 2) req.push('только с видео');
  
      var you = [];
      if (p.look_for.gender == 'm') you.push('м');
      if (p.look_for.gender == 'w') you.push('ж');
      if (!(p.look_for.age_range[0] == 0 && p.look_for.age_range[1] == 100)) {
          if (p.look_for.age_range[0] == 0)
              you.push('до '+p.look_for.age_range[1]);
          else if (p.look_for.age_range[1] == 100)
              you.push(p.look_for.age_range[0]+'+');
          else
              you.push(p.look_for.age_range[0]+'-'+p.look_for.age_range[1]);
      }
  
      var me;
      if (p.me.gender == 'm') me = 'я - м';
      if (p.me.gender == 'w') me = 'я - ж';
  
      var result = '';
      if (you.length > 0) result += you.join(' ')+'? ';
      if (req.length > 0) result += req.join(', ')+' ';
      if (me) result += me;
  
      if (result.length > 0) result = this.prefix + ' ' + result;
      
      return result;
  };

}]);
}

)();
