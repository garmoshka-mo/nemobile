var mod;mod=angular.module("infinite-scroll",[]),mod.directive("infiniteScroll",["$rootScope","$window","$timeout",function(n,i,t){return{link:function(e,l,o){var r,c,a,f,u;return i=angular.element(i),f=0,null!=o.infiniteScrollDistance&&e.$watch(o.infiniteScrollDistance,function(n){return f=parseInt(n,10)}),u=!0,r=!1,null!=o.infiniteScrollDisabled&&e.$watch(o.infiniteScrollDisabled,function(n){return u=!n,u&&r?(r=!1,a()):void 0}),c=i,null!=o.infiniteScrollContainer&&e.$watch(o.infiniteScrollContainer,function(n){if(n=angular.element(n),null!=n)return c=n;throw new Exception("invalid infinite-scroll-container attribute.")}),null!=o.infiniteScrollParent&&(c=l.parent(),e.$watch(o.infiniteScrollParent,function(){return c=l.parent()})),a=function(){var t,a,h,d;return c===i?(t=c.height()+c.scrollTop(),a=l.offset().top+l.height()):(t=c.height(),a=l.offset().top-c.offset().top+l.height()),h=a-t,d=h<=c.height()*f,d&&u?n.$$phase?e.$eval(o.infiniteScroll):e.$apply(o.infiniteScroll):d?r=!0:void 0},c.on("scroll",a),e.$on("$destroy",function(){return c.off("scroll",a)}),t(function(){return o.infiniteScrollImmediateCheck?e.$eval(o.infiniteScrollImmediateCheck)?a():void 0:a()},0)}}}]);