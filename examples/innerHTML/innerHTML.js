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
    ***************************************************************************** */function e(e,t,n,r){var i,o=arguments.length,a=o<3?t:null===r?r=Object.getOwnPropertyDescriptor(t,n):r;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(e,t,n,r);else for(var s=e.length-1;s>=0;s--)(i=e[s])&&(a=(o<3?i(a):o>3?i(t,n,a):i(t,n))||a);return o>3&&a&&Object.defineProperty(t,n,a),a}function t(e,t){if("object"==typeof Reflect&&"function"==typeof Reflect.metadata)return Reflect.metadata(e,t)}var n="ΔTrackable",r="ΔChangeVersion",i="ΔDefFactories",o="ΔΔProxy",a="ΔIsProxy",s="ΔnewItem",d="Δjson",l=!1;function c(e){return e&&e.ΔTrackable?e.ΔMd?e.ΔMd:e.ΔMd={parents:void 0,refreshCtxt:void 0,watchers:void 0}:null}var u=Array.isArray;function f(e,t){e&&(u(e)&&!e[a]?e.forEach(t):t(e))}function p(e,t){if(e&&t){if(e===t)return;if(u(e)){var n=e;if(1===n.length){if(n[0]===t)return}else{var r=n.indexOf(t);if(r>-1)return n.splice(r,1),1===n.length?n[0]:n}}}return e}function v(e,t){return e?u(e)&&!e[a]?(e.push(t),e):[e,t]:t}function h(e){return e&&!0===e[n]?e[r]:0}function m(e,t){return!(!e||"object"!=typeof e)&&"ΔΔ"+t in e}function g(e){return!(!e||!0!==e[n])}function b(e){return h(e)%2==1}function y(e,t){var n=c(e);return n&&t?(n.watchers=v(n.watchers,t),b(e)&&F.register(e),t):null}function w(e,t){var n=e?e.ΔMd:void 0;n&&t&&(n.watchers=p(n.watchers,t))}function N(e,t){var n,r;t&&function(e,t){if(g(e)){var n=e.constructor.prototype["ΔDefFactories"];for(var r in n)n.hasOwnProperty(r)&&t(r,e["ΔΔ"+r],n[r])}}(e,(function(i,o,a){var c=a===D;if(n=t[i],r="ΔΔ"+i,void 0===n)c&&(e[r]=void 0);else{var u=typeof n;if(null===n)(c||a===P)&&(e[r]=null);else if("object"===u){var f=function(e,t){if(e&&void 0!==t){if(e[s])return e[s](t);l=!0;var n=e[t];return l=!1,n}}(e,i);f?f[d]=n:c&&(e[r]=n)}else"string"===u?(c||a===I)&&(e[r]=n):"number"===u?(c||a===O)&&(e[r]=n):"boolean"===u?(c||a===E)&&(e[r]=n):c&&(e[r]=n)}}));e[d]=void 0}function C(e){var t=e.prototype;t[n]=!0,t[r]=0}function x(){return""}x["ΔIsFactory"]=!0;var I=x;function $(){return 0}$["ΔIsFactory"]=!0;var O=$;function j(){return!1}j["ΔIsFactory"]=!0;var E=j;function k(){return null}k["ΔIsFactory"]=!0;var P=k;function A(){}A["ΔIsFactory"]=!0;var D=A;function T(e,t){if(t){var n=c(t);n&&(n.parents=v(n.parents,e))}}var V=0,R=function(){function e(){this.id=++V}return e.prototype.register=function(e){var t=this,n=c(e);n&&!n.refreshCtxt&&(this.objects?this.objects.push(e):(this.objects=[e],Promise.resolve().then((function(){t.refresh()}))),n.refreshCtxt=this)},e.prototype.refresh=function(e){void 0===e&&(e=!0);var t=this.objects,n=t?t.length:0;if(n){M();for(var r,i,o=[],a=0;n>a;a++)(i=(r=t[a]).ΔMd).refreshCtxt&&(r.ΔChangeVersion%2&&(r.ΔChangeVersion+=1),i.refreshCtxt&&i.watchers&&o.push({dataNode:r,watchers:i.watchers})),i.refreshCtxt=void 0;this.objects=void 0,o.length&&(e?H(o):Promise.resolve().then((function(){H(o)})))}},e}();function H(e){for(var t=function(e){f(e.watchers,(function(t){t(e.dataNode)}))},n=0,r=e;n<r.length;n++){t(r[n])}}var F=new R;function M(){F.objects&&(F=new R)}var L=0,S={log:function(e){for(var t=[],n=1;n<arguments.length;n++)t[n-1]=arguments[n];console.log.apply(console,arguments)},error:function(e){for(var t=[],n=1;n<arguments.length;n++)t[n-1]=arguments[n];console.error.apply(console,arguments)}};function W(e,t){for(var n=e,r=[];n;){if(n.template){var i=n.template;r.push('\n>> Template: "'+i.templateName+'" - File: "'+i.filePath+'"')}n=n.parentView}S.error("IVY: "+t+r.join(""))}var q=void 0,K=/^ΔΔ(\w+)Emitter$/,z=/^ΔΔ/,U=/([^ ]+)\s([^ ]+)/,_="ΔIsAPI",B="ΔIsController",X="ΔDefaultParam",Y="ΔIoParams",G="ΔRequiredProps",J={$targetApi:"$1 cannot be used on DOM nodes",$targetElt:"$1 cannot be used on components that don't define #main elements"},Q=0,Z=function(){function e(e,t,n,r,i){this.templateName=e,this.filePath=t,this.staticCache=n,this.renderFn=r,this.$Class=i,this._uid=++Q,this.tplApi=void 0,this.tplCtl=void 0,this.forceRefresh=!1,this.activeWatch=!1,this.lastRefreshVersion=0,this.processing=!1,this.rendering=!1,this.initialized=!1,this.labels=void 0,this.hasCtlClass=!1,this.view=function(e,t,n,r){var i={kind:"#view",uid:"view"+ ++L,attached:!1,nodes:null,namespace:void 0,namespaces:void 0,doc:null,parentView:e,cm:!0,cmAppends:null,lastRefresh:0,container:null,projectionHost:null,template:r,rootDomNode:null,anchorNode:null,expressions:void 0,oExpressions:void 0,instructions:void 0,paramNode:void 0,createElement:ne,isEmpty:re};e?function(e,t,n){if(e.parentView=t,e.doc=t.doc,e.container=n,e.rootDomNode=t.rootDomNode,t.namespace){var r=t.namespace;e.namespace=r,e.namespaces=[r]}}(i,e,t):i.doc="undefined"!=typeof document?document:null;return i}(null,null,0,this);var o=this;this.watchCb=function(){o.notifyChange()},this.watchCb.$templateId=this._uid,this.$Class!==q&&($e(this.$Class,B)?this.hasCtlClass=!0:$e(this.$Class,_)||g(this.$Class.prototype)||W(this.view,"Type of $ argument must be either a @Controller, an @API or a @Data class"))}return e.prototype.dispose=function(e){void 0===e&&(e=!1);var t=this.view;this.disconnectObserver(),te(t,this.tplCtl,"$dispose",this.templateName),e&&t&&t.nodes&&t.nodes.length&&ge(t,t.nodes[0])},Object.defineProperty(e.prototype,"uid",{get:function(){return this._uid},enumerable:!0,configurable:!0}),Object.defineProperty(e.prototype,"document",{get:function(){return this.view.doc},set:function(e){this.view.doc=e},enumerable:!0,configurable:!0}),Object.defineProperty(e.prototype,"api",{get:function(){if(!this.tplApi)if(this.hasCtlClass){var e=this.controller;e&&e.$api&&(this.tplApi=e.$api)}else this.$Class&&(this.tplApi=new this.$Class,ee(this.view,this.tplApi,this.staticCache));return this.tplApi},enumerable:!0,configurable:!0}),Object.defineProperty(e.prototype,"controller",{get:function(){if(!this.tplCtl&&this.hasCtlClass){var e=this.tplCtl=new this.$Class;if(m(e,"$template")&&(e.$template=this),m(e,"$logger")){var t=this.view;e.$logger={log:S.log,error:function(e){for(var n=[],r=1;r<arguments.length;r++)n[r-1]=arguments[r];W(t,e+(n.length?" "+n.join(" "):""))}}}e.$api&&ee(this.view,e.$api,this.staticCache)}return this.tplCtl},enumerable:!0,configurable:!0}),e.prototype.attach=function(e){if(this.view.rootDomNode)W(this.view,"Template host cannot be changed once set");else{var t=this.view;if(!t.doc)throw new Error("[iv] Template.document must be defined before calling Template.attach()");t.rootDomNode=e,t.anchorNode=t.doc.createComment("template anchor"),Ae(t.anchorNode,e)}return this},e.prototype.registerLabel=function(e,t){this.labels||(this.labels={});var n=this.labels[e];n?n.push(t):n=this.labels[e]=[t]},e.prototype.query=function(e,t){if(void 0===t&&(t=!1),this.rendering)return null;for(var n=[],r=0,i=e.split(";");r<i.length;r++){var o=i[r];if(o&&"#"!==o.charAt(0))return W(this.view,"[$template.query()] Invalid label argument: '"+o+"' (labels must start with #)"),null;var a=this.labels&&this.labels[o]||null;if(a&&a.length){if(!t)return a[0];n=n.concat(a)}}return n.length?n:null},e.prototype.notifyChange=function(){this.render()},e.prototype.disconnectObserver=function(){this.activeWatch&&(w(this.api,this.watchCb),w(this.controller,this.watchCb),this.activeWatch=!1)},e.prototype.render=function(e,t){if(void 0===t&&(t=!1),this.processing)return this;t&&(this.forceRefresh=!0),this.processing=!0;var n=this.api,r=this.controller,i=this.view;if(r&&!g(r)&&(W(i,"Template controller must be a @Controller Object - please check: "+this.$Class.name),this.tplCtl=this.$Class=void 0),n&&e)for(var o in b(n)||M(),this.disconnectObserver(),e)e.hasOwnProperty(o)&&(n[o]=e[o]);var a=!this.forceRefresh,s=i.nodes;if(s&&s[0]&&s[0].attached||(a=!1),a&&h(n)+h(r)>this.lastRefreshVersion&&(a=!1),!a){r&&(this.initialized||(te(i,r,"$init","controller"),this.initialized=!0),te(i,r,"$beforeRender","controller")),this.rendering=!0,this.labels=void 0,i.lastRefresh++,i.instructions=void 0;try{this.renderFn(i,this.hasCtlClass?r:n,n,this)}catch(e){W(i,"Template execution error\n"+(e.message||e))}this.rendering=!1,r&&te(i,r,"$afterRender","controller"),function(e,t){if(void 0===t&&(t=!1),e){var n=e.ΔMd;n&&n.refreshCtxt?n.refreshCtxt.refresh(!0):t&&M()}}(n),this.forceRefresh=!1,this.lastRefreshVersion=h(n)+h(r)}return this.activeWatch||(y(n,this.watchCb),r&&y(r,this.watchCb),this.activeWatch=!0),this.processing=!1,this},e}();function ee(e,t,n){var r=n.events;if(void 0===r){var i=void 0;for(var o in t)if(o.match(K)){var a=RegExp.$1;i||(i=[]),"function"!=typeof t[a+"Emitter"].init?W(e,"Invalid EventEmitter: "+a+"Emitter"):(i.push(a+"Emitter"),i.push(a),t[a+"Emitter"].init(a,t))}n.events=i||null}else if(null!==r)for(var s=r.length,d=0;s>d;d+=2)t[r[d]].init(r[d+1],t)}function te(e,t,n,r){if(t&&"function"==typeof t[n])try{t[n]()}catch(t){W(e,r+" "+n+" hook execution error\n"+(t.message||t))}}function ne(e,t){return(t=t||this.namespace)?this.doc.createElementNS(t,e):this.doc.createElement(e)}function re(){return function(e){if(e!==q&&null!==e){var t=!0;return function e(t,n,r){if(t!==q&&null!==t){if(!r(t))return!1;if(null!==t.nodes&&t.nodes.length)for(var i=0,o=t.nodes;i<o.length;i++){if(!a(o[i]))return!1}}return!0;function a(t){var i=t.kind;if("#fragment"===i)return!!r(t)&&e(t.contentView,n,r);if("#container"!==i)return r(t);if(!r(t))return!1;var o=t,a=o.subKind;if("##block"===a){var s=o.views;if(null!==s)for(var d=0,l=s;d<l.length;d++){var c=l[d];if(!e(c,n,r))return!1}if(n&&o.viewPool)for(var u=0,f=o.viewPool;u<f.length;u++){var p=f[u];if(!e(p,n,r))return!1}}else if("##cpt"===a){var v=o.template;if(null!==v)return e(v.view,n,r)}else"##async"===a&&console.log("TODO: support scanNode for @async block");return!0}}(e,!1,(function(e){if(!t)return!1;var n=e.kind;if("#view"===n){var r=e;if(r.cm){var i=r.doc.createDocumentFragment();r.domNode=i,r.cmAppends=[function(e){e.domNode?Ae(e.domNode,i):e.domNode=i}]}!function(e){if(e.instructions){var t=e.instructions.slice(0),n=t.length;if(e.instructions.splice(0,n),e.instructions=void 0,n)for(var r=0;n>r;r+=2)t[r].apply(null,t[r+1])}}(r)}else if("#element"===n||"#text"===n)return t=!1;return!0})),t}return!0}(this)}function ie(e,t,n){if(n){var r=function(e){var t=e;for(;t&&!t.template;)t=t.parentView;return t}(e);if(r!==q&&null!==r)for(var i=r.template,o=n.length,a=0;o>a;a++)i.registerLabel(n[a],t)}}var oe=[];function ae(e,t,n){var r=e.nodes[t];if(r&&"##block"===r.subKind){var i=r,o=i.lastRefresh;if(n||o===e.lastRefresh){var a=i.views.length;if(!n){if(a!==i.previousNbrOfViews)for(var s=i.viewPool,d=s.length,l=void 0,c=0;d>c;c++)ge(l=s[c],l.nodes[0]),l.attached=!1;i.previousNbrOfViews=a}}else ge(e,i)}}function se(e,t,n,r,i,o,a,s,d){if(t){var l=e.createElement(i);if(s)for(var c=s.length,u=0;c>u;u+=2)l.setAttribute(s[u],s[u+1]);if(d){c=d.length;for(var f=0;c>f;f+=2)l[d[f]]=d[f+1]}var p={kind:"#element",uid:"elt"+ ++L,idx:n,parentIdx:-1,ns:"",domNode:l,attached:!0,nextSibling:void 0,firstChild:void 0,lastChild:void 0,contentView:null};e.nodes[n]=p,ie(e,l,a),e.cmAppends[r](p,!1),o&&(e.cmAppends[r+1]=function(e,t){e.domNode?Ae(e.domNode,l):e.domNode=l,t||de(p,e)})}else a&&ie(e,e.nodes[n].domNode,a)}function de(e,t){e.firstChild?(e.lastChild.nextSibling=t,e.lastChild=t):(e.firstChild=e.lastChild=t,t.nextSibling=void 0),t.parentIdx=e.idx}function le(e,t,n,r,i,o,a,s){for(var d,l=[],c=8;c<arguments.length;c++)l[c-8]=arguments[c];if(s){var u=void 0,f=void 0,p=!1;u=t?a.slice(0):(d=e.nodes[r]).pieces;for(var v=0;s>v;v++)(f=ce(e,n,l[v]))!==oe&&(p=!0,u[1+2*v]=null==f?"":f);if(!t)return p&&(d.domNode.textContent=u.join("")),void ie(e,d.domNode,o);d=h(e.doc.createTextNode(u.join("")),u),ie(e,d.domNode,o)}else{if(!t)return void(o&&ie(e,e.nodes[r].domNode,o));d=h(e.doc.createTextNode(a),void 0),ie(e,d.domNode,o)}function h(e,t){return{kind:"#text",uid:"txt"+ ++L,domNode:e,attached:!0,idx:r,parentIdx:-1,pieces:t,nextSibling:void 0}}e.nodes[r]=d,e.cmAppends[i](d,!1)}function ce(e,t,n){if(t){if(n[2]){var r=e.oExpressions;return r[2*n[0]]?oe:(r[2*n[0]]=1,n[1])}return function(e,t,n){if(e.expressions){var r=e.expressions;if(r.length>t&&r[t]===n)return oe;r[t]=n}else e.expressions=[],e.expressions[t]=n;return n}(e,n[0],n[1])}return n}function ue(e,t,n,r,i,o,a,s){var d,l=e.nodes[r],c=l.kind,u=q;if(a!==q&&s!==q&&null!==a&&"object"==typeof a&&(t&&"string"==typeof s&&g(a)&&!m(a,s)&&W(e,"Invalid property: '"+s+"'"),u=a[s]),"#container"===c)(function(e,t,n,r,i){if(r&&(!e.cm||m(r,i)))return!0;var o="";return n.template&&(o=" on <*"+n.template.templateName+"/>"),W(e,"Invalid parameter '"+i+"'"+o),!1})(e,0,l,d=l.data,o)&&(t&&Pe(e,d,o),d[o]=u);else if("#param"===c)if(0===o){var f=l;f.dataHolder&&(f.dataHolder[f.dataName]=u,d=f.dataHolder,o=f.dataName,t&&Pe(e,d,o,"."+o,!1,!0))}else d=function(e,t,n,r,i){if(0===i){if(n.dataHolder)return n.dataHolder[n.dataName]=r,n.dataHolder}else{if(n.data)return t&&!m(n.data,i)&&W(e,"Invalid param node parameter: "+i),n.data[i]=r,n.data;W(e,"Invalid param node parameter: "+i)}return null}(e,t,l,u,o),t&&Pe(e,d,o,"."+l.dataName);else if("#decorator"===c){var p=l;d=p.api,0===o?(o=ve(e,p,u),t&&o&&Pe(e,d,o,p.refName,!0)):t&&!pe(e,p,o)||(t&&Pe(e,d,o,p.refName),d[o]=u)}var v=l.bindings;if(v===q&&(v=l.bindings=[]),v[i]===q){if(d){var b={propertyHolder:a,propertyName:s,watchFn:y(d,(function(){var e=d[o],t=b.propertyHolder;if(t!==q&&null!==t&&b.propertyName!==q&&t[b.propertyName]!==e){var n=h(t);0===n||n%2==1?Promise.resolve().then((function(){t[b.propertyName]=e})):t[b.propertyName]=e}}))};v[i]=b}}else{var w=v[i];w.propertyHolder=a,w.propertyName=s}}function fe(e,t,n,r,i,o,a,s,d,l,c){var u;if(t){var f=e.nodes;if(void 0===a)W(e,"Undefined decorator reference: @"+o);else if("function"!=typeof a&&!0!==a.$isDecorator)W(e,"Invalid decorator reference: @"+o);else{var p=new a.$apiClass,v=a(p);if(u={kind:"#decorator",uid:"deco"+ ++L,idx:r,parentIdx:i,attached:!0,nextSibling:void 0,domNode:void 0,instance:v,api:p,refName:"@"+o,validProps:!0},f[r]=u,l)for(var h=l.length,m=0;h>m;m+=2)pe(e,u,l[m]),p[l[m]]=l[m+1]}}else u=e.nodes[r];if(u!==q){p=u.api;1===s&&ve(e,u,d),ie(e,p,c)}}function pe(e,t,n){return!!m(t.api,n)||(W(e,"Invalid decorator parameter '"+n+"' on "+t.refName),!1)}function ve(e,t,n){var r=t.api,i=r[X];return i===q?(W(e,t.refName+" doesn't define any default parameter"),""):(r[i]=n,i)}function he(e,t,n){if(t){var r=n.api,i=e.nodes[n.parentIdx],o=null,a=null;if(void 0===i.kind)o=i;else if("#element"===i.kind)o=i.domNode;else if("#container"===i.kind&&"##cpt"===i.subKind){var s=i.template;a=s.api,o=s.query("#main")}else W(e,"Invalid decorator target for "+n.refName);null!==o&&m(r,"$targetElt")&&(r.$targetElt=o),null!==a&&m(r,"$targetApi")&&(r.$targetApi=a),n.validProps=function(e,t,n,r){if(t[G]!==q){var i=t[G],o=void 0,a=!0;for(var s in i)if((o=t[i[s]])===q||null===o){var d=Ie(i[s]);r!==q&&r[d]!==q?W(e,(n+" "+d).replace(U,r[d])):W(e,d+" property is required for "+n),a=!1}return a}return!0}(e,n.api,n.refName,J),n.validProps&&te(e,n.instance,"$init",n.refName)}n.validProps&&te(e,n.instance,"$render",n.refName)}function me(e,t,n,r){var i=e.nodes[r];i!==q&&he(e,t,i)}function ge(e,t){if(t&&t.attached)if("#text"===t.kind||"#element"===t.kind){var n=function e(t,n){if(0===n.idx&&t.projectionHost){if(!n.attached)return null;var r=t.projectionHost.hostNode;return"#element"===r.kind?r.domNode:e(t.projectionHost.view,r)}return 0===n.idx?t.parentView?e(t.parentView,t.container):t.rootDomNode:t.nodes[n.parentIdx].domNode}(e,t);t.attached=!1,n?n.removeChild(t.domNode):W(e,"Internal error - parent not found for: "+t.uid)}else if("#container"===t.kind){if("##block"===t.subKind){for(var r=t,i=r.views,o=i.length,a=void 0,s=0;o>s;s++)a=i[s].nodes[0],ge(i[s],a),i[s].attached=a.attached=!1,"#container"!==a.kind&&"#fragment"!==a.kind||(a.domNode=void 0);r.views=[],r.previousNbrOfViews=0,r.viewPool=i.concat(r.viewPool)}else if("##cpt"===t.subKind){var d=t.template;a=d.view.nodes[0];ge(d.view,a),d.view.attached=a.attached=!1,"#container"!==a.kind&&"#fragment"!==a.kind||(a.domNode=void 0)}}else if("#fragment"===t.kind){var l=t;if(l.attached=!1,l.contentView)ge(l.contentView,l.contentView.nodes[0]);else if(l.firstChild)for(var c=l.firstChild;c;)ge(e,c),c=c.nextSibling;l.domNode=void 0}else"#param"===t.kind?console.warn("TODO removeFromDom for param nodes"):console.warn("RemoveFromDom for "+t.kind)}var be=C,ye=function(e,t){return e||(e=k,t=3),function(n,r){var a="ΔΔ"+r,s=n[i];s||(s=n[i]={}),s[r]=t?1===t?k:A:e,n[a]=void 0,function(e,t,n,r){r&&delete e[t]&&Object.defineProperty(e,t,r)}(n,r,0,{get:function(){return function(e,t,n,r,i){e.ΔComputeDependencies&&(e.ΔComputeDependencies[n]=!0);!l&&e[d]&&N(e,e[d]);var o=e[t];(void 0===o||l&&null===o)&&(o=e[t]=!l&&i?i>1?void 0:null:r(),T(e,o));return o}(this,a,r,e,t)},set:function(t){!function(e,t,n,r,i,a){var s=g(r),d=i===D;if(e.ΔComputeDependencies)return void console.error("[Trax] @computed properties must not mutate the Data object when calculated");r&&!s&&i.ΔCreateProxy&&(r=i.ΔCreateProxy(r)||r,s=g(r));var l=!1,c=a[n];b(e)?l=c!==r:c!==r&&(!function e(t){if(!g(t))return;var n=!0;b(t)?n=!1:t.ΔChangeVersion+=1;if(F.register(t),n){var r=t.ΔMd;r&&r.parents&&f(r.parents,(function(t){e(t)}))}}(e),l=!0);l&&(s&&void 0===r&&(r=null),(s||c&&g(c))&&function(e,t,n,r){(function(e,t){if(t){var n=t.ΔMd;n&&n.parents&&(n.parents=p(n.parents,e))}})(e,t),r||T(e,n)}(e,c,r,d),a[n]=r,function(e,t,n,r,i){var a=e?e.ΔMd:void 0;if(a&&a.trackers){var s=e[o]||e;f(a.trackers,(function(e){e(s,t,n,r,i)}))}}(e,"set",t,c,r))}(this,r,a,t,e,this)},enumerable:!0,configurable:!0})}},we=I,Ne=O,Ce={};function xe(e){e.prototype[_]=!0,C(e)}function Ie(e){return e.replace(z,"")}function $e(e,t){return!0===e.prototype[t]}function Oe(e,t){return t.$apiClass=e,t.$isDecorator=!0,t}function je(e,t){e[X]=Ie(t)}function Ee(e,t){var n=e[Y];t="/"+Ie(t),e[Y]=n===q?t:n+t}function ke(e,t){var n=e[G];n===q&&(n=e[G]=[]),n.push(t)}function Pe(e,t,n,r,i,o){var a=t[Y];if(a!==q){var s="/"+n;if(a===s||a.indexOf(s)>-1)return!0}return W(e,r!==q?i?"Invalid I/O binding expression on "+r+" (@defaultParam is not an @io param)":o?"Invalid I/O binding expression on "+r+"@paramValue (not an @io param)":"Invalid I/O binding expression on "+r+"."+n+" (not an @io param)":"Invalid I/O binding expression on '"+n+"' (not an @io param)"),!1}function Ae(e,t,n){t.appendChild(e)}var De="value",Te="checked",Ve="data",Re=["text","radio","checkbox","number","range"],He={passive:!0},Fe=Oe(function(){function n(){this.ΔΔevents="input",this.ΔΔdebounce=0}return n.prototype.ΔDefault=function(e){switch(e){case"events":return"input";case"debounce":return 0}return Ce},e([ke,je,Ee,t("design:type",Object)],n.prototype,"ΔΔdata",void 0),e([ye(),t("design:type",Object)],n.prototype,"data",void 0),e([ke,t("design:type",Object)],n.prototype,"ΔΔ$targetElt",void 0),e([ye(),t("design:type",Object)],n.prototype,"$targetElt",void 0),e([ye(we),t("design:type",String)],n.prototype,"events",void 0),e([ye(0,2),t("design:type",Object)],n.prototype,"input2data",void 0),e([ye(0,2),t("design:type",Object)],n.prototype,"data2input",void 0),e([ye(Ne),t("design:type",Number)],n.prototype,"debounce",void 0),n=e([xe],n)}(),(function(e){var t,n,r="",i="",o="",a={};function s(t){if("number"===r&&"input"===t.type){var i=t[Ve];if("e"===i||"E"===i||"-"===i||"+"===i)return}e.debounce<=0?d():(n||(n=new Me("@value error")),n.duration=e.debounce,n.process(d))}function d(){var n;if("text"===r||"number"===r)n=t[De];else if("range"===r){var i=t[De];if(""===i)n=0;else if(n=parseInt(i),isNaN(n))throw"Invalid input value '"+i+"': value of input type range shall be an integer"}else if("checkbox"===r)n=t[Te];else if("radio"===r){if(!t[Te])return;n=t[De]}e.data=e.input2data(n)}return{$init:function(){if("INPUT"!==(t=e.$targetElt).tagName&&"TEXTAREA"!==t.tagName&&"SELECT"!==t.tagName)throw"@value can only be used on input, textarea and select elements";if(r="text","INPUT"===t.tagName&&(r=t.getAttribute("type"),-1===Re.indexOf(r)))throw"Invalid input type '"+r+"': @value can only be used on types '"+Re.join("', '")+"'";t.addEventListener("change",s,He)},$render:function(){if(void 0===e.input2data&&(e.input2data=function(e){if("number"===r){if(""===e)return 0;try{e=parseFloat(e)}catch(e){return console.log("@value conversion error: ",e),0}}return e}),void 0===e.data2input&&(e.data2input=Se),i!==e.data){i=e.data;var n=e.data2input(i);if("text"===r||"number"===r)t[De]=n;else if("range"===r){if(!Number.isInteger(n))throw"Invalid input value '"+n+"': value of input type range shall be an integer";t[De]=""+n}else"checkbox"===r?t[Te]=!!n:"radio"===r&&(t[Te]=n===t[De])}if(o!==e.events){for(var d=e.events.split(";"),l=0,c=o.split(";");l<c.length;l++){"change"!==(p=c[l])&&(d.indexOf(p)<0&&a[p]&&(t.removeEventListener(p,s,He),a[p]=!1))}for(var u=0,f=d;u<f.length;u++){var p;"change"!==(p=f[u])&&(a[p]||(t.addEventListener(p,s,He),a[p]=!0))}o=e.events}},$dispose:function(){if(t){if(t.removeEventListener("change",s),""!==o)for(var e=0,r=o.split(";");e<r.length;e++){var i=r[e];"change"!==i&&t.removeEventListener(i,s,He)}o="",n=void 0}}}})),Me=function(){function e(e){void 0===e&&(e="Error in callback"),this.errContext=e,this.timeoutId=null,this.duration=100}return e.prototype.process=function(e){var t=this;this.duration<=0?Le(e,this.errContext):(null!==this.timeoutId&&clearTimeout(this.timeoutId),this.timeoutId=setTimeout((function(){t.timeoutId=null,Le(e,t.errContext)}),this.duration))},e}();function Le(e,t){try{e()}catch(e){throw"Debounce - "+t+"\n"+(e.message?e.message:e)}}function Se(e){return e}var We,qe,Ke,ze,Ue,_e,Be,Xe,Ye=Oe(function(){function n(){this.ΔΔhtml=""}return n.prototype.ΔDefault=function(e){switch(e){case"html":return""}return Ce},e([je,t("design:type",String)],n.prototype,"ΔΔhtml",void 0),e([ye(we),t("design:type",String)],n.prototype,"html",void 0),e([ke,t("design:type",Object)],n.prototype,"ΔΔ$targetElt",void 0),e([ye(),t("design:type",Object)],n.prototype,"$targetElt",void 0),n=e([xe],n)}(),(function(e){var t="";return{$render:function(){e.html!==t&&(e.$targetElt.innerHTML=t=e.html)}}}));(_e={},Be=["class","output"],Xe=function(){function n(){}return e([ye(we),t("design:type",String)],n.prototype,"html",void 0),n=e([be],n)}(),We="main",qe=".../innerHTML/innerHTML.ts",Ke=_e,ze=function(e,t,n){var r,i,o,a=n.html,s=(i=9,(o=(r=e).cm)?(r.nodes=new Array(i),r.cmAppends||(r.cmAppends=[],r.anchorNode&&(r.cmAppends[0]=function(e,t){var n,i;e.domNode?(n=e.domNode,i=r.anchorNode,r.rootDomNode.insertBefore(n,i)):e.domNode=r.rootDomNode}))):r.cmAppends=null,o);!function(e,t,n,r){if(t){var i={kind:"#fragment",uid:"fra"+ ++L,idx:n,parentIdx:-1,ns:"",domNode:void 0,attached:!0,nextSibling:void 0,firstChild:void 0,lastChild:void 0,contentView:null};e.nodes[n]=i;var o=e.cmAppends[r];o(i,!1),e.cmAppends[r+1]=function(e,t){o(e,!0),t||de(i,e)}}}(e,s,0,0),se(e,s,1,1,"div",1),le(e,s,0,2,2,0," Enter some HTML: ",0),se(e,s,3,1,"textarea",0),fe(e,s,0,4,3,"value",Fe,2),ue(e,s,0,4,0,0,n,"html"),me(e,s,0,4),se(e,s,5,1,"div",1,0,Be),le(e,s,0,6,2,0," Output: ",0),se(e,s,7,1,"div",0),fe(e,s,0,8,7,"unsafeInnerHTML",Ye,1,a),me(e,s,0,8),function(e,t,n){if(n)for(var r=n.length,i=0;r>i;i++)ae(e,n[i],e.cm);e.cm&&(e.cm=!1,e.cmAppends=null)}(e)},Ue=Xe,function(){return new Z(We,qe,Ke,ze,Ue)})().attach(document.body).render({html:'    <div class="blue"> \n        Hello <b> World </b> \n    </div>\n'})}();
