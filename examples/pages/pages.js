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
    ***************************************************************************** */function e(e,t,n,i){var o,r=arguments.length,a=r<3?t:null===i?i=Object.getOwnPropertyDescriptor(t,n):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(e,t,n,i);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(r<3?o(a):r>3?o(t,n,a):o(t,n))||a);return r>3&&a&&Object.defineProperty(t,n,a),a}function t(e,t){if("object"==typeof Reflect&&"function"==typeof Reflect.metadata)return Reflect.metadata(e,t)}var n="ΔTrackable",i="ΔChangeVersion",o="ΔDefFactories",r="ΔIsFactory",a="ΔΔProxy",s="ΔIsProxy",d="ΔDefault",c="ΔCreateProxy",l="ΔnewItem",f="Δdispose",u="Δjson",v=!1;function h(e){return e&&e.ΔTrackable?e.ΔMd?e.ΔMd:e.ΔMd={parents:void 0,refreshCtxt:void 0,watchers:void 0}:null}var p=Array.isArray;function m(e,t){e&&(p(e)&&!e[s]?e.forEach(t):t(e))}function g(e,t){if(e&&t){if(e===t)return;if(p(e)){var n=e;if(1===n.length){if(n[0]===t)return}else{var i=n.indexOf(t);if(i>-1)return n.splice(i,1),1===n.length?n[0]:n}}}return e}function w(e,t){return e?p(e)&&!e[s]?(e.push(t),e):[e,t]:t}function b(e){return e&&!0===e[n]?e[i]:0}function N(e,t){if(void 0===t&&(t=!1),C(e)){e[f]?e[f](t):y(e,(function(n,i){L(e,i),e["ΔΔ"+n]=void 0,t&&N(i,!0)}));var n=e.ΔMd;if(n){var i=[];m(n.parents,(function(e){i.push(e)}));for(var o=function(t){y(t,(function(n,i){i===e&&(L(t,e),t["ΔΔ"+n]=void 0)})),z(t)},r=0,a=i;r<a.length;r++){o(a[r])}}}}function y(e,t){if(C(e)){var n=e.constructor.prototype["ΔDefFactories"];for(var i in n)n.hasOwnProperty(i)&&t(i,e["ΔΔ"+i],n[i])}}function x(e,t){return!(!e||"object"!=typeof e)&&"ΔΔ"+t in e}function C(e){return!(!e||!0!==e[n])}function k(e){return b(e)%2==1}function D(e,t){var n=h(e);return n&&t?(n.watchers=w(n.watchers,t),k(e)&&q.register(e),t):null}function I(e,t){var n=e?e.ΔMd:void 0;n&&t&&(n.watchers=g(n.watchers,t))}function P(e,t){if(e&&t){var n=e[d];if(n){var i=n(t);if(i!==O)return e[t]=i}var r=e[o],a=r?r[t]:null;if(a)return e[t]=a()}}var A=function(){var e,t,n=[],i=[],o={getDefaultConversion:function(){return r(e,o)},getPreviousConversion:function(){return e.ΔtoJsResult}};function r(e,n){var i=n.getPreviousConversion();if(i)return i;var o=void 0;if(e.Δconvert)o=e.Δconvert(t);else{if(e["Δjson"])return e["Δjson"];o={},y(e,(function(e,n){C(n)&&(n=a(n,t)),void 0!==n&&(o[e]=n)}))}return o}function a(a,s){var d=0===n.length,c=a;if(a&&C(a)&&(n.push(a),c=void 0,i.push(a),e=a,s?(t=s,c=s(a,o)):c=r(a,o),a.ΔtoJsResult=c,i.pop(),e=i[i.length-1]),d){for(var l=n.length;l--;)n[l]["ΔtoJsResult"]=void 0;e=null,n=[],t=void 0}return c}return a}();function V(e,t){var n,i;t&&y(e,(function(o,r,a){var s=a===X;if(n=t[o],i="ΔΔ"+o,void 0===n)s&&(e[i]=void 0);else{var d=typeof n;if(null===n)(s||a===H)&&(e[i]=null);else if("object"===d){var c=function(e,t){if(e&&void 0!==t){if(e[l])return e[l](t);v=!0;var n=e[t];return v=!1,n}}(e,o);c?c[u]=n:s&&(e[i]=n)}else"string"===d?(s||a===$)&&(e[i]=n):"number"===d?(s||a===S)&&(e[i]=n):"boolean"===d?(s||a===T)&&(e[i]=n):s&&(e[i]=n)}}));e[u]=void 0}var O={};function j(){return""}j[r]=!0;var $=j;function R(){return 0}R[r]=!0;var S=R;function E(){return!1}E[r]=!0;var T=E;function F(){return null}F[r]=!0;var H=F;function M(){}M[r]=!0;var X=M;function K(e,t,n,i,o,r){var s=C(i),d=o===X;if(!e.ΔComputeDependencies){i&&!s&&o.ΔCreateProxy&&(s=C(i=o.ΔCreateProxy(i)||i));var c=!1,l=r[n];return k(e)?c=l!==i:l!==i&&(z(e),c=!0),c&&(s&&void 0===i&&(i=null),(s||l&&C(l))&&function(e,t,n,i){L(e,t),i||W(e,n)}(e,l,i,d),r[n]=i,function(e,t,n,i,o){var r=e?e.ΔMd:void 0;if(r&&r.trackers){var s=e[a]||e;m(r.trackers,(function(e){e(s,t,n,i,o)}))}}(e,"set",t,l,i)),i}console.error("[Trax] @computed properties must not mutate the Data object when calculated")}function z(e){if(C(e)){var t=!0;if(k(e)?t=!1:e.ΔChangeVersion+=1,q.register(e),t){var n=e.ΔMd;n&&n.parents&&m(n.parents,(function(e){z(e)}))}}}function L(e,t){if(t){var n=t.ΔMd;n&&n.parents&&(n.parents=g(n.parents,e))}}function W(e,t){if(t){var n=h(t);n&&(n.parents=w(n.parents,e))}}var J=0,B=function(){function e(){this.id=++J}return e.prototype.register=function(e){var t=this,n=h(e);n&&!n.refreshCtxt&&(this.objects?this.objects.push(e):(this.objects=[e],Promise.resolve().then((function(){t.refresh()}))),n.refreshCtxt=this)},e.prototype.refresh=function(e){void 0===e&&(e=!0);var t=this.objects,n=t?t.length:0;if(n){U();for(var i,o,r=[],a=0;n>a;a++)(o=(i=t[a]).ΔMd).refreshCtxt&&(i.ΔChangeVersion%2&&(i.ΔChangeVersion+=1),o.refreshCtxt&&o.watchers&&r.push({dataNode:i,watchers:o.watchers})),o.refreshCtxt=void 0;this.objects=void 0,r.length&&(e?_(r):Promise.resolve().then((function(){_(r)})))}},e}();function _(e){for(var t=function(e){m(e.watchers,(function(t){t(e.dataNode)}))},n=0,i=e;n<i.length;n++){t(i[n])}}var q=new B;function U(){q.objects&&(q=new B)}var Y=/^\Δ/,G=function(){function e(e){this.ΔTrackable=!0,this.ΔDataFactory=!0,this.ΔChangeVersion=0,this.ΔMd=void 0,this.ΔΔSelf=this,this.ΔIsProxy=!1,this.ΔItemFactory=e}return e.ΔNewProxy=function(t){var n=new Proxy({},new e(t));return n[a]=n,n},e.ΔCreateProxy=function(t,n){if("object"==typeof t){var i=new Proxy(t,new e(n));for(var o in z(i),t)t.hasOwnProperty(o)&&W(i,t[o]);return i}return null},e.prototype.ΔnewItem=function(e){var t=this.ΔItemFactory();return K(this.ΔΔSelf,e,e,t,this.ΔItemFactory,this.ΔΔDict)},e.prototype.Δdispose=function(e){void 0===e&&(e=!1);var t,n=this.ΔΔDict;for(var i in n)n.hasOwnProperty(i)&&(t=n[i],L(this.ΔΔSelf,t),n[i]=void 0,e&&N(t,!0));return n},e.prototype.Δconvert=function(e){var t={},n=this.ΔΔDict;for(var i in n)n.hasOwnProperty(i)&&(t[i]=A(n[i],e));return t},e.prototype.ΔinitFromJson=function(){var e=this["Δjson"];if(e){if(e.constructor!==Object)console.error("[Trax] Invalid json type: Dictionaries can only be initialized from Objects");else{var t=this.ΔΔDict,n=void 0,i=void 0;for(var o in e)if(e.hasOwnProperty(o))if(i=n=e[o],n){var r=this.ΔItemFactory();C(r)&&(r["Δjson"]=n,i=r),t[o]=i}else null===n&&(t[o]=null)}this["Δjson"]=void 0}},e.prototype.ΔToString=function(){return"Trax Dict {...}"},e.prototype.set=function(e,t,n){return this.ΔΔDict||(this.ΔΔDict=e),t.match(Y)?this[t]=n:K(this.ΔΔSelf,t,t,n,this.ΔItemFactory,this.ΔΔDict),!0},e.prototype.get=function(e,t){return this.ΔΔDict||(this.ΔΔDict=e),t===s||(this["Δjson"]&&this.ΔinitFromJson(),t===Symbol.iterator?this.ΔΔDict[Symbol.iterator]:"string"===typeof t?t.match(Y)?this[t]:this.ΔΔDict[t]:this[t])},e.prototype.deleteProperty=function(e,t){return this.ΔΔDict||(this.ΔΔDict=e),!t.match(Y)&&(K(this.ΔΔSelf,t,t,null,this.ΔItemFactory,this.ΔΔDict),delete this.ΔΔDict[t],!0)},e}();function Q(e){function t(){return G.ΔNewProxy(e)}return e=e||H,t[r]=!0,t[c]=function(t){return G.ΔCreateProxy(t,e)},t}var Z=0,ee={log:function(e){for(var t=[],n=1;n<arguments.length;n++)t[n-1]=arguments[n];console.log.apply(console,arguments)},error:function(e){for(var t=[],n=1;n<arguments.length;n++)t[n-1]=arguments[n];console.error.apply(console,arguments)}};function te(e,t){for(var n=e,i=[];n;){if(n.template){var o=n.template;i.push('\n>> Template: "'+o.templateName+'" - File: "'+o.filePath+'"')}n=n.parentView}ee.error("IVY: "+t+i.join(""))}var ne=void 0,ie=11,oe="$api",re=/^ΔΔ(\w+)Emitter$/,ae=/^ΔΔ(.+)$/,se="ΔIsAPI",de="ΔIsController",ce=0,le=function(){function e(e,t,n,i,o,r){this.templateName=e,this.filePath=t,this.staticCache=n,this.renderFn=i,this.$Class=o,this.$contextIdentifiers=r,this.kind="$template",this._uid=++ce,this.tplApi=void 0,this.tplCtl=void 0,this.forceRefresh=!1,this.activeWatch=!1,this.lastRefreshVersion=0,this.processing=!1,this.rendering=!1,this.initialized=!1,this.labels=void 0,this.hasCtlClass=!1,this.$contextInitialized=!1,this.view=pe(null,null,1,this);var a=this;this.watchCb=function(){a.notifyChange()},this.watchCb.$templateId=this._uid,this.$Class!==ne&&(qe(this.$Class,de)?this.hasCtlClass=!0:qe(this.$Class,se)||C(this.$Class.prototype)||te(this.view,"Type of $ argument must be either a @Controller, an @API or a @Data class"))}return e.prototype.dispose=function(e){void 0===e&&(e=!0);var t=this.view;this.disconnectObserver(),ue(t,this.tplCtl,"$dispose",this.templateName),e&&t&&t.nodes&&t.nodes.length&&(Le(t,t.nodes[0]),t.anchorNode&&(t.rootDomNode.removeChild(t.anchorNode),t.anchorNode=null))},Object.defineProperty(e.prototype,"uid",{get:function(){return this._uid},enumerable:!0,configurable:!0}),Object.defineProperty(e.prototype,"document",{get:function(){return this.view.doc},set:function(e){this.view.doc=e},enumerable:!0,configurable:!0}),Object.defineProperty(e.prototype,"api",{get:function(){if(!this.tplApi)if(this.hasCtlClass){var e=this.controller;e&&e.$api&&(this.tplApi=e.$api)}else this.$Class?(this.tplApi=new this.$Class,fe(this.view,this.tplApi,this.staticCache)):this.$contextIdentifiers?this.tplApi=function(e){return void 0!==e?(t[r]=!0,Q(t)()):Q()();function t(){return new e}}():this.tplApi={};return this.tplApi},enumerable:!0,configurable:!0}),Object.defineProperty(e.prototype,"controller",{get:function(){if(!this.tplCtl&&this.hasCtlClass){var e=this.tplCtl=new this.$Class;if(x(e,"$template")&&(e.$template=this),x(e,"$logger")){var t=this.view;e.$logger={log:ee.log,error:function(e){for(var n=[],i=1;i<arguments.length;i++)n[i-1]=arguments[i];te(t,e+(n.length?" "+n.join(" "):""))}}}e[oe]&&fe(this.view,e[oe],this.staticCache)}return this.tplCtl},enumerable:!0,configurable:!0}),e.prototype.attach=function(e){if(this.view.rootDomNode)te(this.view,"Template host cannot be changed once set");else{var t=this.view;if(!t.doc)throw new Error("[iv] Template.document must be defined before calling Template.attach()");t.rootDomNode=e,t.anchorNode=t.doc.createComment("template anchor"),Ue(t.anchorNode,e)}return this},e.prototype.registerLabel=function(e,t){this.labels||(this.labels={});var n=this.labels[e];n?n.push(t):n=this.labels[e]=[t]},e.prototype.query=function(e,t){if(void 0===t&&(t=!1),this.rendering)return null;for(var n=[],i=0,o=e.split(";");i<o.length;i++){var r=o[i];if(r&&"#"!==r.charAt(0))return te(this.view,"[$template.query()] Invalid label argument: '"+r+"' (labels must start with #)"),null;var a=this.labels&&this.labels[r]||null;if(a&&a.length){if(!t)return a[0];n=n.concat(a)}}return n.length?n:null},e.prototype.notifyChange=function(){this.render()},e.prototype.disconnectObserver=function(){this.activeWatch&&(I(this.api,this.watchCb),I(this.controller,this.watchCb),this.activeWatch=!1)},e.prototype.render=function(e,t){if(void 0===t&&(t=!1),this.processing)return this;t&&(this.forceRefresh=!0),this.processing=!0;var n=this.api,i=this.controller,o=this.view,r=this.$contextIdentifiers;i&&!C(i)&&(te(o,"Template controller must be a @Controller Object - please check: "+this.$Class.name),this.tplCtl=this.$Class=void 0);var a=!1;if(n&&e)if(r!==ne){var s=e.context;s!==ne&&"object"==typeof s&&(a=!0)}else for(var d in k(n)||U(),this.disconnectObserver(),e)e.hasOwnProperty(d)&&(n[d]=e[d]);if(this.$contextInitialized&&(a=!0),a){var c="",l=(e?e.context:null)||n.$context;if(l){for(var f=0;r.length>f;f++)n[c=r[f]]=l[c];n.$context=l,this.$contextInitialized=!0}}r===ne||this.$contextInitialized||te(o,"Missing $fragment context");var u=!this.forceRefresh,v=o.nodes;if(v&&v[0]&&v[0].attached||(u=!1),u&&b(n)+b(i)>this.lastRefreshVersion&&(u=!1),!u){i&&(this.initialized||(ue(o,i,"$init","controller"),this.initialized=!0),ue(o,i,"$beforeRender","controller")),this.rendering=!0,this.labels=void 0,o.lastRefresh++,o.instructions=void 0;try{this.renderFn(o,this.hasCtlClass?i:n,n,this)}catch(e){te(o,"Template execution error\n"+(e.message||e))}this.rendering=!1,i&&ue(o,i,"$afterRender","controller"),function(e,t){if(void 0===t&&(t=!1),e){var n=e.ΔMd;n&&n.refreshCtxt?n.refreshCtxt.refresh(!0):t&&U()}}(n),this.forceRefresh=!1,this.lastRefreshVersion=b(n)+b(i)}return this.activeWatch||(D(n,this.watchCb),i&&D(i,this.watchCb),this.activeWatch=!0),this.processing=!1,this},e}();function fe(e,t,n){var i=n.events;if(void 0===i){var o=void 0;for(var r in t)if(r.match(re)){var a=RegExp.$1;o||(o=[]),"function"!=typeof t[a+"Emitter"].init?te(e,"Invalid EventEmitter: "+a+"Emitter"):(o.push(a+"Emitter"),o.push(a),t[a+"Emitter"].init(a,t))}n.events=o||null}else if(null!==i)for(var s=i.length,d=0;s>d;d+=2)t[i[d]].init(i[d+1],t)}function ue(e,t,n,i){if(t&&"function"==typeof t[n]){var o=void 0;try{void 0!==(o=t[n]())&&"function"==typeof o.catch&&o.catch((function(t){te(e,i+" "+n+" hook execution error\n"+(t.message||t))}))}catch(t){te(e,i+" "+n+" hook execution error\n"+(t.message||t))}}}function ve(e,t){return(t=t||this.namespace)?this.doc.createElementNS(t,e):this.doc.createElement(e)}function he(){return function(e){if(e!==ne&&null!==e){var t=!0;return Ge(e,!1,(function(e){if(!t)return!1;var n=e.kind;if("#view"===n){var i=e;if(i.cm){var o=i.doc.createDocumentFragment();i.domNode=o,i.cmAppends=[function(e){e.domNode?Ue(e.domNode,o):e.domNode=o}]}ke(i)}else if("#element"===n||"#text"===n)return t=!1;return!0})),t}return!0}(this)}function pe(e,t,n,i){var o={kind:"#view",uid:"view"+ ++Z,attached:!1,nodes:null,namespace:void 0,namespaces:void 0,doc:null,parentView:e,cm:!0,cmAppends:null,lastRefresh:0,container:null,projectionHost:null,template:i,rootDomNode:null,anchorNode:null,expressions:void 0,oExpressions:void 0,instructions:void 0,paramNode:void 0,createElement:ve,isEmpty:he};return e?ge(o,e,t):o.doc="undefined"!=typeof document?document:null,o}function me(e,t,n){if(n){var i=function(e){var t=e;for(;t&&!t.template;)t=t.parentView;return t}(e);if(i!==ne&&null!==i)for(var o=i.template,r=n.length,a=0;r>a;a++)o.registerLabel(n[a],t)}}function ge(e,t,n){if(e.parentView=t,e.doc=t.doc,e.container=n,e.rootDomNode=t.rootDomNode,t.namespace){var i=t.namespace;e.namespace=i,e.namespaces=[i]}}function we(e,t,n,i,o,r){return function(){return new le(e,t,n,i,o,r)}}var be=[];function Ne(e,t,n){var i=e.cm;return i?(e.nodes=new Array(n),e.cmAppends||(e.cmAppends=[],e.anchorNode&&(e.cmAppends[0]=function(t,n){t.domNode?Ye(t.domNode,e.anchorNode,e.rootDomNode):t.domNode=e.rootDomNode}))):e.cmAppends=null,i}function ye(e,t,n,i,o,r){var a=r||function(e,t,n,i,o){var r,a=e.nodes[n];if(a&&a.attached||te(e,"Invalid ζview call: container must be attached ("+(a?a.uid:"XX")+") - pview: "+e.uid+" containerIdx: "+n),"#container"===a.kind)if("##block"===a.subKind){var s=(d=a).views;1===o&&(d.insertFn=null),1===o&&d.views.length>1?(d.previousNbrOfViews=s.length,r=s.shift(),d.viewPool.length?d.viewPool=s.concat(d.viewPool):d.viewPool=s,d.views=[r]):(r=d.views[o-1])||(d.viewPool.length>0?(d.insertFn||(d.insertFn=De(e,d)),Pe((r=s[o-1]=d.viewPool.shift()).nodes[0],d.insertFn),r.attached=!0):((r=s[o-1]=pe(e,d)).nodes=new Array(i),e.cm&&d.cmAppend?r.cmAppends=[d.cmAppend]:e.cm||(r.cmAppends=[De(e,d)]))),d.lastRefresh=r.lastRefresh=e.lastRefresh}else{var d;(r=(d=a).contentView)||((r=d.contentView=pe(e,d)).nodes=new Array(i)),r.lastRefresh=e.lastRefresh}else if("#param"===a.kind){var c=a;(r=c.contentView)||(r=c.contentView=pe(e,null),c.viewPool&&(c.viewPool[c.viewInstanceIdx]=r),r.nodes=new Array(i),r.paramNode=c),r.lastRefresh=e.lastRefresh}return r}(e,0,n,i,o);if(1===t)a.instructions=[];else{for(var s=a,d=t-1;d>0;)s=s.parentView,d--;s.instructions||(s.instructions=[]),a.instructions=s.instructions}return a.cm&&!a.cmAppends&&Ce(a,xe,[a,e,n]),a}function xe(e,t,n){var i=t.nodes[n];"#container"===i.kind&&!e.cmAppends&&i.cmAppend&&(e.cmAppends=[i.cmAppend])}function Ce(e,t,n){e.instructions.push(t),e.instructions.push(n)}function ke(e){if(e.instructions){var t=e.instructions.slice(0),n=t.length;if(e.instructions.splice(0,n),e.instructions=void 0,n)for(var i=0;n>i;i+=2)t[i].apply(null,t[i+1])}}function De(e,t){var n=function e(t,n){for(;;){if(n||te(t,"Internal error - findNextSiblingDomNd: nd cannot be undefined"),0===n.idx){if(!n.attached)return{position:"defer",parentDomNd:void 0};if(n.domNode.nodeType===ie)return{position:"lastChild",parentDomNd:n.domNode};var i=t.parentView;if(i){if(t.projectionHost){var o=t.projectionHost.hostNode;return"#element"===o.kind?{position:"lastChild",parentDomNd:o.domNode}:e(t.projectionHost.view,o)}if(t.container&&"##block"===t.container.subKind){var r=t.container,a=r.views.indexOf(t);if(a>-1)for(var s=void 0,d=void 0,c=a+1;c<r.views.length;c++)if((s=r.views[c]).nodes&&s.nodes.length&&(d=m(s,s.nodes[0],r.domNode)))return d;for(var l=r.viewPool,f=void 0,u=0,v=l;u<v.length;u++){if((s=v[u]).nodes&&s.nodes.length&&s.attached&&(f=m(s,s.nodes[0],r.domNode)))return f}}return e(i,t.container)}return{position:"lastOnRoot",parentDomNd:t.rootDomNode,nextDomNd:t.anchorNode}}if(!n.nextSibling){var h=t.nodes[n.parentIdx];return"#element"===h.kind?{position:"lastChild",parentDomNd:ze(t,n)}:e(t,h)}var p=m(t,n.nextSibling,ze(t,n));if(p)return p;n=n.nextSibling}function m(e,t,n){if(!t)return null;if("#element"===t.kind||"#text"===t.kind)return{position:"beforeChild",nextDomNd:t.domNode,parentDomNd:n};if("#fragment"===t.kind){for(var i=void 0,o=t.firstChild;o;){if(i=m(e,o,n))return i;o=o.nextSibling}if(t.contentView){var r=t.contentView;if(r.nodes)return m(r,r.nodes[0],n)}return null}if("#container"===t.kind){var a=t;i=null;if("##block"===a.subKind)for(var s=a.views,d=s.length,c=0;d>c&&!(i=m(s[c],s[c].nodes[0],n));c++);else if("##cpt"===a.subKind){var l=a.template.view;i=m(l,l.nodes[0],n)}return i||null}throw new Error("TODO findFirstDomNd: "+t.kind)}}(e,t),i=n.position,o=n.nextDomNd,r=n.parentDomNd;return"beforeChild"===i||"lastOnRoot"===i?function(e,t){e.domNode?Ye(e.domNode,o,r):e.domNode=r}:"lastChild"===i?function(e,t){e.domNode?Ue(e.domNode,r):e.domNode=r}:function(){console.warn("TODO: VALIDATE VIEW APPEND: ",i),function(e,t,n){void 0===t&&(t="");n&&e.uid!==n||(console.log(""),console.log(Qe),t&&console.log(t+":"),function e(t,n){void 0===n&&(n="");if(!t.nodes)return void console.log(""+n+t.uid+" - no nodes");var i=t.parentView?t.parentView.uid:"XX",o=t.projectionHost,r=o?" >>> projection host: "+o.hostNode.uid+" in "+o.view.uid:"";console.log(n+"*"+t.uid+"* cm:"+t.cm+" isTemplate:"+(void 0!==t.template)+" parentView:"+i+r);for(var a,s=t.nodes.length,d="",c=0;s>c;c++)if(a=t.nodes[c])if(d=a.uid.length<5?["     ","    ","   ","  "," "][a.uid.length]:"","#container"===a.kind){var l=a,f=l.domNode?l.domNode.uid:"XX";if(console.log(n+"["+c+"] "+a.uid+d+" "+f+" attached:"+(a.attached?1:0)+" parent:"+C(a.parentIdx)+" nextSibling:"+(a.nextSibling?a.nextSibling.uid:"X")),"##block"===l.subKind){var u=l,v=u.views.length;if(v)for(var h=0;v>h;h++)if(u.views[h]){var p=u.views[h];f=p.rootDomNode?p.rootDomNode.$uid:"XX",console.log(n+"  - view #"+h),e(u.views[h],"    "+n)}else console.log(n+"  - view #"+h+" UNDEFINED");else console.log(n+"  - no child views")}else if("##cpt"===l.subKind){var m=l,g=m.template,w=m.contentView;w?(console.log(n+"  - light DOM:"),e(w,"    "+n)):console.log(n+"  - light DOM: none"),g?(console.log(n+"  - shadow DOM:"),e(g.view,"    "+n)):console.log(n+"  - no template")}else console.log(n+"  - "+l.subKind+" container")}else{f=a.domNode?a.domNode.uid:"XX";var b="";if(a.domNode&&"#text"===a.kind)b=" text=#"+a.domNode._textContent+"#";else if("#fragment"===a.kind||"#element"===a.kind){for(var N=[],y=a.firstChild;y;)N.push(y.uid),y=y.nextSibling;b=" children:["+N.join(", ")+"]";var x=a.contentView;x&&(b+=" >>> content view: "+x.uid)}console.log(n+"["+a.idx+"] "+a.uid+d+" "+f+" attached:"+(a.attached?1:0)+" parent:"+C(a.parentIdx)+" nextSibling:"+(a.nextSibling?a.nextSibling.uid:"X")+b)}else console.log(n+"["+c+"] XX");function C(e){return e<0?"X":e}}(e))}(e,"getViewInsertFunction for "+t.uid)}}function Ie(e,t,n){var i=e.nodes[t];if(i&&"##block"===i.subKind){var o=i,r=o.lastRefresh;if(n||r===e.lastRefresh){var a=o.views.length;if(!n){if(a!==o.previousNbrOfViews)for(var s=o.viewPool,d=s.length,c=void 0,l=0;d>l;l++)Le(c=s[l],c.nodes[0]),c.attached=!1;o.previousNbrOfViews=a}}else Le(e,o)}}function Pe(e,t,n){if(!e.attached){if(t(e,!0),e.attached=!0,"#fragment"===e.kind)for(var i=e.firstChild;i;)Pe(i,t),i=i.nextSibling;else if("#container"===e.kind){var o=e.subKind;if("##cpt"===o){var r=e.template,a=r?r.view.nodes[0]:null;r&&(r.forceRefresh=!0),a&&(Pe(a,t),r.view.attached=!0)}else if("##block"===o)for(var s=e.views,d=0;s.length>d;d++)Pe(s[d].nodes[0],t),s[d].attached=!0}if("#fragment"===e.kind||"#element"===e.kind){var c=e.contentView;c&&(Pe(c.nodes[0],t),c.attached=!0)}}}function Ae(e,t,n){if(n)for(var i=n.length,o=0;i>o;o++)Ie(e,n[o],e.cm);e.cm&&(e.cm=!1,e.cmAppends=null)}function Ve(e,t,n,i,o,r,a,s,d){if(t){var c=e.createElement(o);if(s)for(var l=s.length,f=0;l>f;f+=2)c.setAttribute(s[f],s[f+1]);if(d){l=d.length;for(var u=0;l>u;u+=2)c[d[u]]=d[u+1]}var v={kind:"#element",uid:"elt"+ ++Z,idx:n,parentIdx:-1,ns:"",domNode:c,attached:!0,nextSibling:void 0,firstChild:void 0,lastChild:void 0,contentView:null};e.nodes[n]=v,me(e,c,a),e.cmAppends[i](v,!1),r&&(e.cmAppends[i+1]=function(e,t){e.domNode?Ue(e.domNode,c):e.domNode=c,t||Oe(v,e)})}else a&&me(e,e.nodes[n].domNode,a)}function Oe(e,t){e.firstChild?(e.lastChild.nextSibling=t,e.lastChild=t):(e.firstChild=e.lastChild=t,t.nextSibling=void 0),t.parentIdx=e.idx}function je(e,t,n,i,o,r,a,s){for(var d,c=[],l=8;l<arguments.length;l++)c[l-8]=arguments[l];if(s){var f=void 0,u=void 0,v=!1;f=t?a.slice(0):(d=e.nodes[i]).pieces;for(var h=0;s>h;h++)(u=Se(e,n,c[h]))!==be&&(v=!0,f[1+2*h]=null==u?"":u);if(!t)return v&&(d.domNode.textContent=f.join("")),void me(e,d.domNode,r);d=p(e.doc.createTextNode(f.join("")),f),me(e,d.domNode,r)}else{if(!t)return void(r&&me(e,e.nodes[i].domNode,r));d=p(e.doc.createTextNode(a),void 0),me(e,d.domNode,r)}function p(e,t){return{kind:"#text",uid:"txt"+ ++Z,domNode:e,attached:!0,idx:i,parentIdx:-1,pieces:t,nextSibling:void 0}}e.nodes[i]=d,e.cmAppends[o](d,!1)}function $e(e,t,n,i,o,r,a,s){for(var d=[],c=8;c<arguments.length;c++)d[c-8]=arguments[c];for(var l=[e,t,n,i,o,r,a,s],f=0;s>f;f++)l.push(d[f]);Ce(e,je,l)}function Re(e,t,n){if(e.expressions){var i=e.expressions;if(i.length>t&&i[t]===n)return be;i[t]=n}else e.expressions=[],e.expressions[t]=n;return n}function Se(e,t,n){if(t){if(n[2]){var i=e.oExpressions;return i[2*n[0]]?be:(i[2*n[0]]=1,n[1])}return Re(e,n[0],n[1])}return n}function Ee(e,t,n,i){if(t){var o={kind:"#fragment",uid:"fra"+ ++Z,idx:n,parentIdx:-1,ns:"",domNode:void 0,attached:!0,nextSibling:void 0,firstChild:void 0,lastChild:void 0,contentView:null};e.nodes[n]=o;var r=e.cmAppends[i];r(o,!1),e.cmAppends[i+1]=function(e,t){r(e,!0),t||Oe(o,e)}}}function Te(e,t,n,i,o){if(t){var r=function(e,t,n){var i;if(1===n)i={kind:"#container",subKind:"##block",uid:"cnb"+ ++Z,idx:e,parentIdx:-1,ns:"",domNode:void 0,attached:!0,nextSibling:void 0,views:[],viewPool:[],cmAppend:t,lastRefresh:0,previousNbrOfViews:0,insertFn:null};else{if(2!==n)return console.warn("TODO: new cnt type"),null;i={kind:"#container",subKind:"##cpt",uid:"cnc"+ ++Z,idx:e,parentIdx:-1,ns:"",domNode:void 0,attached:!0,nextSibling:void 0,cmAppend:t,cptRef:null,template:null,data:null,contentView:null,dynamicParams:void 0}}return i}(n,null,o);return e.nodes[n]=r,function(e,t,n){if(e.cmAppends){var i=e.cmAppends[n];i?(t.cmAppend=function(e,t){i(e,!0)},i(t,!1)):console.log("ERROR?",i===ne)}}(e,r,i),r}}function Fe(e,t,n,i,o,r,a,s,d,c){var l;n=n||0,t?l=e.nodes[i]||Te(e,t,i,o,2):(l=e.nodes[i]).lists&&(l.lists.sizes={});var f=Se(e,n,r);if(l.template){if(f!==be&&l.cptRef!==f){var u=l.data;l.template.dispose(!0),m();var v=l.data;for(var h in u)if(u.hasOwnProperty(h)&&h.match(ae)){var p=RegExp.$1;x(v,p)&&(v[p]=u[p])}}}else{if(f===be)return void te(e,"Invalid component ref");m()}function m(){var t=l.template=f();l.cptRef=f,ge(t.view,e,l),t.disconnectObserver(),l.data=t.api,function(t){if(d){var n=d.length;if(!t&&n)te(e,"Invalid parameter: "+d[0]);else for(var i=0;n>i;i+=2)x(t,d[i])?t[d[i]]=d[i+1]:te(e,"Invalid parameter: "+d[i])}}(t.api)}c&&(l.dynamicParams={}),0===n&&a&&He(e,i,l,s,c)}function He(e,t,n,i,o){var r=(n=n||e.nodes[t])?n.template:void 0;if(void 0!==r){if(r.view.lastRefresh=e.lastRefresh-1,function(e){if(e.lists)for(var t=e.lists,n=t.listNames,i=void 0,o=void 0,r=void 0,a=void 0,s=0;n.length>s;s++)i=n[s],o=t.sizes[i]||0,r=e.data[i],a=r.length,o<a&&r.splice(o,a-o)}(n),n.contentView){r.api.$content=n.contentView;var a=n.contentView.instructions;a&&a.length&&(r.forceRefresh=!0)}if(r.view.cm)r.view.cmAppends=[n.cmAppend];else{if(o)for(var s=o.length,d=(n?n.dynamicParams:{})||{},c=r.api,l=0;s>l;l++)d[o[l]]||P(c,o[l]);var f=r.view.nodes[0];if(!f.attached)r.forceRefresh=!0,Pe(f,De(e,n))}i&&me(e,r.api,i),r.render()}}function Me(e,t,n,i,o,r){if(r!==be){var a=Se(e,n,r);if(a!==be){var s=e.nodes[i],d=s.kind;if("#container"===d){var c=s.data;(function(e,t,n,i,o){if(i&&(!e.cm||x(i,o)))return!0;var r="";n.template&&(r=" on <*"+n.template.templateName+"/>");return te(e,"Invalid parameter '"+o+"'"+r),!1})(e,0,s,c,o)&&(c[o]=a)}else if("#param"===d)!function(e,t,n,i,o){if(0===o){if(n.dataHolder)return n.dataHolder[n.dataName]=i,n.dataHolder}else{if(n.data)return t&&!x(n.data,o)&&te(e,"Invalid param node parameter: "+o),n.data[o]=i,n.data;te(e,"Invalid param node parameter: "+o)}}(e,t,s,a,o);else if("#decorator"===d){var l=s;t&&!function(e,t,n){if(!x(t.api,n))return te(e,"Invalid decorator parameter '"+n+"' on "+t.refName),!1;return!0}(e,l,o)||(l.api[o]=a)}}}}function Xe(e,t,n,i,o,r,a,s){if(t){var d=e.nodes[i];if("#element"===d.kind){var c=d.domNode;if(!c)return void te(e,"Cannot set "+o+" event listener: undefined DOM node");var l=v(c);a&&!1!==(s=s||{}).passive&&(s.passive=!0),c.addEventListener(o,(function(e){l.callback&&l.callback(e)}),s)}else if("#container"===d.kind){var f=d.template;f?u(f.api,!1):te(e,"Cannot set "+o+" event listener: undefined component template")}else"#param"===d.kind?u(d.data,!0):"#decorator"===d.kind&&u(d.api,!0)}else e.nodes[n].callback=r;function u(t,n){if(t&&x(t,o+"Emitter")){var i=t[o+"Emitter"];if(i.addListener&&"function"==typeof i.addListener){var r=v(null);i.addListener((function(e){r.callback&&r.callback(e)})),n&&"function"==typeof i.init&&i.init(o,t)}else te(e,"Invalid event emitter for: "+o)}else te(e,"Unsupported event: "+o)}function v(t){var o={kind:"#listener",uid:"evt"+ ++Z,idx:n,parentIdx:i,nextSibling:void 0,domNode:t,attached:!0,callback:r};return e.nodes[n]=o,o}}function Ke(e,t,n,i,o){var r,a=e.nodes[n];if(1===o)if(i[de]){if(x(i,oe)){var s=i[oe];s!==ne&&(r=s.$content)}}else x(i,"$content")&&(r=i.$content);else r=Se(e,t,i);if(r!==be&&void 0!==i||(r=a.contentView),r){var d=r.projectionHost;if(d&&d.hostNode!==a&&Le(r,r.nodes[0]),a.contentView&&a.contentView!==r&&Le(a.contentView,a.contentView.nodes[0]),a.contentView=r,r.projectionHost={view:e,hostNode:a},r.cm)if("#element"===a.kind){var c=a.domNode;r.cmAppends=[function(e){e.domNode?Ue(e.domNode,a.domNode):e.domNode=c}]}else r.cmAppends=[De(e,a)];else{var l=void 0,f=!1;if(r.domNode!==ne&&null!==r.nodes&&r.domNode.nodeType===ie&&(Ue(r.nodes[0].domNode,a.domNode),function(e,t,n){if(!e||e.cm||!e.nodes||!e.nodes.length)return;n===ne&&(n=e.domNode);if(n===ne||t===n)return;Ge(e,!0,(function(e){return"#view"!==e.kind&&"#fragment"!==e.kind&&"#container"!==e.kind||e.domNode===n&&(e.domNode=t),!0}))}(r,a.domNode),f=!0),!f){if("#element"===a.kind){var u=a.domNode;l=function(e,t){e.domNode?Ue(e.domNode,u):e.domNode=u}}else l=De(e,a);Pe(r.nodes[0],l)}}r.container=a,ke(r)}}function ze(e,t){if(0===t.idx&&e.projectionHost){if(!t.attached)return null;var n=e.projectionHost.hostNode;return"#element"===n.kind?n.domNode:ze(e.projectionHost.view,n)}return 0===t.idx?e.parentView?ze(e.parentView,e.container):e.rootDomNode:e.nodes[t.parentIdx].domNode}function Le(e,t){if(t&&t.attached)if("#text"===t.kind||"#element"===t.kind){var n=ze(e,t);t.attached=!1,n?n.removeChild(t.domNode):te(e,"Internal error - parent not found for: "+t.uid)}else if("#container"===t.kind){if("##block"===t.subKind){for(var i=t,o=i.views,r=o.length,a=void 0,s=0;r>s;s++)a=o[s].nodes[0],Le(o[s],a),o[s].attached=a.attached=!1,"#container"!==a.kind&&"#fragment"!==a.kind||(a.domNode=void 0);i.views=[],i.previousNbrOfViews=0,i.viewPool=o.concat(i.viewPool)}else if("##cpt"===t.subKind){var d=t.template;a=d.view.nodes[0];Le(d.view,a),d.view.attached=a.attached=!1,"#container"!==a.kind&&"#fragment"!==a.kind||(a.domNode=void 0)}}else if("#fragment"===t.kind){var c=t;if(c.attached=!1,c.contentView)Le(c.contentView,c.contentView.nodes[0]);else if(c.firstChild)for(var l=c.firstChild;l;)Le(e,l),l=l.nextSibling;c.domNode=void 0}else"#param"===t.kind?console.warn("TODO removeFromDom for param nodes"):console.warn("RemoveFromDom for "+t.kind)}var We=function(e){var t=e.prototype;t[n]=!0,t[i]=0},Je=function(e,t){return e||(e=F,t=3),function(n,i){var r="ΔΔ"+i,a=n[o];a||(a=n[o]={}),a[i]=t?1===t?F:M:e,n[r]=void 0,function(e,t,n,i){i&&delete e[t]&&Object.defineProperty(e,t,i)}(n,i,0,{get:function(){return function(e,t,n,i,o){e.ΔComputeDependencies&&(e.ΔComputeDependencies[n]=!0);!v&&e[u]&&V(e,e[u]);var r=e[t];(void 0===r||v&&null===r)&&(r=e[t]=!v&&o?o>1?void 0:null:i(),W(e,r));return r}(this,r,i,e,t)},set:function(t){K(this,i,r,t,e,this)},enumerable:!0,configurable:!0})}},Be=S,_e=O;function qe(e,t){return!0===e.prototype[t]}function Ue(e,t,n){t.appendChild(e)}function Ye(e,t,n,i){n.insertBefore(e,t)}function Ge(e,t,n){if(e!==ne&&null!==e){if(!n(e))return!1;if(null!==e.nodes&&e.nodes.length)for(var i=0,o=e.nodes;i<o.length;i++){if(!r(o[i]))return!1}}return!0;function r(e){var i=e.kind;if("#fragment"===i)return!!n(e)&&Ge(e.contentView,t,n);if("#container"!==i)return n(e);if(!n(e))return!1;var o=e,r=o.subKind;if("##block"===r){var a=o.views;if(null!==a)for(var s=0,d=a;s<d.length;s++){if(!Ge(d[s],t,n))return!1}if(t&&o.viewPool)for(var c=0,l=o.viewPool;c<l.length;c++){if(!Ge(l[c],t,n))return!1}}else if("##cpt"===r){var f=o.template;if(null!==f)return Ge(f.view,t,n)}else"##async"===r&&console.log("TODO: support scanNode for @async block");return!0}}var Qe="-------------------------------------------------------------------------------";var Ze,et,tt,nt=(Ze={},et=[" This is page A / count=",""," "],tt=function(){function n(){}return e([Je(Be),t("design:type",Number)],n.prototype,"count",void 0),e([Je(),t("design:type",Object)],n.prototype,"$content",void 0),n=e([We],n)}(),we("pageA",".../pages/pages.ts",Ze,(function(e,t,n){var i=n.count,o=(n.$content,Ne(e,0,4));Ee(e,o,0,0),je(e,o,0,1,1,0,et,1,Re(e,0,i)),Ve(e,o,2,1,"br",0),Ee(e,o,3,1),Ke(e,0,3,t,1),Ae(e)}),tt)),it=function(){var n={},i=["class","blue"],o=[" This is page B (count=","",") "],r=["class","container"],a=function(){function n(){}return e([Je(Be),t("design:type",Number)],n.prototype,"count",void 0),e([Je(),t("design:type",Object)],n.prototype,"$content",void 0),n=e([We],n)}();return we("pageB",".../pages/pages.ts",n,(function(e,t,n){var a=n.count,s=(n.$content,Ne(e,0,3));Ve(e,s,0,0,"div",1,0,i),je(e,s,0,1,1,0,o,1,Re(e,0,a)),Ve(e,s,2,1,"div",0,0,r),Ke(e,0,2,t,1),Ae(e)}),a)}();(function(){var n={},i=["class","page container"],o=[" (main counter=","",") "],r=[1],a=function(){function n(){this.ΔΔcounter=1}return n.prototype.ΔDefault=function(e){switch(e){case"counter":return 1}return _e},e([Je(),t("design:type",Object)],n.prototype,"page",void 0),e([Je(),t("design:type",Object)],n.prototype,"counter",void 0),n=e([We],n)}();return we("main",".../pages/pages.ts",n,(function(e,t,n){var a,s,d,c=n.page,l=n.counter,f=Ne(e,0,13);Ee(e,f,0,0),Te(e,f,1,1,1),c||(c=t.page=nt),Ve(e,f,2,1,"button",1),Xe(e,f,3,2,"click",(function(){return t.page=nt}),1),je(e,f,0,4,2,0," page A ",0),Ve(e,f,5,1,"button",1),Xe(e,f,6,5,"click",(function(){return t.page=it}),1),je(e,f,0,7,2,0," page B ",0),Ve(e,f,8,1,"button",1),Xe(e,f,9,8,"click",(function(){return t.counter++}),1),je(e,f,0,10,2,0," + ",0),Ve(e,f,11,1,"div",1,0,i),Fe(e,f,0,12,2,Re(e,0,c),0),Me(e,f,0,12,"count",Re(e,1,l+1)),s=(a=ye(e,1,12,4,0)).cm,Ce(d=a,Ee,[d,s,0,0]),function(e,t,n,i,o,r,a,s,d){t&&Ce(e,Ve,[e,t,n,i,o,r,a,s,d])}(a,s,1,1,"b",1),$e(a,s,1,2,2,0," Page content ",0),$e(a,s,1,3,1,0,o,1,[0,l]),function(e,t,n){if(e.paramNode){var i=e.paramNode;i.dataHolder?(Ce(e,Ae,[e,t,n]),i.data&&"#view"!==i.data.kind?i.data?i.data.$content=e:console.warn("TODO: ζendD no data"):i.dataHolder[i.dataName]=e):te(e,"ζendD dataHoler should be defined")}else Ce(e,Ae,[e,t,n])}(a,s),He(e,12),Ae(e,0,r)}),a)})()().attach(document.body).render()}();
