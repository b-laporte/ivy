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
    ***************************************************************************** */function t(t,e,n,i){var r,o=arguments.length,s=o<3?e:null===i?i=Object.getOwnPropertyDescriptor(e,n):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)s=Reflect.decorate(t,e,n,i);else for(var a=t.length-1;a>=0;a--)(r=t[a])&&(s=(o<3?r(s):o>3?r(e,n,s):r(e,n))||s);return o>3&&s&&Object.defineProperty(e,n,s),s}function e(t,e){if("object"==typeof Reflect&&"function"==typeof Reflect.metadata)return Reflect.metadata(t,e)}var n="ΔTrackable",i="ΔChangeVersion",r="ΔDefFactories",o="ΔIsFactory",s="ΔΔProxy",a="ΔIsProxy",c="ΔCreateProxy",l="ΔnewItem",f="Δdispose",u="Δjson",d=!1;function h(t){return t&&t.ΔTrackable?t.ΔMd?t.ΔMd:t.ΔMd={parents:void 0,refreshCtxt:void 0,watchers:void 0}:null}var v=Array.isArray;function p(t,e){t&&(v(t)&&!t[a]?t.forEach(e):e(t))}function m(t,e){if(t&&e){if(t===e)return;if(v(t)){var n=t;if(1===n.length){if(n[0]===e)return}else{var i=n.indexOf(e);if(i>-1)return n.splice(i,1),1===n.length?n[0]:n}}}return t}function g(t,e){return t?v(t)&&!t[a]?(t.push(e),t):[t,e]:e}function y(t){return t&&!0===t[n]?t[i]:0}function b(t,e){if(void 0===e&&(e=!1),x(t)){t[f]?t[f](e):w(t,(function(n,i){L(t,i),t["ΔΔ"+n]=void 0,e&&b(i,!0)}));var n=t.ΔMd;if(n){var i=[];p(n.parents,(function(t){i.push(t)}));for(var r=function(e){w(e,(function(n,i){i===t&&(L(e,t),e["ΔΔ"+n]=void 0)})),z(e)},o=0,s=i;o<s.length;o++){r(s[o])}}}}function w(t,e){if(x(t)){var n=t.constructor.prototype["ΔDefFactories"];for(var i in n)n.hasOwnProperty(i)&&e(i,t["ΔΔ"+i],n[i])}}function C(t,e){return!(!t||"object"!=typeof t)&&"ΔΔ"+e in t}function x(t){return!(!t||!0!==t[n])}function N(t){return y(t)%2==1}function k(t,e){var n=h(t);return n&&e?(n.watchers=g(n.watchers,e),N(t)&&B.register(t),e):null}function D(t,e){var n=t?t.ΔMd:void 0;n&&e&&(n.watchers=m(n.watchers,e))}var j=function(){var t,e,n=[],i=[],r={getDefaultConversion:function(){return o(t,r)},getPreviousConversion:function(){return t.ΔtoJsResult}};function o(t,n){var i=n.getPreviousConversion();if(i)return i;var r=void 0;if(t.Δconvert)r=t.Δconvert(e);else{if(t["Δjson"])return t["Δjson"];r={},w(t,(function(t,n){x(n)&&(n=s(n,e)),void 0!==n&&(r[t]=n)}))}return r}function s(s,a){var c=0===n.length,l=s;if(s&&x(s)&&(n.push(s),l=void 0,i.push(s),t=s,a?(e=a,l=a(s,r)):l=o(s,r),s.ΔtoJsResult=l,i.pop(),t=i[i.length-1]),c){for(var f=n.length;f--;)n[f]["ΔtoJsResult"]=void 0;t=null,n=[],e=void 0}return l}return s}();function P(t,e){var n,i;e&&w(t,(function(r,o,s){var a=s===S;if(n=e[r],i="ΔΔ"+r,void 0===n)a&&(t[i]=void 0);else{var c=typeof n;if(null===n)(a||s===F)&&(t[i]=null);else if("object"===c){var f=function(t,e){if(t&&void 0!==e){if(t[l])return t[l](e);d=!0;var n=t[e];return d=!1,n}}(t,r);f?f[u]=n:a&&(t[i]=n)}else"string"===c?(a||s===$)&&(t[i]=n):"number"===c?(a||s===A)&&(t[i]=n):"boolean"===c?(a||s===V)&&(t[i]=n):a&&(t[i]=n)}}));t[u]=void 0}function I(){return""}I[o]=!0;var $=I;function O(){return 0}O[o]=!0;var A=O;function R(){return!1}R[o]=!0;var V=R;function E(){return null}E[o]=!0;var F=E;function T(){}T[o]=!0;var S=T;function M(t,e,n,i,r,o){var a=x(i),c=r===S;if(!t.ΔComputeDependencies){i&&!a&&r.ΔCreateProxy&&(a=x(i=r.ΔCreateProxy(i)||i));var l=!1,f=o[n];return N(t)?l=f!==i:f!==i&&(z(t),l=!0),l&&(a&&void 0===i&&(i=null),(a||f&&x(f))&&function(t,e,n,i){L(t,e),i||J(t,n)}(t,f,i,c),o[n]=i,function(t,e,n,i,r){var o=t?t.ΔMd:void 0;if(o&&o.trackers){var a=t[s]||t;p(o.trackers,(function(t){t(a,e,n,i,r)}))}}(t,"set",e,f,i)),i}console.error("[Trax] @computed properties must not mutate the Data object when calculated")}function z(t){if(x(t)){var e=!0;if(N(t)?e=!1:t.ΔChangeVersion+=1,B.register(t),e){var n=t.ΔMd;n&&n.parents&&p(n.parents,(function(t){z(t)}))}}}function L(t,e){if(e){var n=e.ΔMd;n&&n.parents&&(n.parents=m(n.parents,t))}}function J(t,e){if(e){var n=h(e);n&&(n.parents=g(n.parents,t))}}var W=0,H=function(){function t(){this.id=++W}return t.prototype.register=function(t){var e=this,n=h(t);n&&!n.refreshCtxt&&(this.objects?this.objects.push(t):(this.objects=[t],Promise.resolve().then((function(){e.refresh()}))),n.refreshCtxt=this)},t.prototype.refresh=function(t){void 0===t&&(t=!0);var e=this.objects,n=e?e.length:0;if(n){_();for(var i,r,o=[],s=0;n>s;s++)(r=(i=e[s]).ΔMd).refreshCtxt&&(i.ΔChangeVersion%2&&(i.ΔChangeVersion+=1),r.refreshCtxt&&r.watchers&&o.push({dataNode:i,watchers:r.watchers})),r.refreshCtxt=void 0;this.objects=void 0,o.length&&(t?K(o):Promise.resolve().then((function(){K(o)})))}},t}();function K(t){for(var e=function(t){p(t.watchers,(function(e){e(t.dataNode)}))},n=0,i=t;n<i.length;n++){e(i[n])}}var B=new H;function _(){B.objects&&(B=new H)}var q=/^\Δ/,U=function(){function t(t){this.ΔTrackable=!0,this.ΔDataFactory=!0,this.ΔChangeVersion=0,this.ΔMd=void 0,this.ΔΔSelf=this,this.ΔIsProxy=!1,this.ΔItemFactory=t}return t.ΔNewProxy=function(e){var n=new Proxy({},new t(e));return n[s]=n,n},t.ΔCreateProxy=function(e,n){if("object"==typeof e){var i=new Proxy(e,new t(n));for(var r in z(i),e)e.hasOwnProperty(r)&&J(i,e[r]);return i}return null},t.prototype.ΔnewItem=function(t){var e=this.ΔItemFactory();return M(this.ΔΔSelf,t,t,e,this.ΔItemFactory,this.ΔΔDict)},t.prototype.Δdispose=function(t){void 0===t&&(t=!1);var e,n=this.ΔΔDict;for(var i in n)n.hasOwnProperty(i)&&(e=n[i],L(this.ΔΔSelf,e),n[i]=void 0,t&&b(e,!0));return n},t.prototype.Δconvert=function(t){var e={},n=this.ΔΔDict;for(var i in n)n.hasOwnProperty(i)&&(e[i]=j(n[i],t));return e},t.prototype.ΔinitFromJson=function(){var t=this["Δjson"];if(t){if(t.constructor!==Object)console.error("[Trax] Invalid json type: Dictionaries can only be initialized from Objects");else{var e=this.ΔΔDict,n=void 0,i=void 0;for(var r in t)if(t.hasOwnProperty(r))if(i=n=t[r],n){var o=this.ΔItemFactory();x(o)&&(o["Δjson"]=n,i=o),e[r]=i}else null===n&&(e[r]=null)}this["Δjson"]=void 0}},t.prototype.ΔToString=function(){return"Trax Dict {...}"},t.prototype.set=function(t,e,n){return this.ΔΔDict||(this.ΔΔDict=t),e.match(q)?this[e]=n:M(this.ΔΔSelf,e,e,n,this.ΔItemFactory,this.ΔΔDict),!0},t.prototype.get=function(t,e){return this.ΔΔDict||(this.ΔΔDict=t),e===a||(this["Δjson"]&&this.ΔinitFromJson(),e===Symbol.iterator?this.ΔΔDict[Symbol.iterator]:"string"===typeof e?e.match(q)?this[e]:this.ΔΔDict[e]:this[e])},t.prototype.deleteProperty=function(t,e){return this.ΔΔDict||(this.ΔΔDict=t),!e.match(q)&&(M(this.ΔΔSelf,e,e,null,this.ΔItemFactory,this.ΔΔDict),delete this.ΔΔDict[e],!0)},t}();function Y(t){function e(){return U.ΔNewProxy(t)}return t=t||F,e[o]=!0,e[c]=function(e){return U.ΔCreateProxy(e,t)},e}var G=0,Q={log:function(t){for(var e=[],n=1;n<arguments.length;n++)e[n-1]=arguments[n];console.log.apply(console,arguments)},error:function(t){for(var e=[],n=1;n<arguments.length;n++)e[n-1]=arguments[n];console.error.apply(console,arguments)}};function X(t,e){for(var n=t,i=[];n;){if(n.template){var r=n.template;i.push('\n>> Template: "'+r.templateName+'" - File: "'+r.filePath+'"')}n=n.parentView}Q.error("IVY: "+e+i.join(""))}var Z=void 0,tt=/^ΔΔ(\w+)Emitter$/,et="ΔIsAPI",nt="ΔIsController",it=0,rt=function(){function t(t,e,n,i,r,o){this.templateName=t,this.filePath=e,this.staticCache=n,this.renderFn=i,this.$Class=r,this.$contextIdentifiers=o,this.kind="$template",this._uid=++it,this.tplApi=void 0,this.tplCtl=void 0,this.forceRefresh=!1,this.activeWatch=!1,this.lastRefreshVersion=0,this.processing=!1,this.rendering=!1,this.initialized=!1,this.labels=void 0,this.hasCtlClass=!1,this.$contextInitialized=!1,this.view=function(t,e,n,i){var r={kind:"#view",uid:"view"+ ++G,attached:!1,nodes:null,namespace:void 0,namespaces:void 0,doc:null,parentView:t,cm:!0,cmAppends:null,lastRefresh:0,container:null,projectionHost:null,template:i,rootDomNode:null,anchorNode:null,expressions:void 0,oExpressions:void 0,instructions:void 0,paramNode:void 0,createElement:at,isEmpty:ct};t?function(t,e,n){if(t.parentView=e,t.doc=e.doc,t.container=n,t.rootDomNode=e.rootDomNode,e.namespace){var i=e.namespace;t.namespace=i,t.namespaces=[i]}}(r,t,e):r.doc="undefined"!=typeof document?document:null;return r}(null,null,0,this);var s=this;this.watchCb=function(){s.notifyChange()},this.watchCb.$templateId=this._uid,this.$Class!==Z&&(Ct(this.$Class,nt)?this.hasCtlClass=!0:Ct(this.$Class,et)||x(this.$Class.prototype)||X(this.view,"Type of $ argument must be either a @Controller, an @API or a @Data class"))}return t.prototype.dispose=function(t){void 0===t&&(t=!0);var e=this.view;this.disconnectObserver(),st(e,this.tplCtl,"$dispose",this.templateName),t&&e&&e.nodes&&e.nodes.length&&(gt(e,e.nodes[0]),e.anchorNode&&(e.rootDomNode.removeChild(e.anchorNode),e.anchorNode=null))},Object.defineProperty(t.prototype,"uid",{get:function(){return this._uid},enumerable:!0,configurable:!0}),Object.defineProperty(t.prototype,"document",{get:function(){return this.view.doc},set:function(t){this.view.doc=t},enumerable:!0,configurable:!0}),Object.defineProperty(t.prototype,"api",{get:function(){if(!this.tplApi)if(this.hasCtlClass){var t=this.controller;t&&t.$api&&(this.tplApi=t.$api)}else this.$Class?(this.tplApi=new this.$Class,ot(this.view,this.tplApi,this.staticCache)):this.$contextIdentifiers?this.tplApi=function(t){return void 0!==t?(e[o]=!0,Y(e)()):Y()();function e(){return new t}}():this.tplApi={};return this.tplApi},enumerable:!0,configurable:!0}),Object.defineProperty(t.prototype,"controller",{get:function(){if(!this.tplCtl&&this.hasCtlClass){var t=this.tplCtl=new this.$Class;if(C(t,"$template")&&(t.$template=this),C(t,"$logger")){var e=this.view;t.$logger={log:Q.log,error:function(t){for(var n=[],i=1;i<arguments.length;i++)n[i-1]=arguments[i];X(e,t+(n.length?" "+n.join(" "):""))}}}t.$api&&ot(this.view,t.$api,this.staticCache)}return this.tplCtl},enumerable:!0,configurable:!0}),t.prototype.attach=function(t){if(this.view.rootDomNode)X(this.view,"Template host cannot be changed once set");else{var e=this.view;if(!e.doc)throw new Error("[iv] Template.document must be defined before calling Template.attach()");e.rootDomNode=t,e.anchorNode=e.doc.createComment("template anchor"),xt(e.anchorNode,t)}return this},t.prototype.registerLabel=function(t,e){this.labels||(this.labels={});var n=this.labels[t];n?n.push(e):n=this.labels[t]=[e]},t.prototype.query=function(t,e){if(void 0===e&&(e=!1),this.rendering)return null;for(var n=[],i=0,r=t.split(";");i<r.length;i++){var o=r[i];if(o&&"#"!==o.charAt(0))return X(this.view,"[$template.query()] Invalid label argument: '"+o+"' (labels must start with #)"),null;var s=this.labels&&this.labels[o]||null;if(s&&s.length){if(!e)return s[0];n=n.concat(s)}}return n.length?n:null},t.prototype.notifyChange=function(){this.render()},t.prototype.disconnectObserver=function(){this.activeWatch&&(D(this.api,this.watchCb),D(this.controller,this.watchCb),this.activeWatch=!1)},t.prototype.render=function(t,e){if(void 0===e&&(e=!1),this.processing)return this;e&&(this.forceRefresh=!0),this.processing=!0;var n=this.api,i=this.controller,r=this.view,o=this.$contextIdentifiers;i&&!x(i)&&(X(r,"Template controller must be a @Controller Object - please check: "+this.$Class.name),this.tplCtl=this.$Class=void 0);var s=!1;if(n&&t)if(o!==Z){var a=t.context;a!==Z&&"object"==typeof a&&(s=!0)}else for(var c in N(n)||_(),this.disconnectObserver(),t)t.hasOwnProperty(c)&&(n[c]=t[c]);if(this.$contextInitialized&&(s=!0),s){var l="",f=(t?t.context:null)||n.$context;if(f){for(var u=0;o.length>u;u++)n[l=o[u]]=f[l];n.$context=f,this.$contextInitialized=!0}}o===Z||this.$contextInitialized||X(r,"Missing $fragment context");var d=!this.forceRefresh,h=r.nodes;if(h&&h[0]&&h[0].attached||(d=!1),d&&y(n)+y(i)>this.lastRefreshVersion&&(d=!1),!d){i&&(this.initialized||(st(r,i,"$init","controller"),this.initialized=!0),st(r,i,"$beforeRender","controller")),this.rendering=!0,this.labels=void 0,r.lastRefresh++,r.instructions=void 0;try{this.renderFn(r,this.hasCtlClass?i:n,n,this)}catch(t){X(r,"Template execution error\n"+(t.message||t))}this.rendering=!1,i&&st(r,i,"$afterRender","controller"),function(t,e){if(void 0===e&&(e=!1),t){var n=t.ΔMd;n&&n.refreshCtxt?n.refreshCtxt.refresh(!0):e&&_()}}(n),this.forceRefresh=!1,this.lastRefreshVersion=y(n)+y(i)}return this.activeWatch||(k(n,this.watchCb),i&&k(i,this.watchCb),this.activeWatch=!0),this.processing=!1,this},t}();function ot(t,e,n){var i=n.events;if(void 0===i){var r=void 0;for(var o in e)if(o.match(tt)){var s=RegExp.$1;r||(r=[]),"function"!=typeof e[s+"Emitter"].init?X(t,"Invalid EventEmitter: "+s+"Emitter"):(r.push(s+"Emitter"),r.push(s),e[s+"Emitter"].init(s,e))}n.events=r||null}else if(null!==i)for(var a=i.length,c=0;a>c;c+=2)e[i[c]].init(i[c+1],e)}function st(t,e,n,i){if(e&&"function"==typeof e[n]){var r=void 0;try{void 0!==(r=e[n]())&&"function"==typeof r.catch&&r.catch((function(e){X(t,i+" "+n+" hook execution error\n"+(e.message||e))}))}catch(e){X(t,i+" "+n+" hook execution error\n"+(e.message||e))}}}function at(t,e){return(e=e||this.namespace)?this.doc.createElementNS(e,t):this.doc.createElement(t)}function ct(){return function(t){if(t!==Z&&null!==t){var e=!0;return function t(e,n,i){if(e!==Z&&null!==e){if(!i(e))return!1;if(null!==e.nodes&&e.nodes.length)for(var r=0,o=e.nodes;r<o.length;r++){if(!s(o[r]))return!1}}return!0;function s(e){var r=e.kind;if("#fragment"===r)return!!i(e)&&t(e.contentView,n,i);if("#container"!==r)return i(e);if(!i(e))return!1;var o=e,s=o.subKind;if("##block"===s){var a=o.views;if(null!==a)for(var c=0,l=a;c<l.length;c++){var f=l[c];if(!t(f,n,i))return!1}if(n&&o.viewPool)for(var u=0,d=o.viewPool;u<d.length;u++){var h=d[u];if(!t(h,n,i))return!1}}else if("##cpt"===s){var v=o.template;if(null!==v)return t(v.view,n,i)}else"##async"===s&&console.log("TODO: support scanNode for @async block");return!0}}(t,!1,(function(t){if(!e)return!1;var n=t.kind;if("#view"===n){var i=t;if(i.cm){var r=i.doc.createDocumentFragment();i.domNode=r,i.cmAppends=[function(t){t.domNode?xt(t.domNode,r):t.domNode=r}]}!function(t){if(t.instructions){var e=t.instructions.slice(0),n=e.length;if(t.instructions.splice(0,n),t.instructions=void 0,n)for(var i=0;n>i;i+=2)e[i].apply(null,e[i+1])}}(i)}else if("#element"===n||"#text"===n)return e=!1;return!0})),e}return!0}(this)}function lt(t,e,n){if(n){var i=function(t){var e=t;for(;e&&!e.template;)e=e.parentView;return e}(t);if(i!==Z&&null!==i)for(var r=i.template,o=n.length,s=0;o>s;s++)r.registerLabel(n[s],e)}}var ft=[];function ut(t,e,n){var i=t.nodes[e];if(i&&"##block"===i.subKind){var r=i,o=r.lastRefresh;if(n||o===t.lastRefresh){var s=r.views.length;if(!n){if(s!==r.previousNbrOfViews)for(var a=r.viewPool,c=a.length,l=void 0,f=0;c>f;f++)gt(l=a[f],l.nodes[0]),l.attached=!1;r.previousNbrOfViews=s}}else gt(t,r)}}function dt(t,e,n,i,r,o,s,a,c){if(e){var l=t.createElement(r);if(a)for(var f=a.length,u=0;f>u;u+=2)l.setAttribute(a[u],a[u+1]);if(c){f=c.length;for(var d=0;f>d;d+=2)l[c[d]]=c[d+1]}var h={kind:"#element",uid:"elt"+ ++G,idx:n,parentIdx:-1,ns:"",domNode:l,attached:!0,nextSibling:void 0,firstChild:void 0,lastChild:void 0,contentView:null};t.nodes[n]=h,lt(t,l,s),t.cmAppends[i](h,!1),o&&(t.cmAppends[i+1]=function(t,e){t.domNode?xt(t.domNode,l):t.domNode=l,e||function(t,e){t.firstChild?(t.lastChild.nextSibling=e,t.lastChild=e):(t.firstChild=t.lastChild=e,e.nextSibling=void 0);e.parentIdx=t.idx}(h,t)})}else s&&lt(t,t.nodes[n].domNode,s)}function ht(t,e,n,i,r,o,s,a){for(var c,l=[],f=8;f<arguments.length;f++)l[f-8]=arguments[f];if(a){var u=void 0,d=void 0,h=!1;u=e?s.slice(0):(c=t.nodes[i]).pieces;for(var v=0;a>v;v++)(d=pt(t,n,l[v]))!==ft&&(h=!0,u[1+2*v]=null==d?"":d);if(!e)return h&&(c.domNode.textContent=u.join("")),void lt(t,c.domNode,o);c=p(t.doc.createTextNode(u.join("")),u),lt(t,c.domNode,o)}else{if(!e)return void(o&&lt(t,t.nodes[i].domNode,o));c=p(t.doc.createTextNode(s),void 0),lt(t,c.domNode,o)}function p(t,e){return{kind:"#text",uid:"txt"+ ++G,domNode:t,attached:!0,idx:i,parentIdx:-1,pieces:e,nextSibling:void 0}}t.nodes[i]=c,t.cmAppends[r](c,!1)}function vt(t,e,n){if(t.expressions){var i=t.expressions;if(i.length>e&&i[e]===n)return ft;i[e]=n}else t.expressions=[],t.expressions[e]=n;return n}function pt(t,e,n){if(e){if(n[2]){var i=t.oExpressions;return i[2*n[0]]?ft:(i[2*n[0]]=1,n[1])}return vt(t,n[0],n[1])}return n}function mt(t,e,n,i,r,o,s,a){if(e){var c=t.nodes[i];if("#element"===c.kind){var l=c.domNode;if(!l)return void X(t,"Cannot set "+r+" event listener: undefined DOM node");var f=h(l);s&&!1!==(a=a||{}).passive&&(a.passive=!0),l.addEventListener(r,(function(t){f.callback&&f.callback(t)}),a)}else if("#container"===c.kind){var u=c.template;u?d(u.api,!1):X(t,"Cannot set "+r+" event listener: undefined component template")}else"#param"===c.kind?d(c.data,!0):"#decorator"===c.kind&&d(c.api,!0)}else t.nodes[n].callback=o;function d(e,n){if(e&&C(e,r+"Emitter")){var i=e[r+"Emitter"];if(i.addListener&&"function"==typeof i.addListener){var o=h(null);i.addListener((function(t){o.callback&&o.callback(t)})),n&&"function"==typeof i.init&&i.init(r,e)}else X(t,"Invalid event emitter for: "+r)}else X(t,"Unsupported event: "+r)}function h(e){var r={kind:"#listener",uid:"evt"+ ++G,idx:n,parentIdx:i,nextSibling:void 0,domNode:e,attached:!0,callback:o};return t.nodes[n]=r,r}}function gt(t,e){if(e&&e.attached)if("#text"===e.kind||"#element"===e.kind){var n=function t(e,n){if(0===n.idx&&e.projectionHost){if(!n.attached)return null;var i=e.projectionHost.hostNode;return"#element"===i.kind?i.domNode:t(e.projectionHost.view,i)}return 0===n.idx?e.parentView?t(e.parentView,e.container):e.rootDomNode:e.nodes[n.parentIdx].domNode}(t,e);e.attached=!1,n?n.removeChild(e.domNode):X(t,"Internal error - parent not found for: "+e.uid)}else if("#container"===e.kind){if("##block"===e.subKind){for(var i=e,r=i.views,o=r.length,s=void 0,a=0;o>a;a++)s=r[a].nodes[0],gt(r[a],s),r[a].attached=s.attached=!1,"#container"!==s.kind&&"#fragment"!==s.kind||(s.domNode=void 0);i.views=[],i.previousNbrOfViews=0,i.viewPool=r.concat(i.viewPool)}else if("##cpt"===e.subKind){var c=e.template;s=c.view.nodes[0];gt(c.view,s),c.view.attached=s.attached=!1,"#container"!==s.kind&&"#fragment"!==s.kind||(s.domNode=void 0)}}else if("#fragment"===e.kind){var l=e;if(l.attached=!1,l.contentView)gt(l.contentView,l.contentView.nodes[0]);else if(l.firstChild)for(var f=l.firstChild;f;)gt(t,f),f=f.nextSibling;l.domNode=void 0}else"#param"===e.kind?console.warn("TODO removeFromDom for param nodes"):console.warn("RemoveFromDom for "+e.kind)}var yt=function(t){var e=t.prototype;e[n]=!0,e[i]=0},bt=function(t,e){return t||(t=E,e=3),function(n,i){var o="ΔΔ"+i,s=n[r];s||(s=n[r]={}),s[i]=e?1===e?E:T:t,n[o]=void 0,function(t,e,n,i){i&&delete t[e]&&Object.defineProperty(t,e,i)}(n,i,0,{get:function(){return function(t,e,n,i,r){t.ΔComputeDependencies&&(t.ΔComputeDependencies[n]=!0);!d&&t[u]&&P(t,t[u]);var o=t[e];(void 0===o||d&&null===o)&&(o=t[e]=!d&&r?r>1?void 0:null:i(),J(t,o));return o}(this,o,i,t,e)},set:function(e){M(this,i,o,e,t,this)},enumerable:!0,configurable:!0})}},wt={};function Ct(t,e){return!0===t.prototype[e]}function xt(t,e,n){e.appendChild(t)}function Nt(){this.count=0}var kt,Dt,jt,Pt,It,$t,Ot,At,Rt,Vt,Et,Ft,Tt,St=(Ot={},At=["class","counter"],Rt=["class","btn"],Vt=["class","val","tabIndex",0],Et=[" ",""," "],Ft=["class","btn"],Tt=function(){function n(){this.ΔΔcount=42}return n.prototype.ΔDefault=function(t){switch(t){case"count":return 42}return wt},t([bt(),e("design:type",Object)],n.prototype,"count",void 0),n=t([yt],n)}(),kt="counter",Dt=".../events/events.ts",jt=Ot,Pt=function(t,e,n){var i,r,o,s=n.count,a=(r=11,(o=(i=t).cm)?(i.nodes=new Array(r),i.cmAppends||(i.cmAppends=[],i.anchorNode&&(i.cmAppends[0]=function(t,e){var n,r;t.domNode?(n=t.domNode,r=i.anchorNode,i.rootDomNode.insertBefore(n,r)):t.domNode=i.rootDomNode}))):i.cmAppends=null,o);dt(t,a,0,0,"div",1,0,At),mt(t,a,1,0,"keydown",(function(t){return function(t,e){var n=parseInt(t.key,10);isNaN(n)||(e.count=n)}(t,n)})),dt(t,a,2,1,"span",1,0,Rt),mt(t,a,3,2,"click",(function(){n.count--}),1),ht(t,a,0,4,2,0," - ",0),dt(t,a,5,1,"span",1,0,Vt),mt(t,a,6,5,"dblclick",Nt.bind(n)),ht(t,a,0,7,2,0,Et,1,vt(t,0,s)),dt(t,a,8,1,"span",1,0,Ft),mt(t,a,9,8,"click",(function(){return n.count++}),1,{capture:!0}),ht(t,a,0,10,2,0," + ",0),function(t,e,n){if(n)for(var i=n.length,r=0;i>r;r++)ut(t,n[r],t.cm);t.cm&&(t.cm=!1,t.cmAppends=null)}(t)},It=Tt,function(){return new rt(kt,Dt,jt,Pt,It,$t)});St().attach(document.getElementById("col1")).render(),St().attach(document.getElementById("col2")).render({count:18})}();