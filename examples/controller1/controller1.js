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
    ***************************************************************************** */var e=function(t,n){return(e=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(e,t){e.__proto__=t}||function(e,t){for(var n in t)t.hasOwnProperty(n)&&(e[n]=t[n])})(t,n)};function t(t,n){function i(){this.constructor=t}e(t,n),t.prototype=null===n?Object.create(n):(i.prototype=n.prototype,new i)}function n(e,t,n,i){var o,r=arguments.length,s=r<3?t:null===i?i=Object.getOwnPropertyDescriptor(t,n):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)s=Reflect.decorate(e,t,n,i);else for(var a=e.length-1;a>=0;a--)(o=e[a])&&(s=(r<3?o(s):r>3?o(t,n,s):o(t,n))||s);return r>3&&s&&Object.defineProperty(t,n,s),s}function i(e,t){if("object"==typeof Reflect&&"function"==typeof Reflect.metadata)return Reflect.metadata(e,t)}var o="ΔTrackable",r="ΔChangeVersion",s="ΔFactory",a="ΔDefFactories",c="ΔIsFactory",l="ΔΔProxy",d="ΔIsProxy",f="ΔDefault",u="ΔCreateProxy",h="ΔnewItem",v="Δdispose",p="Δjson",m=!1;function g(e){return e&&e.ΔTrackable?e.ΔMd?e.ΔMd:e.ΔMd={parents:void 0,refreshCtxt:void 0,watchers:void 0}:null}var b=Array.isArray;function w(e,t){e&&(b(e)&&!e[d]?e.forEach(t):t(e))}function y(e,t){if(e&&t){if(e===t)return;if(b(e)){var n=e;if(1===n.length){if(n[0]===t)return}else{var i=n.indexOf(t);if(i>-1)return n.splice(i,1),1===n.length?n[0]:n}}}return e}function x(e,t){return e?b(e)&&!e[d]?(e.push(t),e):[e,t]:t}function N(e){return e&&!0===e[o]?e[r]:0}function C(e,t){if(void 0===t&&(t=!1),D(e)){e[v]?e[v](t):k(e,(function(n,i){q(e,i),e["ΔΔ"+n]=void 0,t&&C(i,!0)}));var n=e.ΔMd;if(n){var i=[];w(n.parents,(function(e){i.push(e)}));for(var o=function(t){k(t,(function(n,i){i===e&&(q(t,e),t["ΔΔ"+n]=void 0)})),J(t)},r=0,s=i;r<s.length;r++){o(s[r])}}}}function k(e,t){if(D(e)){var n=e.constructor.prototype["ΔDefFactories"];for(var i in n)n.hasOwnProperty(i)&&t(i,e["ΔΔ"+i],n[i])}}function P(e,t){return!(!e||"object"!=typeof e)&&"ΔΔ"+t in e}function D(e){return!(!e||!0!==e[o])}function O(e){return N(e)%2==1}function j(e,t){var n=g(e);return n&&t?(n.watchers=x(n.watchers,t),O(e)&&Q.register(e),t):null}function I(e,t){var n=e?e.ΔMd:void 0;n&&t&&(n.watchers=y(n.watchers,t))}function A(e,t){if(e&&t){var n=e[f];if(n){var i=n(t);if(i!==_)return e[t]=i}var o=e[a],r=o?o[t]:null;if(r)return e[t]=r()}}var V=function(){var e,t,n=[],i=[],o={getDefaultConversion:function(){return r(e,o)},getPreviousConversion:function(){return e.ΔtoJsResult}};function r(e,n){var i=n.getPreviousConversion();if(i)return i;var o=void 0;if(e.Δconvert)o=e.Δconvert(t);else{if(e["Δjson"])return e["Δjson"];o={},k(e,(function(e,n){D(n)&&(n=s(n,t)),void 0!==n&&(o[e]=n)}))}return o}function s(s,a){var c=0===n.length,l=s;if(s&&D(s)&&(n.push(s),l=void 0,i.push(s),e=s,a?(t=a,l=a(s,o)):l=r(s,o),s.ΔtoJsResult=l,i.pop(),e=i[i.length-1]),c){for(var d=n.length;d--;)n[d]["ΔtoJsResult"]=void 0;e=null,n=[],t=void 0}return l}return s}();function R(e,t){var n,i;t&&k(e,(function(o,r,s){var a=s===H;if(n=t[o],i="ΔΔ"+o,void 0===n)a&&(e[i]=void 0);else{var c=typeof n;if(null===n)(a||s===L)&&(e[i]=null);else if("object"===c){var l=function(e,t){if(e&&void 0!==t){if(e[h])return e[h](t);m=!0;var n=e[t];return m=!1,n}}(e,o);l?l[p]=n:a&&(e[i]=n)}else"string"===c?(a||s===E)&&(e[i]=n):"number"===c?(a||s===T)&&(e[i]=n):"boolean"===c?(a||s===X)&&(e[i]=n):a&&(e[i]=n)}}));e[p]=void 0}function $(e){var t=e.prototype;t[o]=!0,t[r]=0}var _={};function S(){return""}S[c]=!0;var E=S;function F(){return 0}F[c]=!0;var T=F;function M(){return!1}M[c]=!0;var X=M;function K(){return null}K[c]=!0;var L=K;function z(){}z[c]=!0;var H=z;function W(e,t,n,i,o,r){var s=D(i),a=o===H;if(!e.ΔComputeDependencies){i&&!s&&o.ΔCreateProxy&&(s=D(i=o.ΔCreateProxy(i)||i));var c=!1,d=r[n];return O(e)?c=d!==i:d!==i&&(J(e),c=!0),c&&(s&&void 0===i&&(i=null),(s||d&&D(d))&&function(e,t,n,i){q(e,t),i||U(e,n)}(e,d,i,a),r[n]=i,function(e,t,n,i,o){var r=e?e.ΔMd:void 0;if(r&&r.trackers){var s=e[l]||e;w(r.trackers,(function(e){e(s,t,n,i,o)}))}}(e,"set",t,d,i)),i}console.error("[Trax] @computed properties must not mutate the Data object when calculated")}function J(e){if(D(e)){var t=!0;if(O(e)?t=!1:e.ΔChangeVersion+=1,Q.register(e),t){var n=e.ΔMd;n&&n.parents&&w(n.parents,(function(e){J(e)}))}}}function q(e,t){if(t){var n=t.ΔMd;n&&n.parents&&(n.parents=y(n.parents,e))}}function U(e,t){if(t){var n=g(t);n&&(n.parents=x(n.parents,e))}}var B=0,Y=function(){function e(){this.id=++B}return e.prototype.register=function(e){var t=this,n=g(e);n&&!n.refreshCtxt&&(this.objects?this.objects.push(e):(this.objects=[e],Promise.resolve().then((function(){t.refresh()}))),n.refreshCtxt=this)},e.prototype.refresh=function(e){void 0===e&&(e=!0);var t=this.objects,n=t?t.length:0;if(n){Z();for(var i,o,r=[],s=0;n>s;s++)(o=(i=t[s]).ΔMd).refreshCtxt&&(i.ΔChangeVersion%2&&(i.ΔChangeVersion+=1),o.refreshCtxt&&o.watchers&&r.push({dataNode:i,watchers:o.watchers})),o.refreshCtxt=void 0;this.objects=void 0,r.length&&(e?G(r):Promise.resolve().then((function(){G(r)})))}},e}();function G(e){for(var t=function(e){w(e.watchers,(function(t){t(e.dataNode)}))},n=0,i=e;n<i.length;n++){t(i[n])}}var Q=new Y;function Z(){Q.objects&&(Q=new Y)}var ee=/^\Δ/,te=function(){function e(e){this.ΔTrackable=!0,this.ΔDataFactory=!0,this.ΔChangeVersion=0,this.ΔMd=void 0,this.ΔΔSelf=this,this.ΔIsProxy=!1,this.ΔItemFactory=e}return e.ΔNewProxy=function(t){var n=new Proxy({},new e(t));return n[l]=n,n},e.ΔCreateProxy=function(t,n){if("object"==typeof t){var i=new Proxy(t,new e(n));for(var o in J(i),t)t.hasOwnProperty(o)&&U(i,t[o]);return i}return null},e.prototype.ΔnewItem=function(e){var t=this.ΔItemFactory();return W(this.ΔΔSelf,e,e,t,this.ΔItemFactory,this.ΔΔDict)},e.prototype.Δdispose=function(e){void 0===e&&(e=!1);var t,n=this.ΔΔDict;for(var i in n)n.hasOwnProperty(i)&&(t=n[i],q(this.ΔΔSelf,t),n[i]=void 0,e&&C(t,!0));return n},e.prototype.Δconvert=function(e){var t={},n=this.ΔΔDict;for(var i in n)n.hasOwnProperty(i)&&(t[i]=V(n[i],e));return t},e.prototype.ΔinitFromJson=function(){var e=this["Δjson"];if(e){if(e.constructor!==Object)console.error("[Trax] Invalid json type: Dictionaries can only be initialized from Objects");else{var t=this.ΔΔDict,n=void 0,i=void 0;for(var o in e)if(e.hasOwnProperty(o))if(i=n=e[o],n){var r=this.ΔItemFactory();D(r)&&(r["Δjson"]=n,i=r),t[o]=i}else null===n&&(t[o]=null)}this["Δjson"]=void 0}},e.prototype.ΔToString=function(){return"Trax Dict {...}"},e.prototype.set=function(e,t,n){return this.ΔΔDict||(this.ΔΔDict=e),t.match(ee)?this[t]=n:W(this.ΔΔSelf,t,t,n,this.ΔItemFactory,this.ΔΔDict),!0},e.prototype.get=function(e,t){return this.ΔΔDict||(this.ΔΔDict=e),t===d||(this["Δjson"]&&this.ΔinitFromJson(),t===Symbol.iterator?this.ΔΔDict[Symbol.iterator]:"string"===typeof t?t.match(ee)?this[t]:this.ΔΔDict[t]:this[t])},e.prototype.deleteProperty=function(e,t){return this.ΔΔDict||(this.ΔΔDict=e),!t.match(ee)&&(W(this.ΔΔSelf,t,t,null,this.ΔItemFactory,this.ΔΔDict),delete this.ΔΔDict[t],!0)},e}();function ne(e){function t(){return te.ΔNewProxy(e)}return e=e||L,t[c]=!0,t[u]=function(t){return te.ΔCreateProxy(t,e)},t}var ie=0,oe={log:function(e){for(var t=[],n=1;n<arguments.length;n++)t[n-1]=arguments[n];console.log.apply(console,arguments)},error:function(e){for(var t=[],n=1;n<arguments.length;n++)t[n-1]=arguments[n];console.error.apply(console,arguments)}};function re(e,t){for(var n=e,i=[];n;){if(n.template){var o=n.template;i.push('\n>> Template: "'+o.templateName+'" - File: "'+o.filePath+'"')}n=n.parentView}oe.error("IVY: "+t+i.join(""))}var se=void 0,ae=11,ce=/^ΔΔ(\w+)Emitter$/,le=/^ΔΔ(.+)$/,de="ΔIsAPI",fe="ΔIsController",ue=0,he=function(){function e(e,t,n,i,o,r){this.templateName=e,this.filePath=t,this.staticCache=n,this.renderFn=i,this.$Class=o,this.$contextIdentifiers=r,this.kind="$template",this._uid=++ue,this.tplApi=void 0,this.tplCtl=void 0,this.forceRefresh=!1,this.activeWatch=!1,this.lastRefreshVersion=0,this.processing=!1,this.rendering=!1,this.initialized=!1,this.labels=void 0,this.hasCtlClass=!1,this.$contextInitialized=!1,this.view=be(null,null,1,this);var s=this;this.watchCb=function(){s.notifyChange()},this.watchCb.$templateId=this._uid,this.$Class!==se&&(qe(this.$Class,fe)?this.hasCtlClass=!0:qe(this.$Class,de)||D(this.$Class.prototype)||re(this.view,"Type of $ argument must be either a @Controller, an @API or a @Data class"))}return e.prototype.dispose=function(e){void 0===e&&(e=!0);var t=this.view;this.disconnectObserver(),pe(t,this.tplCtl,"$dispose",this.templateName),e&&t&&t.nodes&&t.nodes.length&&(Me(t,t.nodes[0]),t.anchorNode&&(t.rootDomNode.removeChild(t.anchorNode),t.anchorNode=null))},Object.defineProperty(e.prototype,"uid",{get:function(){return this._uid},enumerable:!0,configurable:!0}),Object.defineProperty(e.prototype,"document",{get:function(){return this.view.doc},set:function(e){this.view.doc=e},enumerable:!0,configurable:!0}),Object.defineProperty(e.prototype,"api",{get:function(){if(!this.tplApi)if(this.hasCtlClass){var e=this.controller;e&&e.$api&&(this.tplApi=e.$api)}else this.$Class?(this.tplApi=new this.$Class,ve(this.view,this.tplApi,this.staticCache)):this.$contextIdentifiers?this.tplApi=function(e){return void 0!==e?(t[c]=!0,ne(t)()):ne()();function t(){return new e}}():this.tplApi={};return this.tplApi},enumerable:!0,configurable:!0}),Object.defineProperty(e.prototype,"controller",{get:function(){if(!this.tplCtl&&this.hasCtlClass){var e=this.tplCtl=new this.$Class;if(P(e,"$template")&&(e.$template=this),P(e,"$logger")){var t=this.view;e.$logger={log:oe.log,error:function(e){for(var n=[],i=1;i<arguments.length;i++)n[i-1]=arguments[i];re(t,e+(n.length?" "+n.join(" "):""))}}}e.$api&&ve(this.view,e.$api,this.staticCache)}return this.tplCtl},enumerable:!0,configurable:!0}),e.prototype.attach=function(e){if(this.view.rootDomNode)re(this.view,"Template host cannot be changed once set");else{var t=this.view;if(!t.doc)throw new Error("[iv] Template.document must be defined before calling Template.attach()");t.rootDomNode=e,t.anchorNode=t.doc.createComment("template anchor"),Ue(t.anchorNode,e)}return this},e.prototype.registerLabel=function(e,t){this.labels||(this.labels={});var n=this.labels[e];n?n.push(t):n=this.labels[e]=[t]},e.prototype.query=function(e,t){if(void 0===t&&(t=!1),this.rendering)return null;for(var n=[],i=0,o=e.split(";");i<o.length;i++){var r=o[i];if(r&&"#"!==r.charAt(0))return re(this.view,"[$template.query()] Invalid label argument: '"+r+"' (labels must start with #)"),null;var s=this.labels&&this.labels[r]||null;if(s&&s.length){if(!t)return s[0];n=n.concat(s)}}return n.length?n:null},e.prototype.notifyChange=function(){this.render()},e.prototype.disconnectObserver=function(){this.activeWatch&&(I(this.api,this.watchCb),I(this.controller,this.watchCb),this.activeWatch=!1)},e.prototype.render=function(e,t){if(void 0===t&&(t=!1),this.processing)return this;t&&(this.forceRefresh=!0),this.processing=!0;var n=this.api,i=this.controller,o=this.view,r=this.$contextIdentifiers;i&&!D(i)&&(re(o,"Template controller must be a @Controller Object - please check: "+this.$Class.name),this.tplCtl=this.$Class=void 0);var s=!1;if(n&&e)if(r!==se){var a=e.context;a!==se&&"object"==typeof a&&(s=!0)}else for(var c in O(n)||Z(),this.disconnectObserver(),e)e.hasOwnProperty(c)&&(n[c]=e[c]);if(this.$contextInitialized&&(s=!0),s){var l="",d=(e?e.context:null)||n.$context;if(d){for(var f=0;r.length>f;f++)n[l=r[f]]=d[l];n.$context=d,this.$contextInitialized=!0}}r===se||this.$contextInitialized||re(o,"Missing $fragment context");var u=!this.forceRefresh,h=o.nodes;if(h&&h[0]&&h[0].attached||(u=!1),u&&N(n)+N(i)>this.lastRefreshVersion&&(u=!1),!u){i&&(this.initialized||(pe(o,i,"$init","controller"),this.initialized=!0),pe(o,i,"$beforeRender","controller")),this.rendering=!0,this.labels=void 0,o.lastRefresh++,o.instructions=void 0;try{this.renderFn(o,this.hasCtlClass?i:n,n,this)}catch(e){re(o,"Template execution error\n"+(e.message||e))}this.rendering=!1,i&&pe(o,i,"$afterRender","controller"),function(e,t){if(void 0===t&&(t=!1),e){var n=e.ΔMd;n&&n.refreshCtxt?n.refreshCtxt.refresh(!0):t&&Z()}}(n),this.forceRefresh=!1,this.lastRefreshVersion=N(n)+N(i)}return this.activeWatch||(j(n,this.watchCb),i&&j(i,this.watchCb),this.activeWatch=!0),this.processing=!1,this},e}();function ve(e,t,n){var i=n.events;if(void 0===i){var o=void 0;for(var r in t)if(r.match(ce)){var s=RegExp.$1;o||(o=[]),"function"!=typeof t[s+"Emitter"].init?re(e,"Invalid EventEmitter: "+s+"Emitter"):(o.push(s+"Emitter"),o.push(s),t[s+"Emitter"].init(s,t))}n.events=o||null}else if(null!==i)for(var a=i.length,c=0;a>c;c+=2)t[i[c]].init(i[c+1],t)}function pe(e,t,n,i){if(t&&"function"==typeof t[n]){var o=void 0;try{void 0!==(o=t[n]())&&"function"==typeof o.catch&&o.catch((function(t){re(e,i+" "+n+" hook execution error\n"+(t.message||t))}))}catch(t){re(e,i+" "+n+" hook execution error\n"+(t.message||t))}}}function me(e,t){return(t=t||this.namespace)?this.doc.createElementNS(t,e):this.doc.createElement(e)}function ge(){return function(e){if(e!==se&&null!==e){var t=!0;return function e(t,n,i){if(t!==se&&null!==t){if(!i(t))return!1;if(null!==t.nodes&&t.nodes.length)for(var o=0,r=t.nodes;o<r.length;o++){if(!s(r[o]))return!1}}return!0;function s(t){var o=t.kind;if("#fragment"===o)return!!i(t)&&e(t.contentView,n,i);if("#container"!==o)return i(t);if(!i(t))return!1;var r=t,s=r.subKind;if("##block"===s){var a=r.views;if(null!==a)for(var c=0,l=a;c<l.length;c++){var d=l[c];if(!e(d,n,i))return!1}if(n&&r.viewPool)for(var f=0,u=r.viewPool;f<u.length;f++){var h=u[f];if(!e(h,n,i))return!1}}else if("##cpt"===s){var v=r.template;if(null!==v)return e(v.view,n,i)}else"##async"===s&&console.log("TODO: support scanNode for @async block");return!0}}(e,!1,(function(e){if(!t)return!1;var n=e.kind;if("#view"===n){var i=e;if(i.cm){var o=i.doc.createDocumentFragment();i.domNode=o,i.cmAppends=[function(e){e.domNode?Ue(e.domNode,o):e.domNode=o}]}!function(e){if(e.instructions){var t=e.instructions.slice(0),n=t.length;if(e.instructions.splice(0,n),e.instructions=void 0,n)for(var i=0;n>i;i+=2)t[i].apply(null,t[i+1])}}(i)}else if("#element"===n||"#text"===n)return t=!1;return!0})),t}return!0}(this)}function be(e,t,n,i){var o={kind:"#view",uid:"view"+ ++ie,attached:!1,nodes:null,namespace:void 0,namespaces:void 0,doc:null,parentView:e,cm:!0,cmAppends:null,lastRefresh:0,container:null,projectionHost:null,template:i,rootDomNode:null,anchorNode:null,expressions:void 0,oExpressions:void 0,instructions:void 0,paramNode:void 0,createElement:me,isEmpty:ge};return e?ye(o,e,t):o.doc="undefined"!=typeof document?document:null,o}function we(e,t,n){if(n){var i=function(e){var t=e;for(;t&&!t.template;)t=t.parentView;return t}(e);if(i!==se&&null!==i)for(var o=i.template,r=n.length,s=0;r>s;s++)o.registerLabel(n[s],t)}}function ye(e,t,n){if(e.parentView=t,e.doc=t.doc,e.container=n,e.rootDomNode=t.rootDomNode,t.namespace){var i=t.namespace;e.namespace=i,e.namespaces=[i]}}function xe(e,t,n,i,o,r){return function(){return new he(e,t,n,i,o,r)}}var Ne=[];function Ce(e,t,n){var i=e.cm;return i?(e.nodes=new Array(n),e.cmAppends||(e.cmAppends=[],e.anchorNode&&(e.cmAppends[0]=function(t,n){t.domNode?Be(t.domNode,e.anchorNode,e.rootDomNode):t.domNode=e.rootDomNode}))):e.cmAppends=null,i}function ke(e,t){var n=function e(t,n){for(;;){if(n||re(t,"Internal error - findNextSiblingDomNd: nd cannot be undefined"),0===n.idx){if(!n.attached)return{position:"defer",parentDomNd:void 0};if(n.domNode.nodeType===ae)return{position:"lastChild",parentDomNd:n.domNode};var i=t.parentView;if(i){if(t.projectionHost){var o=t.projectionHost.hostNode;return"#element"===o.kind?{position:"lastChild",parentDomNd:o.domNode}:e(t.projectionHost.view,o)}if(t.container&&"##block"===t.container.subKind){var r=t.container,s=r.views.indexOf(t);if(s>-1)for(var a=void 0,c=void 0,l=s+1;l<r.views.length;l++)if((a=r.views[l]).nodes&&a.nodes.length&&(c=m(a,a.nodes[0],r.domNode)))return c;for(var d=r.viewPool,f=void 0,u=0,h=d;u<h.length;u++){if((a=h[u]).nodes&&a.nodes.length&&a.attached&&(f=m(a,a.nodes[0],r.domNode)))return f}}return e(i,t.container)}return{position:"lastOnRoot",parentDomNd:t.rootDomNode,nextDomNd:t.anchorNode}}if(!n.nextSibling){var v=t.nodes[n.parentIdx];return"#element"===v.kind?{position:"lastChild",parentDomNd:Te(t,n)}:e(t,v)}var p=m(t,n.nextSibling,Te(t,n));if(p)return p;n=n.nextSibling}function m(e,t,n){if(!t)return null;if("#element"===t.kind||"#text"===t.kind)return{position:"beforeChild",nextDomNd:t.domNode,parentDomNd:n};if("#fragment"===t.kind){for(var i=void 0,o=t.firstChild;o;){if(i=m(e,o,n))return i;o=o.nextSibling}if(t.contentView){var r=t.contentView;if(r.nodes)return m(r,r.nodes[0],n)}return null}if("#container"===t.kind){var s=t;i=null;if("##block"===s.subKind)for(var a=s.views,c=a.length,l=0;c>l&&!(i=m(a[l],a[l].nodes[0],n));l++);else if("##cpt"===s.subKind){var d=s.template.view;i=m(d,d.nodes[0],n)}return i||null}throw new Error("TODO findFirstDomNd: "+t.kind)}}(e,t),i=n.position,o=n.nextDomNd,r=n.parentDomNd;return"beforeChild"===i||"lastOnRoot"===i?function(e,t){e.domNode?Be(e.domNode,o,r):e.domNode=r}:"lastChild"===i?function(e,t){e.domNode?Ue(e.domNode,r):e.domNode=r}:function(){console.warn("TODO: VALIDATE VIEW APPEND: ",i),function(e,t,n){void 0===t&&(t="");n&&e.uid!==n||(console.log(""),console.log(Ye),t&&console.log(t+":"),function e(t,n){void 0===n&&(n="");if(!t.nodes)return void console.log(""+n+t.uid+" - no nodes");var i=t.parentView?t.parentView.uid:"XX",o=t.projectionHost,r=o?" >>> projection host: "+o.hostNode.uid+" in "+o.view.uid:"";console.log(n+"*"+t.uid+"* cm:"+t.cm+" isTemplate:"+(void 0!==t.template)+" parentView:"+i+r);for(var s,a=t.nodes.length,c="",l=0;a>l;l++)if(s=t.nodes[l])if(c=s.uid.length<5?["     ","    ","   ","  "," "][s.uid.length]:"","#container"===s.kind){var d=s,f=d.domNode?d.domNode.uid:"XX";if(console.log(n+"["+l+"] "+s.uid+c+" "+f+" attached:"+(s.attached?1:0)+" parent:"+C(s.parentIdx)+" nextSibling:"+(s.nextSibling?s.nextSibling.uid:"X")),"##block"===d.subKind){var u=d,h=u.views.length;if(h)for(var v=0;h>v;v++)if(u.views[v]){var p=u.views[v];f=p.rootDomNode?p.rootDomNode.$uid:"XX",console.log(n+"  - view #"+v),e(u.views[v],"    "+n)}else console.log(n+"  - view #"+v+" UNDEFINED");else console.log(n+"  - no child views")}else if("##cpt"===d.subKind){var m=d,g=m.template,b=m.contentView;b?(console.log(n+"  - light DOM:"),e(b,"    "+n)):console.log(n+"  - light DOM: none"),g?(console.log(n+"  - shadow DOM:"),e(g.view,"    "+n)):console.log(n+"  - no template")}else console.log(n+"  - "+d.subKind+" container")}else{f=s.domNode?s.domNode.uid:"XX";var w="";if(s.domNode&&"#text"===s.kind)w=" text=#"+s.domNode._textContent+"#";else if("#fragment"===s.kind||"#element"===s.kind){for(var y=[],x=s.firstChild;x;)y.push(x.uid),x=x.nextSibling;w=" children:["+y.join(", ")+"]";var N=s.contentView;N&&(w+=" >>> content view: "+N.uid)}console.log(n+"["+s.idx+"] "+s.uid+c+" "+f+" attached:"+(s.attached?1:0)+" parent:"+C(s.parentIdx)+" nextSibling:"+(s.nextSibling?s.nextSibling.uid:"X")+w)}else console.log(n+"["+l+"] XX");function C(e){return e<0?"X":e}}(e))}(e,"getViewInsertFunction for "+t.uid)}}function Pe(e,t,n){var i=e.nodes[t];if(i&&"##block"===i.subKind){var o=i,r=o.lastRefresh;if(n||r===e.lastRefresh){var s=o.views.length;if(!n){if(s!==o.previousNbrOfViews)for(var a=o.viewPool,c=a.length,l=void 0,d=0;c>d;d++)Me(l=a[d],l.nodes[0]),l.attached=!1;o.previousNbrOfViews=s}}else Me(e,o)}}function De(e,t,n){if(!e.attached){if(t(e,!0),e.attached=!0,"#fragment"===e.kind)for(var i=e.firstChild;i;)De(i,t),i=i.nextSibling;else if("#container"===e.kind){var o=e.subKind;if("##cpt"===o){var r=e.template,s=r?r.view.nodes[0]:null;r&&(r.forceRefresh=!0),s&&(De(s,t),r.view.attached=!0)}else if("##block"===o)for(var a=e.views,c=0;a.length>c;c++)De(a[c].nodes[0],t),a[c].attached=!0}if("#fragment"===e.kind||"#element"===e.kind){var l=e.contentView;l&&(De(l.nodes[0],t),l.attached=!0)}}}function Oe(e,t,n){if(n)for(var i=n.length,o=0;i>o;o++)Pe(e,n[o],e.cm);e.cm&&(e.cm=!1,e.cmAppends=null)}function je(e,t,n,i,o,r,s,a,c){if(t){var l=e.createElement(o);if(a)for(var d=a.length,f=0;d>f;f+=2)l.setAttribute(a[f],a[f+1]);if(c){d=c.length;for(var u=0;d>u;u+=2)l[c[u]]=c[u+1]}var h={kind:"#element",uid:"elt"+ ++ie,idx:n,parentIdx:-1,ns:"",domNode:l,attached:!0,nextSibling:void 0,firstChild:void 0,lastChild:void 0,contentView:null};e.nodes[n]=h,we(e,l,s),e.cmAppends[i](h,!1),r&&(e.cmAppends[i+1]=function(e,t){e.domNode?Ue(e.domNode,l):e.domNode=l,t||Ie(h,e)})}else s&&we(e,e.nodes[n].domNode,s)}function Ie(e,t){e.firstChild?(e.lastChild.nextSibling=t,e.lastChild=t):(e.firstChild=e.lastChild=t,t.nextSibling=void 0),t.parentIdx=e.idx}function Ae(e,t,n,i,o,r,s,a){for(var c,l=[],d=8;d<arguments.length;d++)l[d-8]=arguments[d];if(a){var f=void 0,u=void 0,h=!1;f=t?s.slice(0):(c=e.nodes[i]).pieces;for(var v=0;a>v;v++)(u=Re(e,n,l[v]))!==Ne&&(h=!0,f[1+2*v]=null==u?"":u);if(!t)return h&&(c.domNode.textContent=f.join("")),void we(e,c.domNode,r);c=p(e.doc.createTextNode(f.join("")),f),we(e,c.domNode,r)}else{if(!t)return void(r&&we(e,e.nodes[i].domNode,r));c=p(e.doc.createTextNode(s),void 0),we(e,c.domNode,r)}function p(e,t){return{kind:"#text",uid:"txt"+ ++ie,domNode:e,attached:!0,idx:i,parentIdx:-1,pieces:t,nextSibling:void 0}}e.nodes[i]=c,e.cmAppends[o](c,!1)}function Ve(e,t,n){if(e.expressions){var i=e.expressions;if(i.length>t&&i[t]===n)return Ne;i[t]=n}else e.expressions=[],e.expressions[t]=n;return n}function Re(e,t,n){if(t){if(n[2]){var i=e.oExpressions;return i[2*n[0]]?Ne:(i[2*n[0]]=1,n[1])}return Ve(e,n[0],n[1])}return n}function $e(e,t,n,i,o){if(t){var r=function(e,t,n){var i;if(1===n)i={kind:"#container",subKind:"##block",uid:"cnb"+ ++ie,idx:e,parentIdx:-1,ns:"",domNode:void 0,attached:!0,nextSibling:void 0,views:[],viewPool:[],cmAppend:t,lastRefresh:0,previousNbrOfViews:0,insertFn:null};else{if(2!==n)return console.warn("TODO: new cnt type"),null;i={kind:"#container",subKind:"##cpt",uid:"cnc"+ ++ie,idx:e,parentIdx:-1,ns:"",domNode:void 0,attached:!0,nextSibling:void 0,cmAppend:t,cptRef:null,template:null,data:null,contentView:null,dynamicParams:void 0}}return i}(n,null,o);return e.nodes[n]=r,function(e,t,n){if(e.cmAppends){var i=e.cmAppends[n];i?(t.cmAppend=function(e,t){i(e,!0)},i(t,!1)):console.log("ERROR?",i===se)}}(e,r,i),r}}function _e(e,t,n,i,o,r,s,a,c,l){var d;n=n||0,t?d=e.nodes[i]||$e(e,t,i,o,2):(d=e.nodes[i]).lists&&(d.lists.sizes={});var f=Re(e,n,r);if(d.template){if(f!==Ne&&d.cptRef!==f){var u=d.data;d.template.dispose(!0),m();var h=d.data;for(var v in u)if(u.hasOwnProperty(v)&&v.match(le)){var p=RegExp.$1;P(h,p)&&(h[p]=u[p])}}}else{if(f===Ne)return void re(e,"Invalid component ref");m()}function m(){var t=d.template=f();d.cptRef=f,ye(t.view,e,d),t.disconnectObserver(),d.data=t.api,function(t){if(c){var n=c.length;if(!t&&n)re(e,"Invalid parameter: "+c[0]);else for(var i=0;n>i;i+=2)P(t,c[i])?t[c[i]]=c[i+1]:re(e,"Invalid parameter: "+c[i])}}(t.api)}l&&(d.dynamicParams={}),0===n&&s&&Se(e,i,d,a,l)}function Se(e,t,n,i,o){var r=(n=n||e.nodes[t])?n.template:void 0;if(void 0!==r){if(r.view.lastRefresh=e.lastRefresh-1,function(e){if(e.lists)for(var t=e.lists,n=t.listNames,i=void 0,o=void 0,r=void 0,s=void 0,a=0;n.length>a;a++)i=n[a],o=t.sizes[i]||0,r=e.data[i],s=r.length,o<s&&r.splice(o,s-o)}(n),n.contentView){r.api.$content=n.contentView;var s=n.contentView.instructions;s&&s.length&&(r.forceRefresh=!0)}if(r.view.cm)r.view.cmAppends=[n.cmAppend];else{if(o)for(var a=o.length,c=(n?n.dynamicParams:{})||{},l=r.api,d=0;a>d;d++)c[o[d]]||A(l,o[d]);var f=r.view.nodes[0];if(!f.attached)r.forceRefresh=!0,De(f,ke(e,n))}i&&we(e,r.api,i),r.render()}}function Ee(e,t,n,i,o){if(o!==Ne){var r=Re(e,t,o);if(r!==Ne){var s=e.nodes[n].domNode;void 0===r?s.removeAttribute(i):s.setAttribute(i,r)}}}function Fe(e,t,n,i,o,r,s,a){if(t){var c=e.nodes[i];if("#element"===c.kind){var l=c.domNode;if(!l)return void re(e,"Cannot set "+o+" event listener: undefined DOM node");var d=h(l);s&&!1!==(a=a||{}).passive&&(a.passive=!0),l.addEventListener(o,(function(e){d.callback&&d.callback(e)}),a)}else if("#container"===c.kind){var f=c.template;f?u(f.api,!1):re(e,"Cannot set "+o+" event listener: undefined component template")}else"#param"===c.kind?u(c.data,!0):"#decorator"===c.kind&&u(c.api,!0)}else e.nodes[n].callback=r;function u(t,n){if(t&&P(t,o+"Emitter")){var i=t[o+"Emitter"];if(i.addListener&&"function"==typeof i.addListener){var r=h(null);i.addListener((function(e){r.callback&&r.callback(e)})),n&&"function"==typeof i.init&&i.init(o,t)}else re(e,"Invalid event emitter for: "+o)}else re(e,"Unsupported event: "+o)}function h(t){var o={kind:"#listener",uid:"evt"+ ++ie,idx:n,parentIdx:i,nextSibling:void 0,domNode:t,attached:!0,callback:r};return e.nodes[n]=o,o}}function Te(e,t){if(0===t.idx&&e.projectionHost){if(!t.attached)return null;var n=e.projectionHost.hostNode;return"#element"===n.kind?n.domNode:Te(e.projectionHost.view,n)}return 0===t.idx?e.parentView?Te(e.parentView,e.container):e.rootDomNode:e.nodes[t.parentIdx].domNode}function Me(e,t){if(t&&t.attached)if("#text"===t.kind||"#element"===t.kind){var n=Te(e,t);t.attached=!1,n?n.removeChild(t.domNode):re(e,"Internal error - parent not found for: "+t.uid)}else if("#container"===t.kind){if("##block"===t.subKind){for(var i=t,o=i.views,r=o.length,s=void 0,a=0;r>a;a++)s=o[a].nodes[0],Me(o[a],s),o[a].attached=s.attached=!1,"#container"!==s.kind&&"#fragment"!==s.kind||(s.domNode=void 0);i.views=[],i.previousNbrOfViews=0,i.viewPool=o.concat(i.viewPool)}else if("##cpt"===t.subKind){var c=t.template;s=c.view.nodes[0];Me(c.view,s),c.view.attached=s.attached=!1,"#container"!==s.kind&&"#fragment"!==s.kind||(s.domNode=void 0)}}else if("#fragment"===t.kind){var l=t;if(l.attached=!1,l.contentView)Me(l.contentView,l.contentView.nodes[0]);else if(l.firstChild)for(var d=l.firstChild;d;)Me(e,d),d=d.nextSibling;l.domNode=void 0}else"#param"===t.kind?console.warn("TODO removeFromDom for param nodes"):console.warn("RemoveFromDom for "+t.kind)}var Xe=$,Ke=function(e,t){return e||(e=K,t=3),function(n,i){var o="ΔΔ"+i,r=n[a];r||(r=n[a]={}),r[i]=t?1===t?K:z:e,n[o]=void 0,function(e,t,n,i){i&&delete e[t]&&Object.defineProperty(e,t,i)}(n,i,0,{get:function(){return function(e,t,n,i,o){e.ΔComputeDependencies&&(e.ΔComputeDependencies[n]=!0);!m&&e[p]&&R(e,e[p]);var r=e[t];(void 0===r||m&&null===r)&&(r=e[t]=!m&&o?o>1?void 0:null:i(),U(e,r));return r}(this,o,i,e,t)},set:function(t){W(this,i,o,t,e,this)},enumerable:!0,configurable:!0})}},Le=function(e){var t=e.ΔFactory;if(t)return t;function n(){return new e}return n[c]=!0,e[s]=n,n},ze=E,He=_;function We(e){e.prototype[de]=!0,$(e)}function Je(e){e.prototype[fe]=!0,$(e)}function qe(e,t){return!0===e.prototype[t]}function Ue(e,t,n){t.appendChild(e)}function Be(e,t,n,i){n.insertBefore(e,t)}var Ye="-------------------------------------------------------------------------------";var Ge,Qe,Ze,et,tt,nt,it=function(){function e(e,t,n,i){this._defaultPrevented=!1,this._immediatePropagationStopped=!1,this._type=e,this._target=t,this._cancelable=n,this.data=i||null}return Object.defineProperty(e.prototype,"type",{get:function(){return this._type},enumerable:!0,configurable:!0}),Object.defineProperty(e.prototype,"target",{get:function(){return this._target},enumerable:!0,configurable:!0}),Object.defineProperty(e.prototype,"cancelable",{get:function(){return this._cancelable},enumerable:!0,configurable:!0}),Object.defineProperty(e.prototype,"defaultPrevented",{get:function(){return this._defaultPrevented},enumerable:!0,configurable:!0}),Object.defineProperty(e.prototype,"immediatePropagationStopped",{get:function(){return this._immediatePropagationStopped},enumerable:!0,configurable:!0}),e.prototype.preventDefault=function(){this._cancelable&&(this._defaultPrevented=!0)},e.prototype.stopImmediatePropagation=function(){this._immediatePropagationStopped=!0},e}(),ot=function(){function e(){this._cancelableEvents=!1,this._target=null,this._eventType=""}return e.prototype.init=function(e,t){this._eventType||(this._eventType=e,this._target=t||null)},Object.defineProperty(e.prototype,"listenerCount",{get:function(){return this._listeners?this._listeners.length:0},enumerable:!0,configurable:!0}),e.prototype.addListener=function(e){return this._listeners?this._listeners.push(e):this._listeners=[e],e},e.prototype.removeListener=function(e){var t=this._listeners;if(t)if(1===t.length&&t[0]===e)this._listeners=void 0;else{var n=t.indexOf(e);n>-1&&t.splice(n,1)}},e.prototype.removeAllListeners=function(){this._listeners=void 0},e.prototype.emit=function(e){if(this._listeners){for(var t=new it(this._eventType,this._target,this._cancelableEvents,e||null),n=!0,i=0,o=this._listeners;i<o.length;i++){if((0,o[i])(t),t.defaultPrevented&&(n=!1),t.immediatePropagationStopped)break}return n}return!0},e}(),rt=function(e){function n(){return null!==e&&e.apply(this,arguments)||this}return t(n,e),n}(ot),st=(function(e){function n(){var t=e.call(this)||this;return t._cancelableEvents=!0,t}t(n,e)}(ot),function(){function e(){}return n([Ke(ze),i("design:type",String)],e.prototype,"placeholder",void 0),n([Ke(Le(rt)),i("design:type",rt)],e.prototype,"submitEmitter",void 0),e=n([We],e)}()),at=function(){function e(){this.ΔΔvalue=""}return e.prototype.ΔDefault=function(e){switch(e){case"value":return""}return He},e.prototype.select=function(e){this.value+=e},e.prototype.clear=function(){this.value=""},e.prototype.submit=function(){this.$api.submitEmitter.emit(this.value)},e.prototype.viewValue=function(){return this.value?this.value.replace(/\d(?!$)/g,"•"):this.$api.placeholder},n([Ke(Le(st)),i("design:type",st)],e.prototype,"$api",void 0),n([Ke(ze),i("design:type",String)],e.prototype,"value",void 0),e=n([Je],e)}(),ct=(Ge=["class","keypad"],Qe=["class","pin"],Ze=[" ",""," "],et=["class","pad"],tt=[" ",""," "],nt=[4],xe("keypad",".../controller1/keypad.ts",{},(function(e,t,n){var i,o,r=0,s=Ce(e,0,14);je(e,s,0,0,"div",1,0,Ge),je(e,s,1,1,"div",1,0,Qe),Ee(e,0,1,"style",Ve(e,0,"color:"+(t.value?"#333":"#ccc"))),Ae(e,s,0,2,2,0,Ze,1,Ve(e,1,t.viewValue())),je(e,s,3,1,"div",1,0,et),$e(e,s,4,2,1);for(var a=function(n){i=function(e,t,n,i,o){var r,s=e.nodes[n];if(s&&s.attached||re(e,"Invalid ζview call: container must be attached ("+(s?s.uid:"XX")+") - pview: "+e.uid+" containerIdx: "+n),"#container"===s.kind)if("##block"===s.subKind){var a=(c=s).views;1===o&&(c.insertFn=null),1===o&&c.views.length>1?(c.previousNbrOfViews=a.length,r=a.shift(),c.viewPool.length?c.viewPool=a.concat(c.viewPool):c.viewPool=a,c.views=[r]):(r=c.views[o-1])||(c.viewPool.length>0?(c.insertFn||(c.insertFn=ke(e,c)),De((r=a[o-1]=c.viewPool.shift()).nodes[0],c.insertFn),r.attached=!0):((r=a[o-1]=be(e,c)).nodes=new Array(i),e.cm&&c.cmAppend?r.cmAppends=[c.cmAppend]:e.cm||(r.cmAppends=[ke(e,c)]))),c.lastRefresh=r.lastRefresh=e.lastRefresh}else{var c;(r=(c=s).contentView)||((r=c.contentView=be(e,c)).nodes=new Array(i)),r.lastRefresh=e.lastRefresh}else if("#param"===s.kind){var l=s;(r=l.contentView)||(r=l.contentView=be(e,null),l.viewPool&&(l.viewPool[l.viewInstanceIdx]=r),r.nodes=new Array(i),r.paramNode=l),r.lastRefresh=e.lastRefresh}return r}(e,0,4,3,++r),o=i.cm,je(i,o,0,0,"button",1),Fe(i,o,1,0,"click",(function(){return t.select(n)}),1),Ae(i,o,0,2,1,0,tt,1,Ve(i,0,n)),Oe(i)},c=1;10>c;c++)a(c);je(e,s,5,2,"button",1),Ee(e,0,5,"disabled",Ve(e,2,!t.value||void 0)),Fe(e,s,6,5,"click",(function(){return t.clear()}),1),Ae(e,s,0,7,3,0," clear ",0),je(e,s,8,2,"button",1),Fe(e,s,9,8,"click",(function(){return t.select(0)}),1),Ae(e,s,0,10,3,0," 0 ",0),je(e,s,11,2,"button",1),Ee(e,0,11,"disabled",Ve(e,3,!t.value||void 0)),Fe(e,s,12,11,"click",(function(){return t.submit()}),1),Ae(e,s,0,13,3,0," submit ",0),Oe(e,0,nt)}),at));(function(){var e={},t=["placeholder","enter your pin"],o=["class","logs"],r=[" ",""," "],s=function(){function e(){this.ΔΔmessage=""}return e.prototype.ΔDefault=function(e){switch(e){case"message":return""}return He},n([Ke(),i("design:type",Object)],e.prototype,"message",void 0),e=n([Xe],e)}();return xe("main",".../controller1/controller1.ts",e,(function(e,n,i){var s=i.message,a=Ce(e,0,5);!function(e,t,n,i){if(t){var o={kind:"#fragment",uid:"fra"+ ++ie,idx:n,parentIdx:-1,ns:"",domNode:void 0,attached:!0,nextSibling:void 0,firstChild:void 0,lastChild:void 0,contentView:null};e.nodes[n]=o;var r=e.cmAppends[i];r(o,!1),e.cmAppends[i+1]=function(e,t){r(e,!0),t||Ie(o,e)}}}(e,a,0,0),_e(e,a,0,1,1,Ve(e,0,ct),0,0,t),Fe(e,a,2,1,"submit",(function(e){return n.message="Last submission: "+e.data})),Se(e,1),je(e,a,3,1,"div",1,0,o),Ae(e,a,0,4,2,0,r,1,Ve(e,1,s)),Oe(e)}),s)})()().attach(document.body).render()}();
