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
    ***************************************************************************** */function e(e,t,n,i){var o,r=arguments.length,a=r<3?t:null===i?i=Object.getOwnPropertyDescriptor(t,n):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(e,t,n,i);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(r<3?o(a):r>3?o(t,n,a):o(t,n))||a);return r>3&&a&&Object.defineProperty(t,n,a),a}function t(e,t){if("object"==typeof Reflect&&"function"==typeof Reflect.metadata)return Reflect.metadata(e,t)}var n="ΔTrackable",i="ΔChangeVersion",o="ΔFactory",r="ΔDefFactories",a="ΔIsFactory",s="ΔΔProxy",d="ΔIsProxy",l="ΔDefault",c="ΔCreateProxy",f="ΔnewItem",u="Δdispose",v="Δjson",p=!1;function h(e){return e&&e.ΔTrackable?e.ΔMd?e.ΔMd:e.ΔMd={parents:void 0,refreshCtxt:void 0,watchers:void 0}:null}var m=Array.isArray;function g(e,t){e&&(m(e)&&!e[d]?e.forEach(t):t(e))}function b(e,t){if(e&&t){if(e===t)return;if(m(e)){var n=e;if(1===n.length){if(n[0]===t)return}else{var i=n.indexOf(t);if(i>-1)return n.splice(i,1),1===n.length?n[0]:n}}}return e}function w(e,t){return e?m(e)&&!e[d]?(e.push(t),e):[e,t]:t}function y(e){return e&&!0===e[n]?e[i]:0}function N(e,t){if(void 0===t&&(t=!1),I(e)){e[u]?e[u](t):x(e,(function(n,i){Y(e,i),e["ΔΔ"+n]=void 0,t&&N(i,!0)}));var n=e.ΔMd;if(n){var i=[];g(n.parents,(function(e){i.push(e)}));for(var o=function(t){x(t,(function(n,i){i===e&&(Y(t,e),t["ΔΔ"+n]=void 0)})),B(t)},r=0,a=i;r<a.length;r++){o(a[r])}}}}function x(e,t){if(I(e)){var n=e.constructor.prototype["ΔDefFactories"];for(var i in n)n.hasOwnProperty(i)&&t(i,e["ΔΔ"+i],n[i])}}function C(e,t){return!(!e||"object"!=typeof e)&&"ΔΔ"+t in e}function I(e){return!(!e||!0!==e[n])}function D(e){return y(e)%2==1}function k(e,t){var n=h(e);return n&&t?(n.watchers=w(n.watchers,t),D(e)&&G.register(e),t):null}function P(e,t){var n=e?e.ΔMd:void 0;n&&t&&(n.watchers=b(n.watchers,t))}function $(e,t){if(e&&t){var n=e[l];if(n){var i=n(t);if(i!==V)return e[t]=i}var o=e[r],a=o?o[t]:null;if(a)return e[t]=a()}}var O=function(){var e,t,n=[],i=[],o={getDefaultConversion:function(){return r(e,o)},getPreviousConversion:function(){return e.ΔtoJsResult}};function r(e,n){var i=n.getPreviousConversion();if(i)return i;var o=void 0;if(e.Δconvert)o=e.Δconvert(t);else{if(e["Δjson"])return e["Δjson"];o={},x(e,(function(e,n){I(n)&&(n=a(n,t)),void 0!==n&&(o[e]=n)}))}return o}function a(a,s){var d=0===n.length,l=a;if(a&&I(a)&&(n.push(a),l=void 0,i.push(a),e=a,s?(t=s,l=s(a,o)):l=r(a,o),a.ΔtoJsResult=l,i.pop(),e=i[i.length-1]),d){for(var c=n.length;c--;)n[c]["ΔtoJsResult"]=void 0;e=null,n=[],t=void 0}return l}return a}();function j(e,t){var n,i;t&&x(e,(function(o,r,a){var s=a===z;if(n=t[o],i="ΔΔ"+o,void 0===n)s&&(e[i]=void 0);else{var d=typeof n;if(null===n)(s||a===X)&&(e[i]=null);else if("object"===d){var l=function(e,t){if(e&&void 0!==t){if(e[f])return e[f](t);p=!0;var n=e[t];return p=!1,n}}(e,o);l?l[v]=n:s&&(e[i]=n)}else"string"===d?(s||a===S)&&(e[i]=n):"number"===d?(s||a===F)&&(e[i]=n):"boolean"===d?(s||a===M)&&(e[i]=n):s&&(e[i]=n)}}));e[v]=void 0}function A(e){var t=e.prototype;t[n]=!0,t[i]=0}function R(e,t){return e||(e=K,t=3),function(n,i){var o="ΔΔ"+i,a=n[r];a||(a=n[r]={}),a[i]=t?1===t?K:L:e,n[o]=void 0,function(e,t,n,i){i&&delete e[t]&&Object.defineProperty(e,t,i)}(n,i,0,{get:function(){return function(e,t,n,i,o){e.ΔComputeDependencies&&(e.ΔComputeDependencies[n]=!0);!p&&e[v]&&j(e,e[v]);var r=e[t];(void 0===r||p&&null===r)&&(r=e[t]=!p&&o?o>1?void 0:null:i(),q(e,r));return r}(this,o,i,e,t)},set:function(t){W(this,i,o,t,e,this)},enumerable:!0,configurable:!0})}}var V={};function E(){return""}E[a]=!0;var S=E;function T(){return 0}T[a]=!0;var F=T;function H(){return!1}H[a]=!0;var M=H;function K(){return null}K[a]=!0;var X=K;function L(){}L[a]=!0;var z=L;function W(e,t,n,i,o,r){var a=I(i),d=o===z;if(!e.ΔComputeDependencies){i&&!a&&o.ΔCreateProxy&&(a=I(i=o.ΔCreateProxy(i)||i));var l=!1,c=r[n];return D(e)?l=c!==i:c!==i&&(B(e),l=!0),l&&(a&&void 0===i&&(i=null),(a||c&&I(c))&&function(e,t,n,i){Y(e,t),i||q(e,n)}(e,c,i,d),r[n]=i,function(e,t,n,i,o){var r=e?e.ΔMd:void 0;if(r&&r.trackers){var a=e[s]||e;g(r.trackers,(function(e){e(a,t,n,i,o)}))}}(e,"set",t,c,i)),i}console.error("[Trax] @computed properties must not mutate the Data object when calculated")}function B(e){if(I(e)){var t=!0;if(D(e)?t=!1:e.ΔChangeVersion+=1,G.register(e),t){var n=e.ΔMd;n&&n.parents&&g(n.parents,(function(e){B(e)}))}}}function Y(e,t){if(t){var n=t.ΔMd;n&&n.parents&&(n.parents=b(n.parents,e))}}function q(e,t){if(t){var n=h(t);n&&(n.parents=w(n.parents,e))}}var J=0,U=function(){function e(){this.id=++J}return e.prototype.register=function(e){var t=this,n=h(e);n&&!n.refreshCtxt&&(this.objects?this.objects.push(e):(this.objects=[e],Promise.resolve().then((function(){t.refresh()}))),n.refreshCtxt=this)},e.prototype.refresh=function(e){void 0===e&&(e=!0);var t=this.objects,n=t?t.length:0;if(n){Q();for(var i,o,r=[],a=0;n>a;a++)(o=(i=t[a]).ΔMd).refreshCtxt&&(i.ΔChangeVersion%2&&(i.ΔChangeVersion+=1),o.refreshCtxt&&o.watchers&&r.push({dataNode:i,watchers:o.watchers})),o.refreshCtxt=void 0;this.objects=void 0,r.length&&(e?_(r):Promise.resolve().then((function(){_(r)})))}},e}();function _(e){for(var t=function(e){g(e.watchers,(function(t){t(e.dataNode)}))},n=0,i=e;n<i.length;n++){t(i[n])}}var G=new U;function Q(){G.objects&&(G=new U)}var Z=/^\Δ/,ee=function(){function e(e){this.ΔTrackable=!0,this.ΔDataFactory=!0,this.ΔChangeVersion=0,this.ΔMd=void 0,this.ΔΔSelf=this,this.ΔIsProxy=!1,this.ΔItemFactory=e}return e.ΔNewProxy=function(t){var n=new Proxy({},new e(t));return n[s]=n,n},e.ΔCreateProxy=function(t,n){if("object"==typeof t){var i=new Proxy(t,new e(n));for(var o in B(i),t)t.hasOwnProperty(o)&&q(i,t[o]);return i}return null},e.prototype.ΔnewItem=function(e){var t=this.ΔItemFactory();return W(this.ΔΔSelf,e,e,t,this.ΔItemFactory,this.ΔΔDict)},e.prototype.Δdispose=function(e){void 0===e&&(e=!1);var t,n=this.ΔΔDict;for(var i in n)n.hasOwnProperty(i)&&(t=n[i],Y(this.ΔΔSelf,t),n[i]=void 0,e&&N(t,!0));return n},e.prototype.Δconvert=function(e){var t={},n=this.ΔΔDict;for(var i in n)n.hasOwnProperty(i)&&(t[i]=O(n[i],e));return t},e.prototype.ΔinitFromJson=function(){var e=this["Δjson"];if(e){if(e.constructor!==Object)console.error("[Trax] Invalid json type: Dictionaries can only be initialized from Objects");else{var t=this.ΔΔDict,n=void 0,i=void 0;for(var o in e)if(e.hasOwnProperty(o))if(i=n=e[o],n){var r=this.ΔItemFactory();I(r)&&(r["Δjson"]=n,i=r),t[o]=i}else null===n&&(t[o]=null)}this["Δjson"]=void 0}},e.prototype.ΔToString=function(){return"Trax Dict {...}"},e.prototype.set=function(e,t,n){return this.ΔΔDict||(this.ΔΔDict=e),t.match(Z)?this[t]=n:W(this.ΔΔSelf,t,t,n,this.ΔItemFactory,this.ΔΔDict),!0},e.prototype.get=function(e,t){return this.ΔΔDict||(this.ΔΔDict=e),t===d||(this["Δjson"]&&this.ΔinitFromJson(),t===Symbol.iterator?this.ΔΔDict[Symbol.iterator]:"string"===typeof t?t.match(Z)?this[t]:this.ΔΔDict[t]:this[t])},e.prototype.deleteProperty=function(e,t){return this.ΔΔDict||(this.ΔΔDict=e),!t.match(Z)&&(W(this.ΔΔSelf,t,t,null,this.ΔItemFactory,this.ΔΔDict),delete this.ΔΔDict[t],!0)},e}();function te(e){function t(){return ee.ΔNewProxy(e)}return e=e||X,t[a]=!0,t[c]=function(t){return ee.ΔCreateProxy(t,e)},t}var ne=0,ie={log:function(e){for(var t=[],n=1;n<arguments.length;n++)t[n-1]=arguments[n];console.log.apply(console,arguments)},error:function(e){for(var t=[],n=1;n<arguments.length;n++)t[n-1]=arguments[n];console.error.apply(console,arguments)}};function oe(e,t){for(var n=e,i=[];n;){if(n.template){var o=n.template;i.push('\n>> Template: "'+o.templateName+'" - File: "'+o.filePath+'"')}n=n.parentView}ie.error("IVY: "+t+i.join(""))}var re=void 0,ae=11,se=/^ΔΔ(\w+)Emitter$/,de=/^ΔΔ/,le=/^ΔΔ(.+)$/,ce=/([^ ]+)\s([^ ]+)/,fe="ΔIsAPI",ue="ΔIsController",ve="ΔDefaultParam",pe="ΔIoParams",he="ΔRequiredProps",me={$targetApi:"$1 cannot be used on DOM nodes",$targetElt:"$1 cannot be used on components that don't define #main elements"},ge=0,be=function(){function e(e,t,n,i,o,r){this.templateName=e,this.filePath=t,this.staticCache=n,this.renderFn=i,this.$Class=o,this.$contextIdentifiers=r,this.kind="$template",this._uid=++ge,this.tplApi=void 0,this.tplCtl=void 0,this.forceRefresh=!1,this.activeWatch=!1,this.lastRefreshVersion=0,this.processing=!1,this.rendering=!1,this.initialized=!1,this.labels=void 0,this.hasCtlClass=!1,this.$contextInitialized=!1,this.view=Ce(null,null,1,this);var a=this;this.watchCb=function(){a.notifyChange()},this.watchCb.$templateId=this._uid,this.$Class!==re&&(lt(this.$Class,ue)?this.hasCtlClass=!0:lt(this.$Class,fe)||I(this.$Class.prototype)||oe(this.view,"Type of $ argument must be either a @Controller, an @API or a @Data class"))}return e.prototype.dispose=function(e){void 0===e&&(e=!0);var t=this.view;this.disconnectObserver(),ye(t,this.tplCtl,"$dispose",this.templateName),e&&t&&t.nodes&&t.nodes.length&&(et(t,t.nodes[0]),t.anchorNode&&(t.rootDomNode.removeChild(t.anchorNode),t.anchorNode=null))},Object.defineProperty(e.prototype,"uid",{get:function(){return this._uid},enumerable:!0,configurable:!0}),Object.defineProperty(e.prototype,"document",{get:function(){return this.view.doc},set:function(e){this.view.doc=e},enumerable:!0,configurable:!0}),Object.defineProperty(e.prototype,"api",{get:function(){if(!this.tplApi)if(this.hasCtlClass){var e=this.controller;e&&e.$api&&(this.tplApi=e.$api)}else this.$Class?(this.tplApi=new this.$Class,we(this.view,this.tplApi,this.staticCache)):this.$contextIdentifiers?this.tplApi=function(e){return void 0!==e?(t[a]=!0,te(t)()):te()();function t(){return new e}}():this.tplApi={};return this.tplApi},enumerable:!0,configurable:!0}),Object.defineProperty(e.prototype,"controller",{get:function(){if(!this.tplCtl&&this.hasCtlClass){var e=this.tplCtl=new this.$Class;if(C(e,"$template")&&(e.$template=this),C(e,"$logger")){var t=this.view;e.$logger={log:ie.log,error:function(e){for(var n=[],i=1;i<arguments.length;i++)n[i-1]=arguments[i];oe(t,e+(n.length?" "+n.join(" "):""))}}}e.$api&&we(this.view,e.$api,this.staticCache)}return this.tplCtl},enumerable:!0,configurable:!0}),e.prototype.attach=function(e){if(this.view.rootDomNode)oe(this.view,"Template host cannot be changed once set");else{var t=this.view;if(!t.doc)throw new Error("[iv] Template.document must be defined before calling Template.attach()");t.rootDomNode=e,t.anchorNode=t.doc.createComment("template anchor"),pt(t.anchorNode,e)}return this},e.prototype.registerLabel=function(e,t){this.labels||(this.labels={});var n=this.labels[e];n?n.push(t):n=this.labels[e]=[t]},e.prototype.query=function(e,t){if(void 0===t&&(t=!1),this.rendering)return null;for(var n=[],i=0,o=e.split(";");i<o.length;i++){var r=o[i];if(r&&"#"!==r.charAt(0))return oe(this.view,"[$template.query()] Invalid label argument: '"+r+"' (labels must start with #)"),null;var a=this.labels&&this.labels[r]||null;if(a&&a.length){if(!t)return a[0];n=n.concat(a)}}return n.length?n:null},e.prototype.notifyChange=function(){this.render()},e.prototype.disconnectObserver=function(){this.activeWatch&&(P(this.api,this.watchCb),P(this.controller,this.watchCb),this.activeWatch=!1)},e.prototype.render=function(e,t){if(void 0===t&&(t=!1),this.processing)return this;t&&(this.forceRefresh=!0),this.processing=!0;var n=this.api,i=this.controller,o=this.view,r=this.$contextIdentifiers;i&&!I(i)&&(oe(o,"Template controller must be a @Controller Object - please check: "+this.$Class.name),this.tplCtl=this.$Class=void 0);var a=!1;if(n&&e)if(r!==re){var s=e.context;s!==re&&"object"==typeof s&&(a=!0)}else for(var d in D(n)||Q(),this.disconnectObserver(),e)e.hasOwnProperty(d)&&(n[d]=e[d]);if(this.$contextInitialized&&(a=!0),a){var l="",c=(e?e.context:null)||n.$context;if(c){for(var f=0;r.length>f;f++)n[l=r[f]]=c[l];n.$context=c,this.$contextInitialized=!0}}r===re||this.$contextInitialized||oe(o,"Missing $fragment context");var u=!this.forceRefresh,v=o.nodes;if(v&&v[0]&&v[0].attached||(u=!1),u&&y(n)+y(i)>this.lastRefreshVersion&&(u=!1),!u){i&&(this.initialized||(ye(o,i,"$init","controller"),this.initialized=!0),ye(o,i,"$beforeRender","controller")),this.rendering=!0,this.labels=void 0,o.lastRefresh++,o.instructions=void 0;try{this.renderFn(o,this.hasCtlClass?i:n,n,this)}catch(e){oe(o,"Template execution error\n"+(e.message||e))}this.rendering=!1,i&&ye(o,i,"$afterRender","controller"),function(e,t){if(void 0===t&&(t=!1),e){var n=e.ΔMd;n&&n.refreshCtxt?n.refreshCtxt.refresh(!0):t&&Q()}}(n),this.forceRefresh=!1,this.lastRefreshVersion=y(n)+y(i)}return this.activeWatch||(k(n,this.watchCb),i&&k(i,this.watchCb),this.activeWatch=!0),this.processing=!1,this},e}();function we(e,t,n){var i=n.events;if(void 0===i){var o=void 0;for(var r in t)if(r.match(se)){var a=RegExp.$1;o||(o=[]),"function"!=typeof t[a+"Emitter"].init?oe(e,"Invalid EventEmitter: "+a+"Emitter"):(o.push(a+"Emitter"),o.push(a),t[a+"Emitter"].init(a,t))}n.events=o||null}else if(null!==i)for(var s=i.length,d=0;s>d;d+=2)t[i[d]].init(i[d+1],t)}function ye(e,t,n,i){if(t&&"function"==typeof t[n]){var o=void 0;try{void 0!==(o=t[n]())&&"function"==typeof o.catch&&o.catch((function(t){oe(e,i+" "+n+" hook execution error\n"+(t.message||t))}))}catch(t){oe(e,i+" "+n+" hook execution error\n"+(t.message||t))}}}function Ne(e,t){return(t=t||this.namespace)?this.doc.createElementNS(t,e):this.doc.createElement(e)}function xe(){return function(e){if(e!==re&&null!==e){var t=!0;return function e(t,n,i){if(t!==re&&null!==t){if(!i(t))return!1;if(null!==t.nodes&&t.nodes.length)for(var o=0,r=t.nodes;o<r.length;o++){if(!a(r[o]))return!1}}return!0;function a(t){var o=t.kind;if("#fragment"===o)return!!i(t)&&e(t.contentView,n,i);if("#container"!==o)return i(t);if(!i(t))return!1;var r=t,a=r.subKind;if("##block"===a){var s=r.views;if(null!==s)for(var d=0,l=s;d<l.length;d++){var c=l[d];if(!e(c,n,i))return!1}if(n&&r.viewPool)for(var f=0,u=r.viewPool;f<u.length;f++){var v=u[f];if(!e(v,n,i))return!1}}else if("##cpt"===a){var p=r.template;if(null!==p)return e(p.view,n,i)}else"##async"===a&&console.log("TODO: support scanNode for @async block");return!0}}(e,!1,(function(e){if(!t)return!1;var n=e.kind;if("#view"===n){var i=e;if(i.cm){var o=i.doc.createDocumentFragment();i.domNode=o,i.cmAppends=[function(e){e.domNode?pt(e.domNode,o):e.domNode=o}]}!function(e){if(e.instructions){var t=e.instructions.slice(0),n=t.length;if(e.instructions.splice(0,n),e.instructions=void 0,n)for(var i=0;n>i;i+=2)t[i].apply(null,t[i+1])}}(i)}else if("#element"===n||"#text"===n)return t=!1;return!0})),t}return!0}(this)}function Ce(e,t,n,i){var o={kind:"#view",uid:"view"+ ++ne,attached:!1,nodes:null,namespace:void 0,namespaces:void 0,doc:null,parentView:e,cm:!0,cmAppends:null,lastRefresh:0,container:null,projectionHost:null,template:i,rootDomNode:null,anchorNode:null,expressions:void 0,oExpressions:void 0,instructions:void 0,paramNode:void 0,createElement:Ne,isEmpty:xe};return e?De(o,e,t):o.doc="undefined"!=typeof document?document:null,o}function Ie(e,t,n){if(n){var i=function(e){var t=e;for(;t&&!t.template;)t=t.parentView;return t}(e);if(i!==re&&null!==i)for(var o=i.template,r=n.length,a=0;r>a;a++)o.registerLabel(n[a],t)}}function De(e,t,n){if(e.parentView=t,e.doc=t.doc,e.container=n,e.rootDomNode=t.rootDomNode,t.namespace){var i=t.namespace;e.namespace=i,e.namespaces=[i]}}function ke(e,t,n,i,o,r){return function(){return new be(e,t,n,i,o,r)}}var Pe=[];function $e(e,t,n){var i=e.cm;return i?(e.nodes=new Array(n),e.cmAppends||(e.cmAppends=[],e.anchorNode&&(e.cmAppends[0]=function(t,n){t.domNode?ht(t.domNode,e.anchorNode,e.rootDomNode):t.domNode=e.rootDomNode}))):e.cmAppends=null,i}function Oe(e,t,n,i,o){var r,a=e.nodes[n];if(a&&a.attached||oe(e,"Invalid ζview call: container must be attached ("+(a?a.uid:"XX")+") - pview: "+e.uid+" containerIdx: "+n),"#container"===a.kind)if("##block"===a.subKind){var s=(d=a).views;1===o&&(d.insertFn=null),1===o&&d.views.length>1?(d.previousNbrOfViews=s.length,r=s.shift(),d.viewPool.length?d.viewPool=s.concat(d.viewPool):d.viewPool=s,d.views=[r]):(r=d.views[o-1])||(d.viewPool.length>0?(d.insertFn||(d.insertFn=je(e,d)),Re((r=s[o-1]=d.viewPool.shift()).nodes[0],d.insertFn),r.attached=!0):((r=s[o-1]=Ce(e,d)).nodes=new Array(i),e.cm&&d.cmAppend?r.cmAppends=[d.cmAppend]:e.cm||(r.cmAppends=[je(e,d)]))),d.lastRefresh=r.lastRefresh=e.lastRefresh}else{var d;(r=(d=a).contentView)||((r=d.contentView=Ce(e,d)).nodes=new Array(i)),r.lastRefresh=e.lastRefresh}else if("#param"===a.kind){var l=a;(r=l.contentView)||(r=l.contentView=Ce(e,null),l.viewPool&&(l.viewPool[l.viewInstanceIdx]=r),r.nodes=new Array(i),r.paramNode=l),r.lastRefresh=e.lastRefresh}return r}function je(e,t){var n=function e(t,n){for(;;){if(n||oe(t,"Internal error - findNextSiblingDomNd: nd cannot be undefined"),0===n.idx){if(!n.attached)return{position:"defer",parentDomNd:void 0};if(n.domNode.nodeType===ae)return{position:"lastChild",parentDomNd:n.domNode};var i=t.parentView;if(i){if(t.projectionHost){var o=t.projectionHost.hostNode;return"#element"===o.kind?{position:"lastChild",parentDomNd:o.domNode}:e(t.projectionHost.view,o)}if(t.container&&"##block"===t.container.subKind){var r=t.container,a=r.views.indexOf(t);if(a>-1)for(var s=void 0,d=void 0,l=a+1;l<r.views.length;l++)if((s=r.views[l]).nodes&&s.nodes.length&&(d=m(s,s.nodes[0],r.domNode)))return d;for(var c=r.viewPool,f=void 0,u=0,v=c;u<v.length;u++){if((s=v[u]).nodes&&s.nodes.length&&s.attached&&(f=m(s,s.nodes[0],r.domNode)))return f}}return e(i,t.container)}return{position:"lastOnRoot",parentDomNd:t.rootDomNode,nextDomNd:t.anchorNode}}if(!n.nextSibling){var p=t.nodes[n.parentIdx];return"#element"===p.kind?{position:"lastChild",parentDomNd:Ze(t,n)}:e(t,p)}var h=m(t,n.nextSibling,Ze(t,n));if(h)return h;n=n.nextSibling}function m(e,t,n){if(!t)return null;if("#element"===t.kind||"#text"===t.kind)return{position:"beforeChild",nextDomNd:t.domNode,parentDomNd:n};if("#fragment"===t.kind){for(var i=void 0,o=t.firstChild;o;){if(i=m(e,o,n))return i;o=o.nextSibling}if(t.contentView){var r=t.contentView;if(r.nodes)return m(r,r.nodes[0],n)}return null}if("#container"===t.kind){var a=t;i=null;if("##block"===a.subKind)for(var s=a.views,d=s.length,l=0;d>l&&!(i=m(s[l],s[l].nodes[0],n));l++);else if("##cpt"===a.subKind){var c=a.template.view;i=m(c,c.nodes[0],n)}return i||null}throw new Error("TODO findFirstDomNd: "+t.kind)}}(e,t),i=n.position,o=n.nextDomNd,r=n.parentDomNd;return"beforeChild"===i||"lastOnRoot"===i?function(e,t){e.domNode?ht(e.domNode,o,r):e.domNode=r}:"lastChild"===i?function(e,t){e.domNode?pt(e.domNode,r):e.domNode=r}:function(){console.warn("TODO: VALIDATE VIEW APPEND: ",i),function(e,t,n){void 0===t&&(t="");n&&e.uid!==n||(console.log(""),console.log(mt),t&&console.log(t+":"),function e(t,n){void 0===n&&(n="");if(!t.nodes)return void console.log(""+n+t.uid+" - no nodes");var i=t.parentView?t.parentView.uid:"XX",o=t.projectionHost,r=o?" >>> projection host: "+o.hostNode.uid+" in "+o.view.uid:"";console.log(n+"*"+t.uid+"* cm:"+t.cm+" isTemplate:"+(void 0!==t.template)+" parentView:"+i+r);for(var a,s=t.nodes.length,d="",l=0;s>l;l++)if(a=t.nodes[l])if(d=a.uid.length<5?["     ","    ","   ","  "," "][a.uid.length]:"","#container"===a.kind){var c=a,f=c.domNode?c.domNode.uid:"XX";if(console.log(n+"["+l+"] "+a.uid+d+" "+f+" attached:"+(a.attached?1:0)+" parent:"+C(a.parentIdx)+" nextSibling:"+(a.nextSibling?a.nextSibling.uid:"X")),"##block"===c.subKind){var u=c,v=u.views.length;if(v)for(var p=0;v>p;p++)if(u.views[p]){var h=u.views[p];f=h.rootDomNode?h.rootDomNode.$uid:"XX",console.log(n+"  - view #"+p),e(u.views[p],"    "+n)}else console.log(n+"  - view #"+p+" UNDEFINED");else console.log(n+"  - no child views")}else if("##cpt"===c.subKind){var m=c,g=m.template,b=m.contentView;b?(console.log(n+"  - light DOM:"),e(b,"    "+n)):console.log(n+"  - light DOM: none"),g?(console.log(n+"  - shadow DOM:"),e(g.view,"    "+n)):console.log(n+"  - no template")}else console.log(n+"  - "+c.subKind+" container")}else{f=a.domNode?a.domNode.uid:"XX";var w="";if(a.domNode&&"#text"===a.kind)w=" text=#"+a.domNode._textContent+"#";else if("#fragment"===a.kind||"#element"===a.kind){for(var y=[],N=a.firstChild;N;)y.push(N.uid),N=N.nextSibling;w=" children:["+y.join(", ")+"]";var x=a.contentView;x&&(w+=" >>> content view: "+x.uid)}console.log(n+"["+a.idx+"] "+a.uid+d+" "+f+" attached:"+(a.attached?1:0)+" parent:"+C(a.parentIdx)+" nextSibling:"+(a.nextSibling?a.nextSibling.uid:"X")+w)}else console.log(n+"["+l+"] XX");function C(e){return e<0?"X":e}}(e))}(e,"getViewInsertFunction for "+t.uid)}}function Ae(e,t,n){var i=e.nodes[t];if(i&&"##block"===i.subKind){var o=i,r=o.lastRefresh;if(n||r===e.lastRefresh){var a=o.views.length;if(!n){if(a!==o.previousNbrOfViews)for(var s=o.viewPool,d=s.length,l=void 0,c=0;d>c;c++)et(l=s[c],l.nodes[0]),l.attached=!1;o.previousNbrOfViews=a}}else et(e,o)}}function Re(e,t,n){if(!e.attached){if(t(e,!0),e.attached=!0,"#fragment"===e.kind)for(var i=e.firstChild;i;)Re(i,t),i=i.nextSibling;else if("#container"===e.kind){var o=e.subKind;if("##cpt"===o){var r=e.template,a=r?r.view.nodes[0]:null;r&&(r.forceRefresh=!0),a&&(Re(a,t),r.view.attached=!0)}else if("##block"===o)for(var s=e.views,d=0;s.length>d;d++)Re(s[d].nodes[0],t),s[d].attached=!0}if("#fragment"===e.kind||"#element"===e.kind){var l=e.contentView;l&&(Re(l.nodes[0],t),l.attached=!0)}}}function Ve(e,t,n){if(n)for(var i=n.length,o=0;i>o;o++)Ae(e,n[o],e.cm);e.cm&&(e.cm=!1,e.cmAppends=null)}function Ee(e,t,n,i,o,r,a,s,d){if(t){var l=e.createElement(o);if(s)for(var c=s.length,f=0;c>f;f+=2)l.setAttribute(s[f],s[f+1]);if(d){c=d.length;for(var u=0;c>u;u+=2)l[d[u]]=d[u+1]}var v={kind:"#element",uid:"elt"+ ++ne,idx:n,parentIdx:-1,ns:"",domNode:l,attached:!0,nextSibling:void 0,firstChild:void 0,lastChild:void 0,contentView:null};e.nodes[n]=v,Ie(e,l,a),e.cmAppends[i](v,!1),r&&(e.cmAppends[i+1]=function(e,t){e.domNode?pt(e.domNode,l):e.domNode=l,t||Se(v,e)})}else a&&Ie(e,e.nodes[n].domNode,a)}function Se(e,t){e.firstChild?(e.lastChild.nextSibling=t,e.lastChild=t):(e.firstChild=e.lastChild=t,t.nextSibling=void 0),t.parentIdx=e.idx}function Te(e,t,n,i,o,r,a,s){for(var d,l=[],c=8;c<arguments.length;c++)l[c-8]=arguments[c];if(s){var f=void 0,u=void 0,v=!1;f=t?a.slice(0):(d=e.nodes[i]).pieces;for(var p=0;s>p;p++)(u=He(e,n,l[p]))!==Pe&&(v=!0,f[1+2*p]=null==u?"":u);if(!t)return v&&(d.domNode.textContent=f.join("")),void Ie(e,d.domNode,r);d=h(e.doc.createTextNode(f.join("")),f),Ie(e,d.domNode,r)}else{if(!t)return void(r&&Ie(e,e.nodes[i].domNode,r));d=h(e.doc.createTextNode(a),void 0),Ie(e,d.domNode,r)}function h(e,t){return{kind:"#text",uid:"txt"+ ++ne,domNode:e,attached:!0,idx:i,parentIdx:-1,pieces:t,nextSibling:void 0}}e.nodes[i]=d,e.cmAppends[o](d,!1)}function Fe(e,t,n){if(e.expressions){var i=e.expressions;if(i.length>t&&i[t]===n)return Pe;i[t]=n}else e.expressions=[],e.expressions[t]=n;return n}function He(e,t,n){if(t){if(n[2]){var i=e.oExpressions;return i[2*n[0]]?Pe:(i[2*n[0]]=1,n[1])}return Fe(e,n[0],n[1])}return n}function Me(e,t,n,i){var o=e.oExpressions;if(o||(o=e.oExpressions=[]),i){if(o[2*t])return o[1+2*t];var r=[t,n,1];return o[2*t]=0,o[1+2*t]=r,r}return o[2*t]?Pe:(o[2*t]=1,n)}function Ke(e,t,n,i,o){if(t){var r=function(e,t,n){var i;if(1===n)i={kind:"#container",subKind:"##block",uid:"cnb"+ ++ne,idx:e,parentIdx:-1,ns:"",domNode:void 0,attached:!0,nextSibling:void 0,views:[],viewPool:[],cmAppend:t,lastRefresh:0,previousNbrOfViews:0,insertFn:null};else{if(2!==n)return console.warn("TODO: new cnt type"),null;i={kind:"#container",subKind:"##cpt",uid:"cnc"+ ++ne,idx:e,parentIdx:-1,ns:"",domNode:void 0,attached:!0,nextSibling:void 0,cmAppend:t,cptRef:null,template:null,data:null,contentView:null,dynamicParams:void 0}}return i}(n,null,o);return e.nodes[n]=r,function(e,t,n){if(e.cmAppends){var i=e.cmAppends[n];i?(t.cmAppend=function(e,t){i(e,!0)},i(t,!1)):console.log("ERROR?",i===re)}}(e,r,i),r}}function Xe(e,t,n,i,o,r,a,s,d,l){var c;n=n||0,t?c=e.nodes[i]||Ke(e,t,i,o,2):(c=e.nodes[i]).lists&&(c.lists.sizes={});var f=He(e,n,r);if(c.template){if(f!==Pe&&c.cptRef!==f){var u=c.data;c.template.dispose(!0),m();var v=c.data;for(var p in u)if(u.hasOwnProperty(p)&&p.match(le)){var h=RegExp.$1;C(v,h)&&(v[h]=u[h])}}}else{if(f===Pe)return void oe(e,"Invalid component ref");m()}function m(){var t=c.template=f();c.cptRef=f,De(t.view,e,c),t.disconnectObserver(),c.data=t.api,function(t){if(d){var n=d.length;if(!t&&n)oe(e,"Invalid parameter: "+d[0]);else for(var i=0;n>i;i+=2)C(t,d[i])?t[d[i]]=d[i+1]:oe(e,"Invalid parameter: "+d[i])}}(t.api)}l&&(c.dynamicParams={}),0===n&&a&&Le(e,i,c,s,l)}function Le(e,t,n,i,o){var r=(n=n||e.nodes[t])?n.template:void 0;if(void 0!==r){if(r.view.lastRefresh=e.lastRefresh-1,function(e){if(e.lists)for(var t=e.lists,n=t.listNames,i=void 0,o=void 0,r=void 0,a=void 0,s=0;n.length>s;s++)i=n[s],o=t.sizes[i]||0,r=e.data[i],a=r.length,o<a&&r.splice(o,a-o)}(n),n.contentView){r.api.$content=n.contentView;var a=n.contentView.instructions;a&&a.length&&(r.forceRefresh=!0)}if(r.view.cm)r.view.cmAppends=[n.cmAppend];else{if(o)for(var s=o.length,d=(n?n.dynamicParams:{})||{},l=r.api,c=0;s>c;c++)d[o[c]]||$(l,o[c]);var f=r.view.nodes[0];if(!f.attached)r.forceRefresh=!0,Re(f,je(e,n))}i&&Ie(e,r.api,i),r.render()}}function ze(e,t,n,i,o){if(o!==Pe){var r=He(e,t,o);if(r!==Pe){var a=e.nodes[n].domNode;void 0===r?a.removeAttribute(i):a.setAttribute(i,r)}}}function We(e,t,n,i,o,r){if(r!==Pe){var a=He(e,n,r);if(a!==Pe){var s=e.nodes[i],d=s.kind;if("#container"===d){var l=s.data;Be(e,t,s,l,o)&&(l[o]=a)}else if("#param"===d)Ye(e,t,s,a,o);else if("#decorator"===d){var c=s;t&&!Ue(e,c,o)||(c.api[o]=a)}}}}function Be(e,t,n,i,o){if(i&&(!e.cm||C(i,o)))return!0;var r="";return n.template&&(r=" on <*"+n.template.templateName+"/>"),oe(e,"Invalid parameter '"+o+"'"+r),!1}function Ye(e,t,n,i,o){if(0===o){if(n.dataHolder)return n.dataHolder[n.dataName]=i,n.dataHolder}else{if(n.data)return t&&!C(n.data,o)&&oe(e,"Invalid param node parameter: "+o),n.data[o]=i,n.data;oe(e,"Invalid param node parameter: "+o)}return null}function qe(e,t,n,i,o,r,a,s){var d,l=e.nodes[i],c=l.kind,f=re;if(a!==re&&s!==re&&null!==a&&"object"==typeof a&&(t&&"string"==typeof s&&I(a)&&!C(a,s)&&oe(e,"Invalid property: '"+s+"'"),f=a[s]),"#container"===c)Be(e,0,l,d=l.data,r)&&(t&&vt(e,d,r),d[r]=f);else if("#param"===c)if(0===r){var u=l;u.dataHolder&&(u.dataHolder[u.dataName]=f,d=u.dataHolder,r=u.dataName,t&&vt(e,d,r,"."+r,!1,!0))}else d=Ye(e,t,l,f,r),t&&vt(e,d,r,"."+l.dataName);else if("#decorator"===c){var v=l;d=v.api,0===r?(r=_e(e,v,f),t&&r&&vt(e,d,r,v.refName,!0)):t&&!Ue(e,v,r)||(t&&vt(e,d,r,v.refName),d[r]=f)}var p=l.bindings;if(p===re&&(p=l.bindings=[]),p[o]===re){if(d){var h={propertyHolder:a,propertyName:s,watchFn:k(d,(function(){var e=d[r],t=h.propertyHolder;if(t!==re&&null!==t&&h.propertyName!==re&&t[h.propertyName]!==e){var n=y(t);0===n||n%2==1?Promise.resolve().then((function(){t[h.propertyName]=e})):t[h.propertyName]=e}}))};p[o]=h}}else{var m=p[o];m.propertyHolder=a,m.propertyName=s}}function Je(e,t,n,i,o,r,a,s,d,l,c){var f;if(t){var u=e.nodes;if(void 0===a)oe(e,"Undefined decorator reference: @"+r);else if("function"!=typeof a&&!0!==a.$isDecorator)oe(e,"Invalid decorator reference: @"+r);else{var v=new a.$apiClass,p=a(v);if(f={kind:"#decorator",uid:"deco"+ ++ne,idx:i,parentIdx:o,attached:!0,nextSibling:void 0,domNode:void 0,instance:p,api:v,refName:"@"+r,validProps:!0},u[i]=f,l)for(var h=l.length,m=0;h>m;m+=2)Ue(e,f,l[m]),v[l[m]]=l[m+1]}}else f=e.nodes[i];if(f!==re){v=f.api;1===s&&_e(e,f,d),Ie(e,v,c)}}function Ue(e,t,n){return!!C(t.api,n)||(oe(e,"Invalid decorator parameter '"+n+"' on "+t.refName),!1)}function _e(e,t,n){var i=t.api,o=i[ve];return o===re?(oe(e,t.refName+" doesn't define any default parameter"),""):(i[o]=n,o)}function Ge(e,t,n){if(t){var i=n.api,o=e.nodes[n.parentIdx],r=null,a=null;if(void 0===o.kind)r=o;else if("#element"===o.kind)r=o.domNode;else if("#container"===o.kind&&"##cpt"===o.subKind){var s=o.template;a=s.api,r=s.query("#main")}else oe(e,"Invalid decorator target for "+n.refName);null!==r&&C(i,"$targetElt")&&(i.$targetElt=r),null!==a&&C(i,"$targetApi")&&(i.$targetApi=a),n.validProps=function(e,t,n,i){if(t[he]!==re){var o=t[he],r=void 0,a=!0;for(var s in o)if((r=t[o[s]])===re||null===r){var d=dt(o[s]);i!==re&&i[d]!==re?oe(e,(n+" "+d).replace(ce,i[d])):oe(e,d+" property is required for "+n),a=!1}return a}return!0}(e,n.api,n.refName,me),n.validProps&&ye(e,n.instance,"$init",n.refName)}n.validProps&&ye(e,n.instance,"$render",n.refName)}function Qe(e,t,n,i){var o=e.nodes[i];o!==re&&Ge(e,t,o)}function Ze(e,t){if(0===t.idx&&e.projectionHost){if(!t.attached)return null;var n=e.projectionHost.hostNode;return"#element"===n.kind?n.domNode:Ze(e.projectionHost.view,n)}return 0===t.idx?e.parentView?Ze(e.parentView,e.container):e.rootDomNode:e.nodes[t.parentIdx].domNode}function et(e,t){if(t&&t.attached)if("#text"===t.kind||"#element"===t.kind){var n=Ze(e,t);t.attached=!1,n?n.removeChild(t.domNode):oe(e,"Internal error - parent not found for: "+t.uid)}else if("#container"===t.kind){if("##block"===t.subKind){for(var i=t,o=i.views,r=o.length,a=void 0,s=0;r>s;s++)a=o[s].nodes[0],et(o[s],a),o[s].attached=a.attached=!1,"#container"!==a.kind&&"#fragment"!==a.kind||(a.domNode=void 0);i.views=[],i.previousNbrOfViews=0,i.viewPool=o.concat(i.viewPool)}else if("##cpt"===t.subKind){var d=t.template;a=d.view.nodes[0];et(d.view,a),d.view.attached=a.attached=!1,"#container"!==a.kind&&"#fragment"!==a.kind||(a.domNode=void 0)}}else if("#fragment"===t.kind){var l=t;if(l.attached=!1,l.contentView)et(l.contentView,l.contentView.nodes[0]);else if(l.firstChild)for(var c=l.firstChild;c;)et(e,c),c=c.nextSibling;l.domNode=void 0}else"#param"===t.kind?console.warn("TODO removeFromDom for param nodes"):console.warn("RemoveFromDom for "+t.kind)}var tt=A,nt=R,it=function(e){if(!e)return K;var t=e.ΔFactory;if(t)return t;function n(){return new e}return n[a]=!0,e[o]=n,n},ot=S,rt=F,at=V;function st(e){e.prototype[fe]=!0,A(e)}function dt(e){return e.replace(de,"")}function lt(e,t){return!0===e.prototype[t]}function ct(e,t){e[ve]=dt(t)}function ft(e,t){var n=e[pe];t="/"+dt(t),e[pe]=n===re?t:n+t}function ut(e,t){var n=e[he];n===re&&(n=e[he]=[]),n.push(t)}function vt(e,t,n,i,o,r){var a=t[pe];if(a!==re){var s="/"+n;if(a===s||a.indexOf(s)>-1)return!0}return oe(e,i!==re?o?"Invalid I/O binding expression on "+i+" (@defaultParam is not an @io param)":r?"Invalid I/O binding expression on "+i+"@paramValue (not an @io param)":"Invalid I/O binding expression on "+i+"."+n+" (not an @io param)":"Invalid I/O binding expression on '"+n+"' (not an @io param)"),!1}function pt(e,t,n){t.appendChild(e)}function ht(e,t,n,i){n.insertBefore(e,t)}var mt="-------------------------------------------------------------------------------";var gt,bt="value",wt="checked",yt="data",Nt=["text","radio","checkbox","number","range"],xt={passive:!0},Ct=function(){function n(){this.ΔΔevents="input",this.ΔΔdebounce=0}return n.prototype.ΔDefault=function(e){switch(e){case"events":return"input";case"debounce":return 0}return at},e([ut,ct,ft,t("design:type",Object)],n.prototype,"ΔΔdata",void 0),e([nt(),t("design:type",Object)],n.prototype,"data",void 0),e([ut,t("design:type",Object)],n.prototype,"ΔΔ$targetElt",void 0),e([nt(),t("design:type",Object)],n.prototype,"$targetElt",void 0),e([nt(ot),t("design:type",String)],n.prototype,"events",void 0),e([nt(0,2),t("design:type",Object)],n.prototype,"input2data",void 0),e([nt(0,2),t("design:type",Object)],n.prototype,"data2input",void 0),e([nt(rt),t("design:type",Number)],n.prototype,"debounce",void 0),n=e([st],n)}(),It=((gt=function(e){var t,n,i="",o="",r="",a={};function s(t){if("number"===i&&"input"===t.type){var o=t[yt];if("e"===o||"E"===o||"-"===o||"+"===o)return}e.debounce<=0?d():(n||(n=new Dt("@value error")),n.duration=e.debounce,n.process(d))}function d(){var n;if("text"===i||"number"===i)n=t[bt];else if("range"===i){var o=t[bt];if(""===o)n=0;else if(n=parseInt(o),isNaN(n))throw"Invalid input value '"+o+"': value of input type range shall be an integer"}else if("checkbox"===i)n=t[wt];else if("radio"===i){if(!t[wt])return;n=t[bt]}e.data=e.input2data(n)}return{$init:function(){if("INPUT"!==(t=e.$targetElt).tagName&&"TEXTAREA"!==t.tagName&&"SELECT"!==t.tagName)throw"@value can only be used on input, textarea and select elements";if(i="text","INPUT"===t.tagName&&(i=t.getAttribute("type"),-1===Nt.indexOf(i)))throw"Invalid input type '"+i+"': @value can only be used on types '"+Nt.join("', '")+"'";t.addEventListener("change",s,xt)},$render:function(){if(void 0===e.input2data&&(e.input2data=function(e){if("number"===i){if(""===e)return 0;try{e=parseFloat(e)}catch(e){return console.log("@value conversion error: ",e),0}}return e}),void 0===e.data2input&&(e.data2input=Pt),o!==e.data){o=e.data;var n=e.data2input(o);if("text"===i||"number"===i)t[bt]=n;else if("range"===i){if(!Number.isInteger(n))throw"Invalid input value '"+n+"': value of input type range shall be an integer";t[bt]=""+n}else"checkbox"===i?t[wt]=!!n:"radio"===i&&(t[wt]=n===t[bt])}if(r!==e.events){for(var d=e.events.split(";"),l=0,c=r.split(";");l<c.length;l++)"change"!==(v=c[l])&&d.indexOf(v)<0&&a[v]&&(t.removeEventListener(v,s,xt),a[v]=!1);for(var f=0,u=d;f<u.length;f++){var v;"change"!==(v=u[f])&&(a[v]||(t.addEventListener(v,s,xt),a[v]=!0))}r=e.events}},$dispose:function(){if(t){if(t.removeEventListener("change",s),""!==r)for(var e=0,i=r.split(";");e<i.length;e++){var o=i[e];"change"!==o&&t.removeEventListener(o,s,xt)}r="",n=void 0}}}}).$apiClass=Ct,gt.$isDecorator=!0,gt),Dt=function(){function e(e){void 0===e&&(e="Error in callback"),this.errContext=e,this.timeoutId=null,this.duration=100}return e.prototype.process=function(e){var t=this;this.duration<=0?kt(e,this.errContext):(null!==this.timeoutId&&clearTimeout(this.timeoutId),this.timeoutId=setTimeout((function(){t.timeoutId=null,kt(e,t.errContext)}),this.duration))},e}();function kt(e,t){try{e()}catch(e){throw"Debounce - "+t+"\n"+(e.message?e.message:e)}}function Pt(e){return e}var $t,Ot,jt,At,Rt,Vt,Et,St,Tt,Ft,Ht,Mt=function(){function n(){}return e([R(S),t("design:type",String)],n.prototype,"name",void 0),e([R(F),t("design:type",Number)],n.prototype,"modelYear",void 0),e([R(M),t("design:type",Boolean)],n.prototype,"electric",void 0),e([R(S),t("design:type",String)],n.prototype,"color",void 0),n=e([A],n)}(),Kt=["WH","BK","RD","BL"],Xt={WH:"white",BK:"black",RD:"red",BL:"blue"},Lt=($t={},Ot=["class","lbl"],jt=["type","text"],At=["class","lbl"],Rt=["type","number"],Vt=["class","color"],Et=["type","radio"],St=[" ",""," "],Tt=["type","checkbox"],Ft=[14],Ht=function(){function n(){this.ΔΔclassName=""}return n.prototype.ΔDefault=function(e){switch(e){case"className":return""}return at},e([nt(it(Mt)),t("design:type",Mt)],n.prototype,"data",void 0),e([nt(ot),t("design:type",String)],n.prototype,"className",void 0),n=e([tt],n)}(),ke("carEditor",".../forms1/forms1.ts",$t,(function(e,t,n,i){var o,r,a=n.data,s=n.className,d=0,l=$e(e,0,20);Ee(e,l,0,0,"div",1),ze(e,0,0,"class",Fe(e,0,"car editor "+s)),Ee(e,l,1,1,"div",1),Ee(e,l,2,2,"div",1,0,Ot),Te(e,l,0,3,3,0," Name: ",0),Ee(e,l,4,2,"input",0,0,jt),Je(e,l,0,5,4,"value",It,2),qe(e,l,0,5,0,0,a,"name"),Qe(e,l,0,5),Ee(e,l,6,1,"div",1),Ee(e,l,7,2,"div",1,0,At),Te(e,l,0,8,3,0," Model Year: ",0),Ee(e,l,9,2,"input",0,0,Rt),Je(e,l,0,10,9,"value",It,2),qe(e,l,0,10,0,0,a,"modelYear"),Qe(e,l,0,10),Ee(e,l,11,1,"div",1),Ee(e,l,12,2,"div",1,0,Vt),Te(e,l,0,13,3,0," Color: ",0),Ke(e,l,14,2,1);for(var c=0,f=Kt;c<f.length;c++){var u=f[c];Ee(o=Oe(e,0,14,4,++d),r=o.cm,0,0,"label",1),Ee(o,r,1,1,"input",0,0,Et),ze(o,0,1,"value",Fe(o,0,u)),Je(o,r,0,2,1,"value",It,2),qe(o,r,0,2,0,0,a,"color"),Qe(o,r,0,2),Te(o,r,0,3,1,0,St,1,Me(o,0,r?Xt[u]:Pe)),Ve(o)}Ee(e,l,15,1,"div",1),Ee(e,l,16,2,"label",1),Ee(e,l,17,3,"input",0,0,Tt),Je(e,l,0,18,17,"value",It,2),qe(e,l,0,18,0,0,a,"electric"),Qe(e,l,0,18),Te(e,l,0,19,3,0," electric ",0),Ve(e,0,Ft)}),Ht)),zt=function(){var n={},i=["class","summary"],o=["class","title"],r=[" Car name: ",""," "],a=[" Model year: ",""," "],s=[" Color code: ",""," "],d=[" Electric: ",""," "],l=["class","columns"],c=["className","col1"],f=["className","col2"],u=function(){function n(){}return e([nt(it(Mt)),t("design:type",Mt)],n.prototype,"data",void 0),n=e([tt],n)}();return ke("main",".../forms1/forms1.ts",n,(function(e,t,n){var u=n.data,v=$e(e,0,15);!function(e,t,n,i){if(t){var o={kind:"#fragment",uid:"fra"+ ++ne,idx:n,parentIdx:-1,ns:"",domNode:void 0,attached:!0,nextSibling:void 0,firstChild:void 0,lastChild:void 0,contentView:null};e.nodes[n]=o;var r=e.cmAppends[i];r(o,!1),e.cmAppends[i+1]=function(e,t){r(e,!0),t||Se(o,e)}}}(e,v,0,0),Ee(e,v,1,1,"div",1,0,i),Ee(e,v,2,2,"div",1,0,o),Te(e,v,0,3,3,0," Summary ",0),Ee(e,v,4,2,"div",1),Te(e,v,0,5,3,0,r,1,Fe(e,0,u.name)),Ee(e,v,6,2,"div",1),Te(e,v,0,7,3,0,a,1,Fe(e,1,u.modelYear)),Ee(e,v,8,2,"div",1),Te(e,v,0,9,3,0,s,1,Fe(e,2,u.color)),Ee(e,v,10,2,"div",1),Te(e,v,0,11,3,0,d,1,Fe(e,3,u.electric)),Ee(e,v,12,1,"div",1,0,l),Xe(e,v,0,13,2,Fe(e,4,Lt),0,0,c),We(e,v,0,13,"data",Fe(e,5,u)),Le(e,13),Xe(e,v,0,14,2,Fe(e,6,Lt),0,0,f),We(e,v,0,14,"data",Fe(e,7,u)),Le(e,14),Ve(e)}),u)}(),Wt=new Mt;Wt.name="Ford Model T",Wt.modelYear=1908,Wt.electric=!1,Wt.color="BK",zt().attach(document.body).render({data:Wt})}();
