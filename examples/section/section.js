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
    ***************************************************************************** */function e(e,t,n,i){var o,r=arguments.length,s=r<3?t:null===i?i=Object.getOwnPropertyDescriptor(t,n):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)s=Reflect.decorate(e,t,n,i);else for(var a=e.length-1;a>=0;a--)(o=e[a])&&(s=(r<3?o(s):r>3?o(t,n,s):o(t,n))||s);return r>3&&s&&Object.defineProperty(t,n,s),s}function t(e,t){if("object"==typeof Reflect&&"function"==typeof Reflect.metadata)return Reflect.metadata(e,t)}var n="ΔTrackable",i="ΔChangeVersion",o="ΔDefFactories",r="ΔIsFactory",s="ΔΔProxy",a="ΔIsProxy",d="ΔDefault",c="ΔCreateProxy",l="ΔnewItem",f="Δdispose",u="Δjson",v=!1;function h(e){return e&&e.ΔTrackable?e.ΔMd?e.ΔMd:e.ΔMd={parents:void 0,refreshCtxt:void 0,watchers:void 0}:null}var p=Array.isArray;function m(e,t){e&&(p(e)&&!e[a]?e.forEach(t):t(e))}function w(e,t){if(e&&t){if(e===t)return;if(p(e)){var n=e;if(1===n.length){if(n[0]===t)return}else{var i=n.indexOf(t);if(i>-1)return n.splice(i,1),1===n.length?n[0]:n}}}return e}function g(e,t){return e?p(e)&&!e[a]?(e.push(t),e):[e,t]:t}function b(e){return e&&!0===e[n]?e[i]:0}function N(e,t){if(void 0===t&&(t=!1),C(e)){e[f]?e[f](t):y(e,(function(n,i){L(e,i),e["ΔΔ"+n]=void 0,t&&N(i,!0)}));var n=e.ΔMd;if(n){var i=[];m(n.parents,(function(e){i.push(e)}));for(var o=function(t){y(t,(function(n,i){i===e&&(L(t,e),t["ΔΔ"+n]=void 0)})),K(t)},r=0,s=i;r<s.length;r++){o(s[r])}}}}function y(e,t){if(C(e)){var n=e.constructor.prototype["ΔDefFactories"];for(var i in n)n.hasOwnProperty(i)&&t(i,e["ΔΔ"+i],n[i])}}function x(e,t){return!(!e||"object"!=typeof e)&&"ΔΔ"+t in e}function C(e){return!(!e||!0!==e[n])}function D(e){return b(e)%2==1}function I(e,t){var n=h(e);return n&&t?(n.watchers=g(n.watchers,t),D(e)&&B.register(e),t):null}function k(e,t){var n=e?e.ΔMd:void 0;n&&t&&(n.watchers=w(n.watchers,t))}function P(e,t){if(e&&void 0!==t){if(e[l])return e[l](t);v=!0;var n=e[t];return v=!1,n}}function V(e,t){if(e&&t){var n=e[d];if(n){var i=n(t);if(i!==j)return e[t]=i}var r=e[o],s=r?r[t]:null;if(s)return e[t]=s()}}var A=function(){var e,t,n=[],i=[],o={getDefaultConversion:function(){return r(e,o)},getPreviousConversion:function(){return e.ΔtoJsResult}};function r(e,n){var i=n.getPreviousConversion();if(i)return i;var o=void 0;if(e.Δconvert)o=e.Δconvert(t);else{if(e["Δjson"])return e["Δjson"];o={},y(e,(function(e,n){C(n)&&(n=s(n,t)),void 0!==n&&(o[e]=n)}))}return o}function s(s,a){var d=0===n.length,c=s;if(s&&C(s)&&(n.push(s),c=void 0,i.push(s),e=s,a?(t=a,c=a(s,o)):c=r(s,o),s.ΔtoJsResult=c,i.pop(),e=i[i.length-1]),d){for(var l=n.length;l--;)n[l]["ΔtoJsResult"]=void 0;e=null,n=[],t=void 0}return c}return s}();var j={};function O(){return""}O[r]=!0;var $=O;function R(){return 0}R[r]=!0;var S=R;function T(){return!1}T[r]=!0;var F=T;function E(){return null}E[r]=!0;var H=E;function M(){}M[r]=!0;var z=M;function X(e,t,n,i,o,r){var a=C(i),d=o===z;if(!e.ΔComputeDependencies){i&&!a&&o.ΔCreateProxy&&(a=C(i=o.ΔCreateProxy(i)||i));var c=!1,l=r[n];return D(e)?c=l!==i:l!==i&&(K(e),c=!0),c&&(a&&void 0===i&&(i=null),(a||l&&C(l))&&function(e,t,n,i){L(e,t),i||W(e,n)}(e,l,i,d),r[n]=i,function(e,t,n,i,o){var r=e?e.ΔMd:void 0;if(r&&r.trackers){var a=e[s]||e;m(r.trackers,(function(e){e(a,t,n,i,o)}))}}(e,"set",t,l,i)),i}console.error("[Trax] @computed properties must not mutate the Data object when calculated")}function K(e){if(C(e)){var t=!0;if(D(e)?t=!1:e.ΔChangeVersion+=1,B.register(e),t){var n=e.ΔMd;n&&n.parents&&m(n.parents,(function(e){K(e)}))}}}function L(e,t){if(t){var n=t.ΔMd;n&&n.parents&&(n.parents=w(n.parents,e))}}function W(e,t){if(t){var n=h(t);n&&(n.parents=g(n.parents,e))}}var J=0,_=function(){function e(){this.id=++J}return e.prototype.register=function(e){var t=this,n=h(e);n&&!n.refreshCtxt&&(this.objects?this.objects.push(e):(this.objects=[e],Promise.resolve().then((function(){t.refresh()}))),n.refreshCtxt=this)},e.prototype.refresh=function(e){void 0===e&&(e=!0);var t=this.objects,n=t?t.length:0;if(n){U();for(var i,o,r=[],s=0;n>s;s++)(o=(i=t[s]).ΔMd).refreshCtxt&&(i.ΔChangeVersion%2&&(i.ΔChangeVersion+=1),o.refreshCtxt&&o.watchers&&r.push({dataNode:i,watchers:o.watchers})),o.refreshCtxt=void 0;this.objects=void 0,r.length&&(e?q(r):Promise.resolve().then((function(){q(r)})))}},e}();function q(e){for(var t=function(e){m(e.watchers,(function(t){t(e.dataNode)}))},n=0,i=e;n<i.length;n++){t(i[n])}}var B=new _;function U(){B.objects&&(B=new _)}var Y=/^\Δ/,G=function(){function e(e){this.ΔTrackable=!0,this.ΔDataFactory=!0,this.ΔChangeVersion=0,this.ΔMd=void 0,this.ΔΔSelf=this,this.ΔIsProxy=!1,this.ΔItemFactory=e}return e.ΔNewProxy=function(t){var n=new Proxy({},new e(t));return n[s]=n,n},e.ΔCreateProxy=function(t,n){if("object"==typeof t){var i=new Proxy(t,new e(n));for(var o in K(i),t)t.hasOwnProperty(o)&&W(i,t[o]);return i}return null},e.prototype.ΔnewItem=function(e){var t=this.ΔItemFactory();return X(this.ΔΔSelf,e,e,t,this.ΔItemFactory,this.ΔΔDict)},e.prototype.Δdispose=function(e){void 0===e&&(e=!1);var t,n=this.ΔΔDict;for(var i in n)n.hasOwnProperty(i)&&(t=n[i],L(this.ΔΔSelf,t),n[i]=void 0,e&&N(t,!0));return n},e.prototype.Δconvert=function(e){var t={},n=this.ΔΔDict;for(var i in n)n.hasOwnProperty(i)&&(t[i]=A(n[i],e));return t},e.prototype.ΔinitFromJson=function(){var e=this["Δjson"];if(e){if(e.constructor!==Object)console.error("[Trax] Invalid json type: Dictionaries can only be initialized from Objects");else{var t=this.ΔΔDict,n=void 0,i=void 0;for(var o in e)if(e.hasOwnProperty(o))if(i=n=e[o],n){var r=this.ΔItemFactory();C(r)&&(r["Δjson"]=n,i=r),t[o]=i}else null===n&&(t[o]=null)}this["Δjson"]=void 0}},e.prototype.ΔToString=function(){return"Trax Dict {...}"},e.prototype.set=function(e,t,n){return this.ΔΔDict||(this.ΔΔDict=e),t.match(Y)?this[t]=n:X(this.ΔΔSelf,t,t,n,this.ΔItemFactory,this.ΔΔDict),!0},e.prototype.get=function(e,t){return this.ΔΔDict||(this.ΔΔDict=e),t===a||(this["Δjson"]&&this.ΔinitFromJson(),t===Symbol.iterator?this.ΔΔDict[Symbol.iterator]:"string"===typeof t?t.match(Y)?this[t]:this.ΔΔDict[t]:this[t])},e.prototype.deleteProperty=function(e,t){return this.ΔΔDict||(this.ΔΔDict=e),!t.match(Y)&&(X(this.ΔΔSelf,t,t,null,this.ΔItemFactory,this.ΔΔDict),delete this.ΔΔDict[t],!0)},e}();function Q(e){function t(){return G.ΔNewProxy(e)}return e=e||H,t[r]=!0,t[c]=function(t){return G.ΔCreateProxy(t,e)},t}var Z=0,ee={log:function(e){for(var t=[],n=1;n<arguments.length;n++)t[n-1]=arguments[n];console.log.apply(console,arguments)},error:function(e){for(var t=[],n=1;n<arguments.length;n++)t[n-1]=arguments[n];console.error.apply(console,arguments)}};function te(e,t){for(var n=e,i=[];n;){if(n.template){var o=n.template;i.push('\n>> Template: "'+o.templateName+'" - File: "'+o.filePath+'"')}n=n.parentView}ee.error("IVY: "+t+i.join(""))}var ne=void 0,ie=11,oe="$api",re=/^ΔΔ(\w+)Emitter$/,se=/^ΔΔ(.+)$/,ae="ΔIsAPI",de="ΔIsController",ce=0,le=function(){function e(e,t,n,i,o,r){this.templateName=e,this.filePath=t,this.staticCache=n,this.renderFn=i,this.$Class=o,this.$contextIdentifiers=r,this.kind="$template",this._uid=++ce,this.tplApi=void 0,this.tplCtl=void 0,this.forceRefresh=!1,this.activeWatch=!1,this.lastRefreshVersion=0,this.processing=!1,this.rendering=!1,this.initialized=!1,this.labels=void 0,this.hasCtlClass=!1,this.$contextInitialized=!1,this.view=pe(null,null,1,this);var s=this;this.watchCb=function(){s.notifyChange()},this.watchCb.$templateId=this._uid,this.$Class!==ne&&(it(this.$Class,de)?this.hasCtlClass=!0:it(this.$Class,ae)||C(this.$Class.prototype)||te(this.view,"Type of $ argument must be either a @Controller, an @API or a @Data class"))}return e.prototype.dispose=function(e){void 0===e&&(e=!0);var t=this.view;this.disconnectObserver(),ue(t,this.tplCtl,"$dispose",this.templateName),e&&t&&t.nodes&&t.nodes.length&&(Qe(t,t.nodes[0]),t.anchorNode&&(t.rootDomNode.removeChild(t.anchorNode),t.anchorNode=null))},Object.defineProperty(e.prototype,"uid",{get:function(){return this._uid},enumerable:!0,configurable:!0}),Object.defineProperty(e.prototype,"document",{get:function(){return this.view.doc},set:function(e){this.view.doc=e},enumerable:!0,configurable:!0}),Object.defineProperty(e.prototype,"api",{get:function(){if(!this.tplApi)if(this.hasCtlClass){var e=this.controller;e&&e.$api&&(this.tplApi=e.$api)}else this.$Class?(this.tplApi=new this.$Class,fe(this.view,this.tplApi,this.staticCache)):this.$contextIdentifiers?this.tplApi=function(e){return void 0!==e?(t[r]=!0,Q(t)()):Q()();function t(){return new e}}():this.tplApi={};return this.tplApi},enumerable:!0,configurable:!0}),Object.defineProperty(e.prototype,"controller",{get:function(){if(!this.tplCtl&&this.hasCtlClass){var e=this.tplCtl=new this.$Class;if(x(e,"$template")&&(e.$template=this),x(e,"$logger")){var t=this.view;e.$logger={log:ee.log,error:function(e){for(var n=[],i=1;i<arguments.length;i++)n[i-1]=arguments[i];te(t,e+(n.length?" "+n.join(" "):""))}}}e[oe]&&fe(this.view,e[oe],this.staticCache)}return this.tplCtl},enumerable:!0,configurable:!0}),e.prototype.attach=function(e){if(this.view.rootDomNode)te(this.view,"Template host cannot be changed once set");else{var t=this.view;if(!t.doc)throw new Error("[iv] Template.document must be defined before calling Template.attach()");t.rootDomNode=e,t.anchorNode=t.doc.createComment("template anchor"),ot(t.anchorNode,e)}return this},e.prototype.registerLabel=function(e,t){this.labels||(this.labels={});var n=this.labels[e];n?n.push(t):n=this.labels[e]=[t]},e.prototype.query=function(e,t){if(void 0===t&&(t=!1),this.rendering)return null;for(var n=[],i=0,o=e.split(";");i<o.length;i++){var r=o[i];if(r&&"#"!==r.charAt(0))return te(this.view,"[$template.query()] Invalid label argument: '"+r+"' (labels must start with #)"),null;var s=this.labels&&this.labels[r]||null;if(s&&s.length){if(!t)return s[0];n=n.concat(s)}}return n.length?n:null},e.prototype.notifyChange=function(){this.render()},e.prototype.disconnectObserver=function(){this.activeWatch&&(k(this.api,this.watchCb),k(this.controller,this.watchCb),this.activeWatch=!1)},e.prototype.render=function(e,t){if(void 0===t&&(t=!1),this.processing)return this;t&&(this.forceRefresh=!0),this.processing=!0;var n=this.api,i=this.controller,o=this.view,r=this.$contextIdentifiers;i&&!C(i)&&(te(o,"Template controller must be a @Controller Object - please check: "+this.$Class.name),this.tplCtl=this.$Class=void 0);var s=!1;if(n&&e)if(r!==ne){var a=e.context;a!==ne&&"object"==typeof a&&(s=!0)}else for(var d in D(n)||U(),this.disconnectObserver(),e)e.hasOwnProperty(d)&&(n[d]=e[d]);if(this.$contextInitialized&&(s=!0),s){var c="",l=(e?e.context:null)||n.$context;if(l){for(var f=0;r.length>f;f++)n[c=r[f]]=l[c];n.$context=l,this.$contextInitialized=!0}}r===ne||this.$contextInitialized||te(o,"Missing $fragment context");var u=!this.forceRefresh,v=o.nodes;if(v&&v[0]&&v[0].attached||(u=!1),u&&b(n)+b(i)>this.lastRefreshVersion&&(u=!1),!u){i&&(this.initialized||(ue(o,i,"$init","controller"),this.initialized=!0),ue(o,i,"$beforeRender","controller")),this.rendering=!0,this.labels=void 0,o.lastRefresh++,o.instructions=void 0;try{this.renderFn(o,this.hasCtlClass?i:n,n,this)}catch(e){te(o,"Template execution error\n"+(e.message||e))}this.rendering=!1,i&&ue(o,i,"$afterRender","controller"),function(e,t){if(void 0===t&&(t=!1),e){var n=e.ΔMd;n&&n.refreshCtxt?n.refreshCtxt.refresh(!0):t&&U()}}(n),this.forceRefresh=!1,this.lastRefreshVersion=b(n)+b(i)}return this.activeWatch||(I(n,this.watchCb),i&&I(i,this.watchCb),this.activeWatch=!0),this.processing=!1,this},e}();function fe(e,t,n){var i=n.events;if(void 0===i){var o=void 0;for(var r in t)if(r.match(re)){var s=RegExp.$1;o||(o=[]),"function"!=typeof t[s+"Emitter"].init?te(e,"Invalid EventEmitter: "+s+"Emitter"):(o.push(s+"Emitter"),o.push(s),t[s+"Emitter"].init(s,t))}n.events=o||null}else if(null!==i)for(var a=i.length,d=0;a>d;d+=2)t[i[d]].init(i[d+1],t)}function ue(e,t,n,i){if(t&&"function"==typeof t[n]){var o=void 0;try{void 0!==(o=t[n]())&&"function"==typeof o.catch&&o.catch((function(t){te(e,i+" "+n+" hook execution error\n"+(t.message||t))}))}catch(t){te(e,i+" "+n+" hook execution error\n"+(t.message||t))}}}function ve(e,t){return(t=t||this.namespace)?this.doc.createElementNS(t,e):this.doc.createElement(e)}function he(){return function(e){if(e!==ne&&null!==e){var t=!0;return st(e,!1,(function(e){if(!t)return!1;var n=e.kind;if("#view"===n){var i=e;if(i.cm){var o=i.doc.createDocumentFragment();i.domNode=o,i.cmAppends=[function(e){e.domNode?ot(e.domNode,o):e.domNode=o}]}Ie(i)}else if("#element"===n||"#text"===n)return t=!1;return!0})),t}return!0}(this)}function pe(e,t,n,i){var o={kind:"#view",uid:"view"+ ++Z,attached:!1,nodes:null,namespace:void 0,namespaces:void 0,doc:null,parentView:e,cm:!0,cmAppends:null,lastRefresh:0,container:null,projectionHost:null,template:i,rootDomNode:null,anchorNode:null,expressions:void 0,oExpressions:void 0,instructions:void 0,paramNode:void 0,createElement:ve,isEmpty:he};return e?we(o,e,t):o.doc="undefined"!=typeof document?document:null,o}function me(e,t,n){if(n){var i=function(e){var t=e;for(;t&&!t.template;)t=t.parentView;return t}(e);if(i!==ne&&null!==i)for(var o=i.template,r=n.length,s=0;r>s;s++)o.registerLabel(n[s],t)}}function we(e,t,n){if(e.parentView=t,e.doc=t.doc,e.container=n,e.rootDomNode=t.rootDomNode,t.namespace){var i=t.namespace;e.namespace=i,e.namespaces=[i]}}function ge(e,t,n,i,o,r){return function(){return new le(e,t,n,i,o,r)}}var be=[];function Ne(e,t,n){var i=e.cm;return i?(e.nodes=new Array(n),e.cmAppends||(e.cmAppends=[],e.anchorNode&&(e.cmAppends[0]=function(t,n){t.domNode?rt(t.domNode,e.anchorNode,e.rootDomNode):t.domNode=e.rootDomNode}))):e.cmAppends=null,i}function ye(e,t,n,i,o){var r,s=e.nodes[n];if(s&&s.attached||te(e,"Invalid ζview call: container must be attached ("+(s?s.uid:"XX")+") - pview: "+e.uid+" containerIdx: "+n),"#container"===s.kind)if("##block"===s.subKind){var a=(d=s).views;1===o&&(d.insertFn=null),1===o&&d.views.length>1?(d.previousNbrOfViews=a.length,r=a.shift(),d.viewPool.length?d.viewPool=a.concat(d.viewPool):d.viewPool=a,d.views=[r]):(r=d.views[o-1])||(d.viewPool.length>0?(d.insertFn||(d.insertFn=ke(e,d)),Ve((r=a[o-1]=d.viewPool.shift()).nodes[0],d.insertFn),r.attached=!0):((r=a[o-1]=pe(e,d)).nodes=new Array(i),e.cm&&d.cmAppend?r.cmAppends=[d.cmAppend]:e.cm||(r.cmAppends=[ke(e,d)]))),d.lastRefresh=r.lastRefresh=e.lastRefresh}else{var d;(r=(d=s).contentView)||((r=d.contentView=pe(e,d)).nodes=new Array(i)),r.lastRefresh=e.lastRefresh}else if("#param"===s.kind){var c=s;(r=c.contentView)||(r=c.contentView=pe(e,null),c.viewPool&&(c.viewPool[c.viewInstanceIdx]=r),r.nodes=new Array(i),r.paramNode=c),r.lastRefresh=e.lastRefresh}return r}function xe(e,t,n,i,o,r){var s=r||ye(e,0,n,i,o);if(1===t)s.instructions=[];else{for(var a=s,d=t-1;d>0;)a=a.parentView,d--;a.instructions||(a.instructions=[]),s.instructions=a.instructions}return s.cm&&!s.cmAppends&&De(s,Ce,[s,e,n]),s}function Ce(e,t,n){var i=t.nodes[n];"#container"===i.kind&&!e.cmAppends&&i.cmAppend&&(e.cmAppends=[i.cmAppend])}function De(e,t,n){e.instructions.push(t),e.instructions.push(n)}function Ie(e){if(e.instructions){var t=e.instructions.slice(0),n=t.length;if(e.instructions.splice(0,n),e.instructions=void 0,n)for(var i=0;n>i;i+=2)t[i].apply(null,t[i+1])}}function ke(e,t){var n=function e(t,n){for(;;){if(n||te(t,"Internal error - findNextSiblingDomNd: nd cannot be undefined"),0===n.idx){if(!n.attached)return{position:"defer",parentDomNd:void 0};if(n.domNode.nodeType===ie)return{position:"lastChild",parentDomNd:n.domNode};var i=t.parentView;if(i){if(t.projectionHost){var o=t.projectionHost.hostNode;return"#element"===o.kind?{position:"lastChild",parentDomNd:o.domNode}:e(t.projectionHost.view,o)}if(t.container&&"##block"===t.container.subKind){var r=t.container,s=r.views.indexOf(t);if(s>-1)for(var a=void 0,d=void 0,c=s+1;c<r.views.length;c++)if((a=r.views[c]).nodes&&a.nodes.length&&(d=m(a,a.nodes[0],r.domNode)))return d;for(var l=r.viewPool,f=void 0,u=0,v=l;u<v.length;u++){if((a=v[u]).nodes&&a.nodes.length&&a.attached&&(f=m(a,a.nodes[0],r.domNode)))return f}}return e(i,t.container)}return{position:"lastOnRoot",parentDomNd:t.rootDomNode,nextDomNd:t.anchorNode}}if(!n.nextSibling){var h=t.nodes[n.parentIdx];return"#element"===h.kind?{position:"lastChild",parentDomNd:Ge(t,n)}:e(t,h)}var p=m(t,n.nextSibling,Ge(t,n));if(p)return p;n=n.nextSibling}function m(e,t,n){if(!t)return null;if("#element"===t.kind||"#text"===t.kind)return{position:"beforeChild",nextDomNd:t.domNode,parentDomNd:n};if("#fragment"===t.kind){for(var i=void 0,o=t.firstChild;o;){if(i=m(e,o,n))return i;o=o.nextSibling}if(t.contentView){var r=t.contentView;if(r.nodes)return m(r,r.nodes[0],n)}return null}if("#container"===t.kind){var s=t;i=null;if("##block"===s.subKind)for(var a=s.views,d=a.length,c=0;d>c&&!(i=m(a[c],a[c].nodes[0],n));c++);else if("##cpt"===s.subKind){var l=s.template.view;i=m(l,l.nodes[0],n)}return i||null}throw new Error("TODO findFirstDomNd: "+t.kind)}}(e,t),i=n.position,o=n.nextDomNd,r=n.parentDomNd;return"beforeChild"===i||"lastOnRoot"===i?function(e,t){e.domNode?rt(e.domNode,o,r):e.domNode=r}:"lastChild"===i?function(e,t){e.domNode?ot(e.domNode,r):e.domNode=r}:function(){console.warn("TODO: VALIDATE VIEW APPEND: ",i),function(e,t,n){void 0===t&&(t="");n&&e.uid!==n||(console.log(""),console.log(at),t&&console.log(t+":"),function e(t,n){void 0===n&&(n="");if(!t.nodes)return void console.log(""+n+t.uid+" - no nodes");var i=t.parentView?t.parentView.uid:"XX",o=t.projectionHost,r=o?" >>> projection host: "+o.hostNode.uid+" in "+o.view.uid:"";console.log(n+"*"+t.uid+"* cm:"+t.cm+" isTemplate:"+(void 0!==t.template)+" parentView:"+i+r);for(var s,a=t.nodes.length,d="",c=0;a>c;c++)if(s=t.nodes[c])if(d=s.uid.length<5?["     ","    ","   ","  "," "][s.uid.length]:"","#container"===s.kind){var l=s,f=l.domNode?l.domNode.uid:"XX";if(console.log(n+"["+c+"] "+s.uid+d+" "+f+" attached:"+(s.attached?1:0)+" parent:"+C(s.parentIdx)+" nextSibling:"+(s.nextSibling?s.nextSibling.uid:"X")),"##block"===l.subKind){var u=l,v=u.views.length;if(v)for(var h=0;v>h;h++)if(u.views[h]){var p=u.views[h];f=p.rootDomNode?p.rootDomNode.$uid:"XX",console.log(n+"  - view #"+h),e(u.views[h],"    "+n)}else console.log(n+"  - view #"+h+" UNDEFINED");else console.log(n+"  - no child views")}else if("##cpt"===l.subKind){var m=l,w=m.template,g=m.contentView;g?(console.log(n+"  - light DOM:"),e(g,"    "+n)):console.log(n+"  - light DOM: none"),w?(console.log(n+"  - shadow DOM:"),e(w.view,"    "+n)):console.log(n+"  - no template")}else console.log(n+"  - "+l.subKind+" container")}else{f=s.domNode?s.domNode.uid:"XX";var b="";if(s.domNode&&"#text"===s.kind)b=" text=#"+s.domNode._textContent+"#";else if("#fragment"===s.kind||"#element"===s.kind){for(var N=[],y=s.firstChild;y;)N.push(y.uid),y=y.nextSibling;b=" children:["+N.join(", ")+"]";var x=s.contentView;x&&(b+=" >>> content view: "+x.uid)}console.log(n+"["+s.idx+"] "+s.uid+d+" "+f+" attached:"+(s.attached?1:0)+" parent:"+C(s.parentIdx)+" nextSibling:"+(s.nextSibling?s.nextSibling.uid:"X")+b)}else console.log(n+"["+c+"] XX");function C(e){return e<0?"X":e}}(e))}(e,"getViewInsertFunction for "+t.uid)}}function Pe(e,t,n){var i=e.nodes[t];if(i&&"##block"===i.subKind){var o=i,r=o.lastRefresh;if(n||r===e.lastRefresh){var s=o.views.length;if(!n){if(s!==o.previousNbrOfViews)for(var a=o.viewPool,d=a.length,c=void 0,l=0;d>l;l++)Qe(c=a[l],c.nodes[0]),c.attached=!1;o.previousNbrOfViews=s}}else Qe(e,o)}}function Ve(e,t,n){if(!e.attached){if(t(e,!0),e.attached=!0,"#fragment"===e.kind)for(var i=e.firstChild;i;)Ve(i,t),i=i.nextSibling;else if("#container"===e.kind){var o=e.subKind;if("##cpt"===o){var r=e.template,s=r?r.view.nodes[0]:null;r&&(r.forceRefresh=!0),s&&(Ve(s,t),r.view.attached=!0)}else if("##block"===o)for(var a=e.views,d=0;a.length>d;d++)Ve(a[d].nodes[0],t),a[d].attached=!0}if("#fragment"===e.kind||"#element"===e.kind){var c=e.contentView;c&&(Ve(c.nodes[0],t),c.attached=!0)}}}function Ae(e,t,n){if(n)for(var i=n.length,o=0;i>o;o++)Pe(e,n[o],e.cm);e.cm&&(e.cm=!1,e.cmAppends=null)}function je(e,t,n){if(e.paramNode){var i=e.paramNode;i.dataHolder?(De(e,Ae,[e,t,n]),i.data&&"#view"!==i.data.kind?i.data?i.data.$content=e:console.warn("TODO: ζendD no data"):i.dataHolder[i.dataName]=e):te(e,"ζendD dataHoler should be defined")}else De(e,Ae,[e,t,n])}function Oe(e,t,n,i,o,r,s,a,d){if(t){var c=e.createElement(o);if(a)for(var l=a.length,f=0;l>f;f+=2)c.setAttribute(a[f],a[f+1]);if(d){l=d.length;for(var u=0;l>u;u+=2)c[d[u]]=d[u+1]}var v={kind:"#element",uid:"elt"+ ++Z,idx:n,parentIdx:-1,ns:"",domNode:c,attached:!0,nextSibling:void 0,firstChild:void 0,lastChild:void 0,contentView:null};e.nodes[n]=v,me(e,c,s),e.cmAppends[i](v,!1),r&&(e.cmAppends[i+1]=function(e,t){e.domNode?ot(e.domNode,c):e.domNode=c,t||Re(v,e)})}else s&&me(e,e.nodes[n].domNode,s)}function $e(e,t,n,i,o,r,s,a,d){t&&De(e,Oe,[e,t,n,i,o,r,s,a,d])}function Re(e,t){e.firstChild?(e.lastChild.nextSibling=t,e.lastChild=t):(e.firstChild=e.lastChild=t,t.nextSibling=void 0),t.parentIdx=e.idx}function Se(e,t,n,i,o,r,s,a){for(var d,c=[],l=8;l<arguments.length;l++)c[l-8]=arguments[l];if(a){var f=void 0,u=void 0,v=!1;f=t?s.slice(0):(d=e.nodes[i]).pieces;for(var h=0;a>h;h++)(u=Ee(e,n,c[h]))!==be&&(v=!0,f[1+2*h]=null==u?"":u);if(!t)return v&&(d.domNode.textContent=f.join("")),void me(e,d.domNode,r);d=p(e.doc.createTextNode(f.join("")),f),me(e,d.domNode,r)}else{if(!t)return void(r&&me(e,e.nodes[i].domNode,r));d=p(e.doc.createTextNode(s),void 0),me(e,d.domNode,r)}function p(e,t){return{kind:"#text",uid:"txt"+ ++Z,domNode:e,attached:!0,idx:i,parentIdx:-1,pieces:t,nextSibling:void 0}}e.nodes[i]=d,e.cmAppends[o](d,!1)}function Te(e,t,n,i,o,r,s,a){for(var d=[],c=8;c<arguments.length;c++)d[c-8]=arguments[c];for(var l=[e,t,n,i,o,r,s,a],f=0;a>f;f++)l.push(d[f]);De(e,Se,l)}function Fe(e,t,n){if(e.expressions){var i=e.expressions;if(i.length>t&&i[t]===n)return be;i[t]=n}else e.expressions=[],e.expressions[t]=n;return n}function Ee(e,t,n){if(t){if(n[2]){var i=e.oExpressions;return i[2*n[0]]?be:(i[2*n[0]]=1,n[1])}return Fe(e,n[0],n[1])}return n}function He(e,t,n,i){if(t){var o={kind:"#fragment",uid:"fra"+ ++Z,idx:n,parentIdx:-1,ns:"",domNode:void 0,attached:!0,nextSibling:void 0,firstChild:void 0,lastChild:void 0,contentView:null};e.nodes[n]=o;var r=e.cmAppends[i];r(o,!1),e.cmAppends[i+1]=function(e,t){r(e,!0),t||Re(o,e)}}}function Me(e,t,n,i){De(e,He,[e,t,n,i])}function ze(e,t,n,i,o){if(t){var r=Xe(n,null,o);return e.nodes[n]=r,Ke(e,r,i),r}}function Xe(e,t,n){var i;if(1===n)i={kind:"#container",subKind:"##block",uid:"cnb"+ ++Z,idx:e,parentIdx:-1,ns:"",domNode:void 0,attached:!0,nextSibling:void 0,views:[],viewPool:[],cmAppend:t,lastRefresh:0,previousNbrOfViews:0,insertFn:null};else{if(2!==n)return console.warn("TODO: new cnt type"),null;i={kind:"#container",subKind:"##cpt",uid:"cnc"+ ++Z,idx:e,parentIdx:-1,ns:"",domNode:void 0,attached:!0,nextSibling:void 0,cmAppend:t,cptRef:null,template:null,data:null,contentView:null,dynamicParams:void 0}}return i}function Ke(e,t,n){if(e.cmAppends){var i=e.cmAppends[n];i?(t.cmAppend=function(e,t){i(e,!0)},i(t,!1)):console.log("ERROR?",i===ne)}}function Le(e,t,n,i,o,r,s,a,d,c){var l;n=n||0,t?l=e.nodes[i]||ze(e,t,i,o,2):(l=e.nodes[i]).lists&&(l.lists.sizes={});var f=Ee(e,n,r);if(l.template){if(f!==be&&l.cptRef!==f){var u=l.data;l.template.dispose(!0),m();var v=l.data;for(var h in u)if(u.hasOwnProperty(h)&&h.match(se)){var p=RegExp.$1;x(v,p)&&(v[p]=u[p])}}}else{if(f===be)return void te(e,"Invalid component ref");m()}function m(){var t=l.template=f();l.cptRef=f,we(t.view,e,l),t.disconnectObserver(),l.data=t.api,function(t){if(d){var n=d.length;if(!t&&n)te(e,"Invalid parameter: "+d[0]);else for(var i=0;n>i;i+=2)x(t,d[i])?t[d[i]]=d[i+1]:te(e,"Invalid parameter: "+d[i])}}(t.api)}c&&(l.dynamicParams={}),0===n&&s&&Je(e,i,l,a,c)}function We(e,t,n,i,o,r,s,a,d,c){Le(e,t,n,i,o,r,s,a,d,c),De(e,Ke,[e,e.nodes[i],o]),s&&De(e,Je,[e,i,0,a,c])}function Je(e,t,n,i,o){var r=(n=n||e.nodes[t])?n.template:void 0;if(void 0!==r){if(r.view.lastRefresh=e.lastRefresh-1,Be(n),n.contentView){r.api.$content=n.contentView;var s=n.contentView.instructions;s&&s.length&&(r.forceRefresh=!0)}if(r.view.cm)r.view.cmAppends=[n.cmAppend];else{if(o)for(var a=o.length,d=(n?n.dynamicParams:{})||{},c=r.api,l=0;a>l;l++)d[o[l]]||V(c,o[l]);var f=r.view.nodes[0];if(!f.attached)r.forceRefresh=!0,Ve(f,ke(e,n))}i&&me(e,r.api,i),r.render()}}function _e(e,t,n,i,o){De(e,Je,[e,t,n,i,o])}function qe(e,t,n,i,o,r,s,a,d,c){var l,f=e.nodes,u=!1;if(f[i]){var v=(l=f[i]).viewPool;s>0&&!v&&((v=l.viewPool=[])[l.viewInstanceIdx]=l.contentView),v&&(l.contentView=v[s]),l.viewInstanceIdx=s,l.dataHolder=l.data=void 0,u=!0}else l={kind:"#param",uid:"pnd"+ ++Z,idx:i,parentIdx:o,nextSibling:void 0,domNode:void 0,attached:!0,dataName:r,dataHolder:void 0,data:void 0,dataIsList:void 0,contentView:void 0,dynamicParams:void 0,viewInstanceIdx:s,viewPool:void 0},f[i]=l;c&&(l.dynamicParams={});var h,p=f[o],m=r,w=void 0,g=p.data;if(g){if(l.dataHolder=g,void 0===l.dataIsList&&function(e,t,n,i){x(i,n)?t.dataIsList=!1:x(i,n+"List")?(t.dataIsList=!0,t.dataName=n+"List"):te(e,"Invalid parameter node: <."+n+">")}(e,l,m,g),m=l.dataName,w=l.data,l.dataIsList){var b=p.lists;b||(b=p.lists={sizes:{},listNames:[],listMap:{}}),b.listMap[m]||(b.listMap[m]=1,b.listNames.push(m));var N=b.sizes[m];N||(N=b.sizes[m]=0),(h=g[m][N])||(h=P(g[m],N)),b.sizes[m]+=1,l.data=h}else l.data=h=g[m],void 0===h&&(l.data=h=P(g,m));u&&h&&h["ΔΔ$content"]&&(l.contentView=h["ΔΔ$content"])}else te(e,"Invalid parameter node <."+r+"/>: no param node can be used in this context");l.lists&&(l.lists.sizes={});var y=p.dynamicParams;if(y&&(y[m]=1),d)if(h){if(w!==h)for(var C=d.length,D=0;C>D;D+=2)t&&!x(h,d[D])&&te(e,"Invalid param node parameter: "+d[D]),h[d[D]]=d[D+1]}else te(e,"Invalid param node parameter: "+d[0])}function Be(e){if(e.lists)for(var t=e.lists,n=t.listNames,i=void 0,o=void 0,r=void 0,s=void 0,a=0;n.length>a;a++)i=n[a],(o=t.sizes[i]||0)<(s=(r=e.data[i]).length)&&r.splice(o,s-o)}function Ue(e,t,n,i,o,r){var s=e.nodes[i];if(Be(s),r)for(var a=r.length,d=s.dynamicParams,c=0;a>c;c++)d&&!d[r[c]]&&V(s.data,r[c]);void 0!==s.contentView&&K(s.dataHolder)}function Ye(e,t,n,i,o){var r,s=e.nodes[n];if(1===o)if(i[de]){if(x(i,oe)){var a=i[oe];a!==ne&&(r=a.$content)}}else x(i,"$content")&&(r=i.$content);else r=Ee(e,t,i);if(r!==be&&void 0!==i||(r=s.contentView),r){var d=r.projectionHost;if(d&&d.hostNode!==s&&Qe(r,r.nodes[0]),s.contentView&&s.contentView!==r&&Qe(s.contentView,s.contentView.nodes[0]),s.contentView=r,r.projectionHost={view:e,hostNode:s},r.cm)if("#element"===s.kind){var c=s.domNode;r.cmAppends=[function(e){e.domNode?ot(e.domNode,s.domNode):e.domNode=c}]}else r.cmAppends=[ke(e,s)];else{var l=void 0,f=!1;if(r.domNode!==ne&&null!==r.nodes&&r.domNode.nodeType===ie&&(ot(r.nodes[0].domNode,s.domNode),function(e,t,n){if(!e||e.cm||!e.nodes||!e.nodes.length)return;n===ne&&(n=e.domNode);if(n===ne||t===n)return;st(e,!0,(function(e){return"#view"!==e.kind&&"#fragment"!==e.kind&&"#container"!==e.kind||e.domNode===n&&(e.domNode=t),!0}))}(r,s.domNode),f=!0),!f){if("#element"===s.kind){var u=s.domNode;l=function(e,t){e.domNode?ot(e.domNode,u):e.domNode=u}}else l=ke(e,s);Ve(r.nodes[0],l)}}r.container=s,Ie(r)}}function Ge(e,t){if(0===t.idx&&e.projectionHost){if(!t.attached)return null;var n=e.projectionHost.hostNode;return"#element"===n.kind?n.domNode:Ge(e.projectionHost.view,n)}return 0===t.idx?e.parentView?Ge(e.parentView,e.container):e.rootDomNode:e.nodes[t.parentIdx].domNode}function Qe(e,t){if(t&&t.attached)if("#text"===t.kind||"#element"===t.kind){var n=Ge(e,t);t.attached=!1,n?n.removeChild(t.domNode):te(e,"Internal error - parent not found for: "+t.uid)}else if("#container"===t.kind){if("##block"===t.subKind){for(var i=t,o=i.views,r=o.length,s=void 0,a=0;r>a;a++)s=o[a].nodes[0],Qe(o[a],s),o[a].attached=s.attached=!1,"#container"!==s.kind&&"#fragment"!==s.kind||(s.domNode=void 0);i.views=[],i.previousNbrOfViews=0,i.viewPool=o.concat(i.viewPool)}else if("##cpt"===t.subKind){var d=t.template;s=d.view.nodes[0];Qe(d.view,s),d.view.attached=s.attached=!1,"#container"!==s.kind&&"#fragment"!==s.kind||(s.domNode=void 0)}}else if("#fragment"===t.kind){var c=t;if(c.attached=!1,c.contentView)Qe(c.contentView,c.contentView.nodes[0]);else if(c.firstChild)for(var l=c.firstChild;l;)Qe(e,l),l=l.nextSibling;c.domNode=void 0}else"#param"===t.kind?console.warn("TODO removeFromDom for param nodes"):console.warn("RemoveFromDom for "+t.kind)}var Ze=function(e){var t=e.prototype;t[n]=!0,t[i]=0},et=function(e,t){return e||(e=E,t=3),function(n,i){var r="ΔΔ"+i,s=n[o];s||(s=n[o]={}),s[i]=t?1===t?E:M:e,n[r]=void 0,function(e,t,n,i){i&&delete e[t]&&Object.defineProperty(e,t,i)}(n,i,0,{get:function(){return function(e,t,n,i,o){e.ΔComputeDependencies&&(e.ΔComputeDependencies[n]=!0);!v&&e[u]&&function(e,t){var n,i;t&&y(e,(function(o,r,s){var a=s===z;if(n=t[o],i="ΔΔ"+o,void 0===n)a&&(e[i]=void 0);else{var d=typeof n;if(null===n)(a||s===H)&&(e[i]=null);else if("object"===d){var c=P(e,o);c?c[u]=n:a&&(e[i]=n)}else"string"===d?(a||s===$)&&(e[i]=n):"number"===d?(a||s===S)&&(e[i]=n):"boolean"===d?(a||s===F)&&(e[i]=n):a&&(e[i]=n)}})),e[u]=void 0}(e,e[u]);var r=e[t];(void 0===r||v&&null===r)&&(r=e[t]=!v&&o?o>1?void 0:null:i(),W(e,r));return r}(this,r,i,e,t)},set:function(t){X(this,i,r,t,e,this)},enumerable:!0,configurable:!0})}},tt=$,nt=j;function it(e,t){return!0===e.prototype[t]}function ot(e,t,n){t.appendChild(e)}function rt(e,t,n,i){n.insertBefore(e,t)}function st(e,t,n){if(e!==ne&&null!==e){if(!n(e))return!1;if(null!==e.nodes&&e.nodes.length)for(var i=0,o=e.nodes;i<o.length;i++){if(!r(o[i]))return!1}}return!0;function r(e){var i=e.kind;if("#fragment"===i)return!!n(e)&&st(e.contentView,t,n);if("#container"!==i)return n(e);if(!n(e))return!1;var o=e,r=o.subKind;if("##block"===r){var s=o.views;if(null!==s)for(var a=0,d=s;a<d.length;a++){if(!st(d[a],t,n))return!1}if(t&&o.viewPool)for(var c=0,l=o.viewPool;c<l.length;c++){if(!st(l[c],t,n))return!1}}else if("##cpt"===r){var f=o.template;if(null!==f)return st(f.view,t,n)}else"##async"===r&&console.log("TODO: support scanNode for @async block");return!0}}var at="-------------------------------------------------------------------------------";var dt,ct,lt,ft,ut,vt,ht=(dt={},ct=["class","group"],lt=["class","title"],ft=[" ",""," "],ut=[1],vt=function(){function n(){this.ΔΔtitle=""}return n.prototype.ΔDefault=function(e){switch(e){case"title":return""}return nt},e([et(tt),t("design:type",String)],n.prototype,"title",void 0),e([et(),t("design:type",Object)],n.prototype,"$content",void 0),n=e([Ze],n)}(),ge("group",".../section/section.ts",dt,(function(e,t,n){var i,o,r=n.title,s=(n.$content,0),a=Ne(e,0,3);Oe(e,a,0,0,"div",1,0,ct),ze(e,a,1,1,1),r&&(Oe(i=ye(e,0,1,2,++s),o=i.cm,0,0,"div",1,0,lt),Se(i,o,0,1,1,0,ft,1,Fe(i,0,r)),Ae(i)),He(e,a,2,1),Ye(e,0,2,t,1),Ae(e,0,ut)}),vt)),pt=function(){var e={},t=["title","Second group"],n=["title","Parent group"],i=["title","Child group"];return ge("groups",".../section/section.ts",e,(function(e){var o,r,s,a,d,c,l,f,u=Ne(e,0,5);He(e,u,0,0),Le(e,u,0,1,1,Fe(e,0,ht),0),Te(o=xe(e,1,1,1,0),r=o.cm,1,0,0,0," This group has no title ",0),je(o,r),Je(e,1),Le(e,u,0,2,1,Fe(e,1,ht),0,0,t),Me(s=xe(e,1,2,4,0),a=s.cm,0,0),Te(s,a,1,1,1,0," This group has a ",0),$e(s,a,2,1,"b",1),Te(s,a,1,3,2,0," title ",0),je(s,a),Je(e,2),Le(e,u,0,3,1,Fe(e,2,ht),0,0,n),We(d=xe(e,1,3,1,0),c=d.cm,1,0,0,[0,ht],0,0,i),Te(l=xe(d,1,0,1,0),f=l.cm,1,0,0,0," Hello World ",0),je(l,f),_e(d,0),je(d,c),Je(e,3),Oe(e,u,4,1,"hr",0),Ae(e)}))}(),mt=function(){var n={},i=["class","section"],o=["class","header"],r=["class","footer"],s=[1,3],a=function(){function n(){}return e([et(),t("design:type",Object)],n.prototype,"$content",void 0),e([et(),t("design:type",Object)],n.prototype,"header",void 0),e([et(),t("design:type",Object)],n.prototype,"footer",void 0),n=e([Ze],n)}();return ge("section",".../section/section.ts",n,(function(e,t,n){n.$content;var a,d,c=n.header,l=n.footer,f=0,u=0,v=Ne(e,0,4);Oe(e,v,0,0,"div",1,0,i),ze(e,v,1,1,1),c&&(Oe(a=ye(e,0,1,1,++f),a.cm,0,0,"div",0,0,o),Ye(a,0,0,Fe(a,0,c)),Ae(a)),He(e,v,2,1),Ye(e,0,2,t,1),ze(e,v,3,1,1),l&&(Oe(d=ye(e,0,3,1,++u),d.cm,0,0,"div",0,0,r),Ye(d,0,0,Fe(d,0,l)),Ae(d)),Ae(e,0,s)}),a)}(),wt=function(){var e={},t=[" content #",""," ... "],n=[2];return ge("sections",".../section/section.ts",e,(function(e){var i,o,r,s,a,d,c,l,f,u,v,h,p,m,w,g,b,N,y,x,C=0,D=Ne(e,0,7);a=N=0,He(e,D,0,0),Le(e,D,0,1,1,Fe(e,0,mt),0),Te(i=xe(e,1,1,1,0),o=i.cm,1,0,0,0," This section has no header & footer ",0),je(i,o),Je(e,1),Le(e,D,0,2,1,Fe(e,1,mt),0),s=(r=xe(e,1,2,1,0)).cm,qe(e,D,0,3,2,"header",a++),Me(d=xe(e,1,3,4,0),c=d.cm,0,0),Te(d,c,1,1,1,0," Hello ",0),$e(d,c,2,1,"b",1),Te(d,c,1,3,2,0," World ",0),je(d,c),Ue(e,0,0,3),Te(r,s,1,0,0,0," This is important information... ",0),je(r,s),Je(e,2),Le(e,D,0,4,1,Fe(e,2,mt),0),C=0,Me(l=xe(e,1,4,3,0),f=l.cm,0,0),qe(e,D,0,5,4,"header",a++),Te(u=xe(e,1,5,1,0),v=u.cm,1,0,0,0," Another section ",0),je(u,v),Ue(e,0,0,5),We(l,f,1,1,1,[0,ht],0),Te(h=xe(l,1,1,1,0),p=h.cm,1,0,0,0," The section content can contain any elements or sub-templates ",0),je(h,p),_e(l,1),function(e,t,n,i,o){if(t){var r=Xe(n,null,o);e.nodes[n]=r,De(e,Ke,[e,r,i])}}(l,f,2,1,1);for(var I=1;4>I;I++)We(m=xe(l,2,2,1,++C),w=m.cm,2,0,0,[0,ht],0),Te(g=xe(m,1,0,1,0),b=g.cm,1,0,0,0,t,1,[0,I]),je(g,b),_e(m,0),je(m,w);qe(e,D,0,6,4,"footer",N++),Te(y=xe(e,1,6,1,0),x=y.cm,1,0,0,0," (and this is the footer placeholder) ",0),je(y,x),Ue(e,0,0,6),je(l,f,n),Je(e,4),Ae(e)}))}();pt().attach(document.body).render(),wt().attach(document.body).render()}();
