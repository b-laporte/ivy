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
    ***************************************************************************** */function e(e,t,n,i){var o,r=arguments.length,a=r<3?t:null===i?i=Object.getOwnPropertyDescriptor(t,n):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(e,t,n,i);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(r<3?o(a):r>3?o(t,n,a):o(t,n))||a);return r>3&&a&&Object.defineProperty(t,n,a),a}function t(e,t){if("object"==typeof Reflect&&"function"==typeof Reflect.metadata)return Reflect.metadata(e,t)}var n="ΔTrackable",i="ΔChangeVersion",o="ΔFactory",r="ΔDefFactories",a="ΔIsFactory",s="ΔΔProxy",d="ΔIsProxy",l="ΔCreateProxy",c="ΔnewItem",u="Δdispose",f="Δjson",v=!1;function p(e){return e&&e.ΔTrackable?e.ΔMd?e.ΔMd:e.ΔMd={parents:void 0,refreshCtxt:void 0,watchers:void 0}:null}var h=Array.isArray;function m(e,t){e&&(h(e)&&!e[d]?e.forEach(t):t(e))}function g(e,t){if(e&&t){if(e===t)return;if(h(e)){var n=e;if(1===n.length){if(n[0]===t)return}else{var i=n.indexOf(t);if(i>-1)return n.splice(i,1),1===n.length?n[0]:n}}}return e}function b(e,t){return e?h(e)&&!e[d]?(e.push(t),e):[e,t]:t}function w(e){return e&&!0===e[n]?e[i]:0}function y(e,t){if(void 0===t&&(t=!1),C(e)){e[u]?e[u](t):N(e,(function(n,i){z(e,i),e["ΔΔ"+n]=void 0,t&&y(i,!0)}));var n=e.ΔMd;if(n){var i=[];m(n.parents,(function(e){i.push(e)}));for(var o=function(t){N(t,(function(n,i){i===e&&(z(t,e),t["ΔΔ"+n]=void 0)})),L(t)},r=0,a=i;r<a.length;r++){o(a[r])}}}}function N(e,t){if(C(e)){var n=e.constructor.prototype["ΔDefFactories"];for(var i in n)n.hasOwnProperty(i)&&t(i,e["ΔΔ"+i],n[i])}}function x(e,t){return!(!e||"object"!=typeof e)&&"ΔΔ"+t in e}function C(e){return!(!e||!0!==e[n])}function I(e){return w(e)%2==1}function D(e,t){var n=p(e);return n&&t?(n.watchers=b(n.watchers,t),I(e)&&U.register(e),t):null}function k(e,t){var n=e?e.ΔMd:void 0;n&&t&&(n.watchers=g(n.watchers,t))}var P=function(){var e,t,n=[],i=[],o={getDefaultConversion:function(){return r(e,o)},getPreviousConversion:function(){return e.ΔtoJsResult}};function r(e,n){var i=n.getPreviousConversion();if(i)return i;var o=void 0;if(e.Δconvert)o=e.Δconvert(t);else{if(e["Δjson"])return e["Δjson"];o={},N(e,(function(e,n){C(n)&&(n=a(n,t)),void 0!==n&&(o[e]=n)}))}return o}function a(a,s){var d=0===n.length,l=a;if(a&&C(a)&&(n.push(a),l=void 0,i.push(a),e=a,s?(t=s,l=s(a,o)):l=r(a,o),a.ΔtoJsResult=l,i.pop(),e=i[i.length-1]),d){for(var c=n.length;c--;)n[c]["ΔtoJsResult"]=void 0;e=null,n=[],t=void 0}return l}return a}();function $(e,t){var n,i;t&&N(e,(function(o,r,a){var s=a===M;if(n=t[o],i="ΔΔ"+o,void 0===n)s&&(e[i]=void 0);else{var d=typeof n;if(null===n)(s||a===H)&&(e[i]=null);else if("object"===d){var l=function(e,t){if(e&&void 0!==t){if(e[c])return e[c](t);v=!0;var n=e[t];return v=!1,n}}(e,o);l?l[f]=n:s&&(e[i]=n)}else"string"===d?(s||a===V)&&(e[i]=n):"number"===d?(s||a===E)&&(e[i]=n):"boolean"===d?(s||a===T)&&(e[i]=n):s&&(e[i]=n)}}));e[f]=void 0}function O(e){var t=e.prototype;t[n]=!0,t[i]=0}function j(e,t){return e||(e=F,t=3),function(n,i){var o="ΔΔ"+i,a=n[r];a||(a=n[r]={}),a[i]=t?1===t?F:K:e,n[o]=void 0,function(e,t,n,i){i&&delete e[t]&&Object.defineProperty(e,t,i)}(n,i,0,{get:function(){return function(e,t,n,i,o){e.ΔComputeDependencies&&(e.ΔComputeDependencies[n]=!0);!v&&e[f]&&$(e,e[f]);var r=e[t];(void 0===r||v&&null===r)&&(r=e[t]=!v&&o?o>1?void 0:null:i(),W(e,r));return r}(this,o,i,e,t)},set:function(t){X(this,i,o,t,e,this)},enumerable:!0,configurable:!0})}}function A(){return""}A[a]=!0;var V=A;function R(){return 0}R[a]=!0;var E=R;function S(){return!1}S[a]=!0;var T=S;function F(){return null}F[a]=!0;var H=F;function K(){}K[a]=!0;var M=K;function X(e,t,n,i,o,r){var a=C(i),d=o===M;if(!e.ΔComputeDependencies){i&&!a&&o.ΔCreateProxy&&(a=C(i=o.ΔCreateProxy(i)||i));var l=!1,c=r[n];return I(e)?l=c!==i:c!==i&&(L(e),l=!0),l&&(a&&void 0===i&&(i=null),(a||c&&C(c))&&function(e,t,n,i){z(e,t),i||W(e,n)}(e,c,i,d),r[n]=i,function(e,t,n,i,o){var r=e?e.ΔMd:void 0;if(r&&r.trackers){var a=e[s]||e;m(r.trackers,(function(e){e(a,t,n,i,o)}))}}(e,"set",t,c,i)),i}console.error("[Trax] @computed properties must not mutate the Data object when calculated")}function L(e){if(C(e)){var t=!0;if(I(e)?t=!1:e.ΔChangeVersion+=1,U.register(e),t){var n=e.ΔMd;n&&n.parents&&m(n.parents,(function(e){L(e)}))}}}function z(e,t){if(t){var n=t.ΔMd;n&&n.parents&&(n.parents=g(n.parents,e))}}function W(e,t){if(t){var n=p(t);n&&(n.parents=b(n.parents,e))}}var B=0,q=function(){function e(){this.id=++B}return e.prototype.register=function(e){var t=this,n=p(e);n&&!n.refreshCtxt&&(this.objects?this.objects.push(e):(this.objects=[e],Promise.resolve().then((function(){t.refresh()}))),n.refreshCtxt=this)},e.prototype.refresh=function(e){void 0===e&&(e=!0);var t=this.objects,n=t?t.length:0;if(n){_();for(var i,o,r=[],a=0;n>a;a++)(o=(i=t[a]).ΔMd).refreshCtxt&&(i.ΔChangeVersion%2&&(i.ΔChangeVersion+=1),o.refreshCtxt&&o.watchers&&r.push({dataNode:i,watchers:o.watchers})),o.refreshCtxt=void 0;this.objects=void 0,r.length&&(e?J(r):Promise.resolve().then((function(){J(r)})))}},e}();function J(e){for(var t=function(e){m(e.watchers,(function(t){t(e.dataNode)}))},n=0,i=e;n<i.length;n++){t(i[n])}}var U=new q;function _(){U.objects&&(U=new q)}var Y=/^\Δ/,G=function(){function e(e){this.ΔTrackable=!0,this.ΔDataFactory=!0,this.ΔChangeVersion=0,this.ΔMd=void 0,this.ΔΔSelf=this,this.ΔIsProxy=!1,this.ΔItemFactory=e}return e.ΔNewProxy=function(t){var n=new Proxy({},new e(t));return n[s]=n,n},e.ΔCreateProxy=function(t,n){if("object"==typeof t){var i=new Proxy(t,new e(n));for(var o in L(i),t)t.hasOwnProperty(o)&&W(i,t[o]);return i}return null},e.prototype.ΔnewItem=function(e){var t=this.ΔItemFactory();return X(this.ΔΔSelf,e,e,t,this.ΔItemFactory,this.ΔΔDict)},e.prototype.Δdispose=function(e){void 0===e&&(e=!1);var t,n=this.ΔΔDict;for(var i in n)n.hasOwnProperty(i)&&(t=n[i],z(this.ΔΔSelf,t),n[i]=void 0,e&&y(t,!0));return n},e.prototype.Δconvert=function(e){var t={},n=this.ΔΔDict;for(var i in n)n.hasOwnProperty(i)&&(t[i]=P(n[i],e));return t},e.prototype.ΔinitFromJson=function(){var e=this["Δjson"];if(e){if(e.constructor!==Object)console.error("[Trax] Invalid json type: Dictionaries can only be initialized from Objects");else{var t=this.ΔΔDict,n=void 0,i=void 0;for(var o in e)if(e.hasOwnProperty(o))if(i=n=e[o],n){var r=this.ΔItemFactory();C(r)&&(r["Δjson"]=n,i=r),t[o]=i}else null===n&&(t[o]=null)}this["Δjson"]=void 0}},e.prototype.ΔToString=function(){return"Trax Dict {...}"},e.prototype.set=function(e,t,n){return this.ΔΔDict||(this.ΔΔDict=e),t.match(Y)?this[t]=n:X(this.ΔΔSelf,t,t,n,this.ΔItemFactory,this.ΔΔDict),!0},e.prototype.get=function(e,t){return this.ΔΔDict||(this.ΔΔDict=e),t===d||(this["Δjson"]&&this.ΔinitFromJson(),t===Symbol.iterator?this.ΔΔDict[Symbol.iterator]:"string"===typeof t?t.match(Y)?this[t]:this.ΔΔDict[t]:this[t])},e.prototype.deleteProperty=function(e,t){return this.ΔΔDict||(this.ΔΔDict=e),!t.match(Y)&&(X(this.ΔΔSelf,t,t,null,this.ΔItemFactory,this.ΔΔDict),delete this.ΔΔDict[t],!0)},e}();function Q(e){function t(){return G.ΔNewProxy(e)}return e=e||H,t[a]=!0,t[l]=function(t){return G.ΔCreateProxy(t,e)},t}var Z=0,ee={log:function(e){for(var t=[],n=1;n<arguments.length;n++)t[n-1]=arguments[n];console.log.apply(console,arguments)},error:function(e){for(var t=[],n=1;n<arguments.length;n++)t[n-1]=arguments[n];console.error.apply(console,arguments)}};function te(e,t){for(var n=e,i=[];n;){if(n.template){var o=n.template;i.push('\n>> Template: "'+o.templateName+'" - File: "'+o.filePath+'"')}n=n.parentView}ee.error("IVY: "+t+i.join(""))}var ne=void 0,ie=11,oe=/^ΔΔ(\w+)Emitter$/,re=/^ΔΔ/,ae=/([^ ]+)\s([^ ]+)/,se="ΔIsAPI",de="ΔIsController",le="ΔDefaultParam",ce="ΔIoParams",ue="ΔRequiredProps",fe={$targetApi:"$1 cannot be used on DOM nodes",$targetElt:"$1 cannot be used on components that don't define #main elements"},ve=0,pe=function(){function e(e,t,n,i,o,r){this.templateName=e,this.filePath=t,this.staticCache=n,this.renderFn=i,this.$Class=o,this.$contextIdentifiers=r,this.kind="$template",this._uid=++ve,this.tplApi=void 0,this.tplCtl=void 0,this.forceRefresh=!1,this.activeWatch=!1,this.lastRefreshVersion=0,this.processing=!1,this.rendering=!1,this.initialized=!1,this.labels=void 0,this.hasCtlClass=!1,this.$contextInitialized=!1,this.view=we(null,null,1,this);var a=this;this.watchCb=function(){a.notifyChange()},this.watchCb.$templateId=this._uid,this.$Class!==ne&&(_e(this.$Class,de)?this.hasCtlClass=!0:_e(this.$Class,se)||C(this.$Class.prototype)||te(this.view,"Type of $ argument must be either a @Controller, an @API or a @Data class"))}return e.prototype.dispose=function(e){void 0===e&&(e=!0);var t=this.view;this.disconnectObserver(),me(t,this.tplCtl,"$dispose",this.templateName),e&&t&&t.nodes&&t.nodes.length&&(Me(t,t.nodes[0]),t.anchorNode&&(t.rootDomNode.removeChild(t.anchorNode),t.anchorNode=null))},Object.defineProperty(e.prototype,"uid",{get:function(){return this._uid},enumerable:!0,configurable:!0}),Object.defineProperty(e.prototype,"document",{get:function(){return this.view.doc},set:function(e){this.view.doc=e},enumerable:!0,configurable:!0}),Object.defineProperty(e.prototype,"api",{get:function(){if(!this.tplApi)if(this.hasCtlClass){var e=this.controller;e&&e.$api&&(this.tplApi=e.$api)}else this.$Class?(this.tplApi=new this.$Class,he(this.view,this.tplApi,this.staticCache)):this.$contextIdentifiers?this.tplApi=function(e){return void 0!==e?(t[a]=!0,Q(t)()):Q()();function t(){return new e}}():this.tplApi={};return this.tplApi},enumerable:!0,configurable:!0}),Object.defineProperty(e.prototype,"controller",{get:function(){if(!this.tplCtl&&this.hasCtlClass){var e=this.tplCtl=new this.$Class;if(x(e,"$template")&&(e.$template=this),x(e,"$logger")){var t=this.view;e.$logger={log:ee.log,error:function(e){for(var n=[],i=1;i<arguments.length;i++)n[i-1]=arguments[i];te(t,e+(n.length?" "+n.join(" "):""))}}}e.$api&&he(this.view,e.$api,this.staticCache)}return this.tplCtl},enumerable:!0,configurable:!0}),e.prototype.attach=function(e){if(this.view.rootDomNode)te(this.view,"Template host cannot be changed once set");else{var t=this.view;if(!t.doc)throw new Error("[iv] Template.document must be defined before calling Template.attach()");t.rootDomNode=e,t.anchorNode=t.doc.createComment("template anchor"),et(t.anchorNode,e)}return this},e.prototype.registerLabel=function(e,t){this.labels||(this.labels={});var n=this.labels[e];n?n.push(t):n=this.labels[e]=[t]},e.prototype.query=function(e,t){if(void 0===t&&(t=!1),this.rendering)return null;for(var n=[],i=0,o=e.split(";");i<o.length;i++){var r=o[i];if(r&&"#"!==r.charAt(0))return te(this.view,"[$template.query()] Invalid label argument: '"+r+"' (labels must start with #)"),null;var a=this.labels&&this.labels[r]||null;if(a&&a.length){if(!t)return a[0];n=n.concat(a)}}return n.length?n:null},e.prototype.notifyChange=function(){this.render()},e.prototype.disconnectObserver=function(){this.activeWatch&&(k(this.api,this.watchCb),k(this.controller,this.watchCb),this.activeWatch=!1)},e.prototype.render=function(e,t){if(void 0===t&&(t=!1),this.processing)return this;t&&(this.forceRefresh=!0),this.processing=!0;var n=this.api,i=this.controller,o=this.view,r=this.$contextIdentifiers;i&&!C(i)&&(te(o,"Template controller must be a @Controller Object - please check: "+this.$Class.name),this.tplCtl=this.$Class=void 0);var a=!1;if(n&&e)if(r!==ne){var s=e.context;s!==ne&&"object"==typeof s&&(a=!0)}else for(var d in I(n)||_(),this.disconnectObserver(),e)e.hasOwnProperty(d)&&(n[d]=e[d]);if(this.$contextInitialized&&(a=!0),a){var l="",c=(e?e.context:null)||n.$context;if(c){for(var u=0;r.length>u;u++)n[l=r[u]]=c[l];n.$context=c,this.$contextInitialized=!0}}r===ne||this.$contextInitialized||te(o,"Missing $fragment context");var f=!this.forceRefresh,v=o.nodes;if(v&&v[0]&&v[0].attached||(f=!1),f&&w(n)+w(i)>this.lastRefreshVersion&&(f=!1),!f){i&&(this.initialized||(me(o,i,"$init","controller"),this.initialized=!0),me(o,i,"$beforeRender","controller")),this.rendering=!0,this.labels=void 0,o.lastRefresh++,o.instructions=void 0;try{this.renderFn(o,this.hasCtlClass?i:n,n,this)}catch(e){te(o,"Template execution error\n"+(e.message||e))}this.rendering=!1,i&&me(o,i,"$afterRender","controller"),function(e,t){if(void 0===t&&(t=!1),e){var n=e.ΔMd;n&&n.refreshCtxt?n.refreshCtxt.refresh(!0):t&&_()}}(n),this.forceRefresh=!1,this.lastRefreshVersion=w(n)+w(i)}return this.activeWatch||(D(n,this.watchCb),i&&D(i,this.watchCb),this.activeWatch=!0),this.processing=!1,this},e}();function he(e,t,n){var i=n.events;if(void 0===i){var o=void 0;for(var r in t)if(r.match(oe)){var a=RegExp.$1;o||(o=[]),"function"!=typeof t[a+"Emitter"].init?te(e,"Invalid EventEmitter: "+a+"Emitter"):(o.push(a+"Emitter"),o.push(a),t[a+"Emitter"].init(a,t))}n.events=o||null}else if(null!==i)for(var s=i.length,d=0;s>d;d+=2)t[i[d]].init(i[d+1],t)}function me(e,t,n,i){if(t&&"function"==typeof t[n]){var o=void 0;try{void 0!==(o=t[n]())&&"function"==typeof o.catch&&o.catch((function(t){te(e,i+" "+n+" hook execution error\n"+(t.message||t))}))}catch(t){te(e,i+" "+n+" hook execution error\n"+(t.message||t))}}}function ge(e,t){return(t=t||this.namespace)?this.doc.createElementNS(t,e):this.doc.createElement(e)}function be(){return function(e){if(e!==ne&&null!==e){var t=!0;return function e(t,n,i){if(t!==ne&&null!==t){if(!i(t))return!1;if(null!==t.nodes&&t.nodes.length)for(var o=0,r=t.nodes;o<r.length;o++){if(!a(r[o]))return!1}}return!0;function a(t){var o=t.kind;if("#fragment"===o)return!!i(t)&&e(t.contentView,n,i);if("#container"!==o)return i(t);if(!i(t))return!1;var r=t,a=r.subKind;if("##block"===a){var s=r.views;if(null!==s)for(var d=0,l=s;d<l.length;d++){var c=l[d];if(!e(c,n,i))return!1}if(n&&r.viewPool)for(var u=0,f=r.viewPool;u<f.length;u++){var v=f[u];if(!e(v,n,i))return!1}}else if("##cpt"===a){var p=r.template;if(null!==p)return e(p.view,n,i)}else"##async"===a&&console.log("TODO: support scanNode for @async block");return!0}}(e,!1,(function(e){if(!t)return!1;var n=e.kind;if("#view"===n){var i=e;if(i.cm){var o=i.doc.createDocumentFragment();i.domNode=o,i.cmAppends=[function(e){e.domNode?et(e.domNode,o):e.domNode=o}]}!function(e){if(e.instructions){var t=e.instructions.slice(0),n=t.length;if(e.instructions.splice(0,n),e.instructions=void 0,n)for(var i=0;n>i;i+=2)t[i].apply(null,t[i+1])}}(i)}else if("#element"===n||"#text"===n)return t=!1;return!0})),t}return!0}(this)}function we(e,t,n,i){var o={kind:"#view",uid:"view"+ ++Z,attached:!1,nodes:null,namespace:void 0,namespaces:void 0,doc:null,parentView:e,cm:!0,cmAppends:null,lastRefresh:0,container:null,projectionHost:null,template:i,rootDomNode:null,anchorNode:null,expressions:void 0,oExpressions:void 0,instructions:void 0,paramNode:void 0,createElement:ge,isEmpty:be};return e?function(e,t,n){if(e.parentView=t,e.doc=t.doc,e.container=n,e.rootDomNode=t.rootDomNode,t.namespace){var i=t.namespace;e.namespace=i,e.namespaces=[i]}}(o,e,t):o.doc="undefined"!=typeof document?document:null,o}function ye(e,t,n){if(n){var i=function(e){var t=e;for(;t&&!t.template;)t=t.parentView;return t}(e);if(i!==ne&&null!==i)for(var o=i.template,r=n.length,a=0;r>a;a++)o.registerLabel(n[a],t)}}var Ne=[];function xe(e,t,n,i,o){var r,a=e.nodes[n];if(a&&a.attached||te(e,"Invalid ζview call: container must be attached ("+(a?a.uid:"XX")+") - pview: "+e.uid+" containerIdx: "+n),"#container"===a.kind)if("##block"===a.subKind){var s=(d=a).views;1===o&&(d.insertFn=null),1===o&&d.views.length>1?(d.previousNbrOfViews=s.length,r=s.shift(),d.viewPool.length?d.viewPool=s.concat(d.viewPool):d.viewPool=s,d.views=[r]):(r=d.views[o-1])||(d.viewPool.length>0?(d.insertFn||(d.insertFn=Ce(e,d)),function e(t,n,i){if(t.attached)return;if(n(t,!0),t.attached=!0,"#fragment"===t.kind)for(var o=t.firstChild;o;)e(o,n),o=o.nextSibling;else if("#container"===t.kind){var r=t.subKind;if("##cpt"===r){var a=t.template,s=a?a.view.nodes[0]:null;a&&(a.forceRefresh=!0),s&&(e(s,n),a.view.attached=!0)}else if("##block"===r)for(var d=t.views,l=0;d.length>l;l++)e(d[l].nodes[0],n),d[l].attached=!0}if("#fragment"===t.kind||"#element"===t.kind){var c=t.contentView;c&&(e(c.nodes[0],n),c.attached=!0)}}((r=s[o-1]=d.viewPool.shift()).nodes[0],d.insertFn),r.attached=!0):((r=s[o-1]=we(e,d)).nodes=new Array(i),e.cm&&d.cmAppend?r.cmAppends=[d.cmAppend]:e.cm||(r.cmAppends=[Ce(e,d)]))),d.lastRefresh=r.lastRefresh=e.lastRefresh}else{var d;(r=(d=a).contentView)||((r=d.contentView=we(e,d)).nodes=new Array(i)),r.lastRefresh=e.lastRefresh}else if("#param"===a.kind){var l=a;(r=l.contentView)||(r=l.contentView=we(e,null),l.viewPool&&(l.viewPool[l.viewInstanceIdx]=r),r.nodes=new Array(i),r.paramNode=l),r.lastRefresh=e.lastRefresh}return r}function Ce(e,t){var n=function e(t,n){for(;;){if(n||te(t,"Internal error - findNextSiblingDomNd: nd cannot be undefined"),0===n.idx){if(!n.attached)return{position:"defer",parentDomNd:void 0};if(n.domNode.nodeType===ie)return{position:"lastChild",parentDomNd:n.domNode};var i=t.parentView;if(i){if(t.projectionHost){var o=t.projectionHost.hostNode;return"#element"===o.kind?{position:"lastChild",parentDomNd:o.domNode}:e(t.projectionHost.view,o)}if(t.container&&"##block"===t.container.subKind){var r=t.container,a=r.views.indexOf(t);if(a>-1)for(var s=void 0,d=void 0,l=a+1;l<r.views.length;l++)if((s=r.views[l]).nodes&&s.nodes.length&&(d=m(s,s.nodes[0],r.domNode)))return d;for(var c=r.viewPool,u=void 0,f=0,v=c;f<v.length;f++){if((s=v[f]).nodes&&s.nodes.length&&s.attached&&(u=m(s,s.nodes[0],r.domNode)))return u}}return e(i,t.container)}return{position:"lastOnRoot",parentDomNd:t.rootDomNode,nextDomNd:t.anchorNode}}if(!n.nextSibling){var p=t.nodes[n.parentIdx];return"#element"===p.kind?{position:"lastChild",parentDomNd:Ke(t,n)}:e(t,p)}var h=m(t,n.nextSibling,Ke(t,n));if(h)return h;n=n.nextSibling}function m(e,t,n){if(!t)return null;if("#element"===t.kind||"#text"===t.kind)return{position:"beforeChild",nextDomNd:t.domNode,parentDomNd:n};if("#fragment"===t.kind){for(var i=void 0,o=t.firstChild;o;){if(i=m(e,o,n))return i;o=o.nextSibling}if(t.contentView){var r=t.contentView;if(r.nodes)return m(r,r.nodes[0],n)}return null}if("#container"===t.kind){var a=t;i=null;if("##block"===a.subKind)for(var s=a.views,d=s.length,l=0;d>l&&!(i=m(s[l],s[l].nodes[0],n));l++);else if("##cpt"===a.subKind){var c=a.template.view;i=m(c,c.nodes[0],n)}return i||null}throw new Error("TODO findFirstDomNd: "+t.kind)}}(e,t),i=n.position,o=n.nextDomNd,r=n.parentDomNd;return"beforeChild"===i||"lastOnRoot"===i?function(e,t){e.domNode?tt(e.domNode,o,r):e.domNode=r}:"lastChild"===i?function(e,t){e.domNode?et(e.domNode,r):e.domNode=r}:function(){console.warn("TODO: VALIDATE VIEW APPEND: ",i),function(e,t,n){void 0===t&&(t="");n&&e.uid!==n||(console.log(""),console.log(nt),t&&console.log(t+":"),function e(t,n){void 0===n&&(n="");if(!t.nodes)return void console.log(""+n+t.uid+" - no nodes");var i=t.parentView?t.parentView.uid:"XX",o=t.projectionHost,r=o?" >>> projection host: "+o.hostNode.uid+" in "+o.view.uid:"";console.log(n+"*"+t.uid+"* cm:"+t.cm+" isTemplate:"+(void 0!==t.template)+" parentView:"+i+r);for(var a,s=t.nodes.length,d="",l=0;s>l;l++)if(a=t.nodes[l])if(d=a.uid.length<5?["     ","    ","   ","  "," "][a.uid.length]:"","#container"===a.kind){var c=a,u=c.domNode?c.domNode.uid:"XX";if(console.log(n+"["+l+"] "+a.uid+d+" "+u+" attached:"+(a.attached?1:0)+" parent:"+C(a.parentIdx)+" nextSibling:"+(a.nextSibling?a.nextSibling.uid:"X")),"##block"===c.subKind){var f=c,v=f.views.length;if(v)for(var p=0;v>p;p++)if(f.views[p]){var h=f.views[p];u=h.rootDomNode?h.rootDomNode.$uid:"XX",console.log(n+"  - view #"+p),e(f.views[p],"    "+n)}else console.log(n+"  - view #"+p+" UNDEFINED");else console.log(n+"  - no child views")}else if("##cpt"===c.subKind){var m=c,g=m.template,b=m.contentView;b?(console.log(n+"  - light DOM:"),e(b,"    "+n)):console.log(n+"  - light DOM: none"),g?(console.log(n+"  - shadow DOM:"),e(g.view,"    "+n)):console.log(n+"  - no template")}else console.log(n+"  - "+c.subKind+" container")}else{u=a.domNode?a.domNode.uid:"XX";var w="";if(a.domNode&&"#text"===a.kind)w=" text=#"+a.domNode._textContent+"#";else if("#fragment"===a.kind||"#element"===a.kind){for(var y=[],N=a.firstChild;N;)y.push(N.uid),N=N.nextSibling;w=" children:["+y.join(", ")+"]";var x=a.contentView;x&&(w+=" >>> content view: "+x.uid)}console.log(n+"["+a.idx+"] "+a.uid+d+" "+u+" attached:"+(a.attached?1:0)+" parent:"+C(a.parentIdx)+" nextSibling:"+(a.nextSibling?a.nextSibling.uid:"X")+w)}else console.log(n+"["+l+"] XX");function C(e){return e<0?"X":e}}(e))}(e,"getViewInsertFunction for "+t.uid)}}function Ie(e,t,n){var i=e.nodes[t];if(i&&"##block"===i.subKind){var o=i,r=o.lastRefresh;if(n||r===e.lastRefresh){var a=o.views.length;if(!n){if(a!==o.previousNbrOfViews)for(var s=o.viewPool,d=s.length,l=void 0,c=0;d>c;c++)Me(l=s[c],l.nodes[0]),l.attached=!1;o.previousNbrOfViews=a}}else Me(e,o)}}function De(e,t,n){if(n)for(var i=n.length,o=0;i>o;o++)Ie(e,n[o],e.cm);e.cm&&(e.cm=!1,e.cmAppends=null)}function ke(e,t,n,i,o,r,a,s,d){if(t){var l=e.createElement(o);if(s)for(var c=s.length,u=0;c>u;u+=2)l.setAttribute(s[u],s[u+1]);if(d){c=d.length;for(var f=0;c>f;f+=2)l[d[f]]=d[f+1]}var v={kind:"#element",uid:"elt"+ ++Z,idx:n,parentIdx:-1,ns:"",domNode:l,attached:!0,nextSibling:void 0,firstChild:void 0,lastChild:void 0,contentView:null};e.nodes[n]=v,ye(e,l,a),e.cmAppends[i](v,!1),r&&(e.cmAppends[i+1]=function(e,t){e.domNode?et(e.domNode,l):e.domNode=l,t||Pe(v,e)})}else a&&ye(e,e.nodes[n].domNode,a)}function Pe(e,t){e.firstChild?(e.lastChild.nextSibling=t,e.lastChild=t):(e.firstChild=e.lastChild=t,t.nextSibling=void 0),t.parentIdx=e.idx}function $e(e,t,n,i,o,r,a,s){for(var d,l=[],c=8;c<arguments.length;c++)l[c-8]=arguments[c];if(s){var u=void 0,f=void 0,v=!1;u=t?a.slice(0):(d=e.nodes[i]).pieces;for(var p=0;s>p;p++)(f=je(e,n,l[p]))!==Ne&&(v=!0,u[1+2*p]=null==f?"":f);if(!t)return v&&(d.domNode.textContent=u.join("")),void ye(e,d.domNode,r);d=h(e.doc.createTextNode(u.join("")),u),ye(e,d.domNode,r)}else{if(!t)return void(r&&ye(e,e.nodes[i].domNode,r));d=h(e.doc.createTextNode(a),void 0),ye(e,d.domNode,r)}function h(e,t){return{kind:"#text",uid:"txt"+ ++Z,domNode:e,attached:!0,idx:i,parentIdx:-1,pieces:t,nextSibling:void 0}}e.nodes[i]=d,e.cmAppends[o](d,!1)}function Oe(e,t,n){if(e.expressions){var i=e.expressions;if(i.length>t&&i[t]===n)return Ne;i[t]=n}else e.expressions=[],e.expressions[t]=n;return n}function je(e,t,n){if(t){if(n[2]){var i=e.oExpressions;return i[2*n[0]]?Ne:(i[2*n[0]]=1,n[1])}return Oe(e,n[0],n[1])}return n}function Ae(e,t,n,i,o){if(t){var r=function(e,t,n){var i;if(1===n)i={kind:"#container",subKind:"##block",uid:"cnb"+ ++Z,idx:e,parentIdx:-1,ns:"",domNode:void 0,attached:!0,nextSibling:void 0,views:[],viewPool:[],cmAppend:t,lastRefresh:0,previousNbrOfViews:0,insertFn:null};else{if(2!==n)return console.warn("TODO: new cnt type"),null;i={kind:"#container",subKind:"##cpt",uid:"cnc"+ ++Z,idx:e,parentIdx:-1,ns:"",domNode:void 0,attached:!0,nextSibling:void 0,cmAppend:t,cptRef:null,template:null,data:null,contentView:null,dynamicParams:void 0}}return i}(n,null,o);return e.nodes[n]=r,function(e,t,n){if(e.cmAppends){var i=e.cmAppends[n];i?(t.cmAppend=function(e,t){i(e,!0)},i(t,!1)):console.log("ERROR?",i===ne)}}(e,r,i),r}}function Ve(e,t,n,i,o){if(o!==Ne){var r=je(e,t,o);if(r!==Ne){var a=e.nodes[n].domNode;void 0===r?a.removeAttribute(i):a.setAttribute(i,r)}}}function Re(e,t,n,i,o,r,a,s){var d,l=e.nodes[i],c=l.kind,u=ne;if(a!==ne&&s!==ne&&null!==a&&"object"==typeof a&&(t&&"string"==typeof s&&C(a)&&!x(a,s)&&te(e,"Invalid property: '"+s+"'"),u=a[s]),"#container"===c)(function(e,t,n,i,o){if(i&&(!e.cm||x(i,o)))return!0;var r="";return n.template&&(r=" on <*"+n.template.templateName+"/>"),te(e,"Invalid parameter '"+o+"'"+r),!1})(e,0,l,d=l.data,r)&&(t&&Ze(e,d,r),d[r]=u);else if("#param"===c)if(0===r){var f=l;f.dataHolder&&(f.dataHolder[f.dataName]=u,d=f.dataHolder,r=f.dataName,t&&Ze(e,d,r,"."+r,!1,!0))}else d=function(e,t,n,i,o){if(0===o){if(n.dataHolder)return n.dataHolder[n.dataName]=i,n.dataHolder}else{if(n.data)return t&&!x(n.data,o)&&te(e,"Invalid param node parameter: "+o),n.data[o]=i,n.data;te(e,"Invalid param node parameter: "+o)}return null}(e,t,l,u,r),t&&Ze(e,d,r,"."+l.dataName);else if("#decorator"===c){var v=l;d=v.api,0===r?(r=Te(e,v,u),t&&r&&Ze(e,d,r,v.refName,!0)):t&&!Se(e,v,r)||(t&&Ze(e,d,r,v.refName),d[r]=u)}var p=l.bindings;if(p===ne&&(p=l.bindings=[]),p[o]===ne){if(d){var h={propertyHolder:a,propertyName:s,watchFn:D(d,(function(){var e=d[r],t=h.propertyHolder;if(t!==ne&&null!==t&&h.propertyName!==ne&&t[h.propertyName]!==e){var n=w(t);0===n||n%2==1?Promise.resolve().then((function(){t[h.propertyName]=e})):t[h.propertyName]=e}}))};p[o]=h}}else{var m=p[o];m.propertyHolder=a,m.propertyName=s}}function Ee(e,t,n,i,o,r,a,s,d,l,c){var u;if(t){var f=e.nodes;if(void 0===a)te(e,"Undefined decorator reference: @"+r);else if("function"!=typeof a&&!0!==a.$isDecorator)te(e,"Invalid decorator reference: @"+r);else{var v=new a.$apiClass,p=a(v);if(u={kind:"#decorator",uid:"deco"+ ++Z,idx:i,parentIdx:o,attached:!0,nextSibling:void 0,domNode:void 0,instance:p,api:v,refName:"@"+r,validProps:!0},f[i]=u,l)for(var h=l.length,m=0;h>m;m+=2)Se(e,u,l[m]),v[l[m]]=l[m+1]}}else u=e.nodes[i];if(u!==ne){v=u.api;1===s&&Te(e,u,d),ye(e,v,c)}}function Se(e,t,n){return!!x(t.api,n)||(te(e,"Invalid decorator parameter '"+n+"' on "+t.refName),!1)}function Te(e,t,n){var i=t.api,o=i[le];return o===ne?(te(e,t.refName+" doesn't define any default parameter"),""):(i[o]=n,o)}function Fe(e,t,n){if(t){var i=n.api,o=e.nodes[n.parentIdx],r=null,a=null;if(void 0===o.kind)r=o;else if("#element"===o.kind)r=o.domNode;else if("#container"===o.kind&&"##cpt"===o.subKind){var s=o.template;a=s.api,r=s.query("#main")}else te(e,"Invalid decorator target for "+n.refName);null!==r&&x(i,"$targetElt")&&(i.$targetElt=r),null!==a&&x(i,"$targetApi")&&(i.$targetApi=a),n.validProps=function(e,t,n,i){if(t[ue]!==ne){var o=t[ue],r=void 0,a=!0;for(var s in o)if((r=t[o[s]])===ne||null===r){var d=Ue(o[s]);i!==ne&&i[d]!==ne?te(e,(n+" "+d).replace(ae,i[d])):te(e,d+" property is required for "+n),a=!1}return a}return!0}(e,n.api,n.refName,fe),n.validProps&&me(e,n.instance,"$init",n.refName)}n.validProps&&me(e,n.instance,"$render",n.refName)}function He(e,t,n,i){var o=e.nodes[i];o!==ne&&Fe(e,t,o)}function Ke(e,t){if(0===t.idx&&e.projectionHost){if(!t.attached)return null;var n=e.projectionHost.hostNode;return"#element"===n.kind?n.domNode:Ke(e.projectionHost.view,n)}return 0===t.idx?e.parentView?Ke(e.parentView,e.container):e.rootDomNode:e.nodes[t.parentIdx].domNode}function Me(e,t){if(t&&t.attached)if("#text"===t.kind||"#element"===t.kind){var n=Ke(e,t);t.attached=!1,n?n.removeChild(t.domNode):te(e,"Internal error - parent not found for: "+t.uid)}else if("#container"===t.kind){if("##block"===t.subKind){for(var i=t,o=i.views,r=o.length,a=void 0,s=0;r>s;s++)a=o[s].nodes[0],Me(o[s],a),o[s].attached=a.attached=!1,"#container"!==a.kind&&"#fragment"!==a.kind||(a.domNode=void 0);i.views=[],i.previousNbrOfViews=0,i.viewPool=o.concat(i.viewPool)}else if("##cpt"===t.subKind){var d=t.template;a=d.view.nodes[0];Me(d.view,a),d.view.attached=a.attached=!1,"#container"!==a.kind&&"#fragment"!==a.kind||(a.domNode=void 0)}}else if("#fragment"===t.kind){var l=t;if(l.attached=!1,l.contentView)Me(l.contentView,l.contentView.nodes[0]);else if(l.firstChild)for(var c=l.firstChild;c;)Me(e,c),c=c.nextSibling;l.domNode=void 0}else"#param"===t.kind?console.warn("TODO removeFromDom for param nodes"):console.warn("RemoveFromDom for "+t.kind)}var Xe=O,Le=j,ze=function(e){if(!e)return F;var t=e.ΔFactory;if(t)return t;function n(){return new e}return n[a]=!0,e[o]=n,n},We=V,Be=E,qe={};function Je(e){e.prototype[se]=!0,O(e)}function Ue(e){return e.replace(re,"")}function _e(e,t){return!0===e.prototype[t]}function Ye(e,t){e[le]=Ue(t)}function Ge(e,t){var n=e[ce];t="/"+Ue(t),e[ce]=n===ne?t:n+t}function Qe(e,t){var n=e[ue];n===ne&&(n=e[ue]=[]),n.push(t)}function Ze(e,t,n,i,o,r){var a=t[ce];if(a!==ne){var s="/"+n;if(a===s||a.indexOf(s)>-1)return!0}return te(e,i!==ne?o?"Invalid I/O binding expression on "+i+" (@defaultParam is not an @io param)":r?"Invalid I/O binding expression on "+i+"@paramValue (not an @io param)":"Invalid I/O binding expression on "+i+"."+n+" (not an @io param)":"Invalid I/O binding expression on '"+n+"' (not an @io param)"),!1}function et(e,t,n){t.appendChild(e)}function tt(e,t,n,i){n.insertBefore(e,t)}var nt="-------------------------------------------------------------------------------";var it,ot="value",rt="checked",at="data",st=["text","radio","checkbox","number","range"],dt={passive:!0},lt=function(){function n(){this.ΔΔevents="input",this.ΔΔdebounce=0}return n.prototype.ΔDefault=function(e){switch(e){case"events":return"input";case"debounce":return 0}return qe},e([Qe,Ye,Ge,t("design:type",Object)],n.prototype,"ΔΔdata",void 0),e([Le(),t("design:type",Object)],n.prototype,"data",void 0),e([Qe,t("design:type",Object)],n.prototype,"ΔΔ$targetElt",void 0),e([Le(),t("design:type",Object)],n.prototype,"$targetElt",void 0),e([Le(We),t("design:type",String)],n.prototype,"events",void 0),e([Le(0,2),t("design:type",Object)],n.prototype,"input2data",void 0),e([Le(0,2),t("design:type",Object)],n.prototype,"data2input",void 0),e([Le(Be),t("design:type",Number)],n.prototype,"debounce",void 0),n=e([Je],n)}(),ct=((it=function(e){var t,n,i="",o="",r="",a={};function s(t){if("number"===i&&"input"===t.type){var o=t[at];if("e"===o||"E"===o||"-"===o||"+"===o)return}e.debounce<=0?d():(n||(n=new ut("@value error")),n.duration=e.debounce,n.process(d))}function d(){var n;if("text"===i||"number"===i)n=t[ot];else if("range"===i){var o=t[ot];if(""===o)n=0;else if(n=parseInt(o),isNaN(n))throw"Invalid input value '"+o+"': value of input type range shall be an integer"}else if("checkbox"===i)n=t[rt];else if("radio"===i){if(!t[rt])return;n=t[ot]}e.data=e.input2data(n)}return{$init:function(){if("INPUT"!==(t=e.$targetElt).tagName&&"TEXTAREA"!==t.tagName&&"SELECT"!==t.tagName)throw"@value can only be used on input, textarea and select elements";if(i="text","INPUT"===t.tagName&&(i=t.getAttribute("type"),-1===st.indexOf(i)))throw"Invalid input type '"+i+"': @value can only be used on types '"+st.join("', '")+"'";t.addEventListener("change",s,dt)},$render:function(){if(void 0===e.input2data&&(e.input2data=function(e){if("number"===i){if(""===e)return 0;try{e=parseFloat(e)}catch(e){return console.log("@value conversion error: ",e),0}}return e}),void 0===e.data2input&&(e.data2input=vt),o!==e.data){o=e.data;var n=e.data2input(o);if("text"===i||"number"===i)t[ot]=n;else if("range"===i){if(!Number.isInteger(n))throw"Invalid input value '"+n+"': value of input type range shall be an integer";t[ot]=""+n}else"checkbox"===i?t[rt]=!!n:"radio"===i&&(t[rt]=n===t[ot])}if(r!==e.events){for(var d=e.events.split(";"),l=0,c=r.split(";");l<c.length;l++)"change"!==(v=c[l])&&d.indexOf(v)<0&&a[v]&&(t.removeEventListener(v,s,dt),a[v]=!1);for(var u=0,f=d;u<f.length;u++){var v;"change"!==(v=f[u])&&(a[v]||(t.addEventListener(v,s,dt),a[v]=!0))}r=e.events}},$dispose:function(){if(t){if(t.removeEventListener("change",s),""!==r)for(var e=0,i=r.split(";");e<i.length;e++){var o=i[e];"change"!==o&&t.removeEventListener(o,s,dt)}r="",n=void 0}}}}).$apiClass=lt,it.$isDecorator=!0,it),ut=function(){function e(e){void 0===e&&(e="Error in callback"),this.errContext=e,this.timeoutId=null,this.duration=100}return e.prototype.process=function(e){var t=this;this.duration<=0?ft(e,this.errContext):(null!==this.timeoutId&&clearTimeout(this.timeoutId),this.timeoutId=setTimeout((function(){t.timeoutId=null,ft(e,t.errContext)}),this.duration))},e}();function ft(e,t){try{e()}catch(e){throw"Debounce - "+t+"\n"+(e.message?e.message:e)}}function vt(e){return e}var pt,ht,mt,gt,bt,wt,yt,Nt,xt,Ct,It,Dt,kt,Pt,$t,Ot,jt,At=function(){function n(){}return e([j(V),t("design:type",String)],n.prototype,"comment",void 0),e([j(V),t("design:type",String)],n.prototype,"color",void 0),n=e([O],n)}(),Vt=["WH","BK","RD","BL"],Rt={WH:"white",BK:"black",RD:"red",BL:"blue"},Et=(yt={},Nt=["class","comment"],xt=["class","color"],Ct=[" ",""," "],It=["class","output"],Dt=["class","lbl"],kt=[" ",""," "],Pt=["class","lbl"],$t=[" ",""," "],Ot=[9],jt=function(){function n(){}return e([Le(ze(At)),t("design:type",At)],n.prototype,"d",void 0),n=e([Xe],n)}(),pt="main",ht=".../select/select.ts",mt=yt,gt=function(e,t,n){var i,o,r,a,s,d=n.d,l=0,c=(a=20,(s=(r=e).cm)?(r.nodes=new Array(a),r.cmAppends||(r.cmAppends=[],r.anchorNode&&(r.cmAppends[0]=function(e,t){e.domNode?tt(e.domNode,r.anchorNode,r.rootDomNode):e.domNode=r.rootDomNode}))):r.cmAppends=null,s);!function(e,t,n,i){if(t){var o={kind:"#fragment",uid:"fra"+ ++Z,idx:n,parentIdx:-1,ns:"",domNode:void 0,attached:!0,nextSibling:void 0,firstChild:void 0,lastChild:void 0,contentView:null};e.nodes[n]=o;var r=e.cmAppends[i];r(o,!1),e.cmAppends[i+1]=function(e,t){r(e,!0),t||Pe(o,e)}}}(e,c,0,0),ke(e,c,1,1,"div",1),$e(e,c,0,2,2,0," Multi-line text (textarea): ",0),ke(e,c,3,1,"textarea",0,0,Nt),Ee(e,c,0,4,3,"value",ct,2),Re(e,c,0,4,0,0,d,"comment"),He(e,c,0,4),ke(e,c,5,1,"div",1),$e(e,c,0,6,2,0," Color (select): ",0),ke(e,c,7,1,"select",1,0,xt),Ee(e,c,0,8,7,"value",ct,2),Re(e,c,0,8,0,0,d,"color"),Ae(e,c,9,2,1);for(var u=0,f=Vt;u<f.length;u++){var v=f[u];ke(i=xe(e,0,9,2,++l),o=i.cm,0,0,"option",1),Ve(i,0,0,"value",Oe(i,0,v)),$e(i,o,0,1,1,0,Ct,1,Oe(i,1,Rt[v])),De(i)}He(e,c,0,8),ke(e,c,10,1,"div",1,0,It),$e(e,c,0,11,2,0," Data model values: ",0),ke(e,c,12,1,"div",1),ke(e,c,13,2,"div",1,0,Dt),$e(e,c,0,14,3,0," comment: ",0),$e(e,c,0,15,2,0,kt,1,Oe(e,0,d.comment.replace(/\n/g,"\n"))),ke(e,c,16,1,"div",1),ke(e,c,17,2,"div",1,0,Pt),$e(e,c,0,18,3,0," color: ",0),$e(e,c,0,19,2,0,$t,1,Oe(e,1,d.color)),De(e,0,Ot)},bt=jt,function(){return new pe(pt,ht,mt,gt,bt,wt)}),St=new At;St.comment="line1\nline2",St.color="BL",Et().attach(document.body).render({d:St})}();
