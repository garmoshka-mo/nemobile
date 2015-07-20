function unique(){return"x"+ ++NOW+ +new Date}function rnow(){return+new Date}function build_url(n,e){var t=n.join(URLBIT),r=[];return e?(each(e,function(n,e){var t="object"==typeof e?JSON.stringify(e):e;"undefined"!=typeof e&&null!=e&&encode(t).length>0&&r.push(n+"="+encode(t))}),t+="?"+r.join(PARAMSBIT)):t}function updater(n,e){var t,r=0,c=function(){r+e>rnow()?(clearTimeout(t),t=setTimeout(c,e)):(r=rnow(),n())};return c}function grep(n,e){var t=[];return each(n||[],function(n){e(n)&&t.push(n)}),t}function supplant(n,e){return n.replace(REPL,function(n,t){return e[t]||n})}function timeout(n,e){return setTimeout(n,e)}function uuid(n){var e="xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g,function(n){var e=16*Math.random()|0,t="x"==n?e:3&e|8;return t.toString(16)});return n&&n(e),e}function isArray(n){return!!n&&"string"!=typeof n&&(Array.isArray&&Array.isArray(n)||"number"==typeof n.length)}function each(n,e){if(n&&e)if(isArray(n))for(var t=0,r=n.length;r>t;)e.call(n[t],n[t],t++);else for(var t in n)n.hasOwnProperty&&n.hasOwnProperty(t)&&e.call(n[t],t,n[t])}function map(n,e){var t=[];return each(n||[],function(n,r){t.push(e(n,r))}),t}function encode(n){return encodeURIComponent(n)}function generate_channel_list(n,e){var t=[];return each(n,function(n,r){e?n.search("-pnpres")<0&&r.subscribed&&t.push(n):r.subscribed&&t.push(n)}),t.sort()}function generate_channel_group_list(n,e){var t=[];return each(n,function(n,r){e?n.search("-pnpres")<0&&r.subscribed&&t.push(n):r.subscribed&&t.push(n)}),t.sort()}function ready(){timeout(function(){READY||(READY=1,each(READY_BUFFER,function(n){n()}))},SECOND)}function PNmessage(n){return msg=n||{apns:{}},msg.getPubnubMessage=function(){var n={};if(Object.keys(msg.apns).length){n.pn_apns={aps:{alert:msg.apns.alert,badge:msg.apns.badge}};for(var e in msg.apns)n.pn_apns[e]=msg.apns[e];var t=["badge","alert"];for(var e in t)delete n.pn_apns[t[e]]}msg.gcm&&(n.pn_gcm={data:msg.gcm});for(var e in msg)n[e]=msg[e];var r=["apns","gcm","publish","channel","callback","error"];for(var e in r)delete n[r[e]];return n},msg.publish=function(){var n=msg.getPubnubMessage();msg.pubnub&&msg.channel&&msg.pubnub.publish({message:n,channel:msg.channel,callback:msg.callback,error:msg.error})},msg}function PN_API(e){function t(n){return n||(n={}),each(an,function(e,t){e in n||(n[e]=t)}),n}function r(n){var e=[];return each(n,function(n,t){e.push(n)}),e}function c(n){return r(n).sort()}function a(n){var e="",t=c(n);for(var r in t){var a=t[r];e+=a+"="+encode(n[a]),r!=t.length-1&&(e+="&")}return e}function o(n,e,t){var r=!1;if("number"==typeof n)r=n>PRESENCE_HB_THRESHOLD||0==n?!1:!0;else{if("boolean"==typeof n)return n?PRESENCE_HB_DEFAULT:0;r=!0}return r?(t&&t("Presence Heartbeat value invalid. Valid range ( x > "+PRESENCE_HB_THRESHOLD+" or x = 0). Current Value : "+(e||PRESENCE_HB_THRESHOLD)),e||PRESENCE_HB_THRESHOLD):n}function i(n,e){return hn.encrypt(n,e||ln)||n}function u(n,e){return hn.decrypt(n,e||ln)||hn.decrypt(n,ln)||n}function s(){return clearTimeout(Z),!nn||nn>=500||1>nn||!generate_channel_list(q,!0).length&&!generate_channel_group_list(z,!0).length?void(en=!1):(en=!0,void pn.presence_heartbeat({callback:function(n){Z=timeout(s,nn*SECOND)},error:function(n){on&&on("Presence Heartbeat unable to reach Pubnub servers."+JSON.stringify(n)),Z=timeout(s,nn*SECOND)}}))}function f(){!en&&s()}function l(n){if(tn){if(!j.length)return}else{if(n&&(j.sending=0),j.sending||!j.length)return;j.sending=1}cn(j.shift())}function d(n){var e=0;return each(generate_channel_group_list(z),function(t){var r=z[t];r&&(e++,(n||function(){})(r))}),e}function h(n){var e=0;return each(generate_channel_list(q),function(t){var r=q[t];r&&(e++,(n||function(){})(r))}),e}function p(n,e,t){if("object"==typeof n){if(n.error){var r={};return n.message&&(r.message=n.message),n.payload&&(r.payload=n.payload),void(t&&t(r))}if(n.payload)return void(n.next_page?e&&e(n.payload,n.next_page):e&&e(n.payload))}e&&e(n)}function b(n,e){if("object"==typeof n&&n.error){var t={};return n.message&&(t.message=n.message),n.payload&&(t.payload=n.payload),void(e&&e(t))}e&&e(n)}function g(n,e,r,c){var e=n.callback||e,a=n.error||on,o=sn();c=c||{},c.auth||(c.auth=n.auth_key||P);var i=[U,"v1","channel-registration","sub-key",D];i.push.apply(i,r),o&&(c.callback=o),cn({callback:o,data:t(c),success:function(n){p(n,e,a)},fail:function(n){b(n,a)},url:i})}function v(){un()||y(1,{error:"Offline. Please check your network settings. "}),S&&clearTimeout(S),S=timeout(v,SECOND)}function _(){N&&pn.time(function(n){E(function(){},n),n||y(1,{error:"Heartbeat failed to connect to Pubnub Servers.Please check your network settings."}),C&&clearTimeout(C),C=timeout(_,w)})}function y(n,e){Y&&Y(n,e),Y=null,clearTimeout(S),clearTimeout(C)}function m(n){var e=rnow()-K;return e-n/1e4}function E(n,e){function t(e){if(e){var t=e/1e4,c=(rnow()-r)/2;K=rnow()-(t+c),n&&n(K)}}var r=rnow();e&&t(e)||pn.time(t)}var S,C,O=+e.windowing||DEF_WINDOWING,M=(+e.timeout||DEF_SUB_TIMEOUT)*SECOND,w=(+e.keepalive||DEF_KEEPALIVE)*SECOND,N=e.timecheck||0,x=e.noleave||0,A=e.publish_key||"demo",D=e.subscribe_key||"demo",P=e.auth_key||"",R=e.secret_key||"",L=e.hmac_SHA256,T=e.ssl?"s":"",F="http"+T+"://"+(e.origin||"pubsub.pubnub.com"),U=nextorigin(F),B=nextorigin(F),I=function(){},j=[],H=!0,K=0,G=0,J=0,Y=0,V=e.restore||0,X=0,W=!1,q={},z={},Q={},Z=null,$=o(e.heartbeat||e.pnexpires||0,e.error),nn=e.heartbeat_interval||$-3,en=!1,tn=e.no_wait_for_pending,rn=e["compatible_3.5"]||!1,cn=e.xdr,an=e.params||{},on=e.error||function(){},un=e._is_online||function(){return 1},sn=e.jsonp_cb||function(){return 0},fn=e.db||{get:function(){},set:function(){}},ln=e.cipher_key,dn=e.uuid||fn&&fn.get(D+"uuid")||"",hn=e.crypto_obj||{encrypt:function(n,e){return n},decrypt:function(n,e){return n}},pn={LEAVE:function(n,e,r,c){var a={uuid:dn,auth:P},o=nextorigin(F),r=r||function(){},i=c||function(){},u=sn();if(n.indexOf(PRESENCE_SUFFIX)>0)return!0;if(rn){if(!T)return!1;if("0"==u)return!1}return x?!1:("0"!=u&&(a.callback=u),cn({blocking:e||T,timeout:2e3,callback:u,data:t(a),success:function(n){p(n,r,i)},fail:function(n){b(n,i)},url:[o,"v2","presence","sub_key",D,"channel",encode(n),"leave"]}),!0)},set_resumed:function(n){W=n},get_cipher_key:function(){return ln},set_cipher_key:function(n){ln=n},raw_encrypt:function(n,e){return i(n,e)},raw_decrypt:function(n,e){return u(n,e)},get_heartbeat:function(){return $},set_heartbeat:function(n){$=o(n,nn,on),nn=$-3>=1?$-3:1,I(),s()},get_heartbeat_interval:function(){return nn},set_heartbeat_interval:function(n){nn=n,s()},get_version:function(){return SDK_VER},getGcmMessageObject:function(n){return{data:n}},getApnsMessageObject:function(n){var e={aps:{badge:1,alert:""}};for(k in n)k[e]=n[k];return e},newPnMessage:function(){var e={};gcm&&(e.pn_gcm=gcm),apns&&(e.pn_apns=apns);for(k in n)e[k]=n[k];return e},_add_param:function(n,e){an[n]=e},channel_group:function(n,e){var t,r,c=n.channel_group,a=n.channels||n.channel,o=n.cloak,i=[],u={},s=n.mode||"add";if(c){var f=c.split(":");f.length>1?(t="*"===f[0]?null:f[0],r=f[1]):r=f[0]}t&&i.push("namespace")&&i.push(encode(t)),i.push("channel-group"),r&&"*"!==r&&i.push(r),a?(isArray(a)&&(a=a.join(",")),u[s]=a,u.cloak=H?"true":"false"):"remove"===s&&i.push("remove"),"undefined"!=typeof o&&(u.cloak=o?"true":"false"),g(n,e,i,u)},channel_group_list_groups:function(n,e){var t;t=n.namespace||n.ns||n.channel_group||null,t&&(n.channel_group=t+":*"),pn.channel_group(n,e)},channel_group_list_channels:function(n,e){return n.channel_group?void pn.channel_group(n,e):on("Missing Channel Group")},channel_group_remove_channel:function(n,e){return n.channel_group?n.channel||n.channels?(n.mode="remove",void pn.channel_group(n,e)):on("Missing Channel"):on("Missing Channel Group")},channel_group_remove_group:function(n,e){return n.channel_group?n.channel?on("Use channel_group_remove_channel if you want to remove a channel from a group."):(n.mode="remove",void pn.channel_group(n,e)):on("Missing Channel Group")},channel_group_add_channel:function(n,e){return n.channel_group?n.channel||n.channels?void pn.channel_group(n,e):on("Missing Channel"):on("Missing Channel Group")},channel_group_cloak:function(n,e){return"undefined"==typeof n.cloak?void e(H):(H=n.cloak,void pn.channel_group(n,e))},channel_group_list_namespaces:function(n,e){var t=["namespace"];g(n,e,t)},channel_group_remove_namespace:function(n,e){var t=["namespace",n.namespace,"remove"];g(n,e,t)},history:function(n,e){var e=n.callback||e,r=n.count||n.limit||100,c=n.reverse||"false",a=n.error||function(){},o=n.auth_key||P,i=n.cipher_key,s=n.channel,f=n.channel_group,l=n.start,d=n.end,h=n.include_token,p={},g=sn();return s||f?e?D?(p.stringtoken="true",p.count=r,p.reverse=c,p.auth=o,f&&(p["channel-group"]=f,s||(s=",")),g&&(p.callback=g),l&&(p.start=l),d&&(p.end=d),h&&(p.include_token="true"),void cn({callback:g,data:t(p),success:function(n){if("object"==typeof n&&n.error)return void a({message:n.message,payload:n.payload});for(var t=n[0],r=[],c=0;c<t.length;c++){var o=u(t[c],i);try{r.push(JSON.parse(o))}catch(s){r.push(o)}}e([r,n[1],n[2]])},fail:function(n){b(n,a)},url:[U,"v2","history","sub-key",D,"channel",encode(s)]})):on("Missing Subscribe Key"):on("Missing Callback"):on("Missing Channel")},replay:function(n,e){var r,e=e||n.callback||function(){},c=n.auth_key||P,a=n.source,o=n.destination,i=n.stop,u=n.start,s=n.end,f=n.reverse,l=n.limit,d=sn(),h={};return a?o?A?D?("0"!=d&&(h.callback=d),i&&(h.stop="all"),f&&(h.reverse="true"),u&&(h.start=u),s&&(h.end=s),l&&(h.count=l),h.auth=c,r=[U,"v1","replay",A,D,a,o],void cn({callback:d,success:function(n){p(n,e,err)},fail:function(){e([0,"Disconnected"])},url:r,data:t(h)})):on("Missing Subscribe Key"):on("Missing Publish Key"):on("Missing Destination Channel"):on("Missing Source Channel")},auth:function(n){P=n,I()},time:function(n){var e=sn();cn({callback:e,data:t({uuid:dn,auth:P}),timeout:5*SECOND,url:[U,"time",e],success:function(e){n(e[0])},fail:function(){n(0)}})},publish:function(n,e){var r=n.message;if(!r)return on("Missing Message");var c,e=e||n.callback||r.callback||function(){},a=n.channel||r.channel,o=n.auth_key||P,u=n.cipher_key,s=n.error||r.error||function(){},f=n.post||!1,d="store_in_history"in n?n.store_in_history:!0,h=sn(),g="push";return n.prepend&&(g="unshift"),a?A?D?(r.getPubnubMessage&&(r=r.getPubnubMessage()),r=JSON.stringify(i(r,u)),c=[U,"publish",A,D,0,encode(a),h,encode(r)],an={uuid:dn,auth:o},d||(an.store="0"),j[g]({callback:h,timeout:5*SECOND,url:c,data:t(an),fail:function(n){b(n,s),l(1)},success:function(n){p(n,e,s),l(1)},mode:f?"POST":"GET"}),void l()):on("Missing Subscribe Key"):on("Missing Publish Key"):on("Missing Channel")},unsubscribe:function(n,e){var t=n.channel,r=n.channel_group,e=e||n.callback||function(){},c=n.error||function(){};X=0,t&&(t=map((t.join?t.join(","):""+t).split(","),function(n){return q[n]?n+","+n+PRESENCE_SUFFIX:void 0}).join(","),each(t.split(","),function(n){var t=!0;n&&(READY&&(t=pn.LEAVE(n,0,e,c)),t||e({action:"leave"}),q[n]=0,n in Q&&delete Q[n])})),r&&(r=map((r.join?r.join(","):""+r).split(","),function(n){return z[n]?n+","+n+PRESENCE_SUFFIX:void 0}).join(","),each(r.split(","),function(n){var t=!0;n&&(READY&&(t=pn.LEAVE(n,0,e,c)),t||e({action:"leave"}),z[n]=0,n in Q&&delete Q[n])})),I()},subscribe:function(n,e){function r(n){n?timeout(I,SECOND):(U=nextorigin(F,1),B=nextorigin(F,1),timeout(function(){pn.time(r)},SECOND)),h(function(e){return n&&e.disconnected?(e.disconnected=0,e.reconnect(e.name)):void(n||e.disconnected||(e.disconnected=1,e.disconnect(e.name)))}),d(function(e){return n&&e.disconnected?(e.disconnected=0,e.reconnect(e.name)):void(n||e.disconnected||(e.disconnected=1,e.disconnect(e.name)))})}function c(){var n=sn(),e=generate_channel_list(q).join(","),a=generate_channel_group_list(z).join(",");if(e||a){e||(e=","),y();var o=t({uuid:dn,auth:i});a&&(o["channel-group"]=a);var s=JSON.stringify(Q);s.length>2&&(o.state=JSON.stringify(Q)),$&&(o.heartbeat=$),f(),Y=cn({timeout:C,callback:n,fail:function(n){pn.time(function(e){!e&&b(n,g),r(e)})},data:t(o),url:[B,"subscribe",D,encode(e),n,X],success:function(n){if(!n||"object"==typeof n&&"error"in n&&n.error)return g(n.error),timeout(I,SECOND);if(v(n[1]),X=!X&&V&&fn.get(D)||n[1],h(function(n){n.connected||(n.connected=1,n.connect(n.name))}),d(function(n){n.connected||(n.connected=1,n.connect(n.name))}),W&&!V)return X=0,W=!1,fn.set(D,0),void timeout(c,w);S&&(X=1e4,S=0),fn.set(D,n[1]);var e=function(){var e="",t="";n.length>3?(e=n[3],t=n[2]):e=n.length>2?n[2]:map(generate_channel_list(q),function(e){return map(Array(n[0].length).join(",").split(","),function(){return e})}).join(",");var r=e.split(","),c=t?t.split(","):[];return function(){var n=r.shift()||J,e=c.shift(),t={};e?(n&&n.indexOf("-pnpres")>=0&&e.indexOf("-pnpres")<0&&(e+="-pnpres"),t=z[e]||q[e]||{callback:function(){}}):t=q[n];var a=[t.callback||G,n.split(PRESENCE_SUFFIX)[0]];return e&&a.push(e.split(PRESENCE_SUFFIX)[0]),a}}(),t=m(+n[1]);each(n[0],function(r){var c=e(),a=u(r,q[c[1]]?q[c[1]].cipher_key:null);c[0]&&c[0](a,n,c[2]||c[1],t,c[1])}),timeout(c,w)}})}}var a=n.channel,o=n.channel_group,e=e||n.callback,e=e||n.message,i=n.auth_key||P,s=n.connect||function(){},l=n.reconnect||function(){},p=n.disconnect||function(){},g=n.error||function(){},v=n.idle||function(){},_=n.presence||0,E=n.noheresync||0,S=n.backfill||0,k=n.timetoken||0,C=n.timeout||M,w=n.windowing||O,N=n.state,x=n.heartbeat||n.pnexpires,A=n.restore||V;return V=A,X=k,a||o?e?D?((x||0===x)&&pn.set_heartbeat(x),a&&each((a.join?a.join(","):""+a).split(","),function(t){var r=q[t]||{};q[J=t]={name:t,connected:r.connected,disconnected:r.disconnected,subscribed:1,callback:G=e,cipher_key:n.cipher_key,connect:s,disconnect:p,reconnect:l},N&&(Q[t]=t in N?N[t]:N),_&&(pn.subscribe({channel:t+PRESENCE_SUFFIX,callback:_,restore:A}),r.subscribed||E||pn.here_now({channel:t,callback:function(n){each("uuids"in n?n.uuids:[],function(e){_({action:"join",uuid:e,timestamp:Math.floor(rnow()/1e3),occupancy:n.occupancy||1},n,t)})}}))}),o&&each((o.join?o.join(","):""+o).split(","),function(t){var r=z[t]||{};z[t]={name:t,connected:r.connected,disconnected:r.disconnected,subscribed:1,callback:G=e,cipher_key:n.cipher_key,connect:s,disconnect:p,reconnect:l},_&&(pn.subscribe({channel_group:t+PRESENCE_SUFFIX,callback:_,restore:A}),r.subscribed||E||pn.here_now({channel_group:t,callback:function(n){each("uuids"in n?n.uuids:[],function(e){_({action:"join",uuid:e,timestamp:Math.floor(rnow()/1e3),occupancy:n.occupancy||1},n,t)})}}))}),I=function(){y(),timeout(c,w)},READY?void I():READY_BUFFER.push(I)):on("Missing Subscribe Key"):on("Missing Callback"):on("Missing Channel")},here_now:function(n,e){var e=n.callback||e,r=n.error||function(){},c=n.auth_key||P,a=n.channel,o=n.channel_group,i=sn(),u="uuids"in n?n.uuids:!0,s=n.state,f={uuid:dn,auth:c};if(u||(f.disable_uuids=1),s&&(f.state=1),!e)return on("Missing Callback");if(!D)return on("Missing Subscribe Key");var l=[U,"v2","presence","sub_key",D];a&&l.push("channel")&&l.push(encode(a)),"0"!=i&&(f.callback=i),o&&(f["channel-group"]=o,!a&&l.push("channel")&&l.push(",")),cn({callback:i,data:t(f),success:function(n){p(n,e,r)},fail:function(n){b(n,r)},url:l})},where_now:function(n,e){var e=n.callback||e,r=n.error||function(){},c=n.auth_key||P,a=sn(),o=n.uuid||dn,i={auth:c};return e?D?("0"!=a&&(i.callback=a),void cn({callback:a,data:t(i),success:function(n){p(n,e,r)},fail:function(n){b(n,r)},url:[U,"v2","presence","sub_key",D,"uuid",encode(o)]})):on("Missing Subscribe Key"):on("Missing Callback")},state:function(n,e){var r,e=n.callback||e||function(n){},c=n.error||function(){},a=n.auth_key||P,o=sn(),i=n.state,u=n.uuid||dn,s=n.channel,f=n.channel_group,l=t({auth:a});return D?u?s||f?("0"!=o&&(l.callback=o),"undefined"!=typeof s&&q[s]&&q[s].subscribed&&i&&(Q[s]=i),"undefined"!=typeof f&&z[f]&&z[f].subscribed&&(i&&(Q[f]=i),l["channel-group"]=f,s||(s=",")),l.state=JSON.stringify(i),r=i?[U,"v2","presence","sub-key",D,"channel",s,"uuid",u,"data"]:[U,"v2","presence","sub-key",D,"channel",s,"uuid",encode(u)],void cn({callback:o,data:t(l),success:function(n){p(n,e,c)},fail:function(n){b(n,c)},url:r})):on("Missing Channel"):on("Missing UUID"):on("Missing Subscribe Key")},grant:function(n,e){var e=n.callback||e,r=n.error||function(){},c=n.channel,o=n.channel_group,i=sn(),u=n.ttl,s=n.read?"1":"0",f=n.write?"1":"0",l=n.manage?"1":"0",d=n.auth_key;if(!e)return on("Missing Callback");if(!D)return on("Missing Subscribe Key");if(!A)return on("Missing Publish Key");if(!R)return on("Missing Secret Key");var h=Math.floor((new Date).getTime()/1e3),g=D+"\n"+A+"\ngrant\n",v={w:f,r:s,timestamp:h};n.manage&&(v.m=l),"undefined"!=typeof c&&null!=c&&c.length>0&&(v.channel=c),"undefined"!=typeof o&&null!=o&&o.length>0&&(v["channel-group"]=o),"0"!=i&&(v.callback=i),(u||0===u)&&(v.ttl=u),d&&(v.auth=d),v=t(v),d||delete v.auth,g+=a(v);var _=L(g,R);_=_.replace(/\+/g,"-"),_=_.replace(/\//g,"_"),v.signature=_,cn({callback:i,data:v,success:function(n){p(n,e,r)},fail:function(n){b(n,r)},url:[U,"v1","auth","grant","sub-key",D]})},mobile_gw_provision:function(n){var e,t=n.callback||function(){},r=n.auth_key||P,c=n.error||function(){},a=sn(),o=n.channel,i=n.op,u=n.gw_type,s=n.device_id;return s?u?i?o?A?D?(e=[U,"v1/push/sub-key",D,"devices",s],an={uuid:dn,auth:r,type:u},"add"==i?an.add=o:"remove"==i&&(an.remove=o),void cn({callback:a,data:an,success:function(n){p(n,t,c)},fail:function(n){b(n,c)},url:e})):on("Missing Subscribe Key"):on("Missing Publish Key"):on("Missing gw destination Channel (channel)"):on("Missing GW Operation (op: add or remove)"):on("Missing GW Type (gw_type: gcm or apns)"):on("Missing Device ID (device_id)")},audit:function(n,e){var e=n.callback||e,r=n.error||function(){},c=n.channel,o=n.channel_group,i=n.auth_key,u=sn();if(!e)return on("Missing Callback");if(!D)return on("Missing Subscribe Key");if(!A)return on("Missing Publish Key");if(!R)return on("Missing Secret Key");var s=Math.floor((new Date).getTime()/1e3),f=D+"\n"+A+"\naudit\n",l={timestamp:s};"0"!=u&&(l.callback=u),"undefined"!=typeof c&&null!=c&&c.length>0&&(l.channel=c),"undefined"!=typeof o&&null!=o&&o.length>0&&(l["channel-group"]=o),i&&(l.auth=i),l=t(l),i||delete l.auth,f+=a(l);var d=L(f,R);d=d.replace(/\+/g,"-"),d=d.replace(/\//g,"_"),l.signature=d,cn({callback:u,data:l,success:function(n){p(n,e,r)},fail:function(n){b(n,r)},url:[U,"v1","auth","audit","sub-key",D]})},revoke:function(n,e){n.read=!1,n.write=!1,pn.grant(n,e)},set_uuid:function(n){dn=n,I()},get_uuid:function(){return dn},isArray:function(n){return isArray(n)},get_subscibed_channels:function(){return generate_channel_list(q,!0)},presence_heartbeat:function(n){var e=n.callback||function(){},r=n.error||function(){},c=sn(),a={uuid:dn,auth:P},o=JSON.stringify(Q);o.length>2&&(a.state=JSON.stringify(Q)),$>0&&320>$&&(a.heartbeat=$),"0"!=c&&(a.callback=c);var i=encode(generate_channel_list(q,!0).join(",")),u=generate_channel_group_list(z,!0).join(",");i||(i=","),u&&(a["channel-group"]=u),cn({callback:c,data:t(a),timeout:5*SECOND,url:[U,"v2","presence","sub-key",D,"channel",i,"heartbeat"],success:function(n){p(n,e,r)},fail:function(n){b(n,r)}})},stop_timers:function(){clearTimeout(S),clearTimeout(C)},xdr:cn,ready:ready,db:fn,uuid:uuid,map:map,each:each,"each-channel":h,grep:grep,offline:function(){y(1,{message:"Offline. Please check your network settings."})},supplant:supplant,now:rnow,unique:unique,updater:updater};return dn||(dn=pn.uuid()),fn.set(D+"uuid",dn),S=timeout(v,SECOND),C=timeout(_,w),Z=timeout(f,(nn-3)*SECOND),E(),pn}function crypto_obj(){function n(n){function e(n,e){var t=(65535&n)+(65535&e),r=(n>>16)+(e>>16)+(t>>16);return r<<16|65535&t}function t(n,e){return n>>>e|n<<32-e}function r(n,e){return n>>>e}function c(n,e,t){return n&e^~n&t}function a(n,e,t){return n&e^n&t^e&t}function o(n){return t(n,2)^t(n,13)^t(n,22)}function i(n){return t(n,6)^t(n,11)^t(n,25)}function u(n){return t(n,7)^t(n,18)^r(n,3)}function s(n){return t(n,17)^t(n,19)^r(n,10)}function f(n,t){var r,f,l,d,h,p,b,g,v,_,y,m,E=new Array(1116352408,1899447441,3049323471,3921009573,961987163,1508970993,2453635748,2870763221,3624381080,310598401,607225278,1426881987,1925078388,2162078206,2614888103,3248222580,3835390401,4022224774,264347078,604807628,770255983,1249150122,1555081692,1996064986,2554220882,2821834349,2952996808,3210313671,3336571891,3584528711,113926993,338241895,666307205,773529912,1294757372,1396182291,1695183700,1986661051,2177026350,2456956037,2730485921,2820302411,3259730800,3345764771,3516065817,3600352804,4094571909,275423344,430227734,506948616,659060556,883997877,958139571,1322822218,1537002063,1747873779,1955562222,2024104815,2227730452,2361852424,2428436474,2756734187,3204031479,3329325298),S=new Array(1779033703,3144134277,1013904242,2773480762,1359893119,2600822924,528734635,1541459225),k=new Array(64);n[t>>5]|=128<<24-t%32,n[(t+64>>9<<4)+15]=t;for(var v=0;v<n.length;v+=16){r=S[0],f=S[1],l=S[2],d=S[3],h=S[4],p=S[5],b=S[6],g=S[7];for(var _=0;64>_;_++)k[_]=16>_?n[_+v]:e(e(e(s(k[_-2]),k[_-7]),u(k[_-15])),k[_-16]),y=e(e(e(e(g,i(h)),c(h,p,b)),E[_]),k[_]),m=e(o(r),a(r,f,l)),g=b,b=p,p=h,h=e(d,y),d=l,l=f,f=r,r=e(y,m);S[0]=e(r,S[0]),S[1]=e(f,S[1]),S[2]=e(l,S[2]),S[3]=e(d,S[3]),S[4]=e(h,S[4]),S[5]=e(p,S[5]),S[6]=e(b,S[6]),S[7]=e(g,S[7])}return S}function l(n){for(var e=Array(),t=(1<<p)-1,r=0;r<n.length*p;r+=p)e[r>>5]|=(n.charCodeAt(r/p)&t)<<24-r%32;return e}function d(n){n=n.replace(/\r\n/g,"\n");for(var e="",t=0;t<n.length;t++){var r=n.charCodeAt(t);128>r?e+=String.fromCharCode(r):r>127&&2048>r?(e+=String.fromCharCode(r>>6|192),e+=String.fromCharCode(63&r|128)):(e+=String.fromCharCode(r>>12|224),e+=String.fromCharCode(r>>6&63|128),e+=String.fromCharCode(63&r|128))}return e}function h(n){for(var e=b?"0123456789ABCDEF":"0123456789abcdef",t="",r=0;r<4*n.length;r++)t+=e.charAt(n[r>>2]>>8*(3-r%4)+4&15)+e.charAt(n[r>>2]>>8*(3-r%4)&15);return t}var p=8,b=0;return n=d(n),h(f(l(n),n.length*p))}var e=CRYPTO;e.size(256);var t=e.s2a("0123456789012345");return{encrypt:function(r,c){if(!c)return r;var a=e.s2a(n(c).slice(0,32)),o=e.s2a(JSON.stringify(r)),i=e.rawEncrypt(o,a,t),u=e.Base64.encode(i);return u||r},decrypt:function(r,c){if(!c)return r;var a=e.s2a(n(c).slice(0,32));try{var o=e.Base64.decode(r),i=e.rawDecrypt(o,a,t,!1),u=JSON.parse(i);return u}catch(s){return void 0}}}}var NOW=1,READY=!1,READY_BUFFER=[],PRESENCE_SUFFIX="-pnpres",DEF_WINDOWING=10,DEF_TIMEOUT=1e4,DEF_SUB_TIMEOUT=310,DEF_KEEPALIVE=60,SECOND=1e3,URLBIT="/",PARAMSBIT="&",PRESENCE_HB_THRESHOLD=5,PRESENCE_HB_DEFAULT=30,SDK_VER="3.7.7",REPL=/{([\w\-]+)}/g,nextorigin=function(){var n=20,e=Math.floor(Math.random()*n);return function(t,r){return t.indexOf("pubsub.")>0&&t.replace("pubsub","ps"+(r?uuid().split("-")[0]:++e<n?e:e=1))||t}}(),CRYPTO=function(){var n=14,e=8,t=!1,r=function(n){try{return unescape(encodeURIComponent(n))}catch(e){throw"Error on UTF-8 encode"}},c=function(n){try{return decodeURIComponent(escape(n))}catch(e){throw"Bad Key"}},a=function(n){var e,t,r=[];for(n.length<16&&(e=16-n.length,r=[e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e]),t=0;t<n.length;t++)r[t]=n[t];return r},o=function(n,e){var t,r,c="";if(e){if(t=n[15],t>16)throw"Decryption error: Maybe bad key";if(16==t)return"";for(r=0;16-t>r;r++)c+=String.fromCharCode(n[r])}else for(r=0;16>r;r++)c+=String.fromCharCode(n[r]);return c},u=function(n){var e,t="";for(e=0;e<n.length;e++)t+=(n[e]<16?"0":"")+n[e].toString(16);return t},s=function(n){var e=[];return n.replace(/(..)/g,function(n){e.push(parseInt(n,16))}),e},f=function(n,e){var t,c=[];for(e||(n=r(n)),t=0;t<n.length;t++)c[t]=n.charCodeAt(t);return c},l=function(t){switch(t){case 128:n=10,e=4;break;case 192:n=12,e=6;break;case 256:n=14,e=8;break;default:throw"Invalid Key Size Specified:"+t}},d=function(n){var e,t=[];for(e=0;n>e;e++)t=t.concat(Math.floor(256*Math.random()));return t},h=function(t,r){var c,a=n>=12?3:2,o=[],i=[],u=[],s=[],f=t.concat(r);for(u[0]=GibberishAES.Hash.MD5(f),s=u[0],c=1;a>c;c++)u[c]=GibberishAES.Hash.MD5(u[c-1].concat(f)),s=s.concat(u[c]);return o=s.slice(0,4*e),i=s.slice(4*e,4*e+16),{key:o,iv:i}},p=function(n,e,t){e=k(e);var r,c=Math.ceil(n.length/16),o=[],i=[];for(r=0;c>r;r++)o[r]=a(n.slice(16*r,16*r+16));for(n.length%16===0&&(o.push([16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16]),c++),r=0;r<o.length;r++)o[r]=0===r?S(o[r],t):S(o[r],i[r-1]),i[r]=g(o[r],e);return i},b=function(n,e,t,r){e=k(e);var a,i=n.length/16,u=[],s=[],f="";for(a=0;i>a;a++)u.push(n.slice(16*a,16*(a+1)));for(a=u.length-1;a>=0;a--)s[a]=v(u[a],e),s[a]=0===a?S(s[a],t):S(s[a],u[a-1]);for(a=0;i-1>a;a++)f+=o(s[a]);return f+=o(s[a],!0),r?f:c(f)},g=function(e,r){t=!1;var c,a=E(e,r,0);for(c=1;n+1>c;c++)a=_(a),a=y(a),n>c&&(a=m(a)),a=E(a,r,c);return a},v=function(e,r){t=!0;var c,a=E(e,r,n);for(c=n-1;c>-1;c--)a=y(a),a=_(a),a=E(a,r,c),c>0&&(a=m(a));return a},_=function(n){var e,r=t?D:A,c=[];for(e=0;16>e;e++)c[e]=r[n[e]];return c},y=function(n){var e,r=[],c=t?[0,13,10,7,4,1,14,11,8,5,2,15,12,9,6,3]:[0,5,10,15,4,9,14,3,8,13,2,7,12,1,6,11];for(e=0;16>e;e++)r[e]=n[c[e]];return r},m=function(n){var e,r=[];if(t)for(e=0;4>e;e++)r[4*e]=B[n[4*e]]^F[n[1+4*e]]^U[n[2+4*e]]^T[n[3+4*e]],r[1+4*e]=T[n[4*e]]^B[n[1+4*e]]^F[n[2+4*e]]^U[n[3+4*e]],r[2+4*e]=U[n[4*e]]^T[n[1+4*e]]^B[n[2+4*e]]^F[n[3+4*e]],r[3+4*e]=F[n[4*e]]^U[n[1+4*e]]^T[n[2+4*e]]^B[n[3+4*e]];else for(e=0;4>e;e++)r[4*e]=R[n[4*e]]^L[n[1+4*e]]^n[2+4*e]^n[3+4*e],r[1+4*e]=n[4*e]^R[n[1+4*e]]^L[n[2+4*e]]^n[3+4*e],r[2+4*e]=n[4*e]^n[1+4*e]^R[n[2+4*e]]^L[n[3+4*e]],r[3+4*e]=L[n[4*e]]^n[1+4*e]^n[2+4*e]^R[n[3+4*e]];return r},E=function(n,e,t){var r,c=[];for(r=0;16>r;r++)c[r]=n[r]^e[t][r];return c},S=function(n,e){var t,r=[];for(t=0;16>t;t++)r[t]=n[t]^e[t];return r},k=function(t){var r,c,a,o,i=[],u=[],s=[];for(r=0;e>r;r++)c=[t[4*r],t[4*r+1],t[4*r+2],t[4*r+3]],i[r]=c;for(r=e;4*(n+1)>r;r++){for(i[r]=[],a=0;4>a;a++)u[a]=i[r-1][a];for(r%e===0?(u=C(O(u)),u[0]^=P[r/e-1]):e>6&&r%e==4&&(u=C(u)),a=0;4>a;a++)i[r][a]=i[r-e][a]^u[a]}for(r=0;n+1>r;r++)for(s[r]=[],o=0;4>o;o++)s[r].push(i[4*r+o][0],i[4*r+o][1],i[4*r+o][2],i[4*r+o][3]);return s},C=function(n){for(var e=0;4>e;e++)n[e]=A[n[e]];return n},O=function(n){var e,t=n[0];for(e=0;4>e;e++)n[e]=n[e+1];return n[3]=t,n},M=function(n,e){var t=[];for(i=0;i<n.length;i+=e)t[i/e]=parseInt(n.substr(i,e),16);return t},w=function(n){var e=[];for(i=0;i<n.length;i++)e[n[i]]=i;return e},N=function(n,e){var t,r;for(r=0,t=0;8>t;t++)r=1==(1&e)?r^n:r,n=n>127?283^n<<1:n<<1,e>>>=1;return r},x=function(n){for(var e=[],t=0;256>t;t++)e[t]=N(n,t);return e},A=M("637c777bf26b6fc53001672bfed7ab76ca82c97dfa5947f0add4a2af9ca472c0b7fd9326363ff7cc34a5e5f171d8311504c723c31896059a071280e2eb27b27509832c1a1b6e5aa0523bd6b329e32f8453d100ed20fcb15b6acbbe394a4c58cfd0efaafb434d338545f9027f503c9fa851a3408f929d38f5bcb6da2110fff3d2cd0c13ec5f974417c4a77e3d645d197360814fdc222a908846eeb814de5e0bdbe0323a0a4906245cc2d3ac629195e479e7c8376d8dd54ea96c56f4ea657aae08ba78252e1ca6b4c6e8dd741f4bbd8b8a703eb5664803f60e613557b986c11d9ee1f8981169d98e949b1e87e9ce5528df8ca1890dbfe6426841992d0fb054bb16",2),D=w(A),P=M("01020408102040801b366cd8ab4d9a2f5ebc63c697356ad4b37dfaefc591",2),R=x(2),L=x(3),T=x(9),F=x(11),U=x(13),B=x(14),I=function(n,e,t){var r,c=d(8),a=h(f(e,t),c),o=a.key,i=a.iv,u=[[83,97,108,116,101,100,95,95].concat(c)];return n=f(n,t),r=p(n,o,i),r=u.concat(r),K.encode(r)},j=function(n,e,t){var r=K.decode(n),c=r.slice(8,16),a=h(f(e,t),c),o=a.key,i=a.iv;return r=r.slice(16,r.length),n=b(r,o,i,t)},H=function(n){function e(n,e){return n<<e|n>>>32-e}function t(n,e){var t,r,c,a,o;return c=2147483648&n,a=2147483648&e,t=1073741824&n,r=1073741824&e,o=(1073741823&n)+(1073741823&e),t&r?2147483648^o^c^a:t|r?1073741824&o?3221225472^o^c^a:1073741824^o^c^a:o^c^a}function r(n,e,t){return n&e|~n&t}function c(n,e,t){return n&t|e&~t}function a(n,e,t){return n^e^t}function o(n,e,t){return e^(n|~t)}function i(n,c,a,o,i,u,s){return n=t(n,t(t(r(c,a,o),i),s)),t(e(n,u),c)}function u(n,r,a,o,i,u,s){return n=t(n,t(t(c(r,a,o),i),s)),t(e(n,u),r)}function s(n,r,c,o,i,u,s){return n=t(n,t(t(a(r,c,o),i),s)),t(e(n,u),r)}function f(n,r,c,a,i,u,s){return n=t(n,t(t(o(r,c,a),i),s)),t(e(n,u),r)}function l(n){for(var e,t=n.length,r=t+8,c=(r-r%64)/64,a=16*(c+1),o=[],i=0,u=0;t>u;)e=(u-u%4)/4,i=u%4*8,o[e]=o[e]|n[u]<<i,u++;return e=(u-u%4)/4,i=u%4*8,o[e]=o[e]|128<<i,o[a-2]=t<<3,o[a-1]=t>>>29,o}function d(n){var e,t,r=[];for(t=0;3>=t;t++)e=n>>>8*t&255,r=r.concat(e);return r}var h,p,b,g,v,_,y,m,E,S=[],k=M("67452301efcdab8998badcfe10325476d76aa478e8c7b756242070dbc1bdceeef57c0faf4787c62aa8304613fd469501698098d88b44f7afffff5bb1895cd7be6b901122fd987193a679438e49b40821f61e2562c040b340265e5a51e9b6c7aad62f105d02441453d8a1e681e7d3fbc821e1cde6c33707d6f4d50d87455a14eda9e3e905fcefa3f8676f02d98d2a4c8afffa39428771f6816d9d6122fde5380ca4beea444bdecfa9f6bb4b60bebfbc70289b7ec6eaa127fad4ef308504881d05d9d4d039e6db99e51fa27cf8c4ac5665f4292244432aff97ab9423a7fc93a039655b59c38f0ccc92ffeff47d85845dd16fa87e4ffe2ce6e0a30143144e0811a1f7537e82bd3af2352ad7d2bbeb86d391",8);for(S=l(n),_=k[0],y=k[1],m=k[2],E=k[3],h=0;h<S.length;h+=16)p=_,b=y,g=m,v=E,_=i(_,y,m,E,S[h+0],7,k[4]),E=i(E,_,y,m,S[h+1],12,k[5]),m=i(m,E,_,y,S[h+2],17,k[6]),y=i(y,m,E,_,S[h+3],22,k[7]),_=i(_,y,m,E,S[h+4],7,k[8]),E=i(E,_,y,m,S[h+5],12,k[9]),m=i(m,E,_,y,S[h+6],17,k[10]),y=i(y,m,E,_,S[h+7],22,k[11]),_=i(_,y,m,E,S[h+8],7,k[12]),E=i(E,_,y,m,S[h+9],12,k[13]),m=i(m,E,_,y,S[h+10],17,k[14]),y=i(y,m,E,_,S[h+11],22,k[15]),_=i(_,y,m,E,S[h+12],7,k[16]),E=i(E,_,y,m,S[h+13],12,k[17]),m=i(m,E,_,y,S[h+14],17,k[18]),y=i(y,m,E,_,S[h+15],22,k[19]),_=u(_,y,m,E,S[h+1],5,k[20]),E=u(E,_,y,m,S[h+6],9,k[21]),m=u(m,E,_,y,S[h+11],14,k[22]),y=u(y,m,E,_,S[h+0],20,k[23]),_=u(_,y,m,E,S[h+5],5,k[24]),E=u(E,_,y,m,S[h+10],9,k[25]),m=u(m,E,_,y,S[h+15],14,k[26]),y=u(y,m,E,_,S[h+4],20,k[27]),_=u(_,y,m,E,S[h+9],5,k[28]),E=u(E,_,y,m,S[h+14],9,k[29]),m=u(m,E,_,y,S[h+3],14,k[30]),y=u(y,m,E,_,S[h+8],20,k[31]),_=u(_,y,m,E,S[h+13],5,k[32]),E=u(E,_,y,m,S[h+2],9,k[33]),m=u(m,E,_,y,S[h+7],14,k[34]),y=u(y,m,E,_,S[h+12],20,k[35]),_=s(_,y,m,E,S[h+5],4,k[36]),E=s(E,_,y,m,S[h+8],11,k[37]),m=s(m,E,_,y,S[h+11],16,k[38]),y=s(y,m,E,_,S[h+14],23,k[39]),_=s(_,y,m,E,S[h+1],4,k[40]),E=s(E,_,y,m,S[h+4],11,k[41]),m=s(m,E,_,y,S[h+7],16,k[42]),y=s(y,m,E,_,S[h+10],23,k[43]),_=s(_,y,m,E,S[h+13],4,k[44]),E=s(E,_,y,m,S[h+0],11,k[45]),m=s(m,E,_,y,S[h+3],16,k[46]),y=s(y,m,E,_,S[h+6],23,k[47]),_=s(_,y,m,E,S[h+9],4,k[48]),E=s(E,_,y,m,S[h+12],11,k[49]),m=s(m,E,_,y,S[h+15],16,k[50]),y=s(y,m,E,_,S[h+2],23,k[51]),_=f(_,y,m,E,S[h+0],6,k[52]),E=f(E,_,y,m,S[h+7],10,k[53]),m=f(m,E,_,y,S[h+14],15,k[54]),y=f(y,m,E,_,S[h+5],21,k[55]),_=f(_,y,m,E,S[h+12],6,k[56]),E=f(E,_,y,m,S[h+3],10,k[57]),m=f(m,E,_,y,S[h+10],15,k[58]),y=f(y,m,E,_,S[h+1],21,k[59]),_=f(_,y,m,E,S[h+8],6,k[60]),E=f(E,_,y,m,S[h+15],10,k[61]),m=f(m,E,_,y,S[h+6],15,k[62]),y=f(y,m,E,_,S[h+13],21,k[63]),_=f(_,y,m,E,S[h+4],6,k[64]),E=f(E,_,y,m,S[h+11],10,k[65]),m=f(m,E,_,y,S[h+2],15,k[66]),y=f(y,m,E,_,S[h+9],21,k[67]),_=t(_,p),y=t(y,b),m=t(m,g),E=t(E,v);return d(_).concat(d(y),d(m),d(E))},K=function(){var n="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/",e=n.split(""),t=function(n,t){{var r,c,a=[],o="";Math.floor(16*n.length/3)}for(r=0;r<16*n.length;r++)a.push(n[Math.floor(r/16)][r%16]);for(r=0;r<a.length;r+=3)o+=e[a[r]>>2],o+=e[(3&a[r])<<4|a[r+1]>>4],o+=void 0!==a[r+1]?e[(15&a[r+1])<<2|a[r+2]>>6]:"=",o+=void 0!==a[r+2]?e[63&a[r+2]]:"=";for(c=o.slice(0,64),r=1;r<Math.ceil(o.length/64);r++)c+=o.slice(64*r,64*r+64)+(Math.ceil(o.length/64)==r+1?"":"\n");return c},r=function(e){e=e.replace(/\n/g,"");var t,r=[],c=[],a=[];for(t=0;t<e.length;t+=4)c[0]=n.indexOf(e.charAt(t)),c[1]=n.indexOf(e.charAt(t+1)),c[2]=n.indexOf(e.charAt(t+2)),c[3]=n.indexOf(e.charAt(t+3)),a[0]=c[0]<<2|c[1]>>4,a[1]=(15&c[1])<<4|c[2]>>2,a[2]=(3&c[2])<<6|c[3],r.push(a[0],a[1],a[2]);return r=r.slice(0,r.length-r.length%16)};return"function"==typeof Array.indexOf&&(n=e),{encode:t,decode:r}}();return{size:l,h2a:s,expandKey:k,encryptBlock:g,decryptBlock:v,Decrypt:t,s2a:f,rawEncrypt:p,rawDecrypt:b,dec:j,openSSLKey:h,
a2h:u,enc:I,Hash:{MD5:H},Base64:K}}();!function(){function n(e){var t,r=function(){if(!a){a=1,clearTimeout(o);try{response=JSON.parse(t.responseText)}catch(n){return h(1)}s(response)}},c=0,a=0,o=timeout(function(){h(1)},l),i=e.data||{},u=e.fail||function(){},s=e.success||function(){},d="undefined"==typeof e.blocking,h=function(n,e){c||(c=1,clearTimeout(o),t&&(t.onerror=t.onload=null,t.abort&&t.abort(),t=null),n&&u(e))};try{t="undefined"!=typeof XDomainRequest&&new XDomainRequest||new XMLHttpRequest,t.onerror=t.onabort=function(){h(1,t.responseText||{error:"Network Connection Error"})},t.onload=t.onloadend=r,t.onreadystatechange=function(){if(4==t.readyState)switch(t.status){case 401:case 402:case 403:try{response=JSON.parse(t.responseText),h(1,response)}catch(n){return h(1,t.responseText)}}},i.pnsdk=f,url=build_url(e.url,i),t.open("GET",url,d),d&&(t.timeout=l),t.send()}catch(p){return h(0),n(e)}return h}function e(n,e,t){each(n.split(","),function(n){var r=function(n){n||(n=window.event),t(n)||(n.cancelBubble=!0,n.returnValue=!1,n.preventDefault&&n.preventDefault(),n.stopPropagation&&n.stopPropagation())};e.addEventListener?e.addEventListener(n,r,!1):e.attachEvent?e.attachEvent("on"+n,r):e["on"+n]=r})}function t(n){console.error(n)}function r(n,e,t){return t?void n.setAttribute(e,t):n&&n.getAttribute&&n.getAttribute(e)}function c(n){return document.getElementById(n)}function a(n,e){var t=[];return each(n.split(/\s+/),function(n){each((e||document).getElementsByTagName(n),function(n){t.push(n)})}),t}function o(n,e){for(var t in e)if(e.hasOwnProperty(t))try{n.style[t]=e[t]+("|width|height|top|left|".indexOf(t)>0&&"number"==typeof e[t]?"px":"")}catch(r){}}function i(n){return document.createElement(n)}function u(n,e){var t=CryptoJS.HmacSHA256(n,e);return t.toString(CryptoJS.enc.Base64)}function s(l){l.db=d,l.xdr=n,l.error=l.error||t,l.hmac_SHA256=u,l.crypto_obj=crypto_obj(),l.params={pnsdk:f},SELF=function(n){return s(n)};var h=PN_API(l);for(var p in h)h.hasOwnProperty(p)&&(SELF[p]=h[p]);return SELF.init=SELF,SELF.$=c,SELF.attr=r,SELF.search=a,SELF.bind=e,SELF.css=o,SELF.create=i,"undefined"!=typeof window&&e("beforeunload",window,function(){return SELF["each-channel"](function(n){SELF.LEAVE(n.name,1)}),!0}),l.notest?SELF:("undefined"!=typeof window&&e("offline",window,SELF._reset_offline),"undefined"!=typeof document&&e("offline",document,SELF._reset_offline),SELF.ready(),SELF)}var f="PubNub-JS-Phonegap/3.7.7",l=31e4,d=function(){var n="undefined"!=typeof localStorage&&localStorage;return{get:function(e){try{return n?n.getItem(e):-1==document.cookie.indexOf(e)?null:((document.cookie||"").match(RegExp(e+"=([^;]+)"))||[])[1]||null}catch(t){return}},set:function(e,t){try{if(n)return n.setItem(e,t)&&0;document.cookie=e+"="+t+"; expires=Thu, 1 Aug 2030 20:00:00 UTC; path=/"}catch(r){return}}}}();s.init=s,s.secure=s,PUBNUB=s({}),"undefined"!=typeof module&&(module.exports=s)||"undefined"!=typeof exports&&(exports.PUBNUB=s)||(PUBNUB=s)}(),function(){var n=PUBNUB.ws=function(e,t){if(!(this instanceof n))return new n(e,t);var r=this,e=r.url=e||"",c=(r.protocol=t||"Sec-WebSocket-Protocol",e.split("/")),a={ssl:"wss:"===c[0],origin:c[2],publish_key:c[3],subscribe_key:c[4],channel:c[5]};return r.CONNECTING=0,r.OPEN=1,r.CLOSING=2,r.CLOSED=3,r.CLOSE_NORMAL=1e3,r.CLOSE_GOING_AWAY=1001,r.CLOSE_PROTOCOL_ERROR=1002,r.CLOSE_UNSUPPORTED=1003,r.CLOSE_TOO_LARGE=1004,r.CLOSE_NO_STATUS=1005,r.CLOSE_ABNORMAL=1006,r.onclose=r.onerror=r.onmessage=r.onopen=r.onsend=function(){},r.binaryType="",r.extensions="",r.bufferedAmount=0,r.trasnmitting=!1,r.buffer=[],r.readyState=r.CONNECTING,e?(r.pubnub=PUBNUB.init(a),r.pubnub.setup=a,r.setup=a,void r.pubnub.subscribe({restore:!1,channel:a.channel,disconnect:r.onerror,reconnect:r.onopen,error:function(){r.onclose({code:r.CLOSE_ABNORMAL,reason:"Missing URL",wasClean:!1})},callback:function(n){r.onmessage({data:n})},connect:function(){r.readyState=r.OPEN,r.onopen()}})):(r.readyState=r.CLOSED,r.onclose({code:r.CLOSE_ABNORMAL,reason:"Missing URL",wasClean:!0}),r)};n.prototype.send=function(n){var e=this;e.pubnub.publish({channel:e.pubnub.setup.channel,message:n,callback:function(n){e.onsend({data:n})}})},n.prototype.close=function(){var n=this;n.pubnub.unsubscribe({channel:n.pubnub.setup.channel}),n.readyState=n.CLOSED,n.onclose({})}}();