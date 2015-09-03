(function(){

services
    .service('defaultIntro',
    ['$resource',
function ($resource) {

  this.prefix = 'Автофильтр:';

  this.compose = function(p) {
      /*
       * Ж 18-22?
       * без общения на св.темы, только интимн.темы, только с видео
       * Я - M (22-25)
       *
       * Ж 36+?
       * общение на своб.темы+, интимн.темы+, видео+
       * Я - M
       * */
      var req = [];
      if (p.subjects.free_talk == -1) req.push('без общения на разные темы');
      if (p.subjects.free_talk == 1) req.push('за общение на разные темы');
      if (p.subjects.free_talk == 2) req.push('только общение');
  
      /*
       if (p.subjects.real == -1) req.push('без общения на св.темы');
       if (p.subjects.real == 1) req.push('общение на разные темы+');
       if (p.subjects.real == 2) req.push('только общение');
       */
  
      if (p.subjects.sexual == -1) req.push('без интимных тем');
      if (p.subjects.sexual == 1) req.push('за интимые темы');
      if (p.subjects.sexual == 2) req.push('только интимные темы');
  
      if (p.subjects.video == -1) req.push('без видео');
      if (p.subjects.video == 1) req.push('если с видео - я за');
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
      if (p.me.gender == 'm') me = 'я м';
      if (p.me.gender == 'w') me = 'я ж';
  
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
