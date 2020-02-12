!function(){"use strict";
/*! *****************************************************************************
    Copyright (c) Microsoft Corporation. All rights reserved.
    Licensed under the Apache License, Version 2.0 (the "License"); you may not use
    this file except in compliance with the License. You may obtain a copy of the
    License at http://www.apache.org/licenses/LICENSE-2.0

    THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
    KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
    WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
    MERCHANTABLITY OR NON-INFRINGEMENT.

    See the Apache Version 2.0 License for specific language governing permissions
    and limitations under the License.
    ***************************************************************************** */function e(e,t,n,i){var o,r=arguments.length,a=r<3?t:null===i?i=Object.getOwnPropertyDescriptor(t,n):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(e,t,n,i);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(r<3?o(a):r>3?o(t,n,a):o(t,n))||a);return r>3&&a&&Object.defineProperty(t,n,a),a}function t(e,t){if("object"==typeof Reflect&&"function"==typeof Reflect.metadata)return Reflect.metadata(e,t)}var n="ΔTrackable",i="ΔChangeVersion",o="ΔDefFactories",r="ΔΔProxy",a="ΔIsProxy",s="ΔDefault",d="ΔnewItem",l="Δjson",c=!1;function f(e){return e&&e.ΔTrackable?e.ΔMd?e.ΔMd:e.ΔMd={parents:void 0,refreshCtxt:void 0,watchers:void 0}:null}var u=Array.isArray;function v(e,t){e&&(u(e)&&!e[a]?e.forEach(t):t(e))}function p(e,t){if(e&&t){if(e===t)return;if(u(e)){var n=e;if(1===n.length){if(n[0]===t)return}else{var i=n.indexOf(t);if(i>-1)return n.splice(i,1),1===n.length?n[0]:n}}}return e}function h(e,t){return e?u(e)&&!e[a]?(e.push(t),e):[e,t]:t}function m(e){return e&&!0===e[n]?e[i]:0}function g(e,t){return!(!e||"object"!=typeof e)&&"ΔΔ"+t in e}function w(e){return!(!e||!0!==e[n])}function b(e){return m(e)%2==1}function N(e,t){var n=f(e);return n&&t?(n.watchers=h(n.watchers,t),b(e)&&X.register(e),t):null}function C(e,t){var n=e?e.ΔMd:void 0;n&&t&&(n.watchers=p(n.watchers,t))}function x(e,t){if(e&&t){var n=e[s];if(n){var i=n(t);if(i!==k)return e[t]=i}var r=e[o],a=r?r[t]:null;if(a)return e[t]=a()}}function y(e,t){var n,i;t&&function(e,t){if(w(e)){var n=e.constructor.prototype["ΔDefFactories"];for(var i in n)n.hasOwnProperty(i)&&t(i,e["ΔΔ"+i],n[i])}}(e,(function(o,r,a){var s=a===E;if(n=t[o],i="ΔΔ"+o,void 0===n)s&&(e[i]=void 0);else{var f=typeof n;if(null===n)(s||a===R)&&(e[i]=null);else if("object"===f){var u=function(e,t){if(e&&void 0!==t){if(e[d])return e[d](t);c=!0;var n=e[t];return c=!1,n}}(e,o);u?u[l]=n:s&&(e[i]=n)}else"string"===f?(s||a===P)&&(e[i]=n):"number"===f?(s||a===O)&&(e[i]=n):"boolean"===f?(s||a===A)&&(e[i]=n):s&&(e[i]=n)}}));e[l]=void 0}var k={};function D(){return""}D["ΔIsFactory"]=!0;var P=D;function V(){return 0}V["ΔIsFactory"]=!0;var O=V;function I(){return!1}I["ΔIsFactory"]=!0;var A=I;function j(){return null}j["ΔIsFactory"]=!0;var R=j;function $(){}$["ΔIsFactory"]=!0;var E=$;function T(e,t){if(t){var n=f(t);n&&(n.parents=h(n.parents,e))}}var S=0,F=function(){function e(){this.id=++S}return e.prototype.register=function(e){var t=this,n=f(e);n&&!n.refreshCtxt&&(this.objects?this.objects.push(e):(this.objects=[e],Promise.resolve().then((function(){t.refresh()}))),n.refreshCtxt=this)},e.prototype.refresh=function(e){void 0===e&&(e=!0);var t=this.objects,n=t?t.length:0;if(n){M();for(var i,o,r=[],a=0;n>a;a++)(o=(i=t[a]).ΔMd).refreshCtxt&&(i.ΔChangeVersion%2&&(i.ΔChangeVersion+=1),o.refreshCtxt&&o.watchers&&r.push({dataNode:i,watchers:o.watchers})),o.refreshCtxt=void 0;this.objects=void 0,r.length&&(e?K(r):Promise.resolve().then((function(){K(r)})))}},e}();function K(e){for(var t=function(e){v(e.watchers,(function(t){t(e.dataNode)}))},n=0,i=e;n<i.length;n++){t(i[n])}}var X=new F;function M(){X.objects&&(X=new F)}var H=0,W={log:function(e){for(var t=[],n=1;n<arguments.length;n++)t[n-1]=arguments[n];console.log.apply(console,arguments)},error:function(e){for(var t=[],n=1;n<arguments.length;n++)t[n-1]=arguments[n];console.error.apply(console,arguments)}};function z(e,t){for(var n=e,i=[];n;){if(n.template){var o=n.template;i.push('\n>> Template: "'+o.templateName+'" - File: "'+o.filePath+'"')}n=n.parentView}W.error("IVY: "+t+i.join(""))}var _=void 0,L=11,q=/^ΔΔ(\w+)Emitter$/,B=/^ΔΔ(.+)$/,U="ΔIsAPI",Y="ΔIsController",G=0,J=function(){function e(e,t,n,i,o){this.templateName=e,this.filePath=t,this.staticCache=n,this.renderFn=i,this.$Class=o,this._uid=++G,this.tplApi=void 0,this.tplCtl=void 0,this.forceRefresh=!1,this.activeWatch=!1,this.lastRefreshVersion=0,this.processing=!1,this.rendering=!1,this.initialized=!1,this.labels=void 0,this.hasCtlClass=!1,this.view=function(e,t,n,i){var o={kind:"#view",uid:"view"+ ++H,attached:!1,nodes:null,namespace:void 0,namespaces:void 0,doc:null,parentView:e,cm:!0,cmAppends:null,lastRefresh:0,container:null,projectionHost:null,template:i,rootDomNode:null,anchorNode:null,expressions:void 0,oExpressions:void 0,instructions:void 0,paramNode:void 0,createElement:ee,isEmpty:te};e?ie(o,e,t):o.doc="undefined"!=typeof document?document:null;return o}(null,null,0,this);var r=this;this.watchCb=function(){r.notifyChange()},this.watchCb.$templateId=this._uid,this.$Class!==_&&(Pe(this.$Class,Y)?this.hasCtlClass=!0:Pe(this.$Class,U)||w(this.$Class.prototype)||z(this.view,"Type of $ argument must be either a @Controller, an @API or a @Data class"))}return e.prototype.dispose=function(e){void 0===e&&(e=!1);var t=this.view;this.disconnectObserver(),Z(t,this.tplCtl,"$dispose",this.templateName),e&&t&&t.nodes&&t.nodes.length&&Ce(t,t.nodes[0])},Object.defineProperty(e.prototype,"uid",{get:function(){return this._uid},enumerable:!0,configurable:!0}),Object.defineProperty(e.prototype,"document",{get:function(){return this.view.doc},set:function(e){this.view.doc=e},enumerable:!0,configurable:!0}),Object.defineProperty(e.prototype,"api",{get:function(){if(!this.tplApi)if(this.hasCtlClass){var e=this.controller;e&&e.$api&&(this.tplApi=e.$api)}else this.$Class&&(this.tplApi=new this.$Class,Q(this.view,this.tplApi,this.staticCache));return this.tplApi},enumerable:!0,configurable:!0}),Object.defineProperty(e.prototype,"controller",{get:function(){if(!this.tplCtl&&this.hasCtlClass){var e=this.tplCtl=new this.$Class;if(g(e,"$template")&&(e.$template=this),g(e,"$logger")){var t=this.view;e.$logger={log:W.log,error:function(e){for(var n=[],i=1;i<arguments.length;i++)n[i-1]=arguments[i];z(t,e+(n.length?" "+n.join(" "):""))}}}e.$api&&Q(this.view,e.$api,this.staticCache)}return this.tplCtl},enumerable:!0,configurable:!0}),e.prototype.attach=function(e){if(this.view.rootDomNode)z(this.view,"Template host cannot be changed once set");else{var t=this.view;if(!t.doc)throw new Error("[iv] Template.document must be defined before calling Template.attach()");t.rootDomNode=e,t.anchorNode=t.doc.createComment("template anchor"),Ve(t.anchorNode,e)}return this},e.prototype.registerLabel=function(e,t){this.labels||(this.labels={});var n=this.labels[e];n?n.push(t):n=this.labels[e]=[t]},e.prototype.query=function(e,t){if(void 0===t&&(t=!1),this.rendering)return null;if(e&&"#"!==e.charAt(0))return z(this.view,"[$template.query()] Invalid label argument: '"+e+"' (labels must start with #)"),null;var n=this.labels&&this.labels[e]||null;return n&&n.length?t?n:n[0]:null},e.prototype.notifyChange=function(){this.render()},e.prototype.disconnectObserver=function(){this.activeWatch&&(C(this.api,this.watchCb),C(this.controller,this.watchCb),this.activeWatch=!1)},e.prototype.render=function(e){if(this.processing)return this;this.processing=!0;var t=this.api,n=this.controller,i=this.view;if(n&&!w(n)&&(z(i,"Template controller must be a @Controller Object - please check: "+this.$Class.name),this.tplCtl=this.$Class=void 0),t&&e)for(var o in b(t)||M(),this.disconnectObserver(),e)e.hasOwnProperty(o)&&(t[o]=e[o]);var r=!this.forceRefresh,a=i.nodes;if(a&&a[0]&&a[0].attached||(r=!1),r&&m(t)+m(n)>this.lastRefreshVersion&&(r=!1),!r){n&&(this.initialized||(Z(i,n,"$init","controller"),this.initialized=!0),Z(i,n,"$beforeRender","controller")),this.rendering=!0,this.labels=void 0,i.lastRefresh++,i.instructions=void 0;try{this.renderFn(i,this.hasCtlClass?n:t,t,this)}catch(e){z(i,"Template execution error\n"+(e.message||e))}this.rendering=!1,n&&Z(i,n,"$afterRender","controller"),function(e,t){if(void 0===t&&(t=!1),e){var n=e.ΔMd;n&&n.refreshCtxt?n.refreshCtxt.refresh(!0):t&&M()}}(t),this.forceRefresh=!1,this.lastRefreshVersion=m(t)+m(n)}return this.activeWatch||(N(t,this.watchCb),n&&N(n,this.watchCb),this.activeWatch=!0),this.processing=!1,this},e}();function Q(e,t,n){var i=n.events;if(void 0===i){var o=void 0;for(var r in t)if(r.match(q)){var a=RegExp.$1;o||(o=[]),"function"!=typeof t[a+"Emitter"].init?z(e,"Invalid EventEmitter: "+a+"Emitter"):(o.push(a+"Emitter"),o.push(a),t[a+"Emitter"].init(a,t))}n.events=o||null}else if(null!==i)for(var s=i.length,d=0;s>d;d+=2)t[i[d]].init(i[d+1],t)}function Z(e,t,n,i){if(t&&"function"==typeof t[n])try{t[n]()}catch(t){z(e,i+" "+n+" hook execution error\n"+(t.message||t))}}function ee(e,t){return(t=t||this.namespace)?this.doc.createElementNS(t,e):this.doc.createElement(e)}function te(){return function(e){if(e!==_&&null!==e){var t=!0;return function e(t,n,i){if(t!==_&&null!==t){if(!i(t))return!1;if(null!==t.nodes&&t.nodes.length)for(var o=0,r=t.nodes;o<r.length;o++){if(!a(r[o]))return!1}}return!0;function a(t){var o=t.kind;if("#fragment"===o)return!!i(t)&&e(t.contentView,n,i);if("#container"!==o)return i(t);if(!i(t))return!1;var r=t,a=r.subKind;if("##block"===a){var s=r.views;if(null!==s)for(var d=0,l=s;d<l.length;d++){var c=l[d];if(!e(c,n,i))return!1}if(n&&r.viewPool)for(var f=0,u=r.viewPool;f<u.length;f++){var v=u[f];if(!e(v,n,i))return!1}}else if("##cpt"===a){var p=r.template;if(null!==p)return e(p.view,n,i)}else"##async"===a&&console.log("TODO: support scanNode for @async block");return!0}}(e,!1,(function(e){if(!t)return!1;var n=e.kind;if("#view"===n){var i=e;if(i.cm){var o=i.doc.createDocumentFragment();i.domNode=o,i.cmAppends=[function(e){e.domNode?Ve(e.domNode,o):e.domNode=o}]}!function(e){if(e.instructions){var t=e.instructions.slice(0),n=t.length;if(e.instructions.splice(0,n),e.instructions=void 0,n)for(var i=0;n>i;i+=2)t[i].apply(null,t[i+1])}}(i)}else if("#element"===n||"#text"===n)return t=!1;return!0})),t}return!0}(this)}function ne(e,t,n){if(n){var i=function(e){var t=e;for(;t&&!t.template;)t=t.parentView;return t}(e);if(i!==_&&null!==i)for(var o=i.template,r=n.length,a=0;r>a;a++)o.registerLabel(n[a],t)}}function ie(e,t,n){if(e.parentView=t,e.doc=t.doc,e.container=n,e.rootDomNode=t.rootDomNode,t.namespace){var i=t.namespace;e.namespace=i,e.namespaces=[i]}}function oe(e,t,n,i,o){return function(){return new J(e,t,n,i,o)}}var re=[];function ae(e,t,n){var i=e.cm;return i?(e.nodes=new Array(n),e.cmAppends||(e.cmAppends=[],e.anchorNode&&(e.cmAppends[0]=function(t,n){t.domNode?Oe(t.domNode,e.anchorNode,e.rootDomNode):t.domNode=e.rootDomNode}))):e.cmAppends=null,i}function se(e,t){var n=function e(t,n){for(;;){if(n||z(t,"Internal error - findNextSiblingDomNd: nd cannot be undefined"),0===n.idx){if(!n.attached)return{position:"defer",parentDomNd:void 0};if(n.domNode.nodeType===L)return{position:"lastChild",parentDomNd:n.domNode};var i=t.parentView;if(i){if(t.projectionHost){var o=t.projectionHost.hostNode;return"#element"===o.kind?{position:"lastChild",parentDomNd:o.domNode}:e(t.projectionHost.view,o)}if(t.container&&"##block"===t.container.subKind){var r=t.container,a=r.views.indexOf(t);if(a>-1)for(var s=void 0,d=void 0,l=a+1;l<r.views.length;l++)if((s=r.views[l]).nodes&&s.nodes.length&&(d=m(s,s.nodes[0],r.domNode)))return d;for(var c=r.viewPool,f=void 0,u=0,v=c;u<v.length;u++){if((s=v[u]).nodes&&s.nodes.length&&s.attached&&(f=m(s,s.nodes[0],r.domNode)))return f}}return e(i,t.container)}return{position:"lastOnRoot",parentDomNd:t.rootDomNode,nextDomNd:t.anchorNode}}if(!n.nextSibling){var p=t.nodes[n.parentIdx];return"#element"===p.kind?{position:"lastChild",parentDomNd:Ne(t,n)}:e(t,p)}var h=m(t,n.nextSibling,Ne(t,n));if(h)return h;n=n.nextSibling}function m(e,t,n){if(!t)return null;if("#element"===t.kind||"#text"===t.kind)return{position:"beforeChild",nextDomNd:t.domNode,parentDomNd:n};if("#fragment"===t.kind){for(var i=void 0,o=t.firstChild;o;){if(i=m(e,o,n))return i;o=o.nextSibling}if(t.contentView){var r=t.contentView;if(r.nodes)return m(r,r.nodes[0],n)}return null}if("#container"===t.kind){var a=t;i=null;if("##block"===a.subKind)for(var s=a.views,d=s.length,l=0;d>l&&!(i=m(s[l],s[l].nodes[0],n));l++);else if("##cpt"===a.subKind){var c=a.template.view;i=m(c,c.nodes[0],n)}return i||null}throw new Error("TODO findFirstDomNd: "+t.kind)}}(e,t),i=n.position,o=n.nextDomNd,r=n.parentDomNd;return"beforeChild"===i||"lastOnRoot"===i?function(e,t){e.domNode?Oe(e.domNode,o,r):e.domNode=r}:"lastChild"===i?function(e,t){e.domNode?Ve(e.domNode,r):e.domNode=r}:function(){console.warn("TODO: VALIDATE VIEW APPEND: ",i),function(e,t,n){void 0===t&&(t="");n&&e.uid!==n||(console.log(""),console.log(Ie),t&&console.log(t+":"),function e(t,n){void 0===n&&(n="");if(!t.nodes)return void console.log(""+n+t.uid+" - no nodes");var i=t.parentView?t.parentView.uid:"XX",o=t.projectionHost,r=o?" >>> projection host: "+o.hostNode.uid+" in "+o.view.uid:"";console.log(n+"*"+t.uid+"* cm:"+t.cm+" isTemplate:"+(void 0!==t.template)+" parentView:"+i+r);for(var a,s=t.nodes.length,d="",l=0;s>l;l++)if(a=t.nodes[l])if(d=a.uid.length<5?["     ","    ","   ","  "," "][a.uid.length]:"","#container"===a.kind){var c=a,f=c.domNode?c.domNode.uid:"XX";if(console.log(n+"["+l+"] "+a.uid+d+" "+f+" attached:"+(a.attached?1:0)+" parent:"+y(a.parentIdx)+" nextSibling:"+(a.nextSibling?a.nextSibling.uid:"X")),"##block"===c.subKind){var u=c,v=u.views.length;if(v)for(var p=0;v>p;p++)if(u.views[p]){var h=u.views[p];f=h.rootDomNode?h.rootDomNode.$uid:"XX",console.log(n+"  - view #"+p),e(u.views[p],"    "+n)}else console.log(n+"  - view #"+p+" UNDEFINED");else console.log(n+"  - no child views")}else if("##cpt"===c.subKind){var m=c,g=m.template,w=m.contentView;w?(console.log(n+"  - light DOM:"),e(w,"    "+n)):console.log(n+"  - light DOM: none"),g?(console.log(n+"  - shadow DOM:"),e(g.view,"    "+n)):console.log(n+"  - no template")}else console.log(n+"  - "+c.subKind+" container")}else{f=a.domNode?a.domNode.uid:"XX";var b="";if(a.domNode&&"#text"===a.kind)b=" text=#"+a.domNode._textContent+"#";else if("#fragment"===a.kind||"#element"===a.kind){for(var N=[],C=a.firstChild;C;)N.push(C.uid),C=C.nextSibling;b=" children:["+N.join(", ")+"]";var x=a.contentView;x&&(b+=" >>> content view: "+x.uid)}console.log(n+"["+a.idx+"] "+a.uid+d+" "+f+" attached:"+(a.attached?1:0)+" parent:"+y(a.parentIdx)+" nextSibling:"+(a.nextSibling?a.nextSibling.uid:"X")+b)}else console.log(n+"["+l+"] XX");function y(e){return e<0?"X":e}}(e))}(e,"getViewInsertFunction for "+t.uid)}}function de(e,t,n){var i=e.nodes[t];if(i&&"##block"===i.subKind){var o=i,r=o.lastRefresh;if(n||r===e.lastRefresh){var a=o.views.length;if(!n){if(a!==o.previousNbrOfViews)for(var s=o.viewPool,d=s.length,l=void 0,c=0;d>c;c++)Ce(l=s[c],l.nodes[0]),l.attached=!1;o.previousNbrOfViews=a}}else Ce(e,o)}}function le(e,t,n){if(n)for(var i=n.length,o=0;i>o;o++)de(e,n[o],e.cm);e.cm&&(e.cm=!1,e.cmAppends=null)}function ce(e,t,n,i,o,r,a,s,d){if(t){var l=e.createElement(o);if(s)for(var c=s.length,f=0;c>f;f+=2)l.setAttribute(s[f],s[f+1]);if(d){c=d.length;for(var u=0;c>u;u+=2)l[d[u]]=d[u+1]}var v={kind:"#element",uid:"elt"+ ++H,idx:n,parentIdx:-1,ns:"",domNode:l,attached:!0,nextSibling:void 0,firstChild:void 0,lastChild:void 0,contentView:null};e.nodes[n]=v,ne(e,l,a),e.cmAppends[i](v,!1),r&&(e.cmAppends[i+1]=function(e,t){e.domNode?Ve(e.domNode,l):e.domNode=l,t||fe(v,e)})}else a&&ne(e,e.nodes[n].domNode,a)}function fe(e,t){e.firstChild?(e.lastChild.nextSibling=t,e.lastChild=t):(e.firstChild=e.lastChild=t,t.nextSibling=void 0),t.parentIdx=e.idx}function ue(e,t,n,i,o,r,a,s){for(var d,l=[],c=8;c<arguments.length;c++)l[c-8]=arguments[c];if(s){var f=void 0,u=void 0,v=!1;f=t?a.slice(0):(d=e.nodes[i]).pieces;for(var p=0;s>p;p++)(u=pe(e,n,l[p]))!==re&&(v=!0,f[1+2*p]=null==u?"":u);if(!t)return v&&(d.domNode.textContent=f.join("")),void ne(e,d.domNode,r);d=h(e.doc.createTextNode(f.join("")),f),ne(e,d.domNode,r)}else{if(!t)return void(r&&ne(e,e.nodes[i].domNode,r));d=h(e.doc.createTextNode(a),void 0),ne(e,d.domNode,r)}function h(e,t){return{kind:"#text",uid:"txt"+ ++H,domNode:e,attached:!0,idx:i,parentIdx:-1,pieces:t,nextSibling:void 0}}e.nodes[i]=d,e.cmAppends[o](d,!1)}function ve(e,t,n){if(e.expressions){var i=e.expressions;if(i.length>t&&i[t]===n)return re;i[t]=n}else e.expressions=[],e.expressions[t]=n;return n}function pe(e,t,n){if(t){if(n[2]){var i=e.oExpressions;return i[2*n[0]]?re:(i[2*n[0]]=1,n[1])}return ve(e,n[0],n[1])}return n}function he(e,t,n,i){if(t){var o={kind:"#fragment",uid:"fra"+ ++H,idx:n,parentIdx:-1,ns:"",domNode:void 0,attached:!0,nextSibling:void 0,firstChild:void 0,lastChild:void 0,contentView:null};e.nodes[n]=o;var r=e.cmAppends[i];r(o,!1),e.cmAppends[i+1]=function(e,t){r(e,!0),t||fe(o,e)}}}function me(e,t,n,i,o){if(t){var r=function(e,t,n){var i;if(1===n)i={kind:"#container",subKind:"##block",uid:"cnb"+ ++H,idx:e,parentIdx:-1,ns:"",domNode:void 0,attached:!0,nextSibling:void 0,views:[],viewPool:[],cmAppend:t,lastRefresh:0,previousNbrOfViews:0,insertFn:null};else{if(2!==n)return console.warn("TODO: new cnt type"),null;i={kind:"#container",subKind:"##cpt",uid:"cnc"+ ++H,idx:e,parentIdx:-1,ns:"",domNode:void 0,attached:!0,nextSibling:void 0,cmAppend:t,cptRef:null,template:null,data:null,contentView:null,dynamicParams:void 0}}return i}(n,null,o);return e.nodes[n]=r,function(e,t,n){if(e.cmAppends){var i=e.cmAppends[n];i?(t.cmAppend=function(e,t){i(e,!0)},i(t,!1)):console.log("ERROR?",i===_)}}(e,r,i),r}}function ge(e,t,n,i,o,r,a,s,d,l){var c;n=n||0,t?c=e.nodes[i]||me(e,t,i,o,2):(c=e.nodes[i]).lists&&(c.lists.sizes={});var f=pe(e,n,r);if(c.template){if(f!==re&&c.cptRef!==f){var u=c.data;c.template.dispose(!0),m();var v=c.data;for(var p in u)if(u.hasOwnProperty(p)&&p.match(B)){var h=RegExp.$1;g(v,h)&&(v[h]=u[h])}}}else{if(f===re)return void z(e,"Invalid component ref");m()}function m(){var t=c.template=f();c.cptRef=f,ie(t.view,e,c),t.disconnectObserver(),c.data=t.api,function(t){if(d){var n=d.length;if(!t&&n)z(e,"Invalid parameter: "+d[0]);else for(var i=0;n>i;i+=2)g(t,d[i])?t[d[i]]=d[i+1]:z(e,"Invalid parameter: "+d[i])}}(t.api)}l&&(c.dynamicParams={}),0===n&&a&&we(e,i,c,s,l)}function we(e,t,n,i,o){var r=(n=n||e.nodes[t])?n.template:void 0;if(void 0!==r){if(r.view.lastRefresh=e.lastRefresh-1,function(e){if(e.lists)for(var t=e.lists,n=t.listNames,i=void 0,o=void 0,r=void 0,a=void 0,s=0;n.length>s;s++)i=n[s],o=t.sizes[i]||0,r=e.data[i],a=r.length,o<a&&r.splice(o,a-o)}(n),n.contentView){r.api.$content=n.contentView;var a=n.contentView.instructions;a&&a.length&&(r.forceRefresh=!0)}if(r.view.cm)r.view.cmAppends=[n.cmAppend];else{if(o)for(var s=o.length,d=(n?n.dynamicParams:{})||{},l=r.api,c=0;s>c;c++)d[o[c]]||x(l,o[c]);var f=r.view.nodes[0];if(!f.attached)r.forceRefresh=!0,function e(t,n,i){if(!t.attached){if(n(t,!0),t.attached=!0,"#fragment"===t.kind)for(var o=t.firstChild;o;)e(o,n),o=o.nextSibling;else if("#container"===t.kind){var r=t.subKind;if("##cpt"===r){var a=t.template,s=a?a.view.nodes[0]:null;a&&(a.forceRefresh=!0),s&&(e(s,n),a.view.attached=!0)}else if("##block"===r)for(var d=t.views,l=0;d.length>l;l++)e(d[l].nodes[0],n),d[l].attached=!0}if("#fragment"===t.kind||"#element"===t.kind){var c=t.contentView;c&&(e(c.nodes[0],n),c.attached=!0)}}}(f,se(e,n))}i&&ne(e,r.api,i),r.render()}}function be(e,t,n,i,o,r){if(r!==re){var a=pe(e,n,r);if(a!==re){var s=e.nodes[i],d=s.kind;if("#container"===d){var l=s.data;(function(e,t,n,i,o){if(i&&(!e.cm||g(i,o)))return!0;var r="";n.template&&(r=" on <*"+n.template.templateName+"/>");return z(e,"Invalid parameter '"+o+"'"+r),!1})(e,0,s,l,o)&&(l[o]=a)}else if("#param"===d)!function(e,t,n,i,o){if(0===o){if(n.dataHolder)return n.dataHolder[n.dataName]=i,n.dataHolder}else{if(n.data)return t&&!g(n.data,o)&&z(e,"Invalid param node parameter: "+o),n.data[o]=i,n.data;z(e,"Invalid param node parameter: "+o)}}(e,t,s,a,o);else if("#decorator"===d){var c=s;t&&!function(e,t,n){if(!g(t.api,n))return z(e,"Invalid decorator parameter '"+n+"' on "+t.refName),!1;return!0}(e,c,o)||(c.api[o]=a)}}}}function Ne(e,t){if(0===t.idx&&e.projectionHost){if(!t.attached)return null;var n=e.projectionHost.hostNode;return"#element"===n.kind?n.domNode:Ne(e.projectionHost.view,n)}return 0===t.idx?e.parentView?Ne(e.parentView,e.container):e.rootDomNode:e.nodes[t.parentIdx].domNode}function Ce(e,t){if(t&&t.attached)if("#text"===t.kind||"#element"===t.kind){var n=Ne(e,t);t.attached=!1,n?n.removeChild(t.domNode):z(e,"Internal error - parent not found for: "+t.uid)}else if("#container"===t.kind){if("##block"===t.subKind){for(var i=t,o=i.views,r=o.length,a=void 0,s=0;r>s;s++)a=o[s].nodes[0],Ce(o[s],a),o[s].attached=a.attached=!1,"#container"!==a.kind&&"#fragment"!==a.kind||(a.domNode=void 0);i.views=[],i.previousNbrOfViews=0,i.viewPool=o.concat(i.viewPool)}else if("##cpt"===t.subKind){var d=t.template;a=d.view.nodes[0];Ce(d.view,a),d.view.attached=a.attached=!1,"#container"!==a.kind&&"#fragment"!==a.kind||(a.domNode=void 0)}}else if("#fragment"===t.kind){var l=t;if(l.attached=!1,l.contentView)Ce(l.contentView,l.contentView.nodes[0]);else if(l.firstChild)for(var c=l.firstChild;c;)Ce(e,c),c=c.nextSibling;l.domNode=void 0}else"#param"===t.kind?console.warn("TODO removeFromDom for param nodes"):console.warn("RemoveFromDom for "+t.kind)}var xe=function(e){var t=e.prototype;t[n]=!0,t[i]=0},ye=function(e,t){return e||(e=j,t=3),function(n,i){var a="ΔΔ"+i,s=n[o];s||(s=n[o]={}),s[i]=t?1===t?j:$:e,n[a]=void 0,function(e,t,n,i){i&&delete e[t]&&Object.defineProperty(e,t,i)}(n,i,0,{get:function(){return function(e,t,n,i,o){e.ΔComputeDependencies&&(e.ΔComputeDependencies[n]=!0);!c&&e[l]&&y(e,e[l]);var r=e[t];(void 0===r||c&&null===r)&&(r=e[t]=!c&&o?o>1?void 0:null:i(),T(e,r));return r}(this,a,i,e,t)},set:function(t){!function(e,t,n,i,o,a){var s=w(i),d=o===E;if(e.ΔComputeDependencies)return void console.error("[Trax] @computed properties must not mutate the Data object when calculated");i&&!s&&o.ΔCreateProxy&&(i=o.ΔCreateProxy(i)||i,s=w(i));var l=!1,c=a[n];b(e)?l=c!==i:c!==i&&(!function e(t){if(!w(t))return;var n=!0;b(t)?n=!1:t.ΔChangeVersion+=1;if(X.register(t),n){var i=t.ΔMd;i&&i.parents&&v(i.parents,(function(t){e(t)}))}}(e),l=!0);l&&(s&&void 0===i&&(i=null),(s||c&&w(c))&&function(e,t,n,i){(function(e,t){if(t){var n=t.ΔMd;n&&n.parents&&(n.parents=p(n.parents,e))}})(e,t),i||T(e,n)}(e,c,i,d),a[n]=i,function(e,t,n,i,o){var a=e?e.ΔMd:void 0;if(a&&a.trackers){var s=e[r]||e;v(a.trackers,(function(e){e(s,t,n,i,o)}))}}(e,"set",t,c,i))}(this,i,a,t,e,this)},enumerable:!0,configurable:!0})}},ke=O,De=k;function Pe(e,t){return!0===e.prototype[t]}function Ve(e,t,n){t.appendChild(e)}function Oe(e,t,n,i){n.insertBefore(e,t)}var Ie="-------------------------------------------------------------------------------";var Ae,je,Re,$e=(Ae={},je=[" This is a subtemplate A: ",""," "],Re=function(){function n(){}return e([ye(ke),t("design:type",Number)],n.prototype,"arg1",void 0),n=e([xe],n)}(),oe("sub1","templateParam/templateParam.ts",Ae,(function(e,t,n){var i=n.arg1,o=ae(e,0,2);ce(e,o,0,0,"div",1),ue(e,o,0,1,1,0,je,1,ve(e,0,i)),le(e)}),Re)),Ee=function(){var n={},i=[" This is a subtemplate B: ",""," "],o=function(){function n(){}return e([ye(ke),t("design:type",Number)],n.prototype,"arg1",void 0),n=e([xe],n)}();return oe("sub2","templateParam/templateParam.ts",n,(function(e,t,n){var o=n.arg1,r=ae(e,0,2);ce(e,r,0,0,"div",1),ue(e,r,0,1,1,0,i,1,ve(e,0,o)),le(e)}),o)}(),Te=function(){var n={},i=function(){function n(){this.templ=$e}return n.prototype.ΔDefault=function(e){switch(e){case"templ":return $e}return De},e([ye(),t("design:type",Object)],n.prototype,"templ",void 0),n=e([xe],n)}();return oe("wrap","templateParam/templateParam.ts",n,(function(e,t,n){var i=n.templ,o=ae(e,0,4);he(e,o,0,0),ce(e,o,1,1,"div",1),ue(e,o,0,2,2,0," This is a wrapper! ",0),ge(e,o,0,3,1,ve(e,0,i),0),be(e,o,0,3,"arg1",ve(e,1,10)),we(e,3),le(e)}),i)}();(function(){var e={};return oe("main","templateParam/templateParam.ts",e,(function(e){var t=ae(e,0,3);he(e,t,0,0),ge(e,t,0,1,1,ve(e,0,Te),1),ge(e,t,0,2,1,ve(e,1,Te),0),be(e,t,0,2,"templ",ve(e,2,Ee)),we(e,2),le(e)}))})()().attach(document.body).render()}();
