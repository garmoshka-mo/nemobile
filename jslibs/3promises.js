(function(){"use strict";function t(t,n){for(var r=0,e=t.length;e>r;r++)if(t[r]===n)return r;return-1}function n(t){var n=t._promiseCallbacks;return n||(n=t._promiseCallbacks={}),n}function r(t,n){return"onerror"===t?void yt.on("error",n):2!==arguments.length?yt[t]:void(yt[t]=n)}function e(t){return"function"==typeof t||"object"==typeof t&&null!==t}function o(t){return"function"==typeof t}function i(t){return"object"==typeof t&&null!==t}function u(){}function s(){setTimeout(function(){for(var t,n=0;n<Et.length;n++){t=Et[n];var r=t.payload;r.guid=r.key+r.id,r.childGuid=r.key+r.childId,r.error&&(r.stack=r.error.stack),yt.trigger(t.name,t.payload)}Et.length=0},50)}function a(t,n,r){1===Et.push({name:t,payload:{key:n._guidKey,id:n._id,eventName:t,detail:n._result,childId:r&&r._id,label:n._label,timeStamp:gt(),error:yt["instrument-with-stack"]?new Error(n._label):null}})&&s()}function c(){return new TypeError("A promises callback cannot return that same promise.")}function f(){}function l(t){try{return t.then}catch(n){return St.error=n,St}}function h(t,n,r,e){try{t.call(n,r,e)}catch(o){return o}}function p(t,n,r){yt.async(function(t){var e=!1,o=h(r,n,function(r){e||(e=!0,n!==r?d(t,r):m(t,r))},function(n){e||(e=!0,w(t,n))},"Settle: "+(t._label||" unknown promise"));!e&&o&&(e=!0,w(t,o))},t)}function _(t,n){n._state===Tt?m(t,n._result):n._state===kt?(n._onError=null,w(t,n._result)):g(n,void 0,function(r){n!==r?d(t,r):m(t,r)},function(n){w(t,n)})}function v(t,n){if(n.constructor===t.constructor)_(t,n);else{var r=l(n);r===St?w(t,St.error):void 0===r?m(t,n):o(r)?p(t,n,r):m(t,n)}}function d(t,n){t===n?m(t,n):e(n)?v(t,n):m(t,n)}function y(t){t._onError&&t._onError(t._result),b(t)}function m(t,n){t._state===jt&&(t._result=n,t._state=Tt,0===t._subscribers.length?yt.instrument&&At("fulfilled",t):yt.async(b,t))}function w(t,n){t._state===jt&&(t._state=kt,t._result=n,yt.async(y,t))}function g(t,n,r,e){var o=t._subscribers,i=o.length;t._onError=null,o[i]=n,o[i+Tt]=r,o[i+kt]=e,0===i&&t._state&&yt.async(b,t)}function b(t){var n=t._subscribers,r=t._state;if(yt.instrument&&At(r===Tt?"fulfilled":"rejected",t),0!==n.length){for(var e,o,i=t._result,u=0;u<n.length;u+=3)e=n[u],o=n[u+r],e?j(r,e,o,i):o(i);t._subscribers.length=0}}function E(){this.error=null}function A(t,n){try{return t(n)}catch(r){return Ct.error=r,Ct}}function j(t,n,r,e){var i,u,s,a,f=o(r);if(f){if(i=A(r,e),i===Ct?(a=!0,u=i.error,i=null):s=!0,n===i)return void w(n,c())}else i=e,s=!0;n._state!==jt||(f&&s?d(n,i):a?w(n,u):t===Tt?m(n,i):t===kt&&w(n,i))}function T(t,n){var r=!1;try{n(function(n){r||(r=!0,d(t,n))},function(n){r||(r=!0,w(t,n))})}catch(e){w(t,e)}}function k(t,n,r){return t===Tt?{state:"fulfilled",value:r}:{state:"rejected",reason:r}}function S(t,n,r,e){this._instanceConstructor=t,this.promise=new t(f,e),this._abortOnReject=r,this._validateInput(n)?(this._input=n,this.length=n.length,this._remaining=n.length,this._init(),0===this.length?m(this.promise,this._result):(this.length=this.length||0,this._enumerate(),0===this._remaining&&m(this.promise,this._result))):w(this.promise,this._validationError())}function C(t,n){return new Ot(this,t,!0,n).promise}function O(t,n){function r(t){d(i,t)}function e(t){w(i,t)}var o=this,i=new o(f,n);if(!wt(t))return w(i,new TypeError("You must pass an array to race.")),i;for(var u=t.length,s=0;i._state===jt&&u>s;s++)g(o.resolve(t[s]),void 0,r,e);return i}function I(t,n){var r=this;if(t&&"object"==typeof t&&t.constructor===r)return t;var e=new r(f,n);return d(e,t),e}function R(t,n){var r=this,e=new r(f,n);return w(e,t),e}function x(){throw new TypeError("You must pass a resolver function as the first argument to the promise constructor")}function M(){throw new TypeError("Failed to construct 'Promise': Please use the 'new' operator, this object constructor cannot be called as a function.")}function N(t,n){this._id=Pt++,this._label=n,this._state=void 0,this._result=void 0,this._subscribers=[],yt.instrument&&At("created",this),f!==t&&(o(t)||x(),this instanceof N||M(),T(this,t))}function P(){this.value=void 0}function Y(t){try{return t.then}catch(n){return Dt.value=n,Dt}}function D(t,n,r){try{t.apply(n,r)}catch(e){return Dt.value=e,Dt}}function K(t,n){for(var r,e,o={},i=t.length,u=new Array(i),s=0;i>s;s++)u[s]=t[s];for(e=0;e<n.length;e++)r=n[e],o[r]=u[e+1];return o}function U(t){for(var n=t.length,r=new Array(n-1),e=1;n>e;e++)r[e-1]=t[e];return r}function q(t,n){return{then:function(r,e){return t.call(n,r,e)}}}function F(t,n){var r=function(){for(var r,e=this,o=arguments.length,i=new Array(o+1),u=!1,s=0;o>s;++s){if(r=arguments[s],!u){if(u=V(r),u===Kt){var a=new Yt(f);return w(a,Kt.value),a}u&&u!==!0&&(r=q(u,r))}i[s]=r}var c=new Yt(f);return i[o]=function(t,r){t?w(c,t):void 0===n?d(c,r):n===!0?d(c,U(arguments)):wt(n)?d(c,K(arguments,n)):d(c,r)},u?L(c,i,t,e):G(c,i,t,e)};return r.__proto__=t,r}function G(t,n,r,e){var o=D(r,e,n);return o===Dt&&w(t,o.value),t}function L(t,n,r,e){return Yt.all(n).then(function(n){var o=D(r,e,n);return o===Dt&&w(t,o.value),t})}function V(t){return t&&"object"==typeof t?t.constructor===Yt?!0:Y(t):!1}function W(t,n){return Yt.all(t,n)}function $(t,n,r){this._superConstructor(t,n,!1,r)}function z(t,n){return new $(Yt,t,n).promise}function B(t,n){return Yt.race(t,n)}function H(t,n,r){this._superConstructor(t,n,!0,r)}function J(t,n){return new Lt(Yt,t,n).promise}function Q(t,n,r){this._superConstructor(t,n,!1,r)}function X(t,n){return new Q(Yt,t,n).promise}function Z(t){throw setTimeout(function(){throw t}),t}function tt(t){var n={};return n.promise=new Yt(function(t,r){n.resolve=t,n.reject=r},t),n}function nt(t,n,r){return Yt.all(t,r).then(function(t){if(!o(n))throw new TypeError("You must pass a function as map's second argument.");for(var e=t.length,i=new Array(e),u=0;e>u;u++)i[u]=n(t[u]);return Yt.all(i,r)})}function rt(t,n){return Yt.resolve(t,n)}function et(t,n){return Yt.reject(t,n)}function ot(t,n,r){return Yt.all(t,r).then(function(t){if(!o(n))throw new TypeError("You must pass a function as filter's second argument.");for(var e=t.length,i=new Array(e),u=0;e>u;u++)i[u]=n(t[u]);return Yt.all(i,r).then(function(n){for(var r=new Array(e),o=0,i=0;e>i;i++)n[i]&&(r[o]=t[i],o++);return r.length=o,r})})}function it(t,n){sn[Zt]=t,sn[Zt+1]=n,Zt+=2,2===Zt&&Wt()}function ut(){var t=process.nextTick,n=process.versions.node.match(/^(?:(\d+)\.)?(?:(\d+)\.)?(\*|\d+)$/);return Array.isArray(n)&&"0"===n[1]&&"10"===n[2]&&(t=setImmediate),function(){t(lt)}}function st(){return function(){vertxNext(lt)}}function at(){var t=0,n=new en(lt),r=document.createTextNode("");return n.observe(r,{characterData:!0}),function(){r.data=t=++t%2}}function ct(){var t=new MessageChannel;return t.port1.onmessage=lt,function(){t.port2.postMessage(0)}}function ft(){return function(){setTimeout(lt,1)}}function lt(){for(var t=0;Zt>t;t+=2){var n=sn[t],r=sn[t+1];n(r),sn[t]=void 0,sn[t+1]=void 0}Zt=0}function ht(){try{{var t=require("vertx");t.runOnLoop||t.runOnContext}return st()}catch(n){return ft()}}function pt(t,n){yt.async(t,n)}function _t(){yt.on.apply(yt,arguments)}function vt(){yt.off.apply(yt,arguments)}var dt={mixin:function(t){return t.on=this.on,t.off=this.off,t.trigger=this.trigger,t._promiseCallbacks=void 0,t},on:function(r,e){var o,i=n(this);o=i[r],o||(o=i[r]=[]),-1===t(o,e)&&o.push(e)},off:function(r,e){var o,i,u=n(this);return e?(o=u[r],i=t(o,e),void(-1!==i&&o.splice(i,1))):void(u[r]=[])},trigger:function(t,r){var e,o,i=n(this);if(e=i[t])for(var u=0;u<e.length;u++)(o=e[u])(r)}},yt={instrument:!1};dt.mixin(yt);var mt;mt=Array.isArray?Array.isArray:function(t){return"[object Array]"===Object.prototype.toString.call(t)};var wt=mt,gt=Date.now||function(){return(new Date).getTime()},bt=Object.create||function(t){if(arguments.length>1)throw new Error("Second argument not supported");if("object"!=typeof t)throw new TypeError("Argument must be an object");return u.prototype=t,new u},Et=[],At=a,jt=void 0,Tt=1,kt=2,St=new E,Ct=new E,Ot=S;S.prototype._validateInput=function(t){return wt(t)},S.prototype._validationError=function(){return new Error("Array Methods must be provided an Array")},S.prototype._init=function(){this._result=new Array(this.length)},S.prototype._enumerate=function(){for(var t=this.length,n=this.promise,r=this._input,e=0;n._state===jt&&t>e;e++)this._eachEntry(r[e],e)},S.prototype._eachEntry=function(t,n){var r=this._instanceConstructor;i(t)?t.constructor===r&&t._state!==jt?(t._onError=null,this._settledAt(t._state,n,t._result)):this._willSettleAt(r.resolve(t),n):(this._remaining--,this._result[n]=this._makeResult(Tt,n,t))},S.prototype._settledAt=function(t,n,r){var e=this.promise;e._state===jt&&(this._remaining--,this._abortOnReject&&t===kt?w(e,r):this._result[n]=this._makeResult(t,n,r)),0===this._remaining&&m(e,this._result)},S.prototype._makeResult=function(t,n,r){return r},S.prototype._willSettleAt=function(t,n){var r=this;g(t,void 0,function(t){r._settledAt(Tt,n,t)},function(t){r._settledAt(kt,n,t)})};var It=C,Rt=O,xt=I,Mt=R,Nt="rsvp_"+gt()+"-",Pt=0,Yt=N;N.cast=xt,N.all=It,N.race=Rt,N.resolve=xt,N.reject=Mt,N.prototype={constructor:N,_guidKey:Nt,_onError:function(t){yt.async(function(n){setTimeout(function(){n._onError&&yt.trigger("error",t)},0)},this)},then:function(t,n,r){var e=this,o=e._state;if(o===Tt&&!t||o===kt&&!n)return yt.instrument&&At("chained",this,this),this;e._onError=null;var i=new this.constructor(f,r),u=e._result;if(yt.instrument&&At("chained",e,i),o){var s=arguments[o-1];yt.async(function(){j(o,i,s,u)})}else g(e,i,t,n);return i},"catch":function(t,n){return this.then(null,t,n)},"finally":function(t,n){var r=this.constructor;return this.then(function(n){return r.resolve(t()).then(function(){return n})},function(n){return r.resolve(t()).then(function(){throw n})},n)}};var Dt=new P,Kt=new P,Ut=F,qt=W;$.prototype=bt(Ot.prototype),$.prototype._superConstructor=Ot,$.prototype._makeResult=k,$.prototype._validationError=function(){return new Error("allSettled must be called with an array")};var Ft=z,Gt=B,Lt=H;H.prototype=bt(Ot.prototype),H.prototype._superConstructor=Ot,H.prototype._init=function(){this._result={}},H.prototype._validateInput=function(t){return t&&"object"==typeof t},H.prototype._validationError=function(){return new Error("Promise.hash must be called with an object")},H.prototype._enumerate=function(){var t=this.promise,n=this._input,r=[];for(var e in n)t._state===jt&&n.hasOwnProperty(e)&&r.push({position:e,entry:n[e]});var o=r.length;this._remaining=o;for(var i,u=0;t._state===jt&&o>u;u++)i=r[u],this._eachEntry(i.entry,i.position)};var Vt=J;Q.prototype=bt(Lt.prototype),Q.prototype._superConstructor=Ot,Q.prototype._makeResult=k,Q.prototype._validationError=function(){return new Error("hashSettled must be called with an object")};var Wt,$t=X,zt=Z,Bt=tt,Ht=nt,Jt=rt,Qt=et,Xt=ot,Zt=0,tn=it,nn="undefined"!=typeof window?window:void 0,rn=nn||{},en=rn.MutationObserver||rn.WebKitMutationObserver,on="undefined"!=typeof process&&"[object process]"==={}.toString.call(process),un="undefined"!=typeof Uint8ClampedArray&&"undefined"!=typeof importScripts&&"undefined"!=typeof MessageChannel,sn=new Array(1e3);Wt=on?ut():en?at():un?ct():void 0===nn&&"function"==typeof require?ht():ft(),yt.async=tn;if("undefined"!=typeof window&&"object"==typeof window.__PROMISE_INSTRUMENTATION__){var an=window.__PROMISE_INSTRUMENTATION__;r("instrument",!0);for(var cn in an)an.hasOwnProperty(cn)&&_t(cn,an[cn])}var fn={race:Gt,Promise:Yt,allSettled:Ft,hash:Vt,hashSettled:$t,denodeify:Ut,on:_t,off:vt,map:Ht,filter:Xt,resolve:Jt,reject:Qt,all:qt,rethrow:zt,defer:Bt,EventTarget:dt,configure:r,async:pt};"function"==typeof define&&define.amd?define(function(){return fn}):"undefined"!=typeof module&&module.exports?module.exports=fn:"undefined"!=typeof this&&(this.RSVP=fn)}).call(this);