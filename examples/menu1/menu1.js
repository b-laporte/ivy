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
    ***************************************************************************** */function e(e,t,n,i){var o,r=arguments.length,a=r<3?t:null===i?i=Object.getOwnPropertyDescriptor(t,n):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(e,t,n,i);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(r<3?o(a):r>3?o(t,n,a):o(t,n))||a);return r>3&&a&&Object.defineProperty(t,n,a),a}function t(e,t){if("object"==typeof Reflect&&"function"==typeof Reflect.metadata)return Reflect.metadata(e,t)}var n="ΔTrackable",i="ΔChangeVersion",o="ΔFactory",r="ΔDefFactories",a="ΔIsFactory",s="ΔΔProxy",d="ΔIsProxy",c="ΔDefault",l="ΔCreateProxy",f="ΔnewItem",u="Δdispose",v="Δjson",h=!1;function p(e){return e&&e.ΔTrackable?e.ΔMd?e.ΔMd:e.ΔMd={parents:void 0,refreshCtxt:void 0,watchers:void 0}:null}var m=Array.isArray;function g(e,t){e&&(m(e)&&!e[d]?e.forEach(t):t(e))}function w(e,t){if(e&&t){if(e===t)return;if(m(e)){var n=e;if(1===n.length){if(n[0]===t)return}else{var i=n.indexOf(t);if(i>-1)return n.splice(i,1),1===n.length?n[0]:n}}}return e}function y(e,t){return e?m(e)&&!e[d]?(e.push(t),e):[e,t]:t}function b(e){return e&&!0===e[n]?e[i]:0}function N(e,t){if(void 0===t&&(t=!1),I(e)){e[u]?e[u](t):x(e,(function(n,i){q(e,i),e["ΔΔ"+n]=void 0,t&&N(i,!0)}));var n=e.ΔMd;if(n){var i=[];g(n.parents,(function(e){i.push(e)}));for(var o=function(t){x(t,(function(n,i){i===e&&(q(t,e),t["ΔΔ"+n]=void 0)})),_(t)},r=0,a=i;r<a.length;r++){o(a[r])}}}}function x(e,t){if(I(e)){var n=e.constructor.prototype["ΔDefFactories"];for(var i in n)n.hasOwnProperty(i)&&t(i,e["ΔΔ"+i],n[i])}}function C(e,t){return!(!e||"object"!=typeof e)&&"ΔΔ"+t in e}function I(e){return!(!e||!0!==e[n])}function k(e){return b(e)%2==1}function D(e,t){var n=p(e);return n&&t?(n.watchers=y(n.watchers,t),k(e)&&Z.register(e),t):null}function P(e,t){var n=e?e.ΔMd:void 0;n&&t&&(n.watchers=w(n.watchers,t))}function V(e,t){if(e&&void 0!==t){if(e[f])return e[f](t);h=!0;var n=e[t];return h=!1,n}}function A(e,t){if(e&&t){var n=e[c];if(n){var i=n(t);if(i!==L)return e[t]=i}var o=e[r],a=o?o[t]:null;if(a)return e[t]=a()}}var j=function(){var e,t,n=[],i=[],o={getDefaultConversion:function(){return r(e,o)},getPreviousConversion:function(){return e.ΔtoJsResult}};function r(e,n){var i=n.getPreviousConversion();if(i)return i;var o=void 0;if(e.Δconvert)o=e.Δconvert(t);else{if(e["Δjson"])return e["Δjson"];o={},x(e,(function(e,n){I(n)&&(n=a(n,t)),void 0!==n&&(o[e]=n)}))}return o}function a(a,s){var d=0===n.length,c=a;if(a&&I(a)&&(n.push(a),c=void 0,i.push(a),e=a,s?(t=s,c=s(a,o)):c=r(a,o),a.ΔtoJsResult=c,i.pop(),e=i[i.length-1]),d){for(var l=n.length;l--;)n[l]["ΔtoJsResult"]=void 0;e=null,n=[],t=void 0}return c}return a}();function $(e){var t=e.prototype;t[n]=!0,t[i]=0}function O(e,t){return e||(e=z,t=3),function(n,i){var o="ΔΔ"+i,a=n[r];a||(a=n[r]={}),a[i]=t?1===t?z:K:e,n[o]=void 0,function(e,t,n,i){i&&delete e[t]&&Object.defineProperty(e,t,i)}(n,i,0,{get:function(){return function(e,t,n,i,o){e.ΔComputeDependencies&&(e.ΔComputeDependencies[n]=!0);!h&&e[v]&&function(e,t){var n,i;t&&x(e,(function(o,r,a){var s=a===J;if(n=t[o],i="ΔΔ"+o,void 0===n)s&&(e[i]=void 0);else{var d=typeof n;if(null===n)(s||a===X)&&(e[i]=null);else if("object"===d){var c=V(e,o);c?c[v]=n:s&&(e[i]=n)}else"string"===d?(s||a===F)&&(e[i]=n):"number"===d?(s||a===E)&&(e[i]=n):"boolean"===d?(s||a===M)&&(e[i]=n):s&&(e[i]=n)}})),e[v]=void 0}(e,e[v]);var r=e[t];(void 0===r||h&&null===r)&&(r=e[t]=!h&&o?o>1?void 0:null:i(),U(e,r));return r}(this,o,i,e,t)},set:function(t){W(this,i,o,t,e,this)},enumerable:!0,configurable:!0})}}var L={};function R(e){if(!e)return z;var t=e.ΔFactory;if(t)return t;function n(){return new e}return n[a]=!0,e[o]=n,n}function S(){return""}S[a]=!0;var F=S;function T(){return 0}T[a]=!0;var E=T;function H(){return!1}H[a]=!0;var M=H;function z(){return null}z[a]=!0;var X=z;function K(){}K[a]=!0;var J=K;function W(e,t,n,i,o,r){var a=I(i),s=o===J;if(!e.ΔComputeDependencies){i&&!a&&o.ΔCreateProxy&&(a=I(i=o.ΔCreateProxy(i)||i));var d=!1,c=r[n];return k(e)?d=c!==i:c!==i&&(_(e),d=!0),d&&(a&&void 0===i&&(i=null),(a||c&&I(c))&&function(e,t,n,i){q(e,t),i||U(e,n)}(e,c,i,s),r[n]=i,B(e,"set",t,c,i)),i}console.error("[Trax] @computed properties must not mutate the Data object when calculated")}function B(e,t,n,i,o){var r=e?e.ΔMd:void 0;if(r&&r.trackers){var a=e[s]||e;g(r.trackers,(function(e){e(a,t,n,i,o)}))}}function _(e){if(I(e)){var t=!0;if(k(e)?t=!1:e.ΔChangeVersion+=1,Z.register(e),t){var n=e.ΔMd;n&&n.parents&&g(n.parents,(function(e){_(e)}))}}}function q(e,t){if(t){var n=t.ΔMd;n&&n.parents&&(n.parents=w(n.parents,e))}}function U(e,t){if(t){var n=p(t);n&&(n.parents=y(n.parents,e))}}var Y=0,G=function(){function e(){this.id=++Y}return e.prototype.register=function(e){var t=this,n=p(e);n&&!n.refreshCtxt&&(this.objects?this.objects.push(e):(this.objects=[e],Promise.resolve().then((function(){t.refresh()}))),n.refreshCtxt=this)},e.prototype.refresh=function(e){void 0===e&&(e=!0);var t=this.objects,n=t?t.length:0;if(n){ee();for(var i,o,r=[],a=0;n>a;a++)(o=(i=t[a]).ΔMd).refreshCtxt&&(i.ΔChangeVersion%2&&(i.ΔChangeVersion+=1),o.refreshCtxt&&o.watchers&&r.push({dataNode:i,watchers:o.watchers})),o.refreshCtxt=void 0;this.objects=void 0,r.length&&(e?Q(r):Promise.resolve().then((function(){Q(r)})))}},e}();function Q(e){for(var t=function(e){g(e.watchers,(function(t){t(e.dataNode)}))},n=0,i=e;n<i.length;n++){t(i[n])}}var Z=new G;function ee(){Z.objects&&(Z=new G)}var te=["push","pop","shift","unshift","splice"],ne=/^\d+$/,ie=/^\Δ/,oe=function(){function e(e){this.ΔTrackable=!0,this.ΔDataFactory=!0,this.ΔChangeVersion=0,this.ΔMd=void 0,this.ΔΔSelf=this,this.ΔIsProxy=!1,this.ΔItemFactory=e}return e.ΔNewProxy=function(t){var n=new Proxy([],new e(t));return n[s]=n,n},e.ΔCreateProxy=function(t,n){if(m(t)){var i=new Proxy(t,new e(n)),o=t.length;for(_(i);o--;)U(i,t[o]);return i}return null},e.prototype.ΔnewItem=function(e){var t=this.ΔItemFactory();return void 0===e&&(e=this.ΔΔList.length),e>-1&&W(this.ΔΔSelf,e,e,t,this.ΔItemFactory,this.ΔΔList),t},e.prototype.Δdispose=function(e){void 0===e&&(e=!1);for(var t,n=this.ΔΔList,i=n.length;i--;)t=n[i],q(this.ΔΔSelf,t),n[i]=void 0,e&&N(t,!0);return n},e.prototype.Δconvert=function(e){for(var t=[],n=this.ΔΔList,i=n.length;i--;)t[i]=j(n[i],e);return t},e.prototype.ΔToString=function(){return"Trax List ["+this.ΔΔList.join(", ")+"]"},e.prototype.ΔinitFromJson=function(){var e=this["Δjson"];if(e){if(e.constructor!==Array)console.error("[Trax] Invalid json type: Lists can only be initialized from Arrays");else for(var t=e.length,n=void 0,i=this.ΔΔList,o=void 0;t--;)if(o=n=e[t],n){var r=this.ΔItemFactory();I(r)&&(r["Δjson"]=n,o=r),i[t]=o}else null===n&&(i[t]=null);this["Δjson"]=void 0}},e.prototype.set=function(e,t,n){if(this.ΔΔList||(this.ΔΔList=e),t.match(ne)){var i=parseInt(t,10);W(this.ΔΔSelf,i,i,n,this.ΔItemFactory,this.ΔΔList)}else t.match(ie)&&(this[t]=n);return!0},e.prototype.get=function(e,t){if(this.ΔΔList||(this.ΔΔList=e),t===d)return!0;var n=typeof t;if(this["Δjson"]&&this.ΔinitFromJson(),"string"===n){if(t.match(ie))return this[t];if(t.match(ne))return this.ΔΔList[parseInt(t,10)];if("length"===t)return this.ΔΔList.length;if("push"===t)return function(){for(var t=[],n=0;n<arguments.length;n++)t[n]=arguments[n];for(var i=this,o=t.length,r=i.ΔΔList.length,a=0;o>a;a++)i.set(e,r+a+"",t[a])};if("toString"===t)return this.ΔToString;if("function"==typeof e[t])return function(){var e=this,n=te.indexOf(t)>-1;if(n){_(e);for(var i=e.ΔΔList,o=0;i.length>o;o++)q(e,i[o])}var r=e.ΔΔList,a=r[t].apply(r,arguments);if(n){for(i=e.ΔΔList,o=0;i.length>o;o++)U(e,i[o]);B(this,t)}return a}}return t===Symbol.iterator?this.ΔΔList[Symbol.iterator]:this[t]},e}();var re=function(e){function t(){return oe.ΔNewProxy(e)}return e=e||X,t[a]=!0,t[l]=function(t){return oe.ΔCreateProxy(t,e)},t},ae=function(){function e(e){this.ΔTrackable=!0,this.ΔDataFactory=!0,this.ΔChangeVersion=0,this.ΔMd=void 0,this.ΔΔSelf=this,this.ΔIsProxy=!1,this.ΔItemFactory=e}return e.ΔNewProxy=function(t){var n=new Proxy({},new e(t));return n[s]=n,n},e.ΔCreateProxy=function(t,n){if("object"==typeof t){var i=new Proxy(t,new e(n));for(var o in _(i),t)t.hasOwnProperty(o)&&U(i,t[o]);return i}return null},e.prototype.ΔnewItem=function(e){var t=this.ΔItemFactory();return W(this.ΔΔSelf,e,e,t,this.ΔItemFactory,this.ΔΔDict)},e.prototype.Δdispose=function(e){void 0===e&&(e=!1);var t,n=this.ΔΔDict;for(var i in n)n.hasOwnProperty(i)&&(t=n[i],q(this.ΔΔSelf,t),n[i]=void 0,e&&N(t,!0));return n},e.prototype.Δconvert=function(e){var t={},n=this.ΔΔDict;for(var i in n)n.hasOwnProperty(i)&&(t[i]=j(n[i],e));return t},e.prototype.ΔinitFromJson=function(){var e=this["Δjson"];if(e){if(e.constructor!==Object)console.error("[Trax] Invalid json type: Dictionaries can only be initialized from Objects");else{var t=this.ΔΔDict,n=void 0,i=void 0;for(var o in e)if(e.hasOwnProperty(o))if(i=n=e[o],n){var r=this.ΔItemFactory();I(r)&&(r["Δjson"]=n,i=r),t[o]=i}else null===n&&(t[o]=null)}this["Δjson"]=void 0}},e.prototype.ΔToString=function(){return"Trax Dict {...}"},e.prototype.set=function(e,t,n){return this.ΔΔDict||(this.ΔΔDict=e),t.match(ie)?this[t]=n:W(this.ΔΔSelf,t,t,n,this.ΔItemFactory,this.ΔΔDict),!0},e.prototype.get=function(e,t){return this.ΔΔDict||(this.ΔΔDict=e),t===d||(this["Δjson"]&&this.ΔinitFromJson(),t===Symbol.iterator?this.ΔΔDict[Symbol.iterator]:"string"===typeof t?t.match(ie)?this[t]:this.ΔΔDict[t]:this[t])},e.prototype.deleteProperty=function(e,t){return this.ΔΔDict||(this.ΔΔDict=e),!t.match(ie)&&(W(this.ΔΔSelf,t,t,null,this.ΔItemFactory,this.ΔΔDict),delete this.ΔΔDict[t],!0)},e}();function se(e){function t(){return ae.ΔNewProxy(e)}return e=e||X,t[a]=!0,t[l]=function(t){return ae.ΔCreateProxy(t,e)},t}var de=0,ce={log:function(e){for(var t=[],n=1;n<arguments.length;n++)t[n-1]=arguments[n];console.log.apply(console,arguments)},error:function(e){for(var t=[],n=1;n<arguments.length;n++)t[n-1]=arguments[n];console.error.apply(console,arguments)}};function le(e,t){for(var n=e,i=[];n;){if(n.template){var o=n.template;i.push('\n>> Template: "'+o.templateName+'" - File: "'+o.filePath+'"')}n=n.parentView}ce.error("IVY: "+t+i.join(""))}var fe=void 0,ue=11,ve="$api",he=/^ΔΔ(\w+)Emitter$/,pe=/^ΔΔ(.+)$/,me="ΔIsAPI",ge="ΔIsController",we=0,ye=function(){function e(e,t,n,i,o,r){this.templateName=e,this.filePath=t,this.staticCache=n,this.renderFn=i,this.$Class=o,this.$contextIdentifiers=r,this.kind="$template",this._uid=++we,this.tplApi=void 0,this.tplCtl=void 0,this.forceRefresh=!1,this.activeWatch=!1,this.lastRefreshVersion=0,this.processing=!1,this.rendering=!1,this.initialized=!1,this.labels=void 0,this.hasCtlClass=!1,this.$contextInitialized=!1,this.view=Ie(null,null,1,this);var a=this;this.watchCb=function(){a.notifyChange()},this.watchCb.$templateId=this._uid,this.$Class!==fe&&(ht(this.$Class,ge)?this.hasCtlClass=!0:ht(this.$Class,me)||I(this.$Class.prototype)||le(this.view,"Type of $ argument must be either a @Controller, an @API or a @Data class"))}return e.prototype.dispose=function(e){void 0===e&&(e=!0);var t=this.view;this.disconnectObserver(),Ne(t,this.tplCtl,"$dispose",this.templateName),e&&t&&t.nodes&&t.nodes.length&&(at(t,t.nodes[0]),t.anchorNode&&(t.rootDomNode.removeChild(t.anchorNode),t.anchorNode=null))},Object.defineProperty(e.prototype,"uid",{get:function(){return this._uid},enumerable:!0,configurable:!0}),Object.defineProperty(e.prototype,"document",{get:function(){return this.view.doc},set:function(e){this.view.doc=e},enumerable:!0,configurable:!0}),Object.defineProperty(e.prototype,"api",{get:function(){if(!this.tplApi)if(this.hasCtlClass){var e=this.controller;e&&e.$api&&(this.tplApi=e.$api)}else this.$Class?(this.tplApi=new this.$Class,be(this.view,this.tplApi,this.staticCache)):this.$contextIdentifiers?this.tplApi=function(e){return void 0!==e?(t[a]=!0,se(t)()):se()();function t(){return new e}}():this.tplApi={};return this.tplApi},enumerable:!0,configurable:!0}),Object.defineProperty(e.prototype,"controller",{get:function(){if(!this.tplCtl&&this.hasCtlClass){var e=this.tplCtl=new this.$Class;if(C(e,"$template")&&(e.$template=this),C(e,"$logger")){var t=this.view;e.$logger={log:ce.log,error:function(e){for(var n=[],i=1;i<arguments.length;i++)n[i-1]=arguments[i];le(t,e+(n.length?" "+n.join(" "):""))}}}e[ve]&&be(this.view,e[ve],this.staticCache)}return this.tplCtl},enumerable:!0,configurable:!0}),e.prototype.attach=function(e){if(this.view.rootDomNode)le(this.view,"Template host cannot be changed once set");else{var t=this.view;if(!t.doc)throw new Error("[iv] Template.document must be defined before calling Template.attach()");t.rootDomNode=e,t.anchorNode=t.doc.createComment("template anchor"),pt(t.anchorNode,e)}return this},e.prototype.registerLabel=function(e,t){this.labels||(this.labels={});var n=this.labels[e];n?n.push(t):n=this.labels[e]=[t]},e.prototype.query=function(e,t){if(void 0===t&&(t=!1),this.rendering)return null;for(var n=[],i=0,o=e.split(";");i<o.length;i++){var r=o[i];if(r&&"#"!==r.charAt(0))return le(this.view,"[$template.query()] Invalid label argument: '"+r+"' (labels must start with #)"),null;var a=this.labels&&this.labels[r]||null;if(a&&a.length){if(!t)return a[0];n=n.concat(a)}}return n.length?n:null},e.prototype.notifyChange=function(){this.render()},e.prototype.disconnectObserver=function(){this.activeWatch&&(P(this.api,this.watchCb),P(this.controller,this.watchCb),this.activeWatch=!1)},e.prototype.render=function(e,t){if(void 0===t&&(t=!1),this.processing)return this;t&&(this.forceRefresh=!0),this.processing=!0;var n=this.api,i=this.controller,o=this.view,r=this.$contextIdentifiers;i&&!I(i)&&(le(o,"Template controller must be a @Controller Object - please check: "+this.$Class.name),this.tplCtl=this.$Class=void 0);var a=!1;if(n&&e)if(r!==fe){var s=e.context;s!==fe&&"object"==typeof s&&(a=!0)}else for(var d in k(n)||ee(),this.disconnectObserver(),e)e.hasOwnProperty(d)&&(n[d]=e[d]);if(this.$contextInitialized&&(a=!0),a){var c="",l=(e?e.context:null)||n.$context;if(l){for(var f=0;r.length>f;f++)n[c=r[f]]=l[c];n.$context=l,this.$contextInitialized=!0}}r===fe||this.$contextInitialized||le(o,"Missing $fragment context");var u=!this.forceRefresh,v=o.nodes;if(v&&v[0]&&v[0].attached||(u=!1),u&&b(n)+b(i)>this.lastRefreshVersion&&(u=!1),!u){i&&(this.initialized||(Ne(o,i,"$init","controller"),this.initialized=!0),Ne(o,i,"$beforeRender","controller")),this.rendering=!0,this.labels=void 0,o.lastRefresh++,o.instructions=void 0;try{this.renderFn(o,this.hasCtlClass?i:n,n,this)}catch(e){le(o,"Template execution error\n"+(e.message||e))}this.rendering=!1,i&&Ne(o,i,"$afterRender","controller"),function(e,t){if(void 0===t&&(t=!1),e){var n=e.ΔMd;n&&n.refreshCtxt?n.refreshCtxt.refresh(!0):t&&ee()}}(n),this.forceRefresh=!1,this.lastRefreshVersion=b(n)+b(i)}return this.activeWatch||(D(n,this.watchCb),i&&D(i,this.watchCb),this.activeWatch=!0),this.processing=!1,this},e}();function be(e,t,n){var i=n.events;if(void 0===i){var o=void 0;for(var r in t)if(r.match(he)){var a=RegExp.$1;o||(o=[]),"function"!=typeof t[a+"Emitter"].init?le(e,"Invalid EventEmitter: "+a+"Emitter"):(o.push(a+"Emitter"),o.push(a),t[a+"Emitter"].init(a,t))}n.events=o||null}else if(null!==i)for(var s=i.length,d=0;s>d;d+=2)t[i[d]].init(i[d+1],t)}function Ne(e,t,n,i){if(t&&"function"==typeof t[n]){var o=void 0;try{void 0!==(o=t[n]())&&"function"==typeof o.catch&&o.catch((function(t){le(e,i+" "+n+" hook execution error\n"+(t.message||t))}))}catch(t){le(e,i+" "+n+" hook execution error\n"+(t.message||t))}}}function xe(e,t){return(t=t||this.namespace)?this.doc.createElementNS(t,e):this.doc.createElement(e)}function Ce(){return function(e){if(e!==fe&&null!==e){var t=!0;return gt(e,!1,(function(e){if(!t)return!1;var n=e.kind;if("#view"===n){var i=e;if(i.cm){var o=i.doc.createDocumentFragment();i.domNode=o,i.cmAppends=[function(e){e.domNode?pt(e.domNode,o):e.domNode=o}]}Re(i)}else if("#element"===n||"#text"===n)return t=!1;return!0})),t}return!0}(this)}function Ie(e,t,n,i){var o={kind:"#view",uid:"view"+ ++de,attached:!1,nodes:null,namespace:void 0,namespaces:void 0,doc:null,parentView:e,cm:!0,cmAppends:null,lastRefresh:0,container:null,projectionHost:null,template:i,rootDomNode:null,anchorNode:null,expressions:void 0,oExpressions:void 0,instructions:void 0,paramNode:void 0,createElement:xe,isEmpty:Ce};return e?De(o,e,t):o.doc="undefined"!=typeof document?document:null,o}function ke(e,t,n){if(n){var i=function(e){var t=e;for(;t&&!t.template;)t=t.parentView;return t}(e);if(i!==fe&&null!==i)for(var o=i.template,r=n.length,a=0;r>a;a++)o.registerLabel(n[a],t)}}function De(e,t,n){if(e.parentView=t,e.doc=t.doc,e.container=n,e.rootDomNode=t.rootDomNode,t.namespace){var i=t.namespace;e.namespace=i,e.namespaces=[i]}}function Pe(e,t,n,i,o,r){return function(){return new ye(e,t,n,i,o,r)}}var Ve=[];function Ae(e,t,n){var i=e.cm;return i?(e.nodes=new Array(n),e.cmAppends||(e.cmAppends=[],e.anchorNode&&(e.cmAppends[0]=function(t,n){t.domNode?mt(t.domNode,e.anchorNode,e.rootDomNode):t.domNode=e.rootDomNode}))):e.cmAppends=null,i}function je(e,t,n,i,o){var r,a=e.nodes[n];if(a&&a.attached||le(e,"Invalid ζview call: container must be attached ("+(a?a.uid:"XX")+") - pview: "+e.uid+" containerIdx: "+n),"#container"===a.kind)if("##block"===a.subKind){var s=(d=a).views;1===o&&(d.insertFn=null),1===o&&d.views.length>1?(d.previousNbrOfViews=s.length,r=s.shift(),d.viewPool.length?d.viewPool=s.concat(d.viewPool):d.viewPool=s,d.views=[r]):(r=d.views[o-1])||(d.viewPool.length>0?(d.insertFn||(d.insertFn=Se(e,d)),Te((r=s[o-1]=d.viewPool.shift()).nodes[0],d.insertFn),r.attached=!0):((r=s[o-1]=Ie(e,d)).nodes=new Array(i),e.cm&&d.cmAppend?r.cmAppends=[d.cmAppend]:e.cm||(r.cmAppends=[Se(e,d)]))),d.lastRefresh=r.lastRefresh=e.lastRefresh}else{var d;(r=(d=a).contentView)||((r=d.contentView=Ie(e,d)).nodes=new Array(i)),r.lastRefresh=e.lastRefresh}else if("#param"===a.kind){var c=a;(r=c.contentView)||(r=c.contentView=Ie(e,null),c.viewPool&&(c.viewPool[c.viewInstanceIdx]=r),r.nodes=new Array(i),r.paramNode=c),r.lastRefresh=e.lastRefresh}return r}function $e(e,t,n,i,o,r){var a=r||je(e,0,n,i,o);if(1===t)a.instructions=[];else{for(var s=a,d=t-1;d>0;)s=s.parentView,d--;s.instructions||(s.instructions=[]),a.instructions=s.instructions}return a.cm&&!a.cmAppends&&Le(a,Oe,[a,e,n]),a}function Oe(e,t,n){var i=t.nodes[n];"#container"===i.kind&&!e.cmAppends&&i.cmAppend&&(e.cmAppends=[i.cmAppend])}function Le(e,t,n){e.instructions.push(t),e.instructions.push(n)}function Re(e){if(e.instructions){var t=e.instructions.slice(0),n=t.length;if(e.instructions.splice(0,n),e.instructions=void 0,n)for(var i=0;n>i;i+=2)t[i].apply(null,t[i+1])}}function Se(e,t){var n=function e(t,n){for(;;){if(n||le(t,"Internal error - findNextSiblingDomNd: nd cannot be undefined"),0===n.idx){if(!n.attached)return{position:"defer",parentDomNd:void 0};if(n.domNode.nodeType===ue)return{position:"lastChild",parentDomNd:n.domNode};var i=t.parentView;if(i){if(t.projectionHost){var o=t.projectionHost.hostNode;return"#element"===o.kind?{position:"lastChild",parentDomNd:o.domNode}:e(t.projectionHost.view,o)}if(t.container&&"##block"===t.container.subKind){var r=t.container,a=r.views.indexOf(t);if(a>-1)for(var s=void 0,d=void 0,c=a+1;c<r.views.length;c++)if((s=r.views[c]).nodes&&s.nodes.length&&(d=m(s,s.nodes[0],r.domNode)))return d;for(var l=r.viewPool,f=void 0,u=0,v=l;u<v.length;u++){if((s=v[u]).nodes&&s.nodes.length&&s.attached&&(f=m(s,s.nodes[0],r.domNode)))return f}}return e(i,t.container)}return{position:"lastOnRoot",parentDomNd:t.rootDomNode,nextDomNd:t.anchorNode}}if(!n.nextSibling){var h=t.nodes[n.parentIdx];return"#element"===h.kind?{position:"lastChild",parentDomNd:rt(t,n)}:e(t,h)}var p=m(t,n.nextSibling,rt(t,n));if(p)return p;n=n.nextSibling}function m(e,t,n){if(!t)return null;if("#element"===t.kind||"#text"===t.kind)return{position:"beforeChild",nextDomNd:t.domNode,parentDomNd:n};if("#fragment"===t.kind){for(var i=void 0,o=t.firstChild;o;){if(i=m(e,o,n))return i;o=o.nextSibling}if(t.contentView){var r=t.contentView;if(r.nodes)return m(r,r.nodes[0],n)}return null}if("#container"===t.kind){var a=t;i=null;if("##block"===a.subKind)for(var s=a.views,d=s.length,c=0;d>c&&!(i=m(s[c],s[c].nodes[0],n));c++);else if("##cpt"===a.subKind){var l=a.template.view;i=m(l,l.nodes[0],n)}return i||null}throw new Error("TODO findFirstDomNd: "+t.kind)}}(e,t),i=n.position,o=n.nextDomNd,r=n.parentDomNd;return"beforeChild"===i||"lastOnRoot"===i?function(e,t){e.domNode?mt(e.domNode,o,r):e.domNode=r}:"lastChild"===i?function(e,t){e.domNode?pt(e.domNode,r):e.domNode=r}:function(){console.warn("TODO: VALIDATE VIEW APPEND: ",i),function(e,t,n){void 0===t&&(t="");n&&e.uid!==n||(console.log(""),console.log(wt),t&&console.log(t+":"),function e(t,n){void 0===n&&(n="");if(!t.nodes)return void console.log(""+n+t.uid+" - no nodes");var i=t.parentView?t.parentView.uid:"XX",o=t.projectionHost,r=o?" >>> projection host: "+o.hostNode.uid+" in "+o.view.uid:"";console.log(n+"*"+t.uid+"* cm:"+t.cm+" isTemplate:"+(void 0!==t.template)+" parentView:"+i+r);for(var a,s=t.nodes.length,d="",c=0;s>c;c++)if(a=t.nodes[c])if(d=a.uid.length<5?["     ","    ","   ","  "," "][a.uid.length]:"","#container"===a.kind){var l=a,f=l.domNode?l.domNode.uid:"XX";if(console.log(n+"["+c+"] "+a.uid+d+" "+f+" attached:"+(a.attached?1:0)+" parent:"+C(a.parentIdx)+" nextSibling:"+(a.nextSibling?a.nextSibling.uid:"X")),"##block"===l.subKind){var u=l,v=u.views.length;if(v)for(var h=0;v>h;h++)if(u.views[h]){var p=u.views[h];f=p.rootDomNode?p.rootDomNode.$uid:"XX",console.log(n+"  - view #"+h),e(u.views[h],"    "+n)}else console.log(n+"  - view #"+h+" UNDEFINED");else console.log(n+"  - no child views")}else if("##cpt"===l.subKind){var m=l,g=m.template,w=m.contentView;w?(console.log(n+"  - light DOM:"),e(w,"    "+n)):console.log(n+"  - light DOM: none"),g?(console.log(n+"  - shadow DOM:"),e(g.view,"    "+n)):console.log(n+"  - no template")}else console.log(n+"  - "+l.subKind+" container")}else{f=a.domNode?a.domNode.uid:"XX";var y="";if(a.domNode&&"#text"===a.kind)y=" text=#"+a.domNode._textContent+"#";else if("#fragment"===a.kind||"#element"===a.kind){for(var b=[],N=a.firstChild;N;)b.push(N.uid),N=N.nextSibling;y=" children:["+b.join(", ")+"]";var x=a.contentView;x&&(y+=" >>> content view: "+x.uid)}console.log(n+"["+a.idx+"] "+a.uid+d+" "+f+" attached:"+(a.attached?1:0)+" parent:"+C(a.parentIdx)+" nextSibling:"+(a.nextSibling?a.nextSibling.uid:"X")+y)}else console.log(n+"["+c+"] XX");function C(e){return e<0?"X":e}}(e))}(e,"getViewInsertFunction for "+t.uid)}}function Fe(e,t,n){var i=e.nodes[t];if(i&&"##block"===i.subKind){var o=i,r=o.lastRefresh;if(n||r===e.lastRefresh){var a=o.views.length;if(!n){if(a!==o.previousNbrOfViews)for(var s=o.viewPool,d=s.length,c=void 0,l=0;d>l;l++)at(c=s[l],c.nodes[0]),c.attached=!1;o.previousNbrOfViews=a}}else at(e,o)}}function Te(e,t,n){if(!e.attached){if(t(e,!0),e.attached=!0,"#fragment"===e.kind)for(var i=e.firstChild;i;)Te(i,t),i=i.nextSibling;else if("#container"===e.kind){var o=e.subKind;if("##cpt"===o){var r=e.template,a=r?r.view.nodes[0]:null;r&&(r.forceRefresh=!0),a&&(Te(a,t),r.view.attached=!0)}else if("##block"===o)for(var s=e.views,d=0;s.length>d;d++)Te(s[d].nodes[0],t),s[d].attached=!0}if("#fragment"===e.kind||"#element"===e.kind){var c=e.contentView;c&&(Te(c.nodes[0],t),c.attached=!0)}}}function Ee(e,t,n){if(n)for(var i=n.length,o=0;i>o;o++)Fe(e,n[o],e.cm);e.cm&&(e.cm=!1,e.cmAppends=null)}function He(e,t,n){if(e.paramNode){var i=e.paramNode;i.dataHolder?(Le(e,Ee,[e,t,n]),i.data&&"#view"!==i.data.kind?i.data?i.data.$content=e:console.warn("TODO: ζendD no data"):i.dataHolder[i.dataName]=e):le(e,"ζendD dataHoler should be defined")}else Le(e,Ee,[e,t,n])}function Me(e,t,n,i,o,r,a,s,d){if(t){var c=e.createElement(o);if(s)for(var l=s.length,f=0;l>f;f+=2)c.setAttribute(s[f],s[f+1]);if(d){l=d.length;for(var u=0;l>u;u+=2)c[d[u]]=d[u+1]}var v={kind:"#element",uid:"elt"+ ++de,idx:n,parentIdx:-1,ns:"",domNode:c,attached:!0,nextSibling:void 0,firstChild:void 0,lastChild:void 0,contentView:null};e.nodes[n]=v,ke(e,c,a),e.cmAppends[i](v,!1),r&&(e.cmAppends[i+1]=function(e,t){e.domNode?pt(e.domNode,c):e.domNode=c,t||ze(v,e)})}else a&&ke(e,e.nodes[n].domNode,a)}function ze(e,t){e.firstChild?(e.lastChild.nextSibling=t,e.lastChild=t):(e.firstChild=e.lastChild=t,t.nextSibling=void 0),t.parentIdx=e.idx}function Xe(e,t,n,i,o,r,a,s){for(var d,c=[],l=8;l<arguments.length;l++)c[l-8]=arguments[l];if(s){var f=void 0,u=void 0,v=!1;f=t?a.slice(0):(d=e.nodes[i]).pieces;for(var h=0;s>h;h++)(u=We(e,n,c[h]))!==Ve&&(v=!0,f[1+2*h]=null==u?"":u);if(!t)return v&&(d.domNode.textContent=f.join("")),void ke(e,d.domNode,r);d=p(e.doc.createTextNode(f.join("")),f),ke(e,d.domNode,r)}else{if(!t)return void(r&&ke(e,e.nodes[i].domNode,r));d=p(e.doc.createTextNode(a),void 0),ke(e,d.domNode,r)}function p(e,t){return{kind:"#text",uid:"txt"+ ++de,domNode:e,attached:!0,idx:i,parentIdx:-1,pieces:t,nextSibling:void 0}}e.nodes[i]=d,e.cmAppends[o](d,!1)}function Ke(e,t,n,i,o,r,a,s){for(var d=[],c=8;c<arguments.length;c++)d[c-8]=arguments[c];for(var l=[e,t,n,i,o,r,a,s],f=0;s>f;f++)l.push(d[f]);Le(e,Xe,l)}function Je(e,t,n){if(e.expressions){var i=e.expressions;if(i.length>t&&i[t]===n)return Ve;i[t]=n}else e.expressions=[],e.expressions[t]=n;return n}function We(e,t,n){if(t){if(n[2]){var i=e.oExpressions;return i[2*n[0]]?Ve:(i[2*n[0]]=1,n[1])}return Je(e,n[0],n[1])}return n}function Be(e,t,n,i){if(t){var o={kind:"#fragment",uid:"fra"+ ++de,idx:n,parentIdx:-1,ns:"",domNode:void 0,attached:!0,nextSibling:void 0,firstChild:void 0,lastChild:void 0,contentView:null};e.nodes[n]=o;var r=e.cmAppends[i];r(o,!1),e.cmAppends[i+1]=function(e,t){r(e,!0),t||ze(o,e)}}}function _e(e,t,n,i,o){if(t){var r=qe(n,null,o);return e.nodes[n]=r,Ue(e,r,i),r}}function qe(e,t,n){var i;if(1===n)i={kind:"#container",subKind:"##block",uid:"cnb"+ ++de,idx:e,parentIdx:-1,ns:"",domNode:void 0,attached:!0,nextSibling:void 0,views:[],viewPool:[],cmAppend:t,lastRefresh:0,previousNbrOfViews:0,insertFn:null};else{if(2!==n)return console.warn("TODO: new cnt type"),null;i={kind:"#container",subKind:"##cpt",uid:"cnc"+ ++de,idx:e,parentIdx:-1,ns:"",domNode:void 0,attached:!0,nextSibling:void 0,cmAppend:t,cptRef:null,template:null,data:null,contentView:null,dynamicParams:void 0}}return i}function Ue(e,t,n){if(e.cmAppends){var i=e.cmAppends[n];i?(t.cmAppend=function(e,t){i(e,!0)},i(t,!1)):console.log("ERROR?",i===fe)}}function Ye(e,t,n,i,o,r,a,s,d,c){var l;n=n||0,t?l=e.nodes[i]||_e(e,t,i,o,2):(l=e.nodes[i]).lists&&(l.lists.sizes={});var f=We(e,n,r);if(l.template){if(f!==Ve&&l.cptRef!==f){var u=l.data;l.template.dispose(!0),m();var v=l.data;for(var h in u)if(u.hasOwnProperty(h)&&h.match(pe)){var p=RegExp.$1;C(v,p)&&(v[p]=u[p])}}}else{if(f===Ve)return void le(e,"Invalid component ref");m()}function m(){var t=l.template=f();l.cptRef=f,De(t.view,e,l),t.disconnectObserver(),l.data=t.api,function(t){if(d){var n=d.length;if(!t&&n)le(e,"Invalid parameter: "+d[0]);else for(var i=0;n>i;i+=2)C(t,d[i])?t[d[i]]=d[i+1]:le(e,"Invalid parameter: "+d[i])}}(t.api)}c&&(l.dynamicParams={}),0===n&&a&&Ge(e,i,l,s,c)}function Ge(e,t,n,i,o){var r=(n=n||e.nodes[t])?n.template:void 0;if(void 0!==r){if(r.view.lastRefresh=e.lastRefresh-1,Ze(n),n.contentView){r.api.$content=n.contentView;var a=n.contentView.instructions;a&&a.length&&(r.forceRefresh=!0)}if(r.view.cm)r.view.cmAppends=[n.cmAppend];else{if(o)for(var s=o.length,d=(n?n.dynamicParams:{})||{},c=r.api,l=0;s>l;l++)d[o[l]]||A(c,o[l]);var f=r.view.nodes[0];if(!f.attached)r.forceRefresh=!0,Te(f,Se(e,n))}i&&ke(e,r.api,i),r.render()}}function Qe(e,t,n,i,o,r,a,s,d,c){var l,f=e.nodes,u=!1;if(f[i]){var v=(l=f[i]).viewPool;a>0&&!v&&((v=l.viewPool=[])[l.viewInstanceIdx]=l.contentView),v&&(l.contentView=v[a]),l.viewInstanceIdx=a,l.dataHolder=l.data=void 0,u=!0}else l={kind:"#param",uid:"pnd"+ ++de,idx:i,parentIdx:o,nextSibling:void 0,domNode:void 0,attached:!0,dataName:r,dataHolder:void 0,data:void 0,dataIsList:void 0,contentView:void 0,dynamicParams:void 0,viewInstanceIdx:a,viewPool:void 0},f[i]=l;c&&(l.dynamicParams={});var h,p=f[o],m=r,g=void 0,w=p.data;if(w){if(l.dataHolder=w,void 0===l.dataIsList&&function(e,t,n,i){C(i,n)?t.dataIsList=!1:C(i,n+"List")?(t.dataIsList=!0,t.dataName=n+"List"):le(e,"Invalid parameter node: <."+n+">")}(e,l,m,w),m=l.dataName,g=l.data,l.dataIsList){var y=p.lists;y||(y=p.lists={sizes:{},listNames:[],listMap:{}}),y.listMap[m]||(y.listMap[m]=1,y.listNames.push(m));var b=y.sizes[m];b||(b=y.sizes[m]=0),(h=w[m][b])||(h=V(w[m],b)),y.sizes[m]+=1,l.data=h}else l.data=h=w[m],void 0===h&&(l.data=h=V(w,m));u&&h&&h["ΔΔ$content"]&&(l.contentView=h["ΔΔ$content"])}else le(e,"Invalid parameter node <."+r+"/>: no param node can be used in this context");l.lists&&(l.lists.sizes={});var N=p.dynamicParams;if(N&&(N[m]=1),d)if(h){if(g!==h)for(var x=d.length,I=0;x>I;I+=2)t&&!C(h,d[I])&&le(e,"Invalid param node parameter: "+d[I]),h[d[I]]=d[I+1]}else le(e,"Invalid param node parameter: "+d[0])}function Ze(e){if(e.lists)for(var t=e.lists,n=t.listNames,i=void 0,o=void 0,r=void 0,a=void 0,s=0;n.length>s;s++)i=n[s],(o=t.sizes[i]||0)<(a=(r=e.data[i]).length)&&r.splice(o,a-o)}function et(e,t,n,i,o,r){var a=e.nodes[i];if(Ze(a),r)for(var s=r.length,d=a.dynamicParams,c=0;s>c;c++)d&&!d[r[c]]&&A(a.data,r[c]);void 0!==a.contentView&&_(a.dataHolder)}function tt(e,t,n,i,o){if(o!==Ve){var r=We(e,t,o);if(r!==Ve){var a=e.nodes[n].domNode;void 0===r?a.removeAttribute(i):a.setAttribute(i,r)}}}function nt(e,t,n,i,o,r){if(r!==Ve){var a=We(e,n,r);if(a!==Ve){var s=e.nodes[i],d=s.kind;if("#container"===d){var c=s.data;(function(e,t,n,i,o){if(i&&(!e.cm||C(i,o)))return!0;var r="";n.template&&(r=" on <*"+n.template.templateName+"/>");return le(e,"Invalid parameter '"+o+"'"+r),!1})(e,0,s,c,o)&&(c[o]=a)}else if("#param"===d)!function(e,t,n,i,o){if(0===o){if(n.dataHolder)return n.dataHolder[n.dataName]=i,n.dataHolder}else{if(n.data)return t&&!C(n.data,o)&&le(e,"Invalid param node parameter: "+o),n.data[o]=i,n.data;le(e,"Invalid param node parameter: "+o)}}(e,t,s,a,o);else if("#decorator"===d){var l=s;t&&!function(e,t,n){if(!C(t.api,n))return le(e,"Invalid decorator parameter '"+n+"' on "+t.refName),!1;return!0}(e,l,o)||(l.api[o]=a)}}}}function it(e,t,n,i,o,r,a,s){if(t){var d=e.nodes[i];if("#element"===d.kind){var c=d.domNode;if(!c)return void le(e,"Cannot set "+o+" event listener: undefined DOM node");var l=v(c);a&&!1!==(s=s||{}).passive&&(s.passive=!0),c.addEventListener(o,(function(e){l.callback&&l.callback(e)}),s)}else if("#container"===d.kind){var f=d.template;f?u(f.api,!1):le(e,"Cannot set "+o+" event listener: undefined component template")}else"#param"===d.kind?u(d.data,!0):"#decorator"===d.kind&&u(d.api,!0)}else e.nodes[n].callback=r;function u(t,n){if(t&&C(t,o+"Emitter")){var i=t[o+"Emitter"];if(i.addListener&&"function"==typeof i.addListener){var r=v(null);i.addListener((function(e){r.callback&&r.callback(e)})),n&&"function"==typeof i.init&&i.init(o,t)}else le(e,"Invalid event emitter for: "+o)}else le(e,"Unsupported event: "+o)}function v(t){var o={kind:"#listener",uid:"evt"+ ++de,idx:n,parentIdx:i,nextSibling:void 0,domNode:t,attached:!0,callback:r};return e.nodes[n]=o,o}}function ot(e,t,n,i,o){var r,a=e.nodes[n];if(1===o)if(i[ge]){if(C(i,ve)){var s=i[ve];s!==fe&&(r=s.$content)}}else C(i,"$content")&&(r=i.$content);else r=We(e,t,i);if(r!==Ve&&void 0!==i||(r=a.contentView),r){var d=r.projectionHost;if(d&&d.hostNode!==a&&at(r,r.nodes[0]),a.contentView&&a.contentView!==r&&at(a.contentView,a.contentView.nodes[0]),a.contentView=r,r.projectionHost={view:e,hostNode:a},r.cm)if("#element"===a.kind){var c=a.domNode;r.cmAppends=[function(e){e.domNode?pt(e.domNode,a.domNode):e.domNode=c}]}else r.cmAppends=[Se(e,a)];else{var l=void 0,f=!1;if(r.domNode!==fe&&null!==r.nodes&&r.domNode.nodeType===ue&&(pt(r.nodes[0].domNode,a.domNode),function(e,t,n){if(!e||e.cm||!e.nodes||!e.nodes.length)return;n===fe&&(n=e.domNode);if(n===fe||t===n)return;gt(e,!0,(function(e){return"#view"!==e.kind&&"#fragment"!==e.kind&&"#container"!==e.kind||e.domNode===n&&(e.domNode=t),!0}))}(r,a.domNode),f=!0),!f){if("#element"===a.kind){var u=a.domNode;l=function(e,t){e.domNode?pt(e.domNode,u):e.domNode=u}}else l=Se(e,a);Te(r.nodes[0],l)}}r.container=a,Re(r)}}function rt(e,t){if(0===t.idx&&e.projectionHost){if(!t.attached)return null;var n=e.projectionHost.hostNode;return"#element"===n.kind?n.domNode:rt(e.projectionHost.view,n)}return 0===t.idx?e.parentView?rt(e.parentView,e.container):e.rootDomNode:e.nodes[t.parentIdx].domNode}function at(e,t){if(t&&t.attached)if("#text"===t.kind||"#element"===t.kind){var n=rt(e,t);t.attached=!1,n?n.removeChild(t.domNode):le(e,"Internal error - parent not found for: "+t.uid)}else if("#container"===t.kind){if("##block"===t.subKind){for(var i=t,o=i.views,r=o.length,a=void 0,s=0;r>s;s++)a=o[s].nodes[0],at(o[s],a),o[s].attached=a.attached=!1,"#container"!==a.kind&&"#fragment"!==a.kind||(a.domNode=void 0);i.views=[],i.previousNbrOfViews=0,i.viewPool=o.concat(i.viewPool)}else if("##cpt"===t.subKind){var d=t.template;a=d.view.nodes[0];at(d.view,a),d.view.attached=a.attached=!1,"#container"!==a.kind&&"#fragment"!==a.kind||(a.domNode=void 0)}}else if("#fragment"===t.kind){var c=t;if(c.attached=!1,c.contentView)at(c.contentView,c.contentView.nodes[0]);else if(c.firstChild)for(var l=c.firstChild;l;)at(e,l),l=l.nextSibling;c.domNode=void 0}else"#param"===t.kind?console.warn("TODO removeFromDom for param nodes"):console.warn("RemoveFromDom for "+t.kind)}var st=$,dt=O,ct=R,lt=E,ft=re,ut=L;function vt(e){e.prototype[me]=!0,$(e)}function ht(e,t){return!0===e.prototype[t]}function pt(e,t,n){t.appendChild(e)}function mt(e,t,n,i){n.insertBefore(e,t)}function gt(e,t,n){if(e!==fe&&null!==e){if(!n(e))return!1;if(null!==e.nodes&&e.nodes.length)for(var i=0,o=e.nodes;i<o.length;i++){if(!r(o[i]))return!1}}return!0;function r(e){var i=e.kind;if("#fragment"===i)return!!n(e)&&gt(e.contentView,t,n);if("#container"!==i)return n(e);if(!n(e))return!1;var o=e,r=o.subKind;if("##block"===r){var a=o.views;if(null!==a)for(var s=0,d=a;s<d.length;s++){if(!gt(d[s],t,n))return!1}if(t&&o.viewPool)for(var c=0,l=o.viewPool;c<l.length;c++){if(!gt(l[c],t,n))return!1}}else if("##cpt"===r){var f=o.template;if(null!==f)return gt(f.view,t,n)}else"##async"===r&&console.log("TODO: support scanNode for @async block");return!0}}var wt="-------------------------------------------------------------------------------";var yt,bt,Nt,xt,Ct,It,kt,Dt,Pt,Vt,At,jt,$t=function(){function n(){}return e([O(F),t("design:type",String)],n.prototype,"id",void 0),e([O(),t("design:type",Object)],n.prototype,"$content",void 0),n=e([$],n)}(),Ot=function(){function n(){}return e([O(F),t("design:type",String)],n.prototype,"title",void 0),e([O(re(R($t))),t("design:type",Array)],n.prototype,"optionList",void 0),n=e([$],n)}(),Lt=(yt={},bt=["class","menu"],Nt=["class","title"],xt=[" ",""," "],Ct=["class","header list"],It=["class","option"],kt=["class","main list"],Dt=["class","option"],Pt=[2,4],Vt=[3],At=[1],jt=function(){function n(){}return e([dt(ct(Ot)),t("design:type",Ot)],n.prototype,"header",void 0),e([dt(ft(ct($t))),t("design:type",Array)],n.prototype,"optionList",void 0),n=e([st],n)}(),Pe("menu",".../menu1/menu1.ts",yt,(function(e,t,n){var i,o,r,a,s,d,c=n.header,l=n.optionList,f=0,u=0,v=0,h=0,p=Ae(e,0,5);if(Me(e,p,0,0,"div",1,0,bt),it(e,p,1,0,"click",(function(e){var t;(t=e.target)&&t.dataset&&(document.getElementById("event-log").innerHTML="You clicked on menu item "+t.dataset.code)})),_e(e,p,2,1,1),c&&c.title){if(u=0,Be(i=je(e,0,2,4,++f),o=i.cm,0,0),Me(i,o,1,1,"div",1,0,Nt),Xe(i,o,0,2,2,0,xt,1,Je(i,0,c.title)),_e(i,o,3,1,1),c.optionList.length){v=0,Me(r=je(i,0,3,2,++u),a=r.cm,0,0,"ul",1,0,Ct),_e(r,a,1,1,1);for(var m=0,g=c.optionList;m<g.length;m++){var w=g[m];Me(s=je(r,0,1,1,++v),s.cm,0,0,"li",0,0,It),tt(s,0,0,"data-code",Je(s,0,w.id)),ot(s,0,0,Je(s,1,w.$content)),Ee(s)}Ee(r,0,At)}Ee(i,0,Vt)}Me(e,p,3,1,"ul",1,0,kt),_e(e,p,4,2,1);for(var y=0,b=l;y<b.length;y++)w=b[y],Me(d=je(e,0,4,1,++h),d.cm,0,0,"li",0,0,Dt),tt(d,0,0,"data-code",Je(d,0,w.id)),ot(d,0,0,Je(d,1,w.$content)),Ee(d);Ee(e,0,Pt)}),jt));var Rt=function(){function n(){this.ΔΔextraLength=2}return n.prototype.ΔDefault=function(e){switch(e){case"extraLength":return 2}return ut},e([dt(lt),t("design:type",Number)],n.prototype,"extraLength",void 0),n=e([vt],n)}();(function(){var e={},t=["class","commands"],n=["id","event-log"],i=["title","Preferred options:"],o=["id","A"],r=["id","A"],a=["id","B"],s=[" Extra #",""," "],d=["option"],c=[0];return Pe("main",".../menu1/menu1.ts",e,(function(e,l,f){var u,v,h,p,m,g,w,y,b,N,x,C,I=Ae(e,0,16);h=p=0,Be(e,I,0,0),Me(e,I,1,1,"div",1,0,t),Xe(e,I,0,2,2,0," Number of extras: ",0),Me(e,I,3,2,"button",1),it(e,I,4,3,"click",(function(){return f.extraLength++}),1),Xe(e,I,0,5,3,0," + ",0),Me(e,I,6,2,"button",1),it(e,I,7,6,"click",(function(){return f.extraLength--}),1),Xe(e,I,0,8,3,0," - ",0),Me(e,I,9,2,"span",0,0,n),Ye(e,I,0,10,1,Je(e,0,Lt),0,0,0,d),v=(u=$e(e,1,10,1,0)).cm,Qe(e,I,0,11,10,"header",h++,0,i),Qe(e,I,0,12,11,"option",p++,0,o),Ke(m=$e(e,1,12,1,0),g=m.cm,1,0,0,0," Value A ",0),He(m,g),et(e,0,0,12),et(e,0,0,11),Qe(e,I,0,13,10,"option",p++,0,r),Ke(w=$e(e,1,13,1,0),y=w.cm,1,0,0,0," Value A ",0),He(w,y),et(e,0,0,13),Qe(e,I,0,14,10,"option",p++,0,a),Ke(b=$e(e,1,14,1,0),N=b.cm,1,0,0,0," Value B ",0),He(b,N),et(e,0,0,14),function(e,t,n,i,o){if(t){var r=qe(n,null,o);e.nodes[n]=r,Le(e,Ue,[e,r,i])}}(u,v,0,0,1);for(var k=0;f.extraLength>k;k++)Qe(e,I,0,15,10,"option",p++),nt(e,I,0,15,"id","X"+k),Ke(x=$e(e,1,15,1,0),C=x.cm,1,0,0,0,s,1,[0,k]),He(x,C),et(e,0,0,15);He(u,v,c),Ge(e,10,0,0,d),Ee(e)}),Rt)})()().attach(document.getElementById("output")).render()}();
