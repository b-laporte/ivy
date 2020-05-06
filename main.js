import{ζ as t,a as e,b as n,c as r,d as a,e as i,f as o,w as s,Δ as l,_ as u,g as c,h as p,i as h,j as d,k as v,l as f,m as g,n as m,o as y,p as b,q as w,r as C,A as R,s as P,t as I,u as L,v as x,x as S,y as $,z as O,B as D,C as j,D as k,E,F as U,G as z,H as _,I as T}from"./widgets-7b980447.js";var A,F,N,B,H,V,M,J,Y,q,G,X,Z,K,Q,W,tt,et,nt,rt,at,it=(F=["class","home layout"],N=["class","blockA"],B=["class","row1"],H=["class","row2"],V=["class","mainA"],M=["class","mainLogo"],J=["className","ivyLogoMain"],Y=["class","mainB"],q=["class","features"],G=["class","row3"],X=["class","section1"],Z=["class","blockB"],K=["class","row1"],Q=["class","row2"],W=["class","headline"],tt=["class","highlight"],et=["class","highlight"],nt=["class","details"],rt=["class","row3"],at=["class","sideblock"],t("",".../doc/home.ts",A={},(function(t){var l=e(t,A,51);n(t,l,0,0,"div",1,0,F),n(t,l,1,1,"div",1,0,N),n(t,l,2,2,"div",0,0,B),n(t,l,3,2,"div",1,0,H),n(t,l,4,3,"div",1,0,V),n(t,l,5,4,"div",1,0,M),r(t,l,0,6,5,a(t,0,s.ivyLogo),1,0,J),n(t,l,7,5,"div",1),i(t,l,0,8,6,0," rethinking web development ",0),n(t,l,9,3,"div",1,0,Y),n(t,l,10,4,"div",1,0,q),n(t,l,11,5,"p",1),i(t,l,0,12,6,0," flexible ",0),n(t,l,13,5,"p",1),i(t,l,0,14,6,0," reactive ",0),n(t,l,15,5,"p",1),i(t,l,0,16,6,0," typescript-based ",0),n(t,l,17,5,"p",1),i(t,l,0,18,6,0," efficient ",0),n(t,l,19,5,"p",1),i(t,l,0,20,6,0," easy ! ",0),n(t,l,21,2,"div",1,0,G),n(t,l,22,3,"div",1,0,X),i(t,l,0,23,4,0," [under construction]... ",0),n(t,l,24,1,"div",1,0,Z),n(t,l,25,2,"div",0,0,K),n(t,l,26,2,"div",1,0,Q),n(t,l,27,3,"div",1,0,W),n(t,l,28,4,"div",1),n(t,l,29,5,"span",1,0,tt),i(t,l,0,30,6,0," ivy is a set of libraries to build ",0),n(t,l,31,5,"br",0),n(t,l,32,5,"span",1,0,et),i(t,l,0,33,6,0," advanced web interfaces ",0),n(t,l,34,4,"p",1,0,nt),i(t,l,0,35,5,0," based on 3 pillars: a ",0),n(t,l,36,5,"b",1),i(t,l,0,37,6,0," JS template engine,",0),i(t,l,0,38,5,0," a ",0),n(t,l,39,5,"b",1),i(t,l,0,40,6,0," state management ",0),i(t,l,0,41,5,0," solution (trax) and a flexible ",0),n(t,l,42,5,"b",1),i(t,l,0,43,6,0," template syntax ",0),i(t,l,0,44,5,0," (XJS). ",0),n(t,l,45,2,"div",1,0,rt),n(t,l,46,3,"div",1,0,at),n(t,l,47,4,"h1",1),i(t,l,0,48,5,0," Compared to... ",0),n(t,l,49,4,"p",1),i(t,l,0,50,5,0," Lorem ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries ",0),o(t)})));function ot(t,e){throw"[IVY ROUTER] "+t}var st=void 0,lt="dataset",ut="routerLinkUrl",ct=/^\:([a-zA-Z_\$]\w*)$/i,pt=/^([^\/\*\+\s]+)$/i,ht=/^\/?\#?/,dt=/\;|\&/,vt=/^([^\=]*)\=(.*)$/i,ft=/(\?|\#).+$/gi,gt=/^[^\/]*\/\/[^\/]*/,mt=void 0,yt=function(){function t(){this.ΔΔpath="",this.pathList=[],this.ΔΔhashParam=null,this.ΔΔrouteId="",this.ΔΔpattern=""}return t.prototype.ΔDefault=function(t){switch(t){case"path":return"";case"pathList":return[];case"hashParam":return null;case"routeId":case"pattern":return""}return l},u([c(p),h("design:type",String)],t.prototype,"path",void 0),u([c(d(p)),h("design:type",Array)],t.prototype,"pathList",void 0),u([c(),h("design:type",Object)],t.prototype,"pathParams",void 0),u([c(),h("design:type",Object)],t.prototype,"params",void 0),u([c(p,1),h("design:type",Object)],t.prototype,"hashParam",void 0),u([c(p),h("design:type",String)],t.prototype,"routeId",void 0),u([c(p),h("design:type",String)],t.prototype,"pattern",void 0),t=u([v],t)}(),bt=function(){function t(){this.parent=null,this.routeDefs={},this.routeTree={},this.initialized=!1,this.baseUrl="",this._currentRoute=new yt}return Object.defineProperty(t.prototype,"currentRoute",{get:function(){return this._currentRoute},enumerable:!0,configurable:!0}),t.prototype.add=function(t){for(var e in t)t.hasOwnProperty(e)&&this.addRoute(this.parseRoute(e),t[e])},t.prototype.remove=function(t){var e=this.parseRoute(t),n=this.routeDefs[e.routeId];if(n===st)return!1;for(var r=e.normalizedPath,a=[this.routeTree],i=this.routeTree,o=0;r.length>o;o++)o<r.length-1?(i=i[r[o]],a.push(i)):i[r[o]]=void 0;if(a.length>1)for(o=a.length-1;o>0&&s(i=a[o]);o--)a[o-1][r[o-1]]=st;return this.routeDefs[e.routeId]=st,n.controller!==st&&null!==n.controller&&n.controller.dispose&&(n.controller.dispose(),n.controller=st),!0;function s(t){for(var e in t)if(t.hasOwnProperty(e)&&t[e]!==st)return!1;return!0}},t.prototype.addRoute=function(t,e){this.routeDefs[t.routeId]!==st&&ot("Route cannot be defined twice: '"+t.pattern+"'",this.routeDefs[t.routeId]),this.routeDefs[t.routeId]=t;for(var n,r=t.normalizedPath,a=this.routeTree,i=r.length,o=0;i>o;o++)a[n=r[o]]===st?o===i-1?a[n]=t:a=a[n]={}:a[n].pattern!==st?ot("Route cannot be defined twice: '"+t.pattern+"'",a[n]):a=a[n];"function"==typeof e?t.controller={load:e}:e.load!==st?t.controller=e:t.controllerFactory=e},t.prototype.parseRoute=function(t){var e=[],n=[],r="",a=!1,i=!1,o=!1,s={},l=!1,u=t.split("/"),c=u.length;if(0===c||""!==u[0])g("Invalid syntax: route pattern must start with '/'");else{var p=void 0,h=u[c-1],d=0;(d=h.indexOf("?"))>-1?(u[c-1]=h.slice(0,d),i=!0,"#"===(h=h.slice(d+1))?o=!0:""!==h&&g("Invalid syntax: route cannot end with '?"+h+"'")):(d=h.indexOf("#"))>-1&&(u[c-1]=h.slice(0,d),o=!0,""!==(h=h.slice(d+1))&&g("Invalid syntax: route cannot end with '#"+h+"'"));for(var v="",f=1;c>f;f++)(p=u[f]).match(ct)?(a=!0,1===s[v=RegExp.$1]&&g("Duplicate variable name: '"+v+"'"),s[v]=1,n[f-1]=v,e[f-1]=" "):p.match(pt)?(n[f-1]="",e[f-1]=p):"*"===p||"+"===p?(l=!0,e[f-1]=p,a=!0,n[f-1]=p,f!==c-1&&g("Invalid route: '"+p+"' can only be used on last path element")):f===c-1&&""===p||g("Invalid path element: '"+p+"'");r="/"+e.join("/")+(i?"?":"")+(o?"#":"")}return{pattern:t,containsParams:i,containsHashParam:o,routeId:r,normalizedPath:e,pathVariables:a?n:null,isDefault:l};function g(e){ot(e+"\nRoute: '"+t+"'")}},t.prototype.init=function(t,e,n,r){return f(this,void 0,void 0,(function(){function a(){"/"!==i.charAt(0)&&(i="/"+i)}var i,o,s,l=this;return g(this,(function(u){switch(u.label){case 0:return this.initialized?[2]:(this.initialized=!0,this.navState=t,this.baseUrl=n,this._win=e,r!==st?this.parent=r:mt=this,i=e.location.href.replace(gt,""),"#"===n?(i=i.replace(ht,""),a()):(o=n.length,i.slice(0,o)!==n?ot("Url doesn't match baseUrl\nbaseUrl: "+n+"\nUrl: "+i):(i=i.slice(o),a())),s=this.navigate(i,2),null===this.parent&&(this._win.addEventListener("popstate",(function(t){t.state&&t.state.url!==st&&l.navigate(t.state.url,0)})),this._win.addEventListener("click",(function(t){!function(t,e){null!==(t=function t(e,n){if(e===st||null===e||"HTML"===e.tagName)return null;if(e[lt]!==st&&e[lt][n]!==st)return e;return t(e.parentElement,n)}(t,ut))&&e.navigate(t[lt][ut])}(t.target,l)}))),[4,s]);case 1:return[2,u.sent()]}}))}))},t.prototype.navigate=function(t,e){return void 0===e&&(e=1),f(this,void 0,void 0,(function(){var n,r,a,i,o,s,l;return g(this,(function(u){switch(u.label){case 0:if(this._win||ot("Router not initialized: navigation is not possible"),null===(n=this.getRoute(t)))return[2];if(""!==this._currentRoute.routeId&&(r=this.routeDefs[this._currentRoute.routeId].controller).canNavigateFrom!==st&&!r.canNavigateFrom(n,this.navState))return[2];a=this.routeDefs[n.routeId],u.label=1;case 1:return null===a||a.controller!==st?[3,6]:(i=void 0,a.controllerFactory.createController===st?[3,3]:[4,a.controllerFactory.createController(a,t)]);case 2:return i=u.sent(),[3,5];case 3:return[4,a.controllerFactory.retrieveRoute(a,t)];case 4:i=u.sent(),u.label=5;case 5:return null!==i&&"function"==typeof i.load?a.controller=i:(n=i,a=this.routeDefs[n.routeId]),[3,1];case 6:return a&&((o=a.controller).canNavigateTo===st||o.canNavigateTo(n,this.navState))?(r!==st&&r.unload!==st&&r.unload(n,this.navState),(s=this._currentRoute).hashParam=n.hashParam,s.params=n.params,s.path=n.path,s.pathList=n.pathList,s.pathParams=n.pathParams,s.pattern=n.pattern,s.routeId=n.routeId,[4,o.load(n,this.navState)]):[2];case 7:return u.sent(),0!==e&&(l="#"===this.baseUrl?"#"+n.path:n.path,1===e?this._win.history.pushState({url:n.path},"",l):this._win.history.replaceState({url:n.path},"",l)),[2]}}))}))},t.prototype.getRoute=function(t){for(var e,n=function(t,e){var n=!1,r=!1,a="",i="",o=t.split("/"),s=o.length,l={};if(0===s||""!==o[0])e("Invalid syntax: url must start with '/'");else{var u=o[s-1],c=0;if((c=u.indexOf("?"))>-1?(o[s-1]=u.slice(0,c),n=!0,i=u.slice(c+1)):i=u,""!==i&&(c=i.indexOf("#"))>-1&&(r=!0,a=i.slice(c+1),i=i.slice(0,c)),n)for(var p=i.split(dt),h=0,d=p;h<d.length;h++){var v=d[h];v.match(vt)?l[RegExp.$1]=RegExp.$2:(f="Invalid parameter: "+v,I.log("[IVY ROUTER] "+f))}}var f;o.length>1&&o.splice(0,1);return{path:o,containsParams:n,containsHashParam:r,hashParam:a,params:n?l:null}}(t,v),r=n.path,a=r.length,i=[],o=this.routeTree,s="*",l=[o],u=0;a>u;u++){if((e=o[r[u]])===st&&(""!==r[u]&&(e=o[" "])!==st&&(i.push(u),i.push(r[u])),e===st&&d(o["*"],o["+"],r[u])))return h(!0,u);if(e===st)return p();if(u===a-1){if(e.normalizedPath!==st)return h(!1,u);if(d(e["*"],e["+"],""))return h(!0,u+1);var c=p();if(null!==c)return c;v("Incomplete URL")}else e.normalizedPath===st?(o=e,l.push(o)):v("Unsupported URL")}return null;function p(){var t=function(){for(var t=l.length-1;t>-1;){if(l[t]["*"])return t;t--}return-1}();return t>-1?(e=l[t]["*"],h(!0,t)):null}function h(t,a,o){var l=e,u=null,c="/"+r.join("/");if(i.length>0&&null!==l.pathVariables){u={};for(var p=0;i.length>p;p+=2){var h=i[p];l.pathVariables[h]!==st&&(u[l.pathVariables[h]]=i[p+1])}}if(t){null===u&&(u={});var d=r.slice(a);u[s]=d.join("/").replace(ft,"")}return(null!==u||n.containsHashParam)&&(r[r.length-1]=r[r.length-1].replace(ft,"")),{path:c,pathList:r,pathParams:u,params:n.params,hashParam:n.containsHashParam?n.hashParam:null,routeId:l.routeId,pattern:l.pattern}}function d(t,n,r){return""===r?e=t:(e=n||t,s=n?"+":"*"),e!==st&&e.normalizedPath!==st}function v(e){ot(e+"\nURL: '"+t+"'")}},t.prototype.deferLoad=function(t){var e=this;return{retrieveRoute:function(n,r){return f(e,void 0,void 0,(function(){var e;return g(this,(function(a){switch(a.label){case 0:return[4,t()];case 1:return e=a.sent(),this.remove(n.pattern),e.loadRoutes(this,n),[2,this.getRoute(r)]}}))}))}}},t.prototype.matchActive=function(t){if(null===this.currentRoute)return!1;for(var e=t.normalizedPath,n=e.length,r=this.currentRoute.pathList,a=r.length,i=0;n>i;i++){if(!(i<a))return"*"===e[i];if(e[i]!==r[i]){if(""===r[i]){if("*"===e[i])continue}else if(" "===e[i]||"*"===e[i]||"+"===e[i])continue;return!1}}return!0},t}();var wt=function(){function t(){this.ΔΔurl=""}return t.prototype.ΔDefault=function(t){switch(t){case"url":return""}return m},u([y,h("design:type",String)],t.prototype,"ΔΔurl",void 0),u([b(w),h("design:type",String)],t.prototype,"url",void 0),u([C,h("design:type",Object)],t.prototype,"ΔΔ$targetElt",void 0),u([b(),h("design:type",Object)],t.prototype,"$targetElt",void 0),t=u([R],t)}();function Ct(t){return void 0===t&&(t=!1),P(wt,(function(e){var n,r=void 0,a={$render:function(){if(e.url!==n&&(e.$targetElt[lt][ut]=n=e.url),t&&mt!==st){var i=e.$targetElt.classList;o=n,s=mt.currentRoute.path,o===s||o.length<s.length&&s.slice(0,o.length)===o?i.add("active"):i.remove("active"),r===st&&(r=L(mt.currentRoute,(function(){a.$render()})))}var o,s},$dispose:function(){r!==st&&x(a,r)}};return a}))}var Rt=Ct(),Pt=Ct(!0);var It=function(){function t(){this.ΔΔpattern=""}return t.prototype.ΔDefault=function(t){switch(t){case"pattern":return""}return m},u([y,h("design:type",String)],t.prototype,"ΔΔpattern",void 0),u([b(w),h("design:type",String)],t.prototype,"pattern",void 0),u([C,h("design:type",Object)],t.prototype,"ΔΔ$targetElt",void 0),u([b(),h("design:type",Object)],t.prototype,"$targetElt",void 0),t=u([R],t)}(),Lt=(P(It,(function(t){return{$render:function(){t.pattern}}})),function(){function t(){this.ΔΔhomePage=!1,this.ΔΔpageContent=""}return t.prototype.ΔDefault=function(t){switch(t){case"homePage":return!1;case"pageContent":return""}return l},u([c(S),h("design:type",Boolean)],t.prototype,"homePage",void 0),u([c(),h("design:type",Object)],t.prototype,"pageContent",void 0),t=u([v],t)}()),xt=new Lt,St=new bt;St.add({"/*":{load:function(t,e){e.homePage=!0,e.pageContent=it},unload:function(t,e){e.homePage=!1}},"/examples/*":St.deferLoad((function(){return import("./examples-99786db0.js")}))}),St.init(xt,window,"#");var $t=function(){var l={},c=["class","mainMenu"],p=["class","container"],d=["class","mainLogo"],v=["className","ivyLogo"],f=["class","menu"],g=["class","primary"],m=["class","ghLogo","width","20px","height","20px","viewBox","0 0 23 23"],y=["class","logo","stroke","none","stroke-width","1","fill-rule","evenodd"],w=["d","M11.9945425,0.455 C5.54802758,0.455 0.32,5.68231082 0.32,12.130976 C0.32,17.2894782 3.66510621,21.6652813 8.30467606,23.2091765 C8.88883324,23.3166901 9.10171015,22.9561612 9.10171015,22.646522 C9.10171015,22.3698537 9.09167555,21.6351775 9.08594149,20.6611044 C5.83831427,21.3663935 5.15309432,19.0957065 5.15309432,19.0957065 C4.62197717,17.7467693 3.8564804,17.3876739 3.8564804,17.3876739 C2.79639639,16.6637491 3.93675722,16.6780842 3.93675722,16.6780842 C5.10865537,16.7605113 5.72506662,17.8815197 5.72506662,17.8815197 C6.76651495,19.6655285 8.45806212,19.15018 9.12321287,18.8512923 C9.22929295,18.0972636 9.53104776,17.5826319 9.8643399,17.2909117 C7.27182883,16.9963244 4.5460009,15.9942978 4.5460009,11.5202988 C4.5460009,10.2459044 5.00114177,9.20302256 5.74800286,8.38735278 C5.62758763,8.09204878 5.22692032,6.90438198 5.86268402,5.29741216 C5.86268402,5.29741216 6.84249122,4.98347247 9.07303986,6.49439681 C10.0041076,6.23493068 11.0032672,6.10591437 11.995976,6.10089707 C12.9879681,6.10591437 13.986411,6.23493068 14.9189122,6.49439681 C17.1480273,4.98347247 18.126401,5.29741216 18.126401,5.29741216 C18.7635982,6.90438198 18.3629309,8.09204878 18.2432325,8.38735278 C18.9915271,9.20302256 19.4430841,10.2459044 19.4430841,11.5202988 C19.4430841,16.0057659 16.7129557,16.9927406 14.1125603,17.2815938 C14.5311465,17.6421227 14.9045771,18.3545795 14.9045771,19.4440505 C14.9045771,21.0044311 14.8902419,22.2637737 14.8902419,22.646522 C14.8902419,22.9590282 15.1009686,23.3224242 15.6930101,23.2084597 C20.3289961,21.6609808 23.6712353,17.2880446 23.6712353,12.130976 C23.6712353,5.68231082 18.4432077,0.455 11.9945425,0.455"],C=function(){function t(){}return u([b($(Lt)),h("design:type",Lt)],t.prototype,"navState",void 0),t=u([O],t)}();return t("navBar",".../doc/nav.ts",l,(function(t,u,h){h.navState;var b=e(t,l,18);n(t,b,0,0,"nav",1,0,c),n(t,b,1,1,"div",1,0,p),n(t,b,2,2,"span",1,0,d),D(t,b,0,3,2,"link",Rt,1,"/"),r(t,b,0,4,3,a(t,0,s.ivyLogo),1,0,v),j(t,b,0,3),n(t,b,5,2,"div",1,0,f),n(t,b,6,3,"ul",1,0,g),n(t,b,7,4,"li",1),D(t,b,0,8,7,"activeLink",Pt,1,"/examples"),i(t,b,0,9,5,0," examples ",0),j(t,b,0,8),n(t,b,10,4,"li",1),i(t,b,0,11,5,0," getting-started ",0),n(t,b,12,4,"li",1),i(t,b,0,13,5,0," api ",0),n(t,b,14,4,"li",1),k(t,0,"http://www.w3.org/2000/svg"),n(t,b,15,5,"svg",1,0,m),n(t,b,16,6,"g",1,0,y),n(t,b,17,7,"path",0,0,w),k(t),o(t)}),C)}();(function(){var i={},s=["class","root"],l=["class","main"],c=["class","main"],p=[3,4,5],d=function(){function t(){}return u([b($(Lt)),h("design:type",Lt)],t.prototype,"navState",void 0),t=u([O],t)}();return t("main",".../doc/main.ts",i,(function(t,u,h){var d,v,f,g,m=h.navState,y=0,b=0,w=e(t,i,6);E(t,w,0,0),r(t,w,0,1,1,a(t,0,$t),0),U(t,w,0,1,"navState",a(t,1,m)),z(t,1),n(t,w,2,1,"div",1,0,s),_(t,w,3,2,1),_(t,w,4,2,1),_(t,w,5,2,1),"string"==typeof m.pageContent?(v=(d=T(t,0,3,1,++y)).cm,n(d,v,0,0,"div",0,0,l),o(d)):m.pageContent?(g=(f=T(t,0,4,2,++b)).cm,n(f,g,0,0,"div",1,0,c),r(f,g,0,1,1,a(f,0,m.pageContent),1),o(f)):console.log("main template: invalid pageContent"),o(t,w,p)}),d)})()().attach(document.body).render({navState:xt});
