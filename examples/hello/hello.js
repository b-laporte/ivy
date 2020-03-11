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
    ***************************************************************************** */function e(e,t,n,i){var r,o=arguments.length,s=o<3?t:null===i?i=Object.getOwnPropertyDescriptor(t,n):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)s=Reflect.decorate(e,t,n,i);else for(var a=e.length-1;a>=0;a--)(r=e[a])&&(s=(o<3?r(s):o>3?r(t,n,s):r(t,n))||s);return o>3&&s&&Object.defineProperty(t,n,s),s}function t(e,t){if("object"==typeof Reflect&&"function"==typeof Reflect.metadata)return Reflect.metadata(e,t)}var n="ΔTrackable",i="ΔChangeVersion",r="ΔDefFactories",o="ΔΔProxy",s="ΔIsProxy",a="ΔnewItem",c="Δjson",l=!1;function f(e){return e&&e.ΔTrackable?e.ΔMd?e.ΔMd:e.ΔMd={parents:void 0,refreshCtxt:void 0,watchers:void 0}:null}var d=Array.isArray;function u(e,t){e&&(d(e)&&!e[s]?e.forEach(t):t(e))}function h(e,t){if(e&&t){if(e===t)return;if(d(e)){var n=e;if(1===n.length){if(n[0]===t)return}else{var i=n.indexOf(t);if(i>-1)return n.splice(i,1),1===n.length?n[0]:n}}}return e}function v(e,t){return e?d(e)&&!e[s]?(e.push(t),e):[e,t]:t}function p(e){return e&&!0===e[n]?e[i]:0}function m(e,t){return!(!e||"object"!=typeof e)&&"ΔΔ"+t in e}function g(e){return!(!e||!0!==e[n])}function b(e){return p(e)%2==1}function w(e,t){var n=f(e);return n&&t?(n.watchers=v(n.watchers,t),b(e)&&F.register(e),t):null}function C(e,t){var n=e?e.ΔMd:void 0;n&&t&&(n.watchers=h(n.watchers,t))}function y(e,t){var n,i;t&&function(e,t){if(g(e)){var n=e.constructor.prototype["ΔDefFactories"];for(var i in n)n.hasOwnProperty(i)&&t(i,e["ΔΔ"+i],n[i])}}(e,(function(r,o,s){var f=s===D;if(n=t[r],i="ΔΔ"+r,void 0===n)f&&(e[i]=void 0);else{var d=typeof n;if(null===n)(f||s===O)&&(e[i]=null);else if("object"===d){var u=function(e,t){if(e&&void 0!==t){if(e[a])return e[a](t);l=!0;var n=e[t];return l=!1,n}}(e,r);u?u[c]=n:f&&(e[i]=n)}else"string"===d?(f||s===x)&&(e[i]=n):"number"===d?(f||s===$)&&(e[i]=n):"boolean"===d?(f||s===P)&&(e[i]=n):f&&(e[i]=n)}}));e[c]=void 0}function N(){return""}N["ΔIsFactory"]=!0;var x=N;function j(){return 0}j["ΔIsFactory"]=!0;var $=j;function k(){return!1}k["ΔIsFactory"]=!0;var P=k;function A(){return null}A["ΔIsFactory"]=!0;var O=A;function V(){}V["ΔIsFactory"]=!0;var D=V;function I(e,t){if(t){var n=f(t);n&&(n.parents=v(n.parents,e))}}var R=0,E=function(){function e(){this.id=++R}return e.prototype.register=function(e){var t=this,n=f(e);n&&!n.refreshCtxt&&(this.objects?this.objects.push(e):(this.objects=[e],Promise.resolve().then((function(){t.refresh()}))),n.refreshCtxt=this)},e.prototype.refresh=function(e){void 0===e&&(e=!0);var t=this.objects,n=t?t.length:0;if(n){M();for(var i,r,o=[],s=0;n>s;s++)(r=(i=t[s]).ΔMd).refreshCtxt&&(i.ΔChangeVersion%2&&(i.ΔChangeVersion+=1),r.refreshCtxt&&r.watchers&&o.push({dataNode:i,watchers:r.watchers})),r.refreshCtxt=void 0;this.objects=void 0,o.length&&(e?T(o):Promise.resolve().then((function(){T(o)})))}},e}();function T(e){for(var t=function(e){u(e.watchers,(function(t){t(e.dataNode)}))},n=0,i=e;n<i.length;n++){t(i[n])}}var F=new E;function M(){F.objects&&(F=new E)}var S=0,W={log:function(e){for(var t=[],n=1;n<arguments.length;n++)t[n-1]=arguments[n];console.log.apply(console,arguments)},error:function(e){for(var t=[],n=1;n<arguments.length;n++)t[n-1]=arguments[n];console.error.apply(console,arguments)}};function H(e,t){for(var n=e,i=[];n;){if(n.template){var r=n.template;i.push('\n>> Template: "'+r.templateName+'" - File: "'+r.filePath+'"')}n=n.parentView}W.error("IVY: "+t+i.join(""))}var K=void 0,z=/^ΔΔ(\w+)Emitter$/,_="ΔIsAPI",q="ΔIsController",L=0,B=function(){function e(e,t,n,i,r){this.templateName=e,this.filePath=t,this.staticCache=n,this.renderFn=i,this.$Class=r,this._uid=++L,this.tplApi=void 0,this.tplCtl=void 0,this.forceRefresh=!1,this.activeWatch=!1,this.lastRefreshVersion=0,this.processing=!1,this.rendering=!1,this.initialized=!1,this.labels=void 0,this.hasCtlClass=!1,this.view=function(e,t,n,i){var r={kind:"#view",uid:"view"+ ++S,attached:!1,nodes:null,namespace:void 0,namespaces:void 0,doc:null,parentView:e,cm:!0,cmAppends:null,lastRefresh:0,container:null,projectionHost:null,template:i,rootDomNode:null,anchorNode:null,expressions:void 0,oExpressions:void 0,instructions:void 0,paramNode:void 0,createElement:J,isEmpty:Q};e?function(e,t,n){if(e.parentView=t,e.doc=t.doc,e.container=n,e.rootDomNode=t.rootDomNode,t.namespace){var i=t.namespace;e.namespace=i,e.namespaces=[i]}}(r,e,t):r.doc="undefined"!=typeof document?document:null;return r}(null,null,0,this);var o=this;this.watchCb=function(){o.notifyChange()},this.watchCb.$templateId=this._uid,this.$Class!==K&&(me(this.$Class,q)?this.hasCtlClass=!0:me(this.$Class,_)||g(this.$Class.prototype)||H(this.view,"Type of $ argument must be either a @Controller, an @API or a @Data class"))}return e.prototype.dispose=function(e){void 0===e&&(e=!1);var t=this.view;this.disconnectObserver(),G(t,this.tplCtl,"$dispose",this.templateName),e&&t&&t.nodes&&t.nodes.length&&ie(t,t.nodes[0])},Object.defineProperty(e.prototype,"uid",{get:function(){return this._uid},enumerable:!0,configurable:!0}),Object.defineProperty(e.prototype,"document",{get:function(){return this.view.doc},set:function(e){this.view.doc=e},enumerable:!0,configurable:!0}),Object.defineProperty(e.prototype,"api",{get:function(){if(!this.tplApi)if(this.hasCtlClass){var e=this.controller;e&&e.$api&&(this.tplApi=e.$api)}else this.$Class&&(this.tplApi=new this.$Class,Y(this.view,this.tplApi,this.staticCache));return this.tplApi},enumerable:!0,configurable:!0}),Object.defineProperty(e.prototype,"controller",{get:function(){if(!this.tplCtl&&this.hasCtlClass){var e=this.tplCtl=new this.$Class;if(m(e,"$template")&&(e.$template=this),m(e,"$logger")){var t=this.view;e.$logger={log:W.log,error:function(e){for(var n=[],i=1;i<arguments.length;i++)n[i-1]=arguments[i];H(t,e+(n.length?" "+n.join(" "):""))}}}e.$api&&Y(this.view,e.$api,this.staticCache)}return this.tplCtl},enumerable:!0,configurable:!0}),e.prototype.attach=function(e){if(this.view.rootDomNode)H(this.view,"Template host cannot be changed once set");else{var t=this.view;if(!t.doc)throw new Error("[iv] Template.document must be defined before calling Template.attach()");t.rootDomNode=e,t.anchorNode=t.doc.createComment("template anchor"),ge(t.anchorNode,e)}return this},e.prototype.registerLabel=function(e,t){this.labels||(this.labels={});var n=this.labels[e];n?n.push(t):n=this.labels[e]=[t]},e.prototype.query=function(e,t){if(void 0===t&&(t=!1),this.rendering)return null;if(e&&"#"!==e.charAt(0))return H(this.view,"[$template.query()] Invalid label argument: '"+e+"' (labels must start with #)"),null;var n=this.labels&&this.labels[e]||null;return n&&n.length?t?n:n[0]:null},e.prototype.notifyChange=function(){this.render()},e.prototype.disconnectObserver=function(){this.activeWatch&&(C(this.api,this.watchCb),C(this.controller,this.watchCb),this.activeWatch=!1)},e.prototype.render=function(e){if(this.processing)return this;this.processing=!0;var t=this.api,n=this.controller,i=this.view;if(n&&!g(n)&&(H(i,"Template controller must be a @Controller Object - please check: "+this.$Class.name),this.tplCtl=this.$Class=void 0),t&&e)for(var r in b(t)||M(),this.disconnectObserver(),e)e.hasOwnProperty(r)&&(t[r]=e[r]);var o=!this.forceRefresh,s=i.nodes;if(s&&s[0]&&s[0].attached||(o=!1),o&&p(t)+p(n)>this.lastRefreshVersion&&(o=!1),!o){n&&(this.initialized||(G(i,n,"$init","controller"),this.initialized=!0),G(i,n,"$beforeRender","controller")),this.rendering=!0,this.labels=void 0,i.lastRefresh++,i.instructions=void 0;try{this.renderFn(i,this.hasCtlClass?n:t,t,this)}catch(e){H(i,"Template execution error\n"+(e.message||e))}this.rendering=!1,n&&G(i,n,"$afterRender","controller"),function(e,t){if(void 0===t&&(t=!1),e){var n=e.ΔMd;n&&n.refreshCtxt?n.refreshCtxt.refresh(!0):t&&M()}}(t),this.forceRefresh=!1,this.lastRefreshVersion=p(t)+p(n)}return this.activeWatch||(w(t,this.watchCb),n&&w(n,this.watchCb),this.activeWatch=!0),this.processing=!1,this},e}();function Y(e,t,n){var i=n.events;if(void 0===i){var r=void 0;for(var o in t)if(o.match(z)){var s=RegExp.$1;r||(r=[]),"function"!=typeof t[s+"Emitter"].init?H(e,"Invalid EventEmitter: "+s+"Emitter"):(r.push(s+"Emitter"),r.push(s),t[s+"Emitter"].init(s,t))}n.events=r||null}else if(null!==i)for(var a=i.length,c=0;a>c;c+=2)t[i[c]].init(i[c+1],t)}function G(e,t,n,i){if(t&&"function"==typeof t[n])try{t[n]()}catch(t){H(e,i+" "+n+" hook execution error\n"+(t.message||t))}}function J(e,t){return(t=t||this.namespace)?this.doc.createElementNS(t,e):this.doc.createElement(e)}function Q(){return function(e){if(e!==K&&null!==e){var t=!0;return function e(t,n,i){if(t!==K&&null!==t){if(!i(t))return!1;if(null!==t.nodes&&t.nodes.length)for(var r=0,o=t.nodes;r<o.length;r++){if(!s(o[r]))return!1}}return!0;function s(t){var r=t.kind;if("#fragment"===r)return!!i(t)&&e(t.contentView,n,i);if("#container"!==r)return i(t);if(!i(t))return!1;var o=t,s=o.subKind;if("##block"===s){var a=o.views;if(null!==a)for(var c=0,l=a;c<l.length;c++){var f=l[c];if(!e(f,n,i))return!1}if(n&&o.viewPool)for(var d=0,u=o.viewPool;d<u.length;d++){var h=u[d];if(!e(h,n,i))return!1}}else if("##cpt"===s){var v=o.template;if(null!==v)return e(v.view,n,i)}else"##async"===s&&console.log("TODO: support scanNode for @async block");return!0}}(e,!1,(function(e){if(!t)return!1;var n=e.kind;if("#view"===n){var i=e;if(i.cm){var r=i.doc.createDocumentFragment();i.domNode=r,i.cmAppends=[function(e){e.domNode?ge(e.domNode,r):e.domNode=r}]}!function(e){if(e.instructions){var t=e.instructions.slice(0),n=t.length;if(e.instructions.splice(0,n),e.instructions=void 0,n)for(var i=0;n>i;i+=2)t[i].apply(null,t[i+1])}}(i)}else if("#element"===n||"#text"===n)return t=!1;return!0})),t}return!0}(this)}function U(e,t,n){if(n){var i=function(e){var t=e;for(;t&&!t.template;)t=t.parentView;return t}(e);if(i!==K&&null!==i)for(var r=i.template,o=n.length,s=0;o>s;s++)r.registerLabel(n[s],t)}}var X=[];function Z(e,t,n){var i=e.nodes[t];if(i&&"##block"===i.subKind){var r=i,o=r.lastRefresh;if(n||o===e.lastRefresh){var s=r.views.length;if(!n){if(s!==r.previousNbrOfViews)for(var a=r.viewPool,c=a.length,l=void 0,f=0;c>f;f++)ie(l=a[f],l.nodes[0]),l.attached=!1;r.previousNbrOfViews=s}}else ie(e,r)}}function ee(e,t,n,i,r,o,s,a,c){if(t){var l=e.createElement(r);if(a)for(var f=a.length,d=0;f>d;d+=2)l.setAttribute(a[d],a[d+1]);if(c){f=c.length;for(var u=0;f>u;u+=2)l[c[u]]=c[u+1]}var h={kind:"#element",uid:"elt"+ ++S,idx:n,parentIdx:-1,ns:"",domNode:l,attached:!0,nextSibling:void 0,firstChild:void 0,lastChild:void 0,contentView:null};e.nodes[n]=h,U(e,l,s),e.cmAppends[i](h,!1),o&&(e.cmAppends[i+1]=function(e,t){e.domNode?ge(e.domNode,l):e.domNode=l,t||function(e,t){e.firstChild?(e.lastChild.nextSibling=t,e.lastChild=t):(e.firstChild=e.lastChild=t,t.nextSibling=void 0);t.parentIdx=e.idx}(h,e)})}else s&&U(e,e.nodes[n].domNode,s)}function te(e,t,n){if(e.expressions){var i=e.expressions;if(i.length>t&&i[t]===n)return X;i[t]=n}else e.expressions=[],e.expressions[t]=n;return n}function ne(e,t,n){if(t){if(n[2]){var i=e.oExpressions;return i[2*n[0]]?X:(i[2*n[0]]=1,n[1])}return te(e,n[0],n[1])}return n}function ie(e,t){if(t&&t.attached)if("#text"===t.kind||"#element"===t.kind){var n=function e(t,n){if(0===n.idx&&t.projectionHost){if(!n.attached)return null;var i=t.projectionHost.hostNode;return"#element"===i.kind?i.domNode:e(t.projectionHost.view,i)}return 0===n.idx?t.parentView?e(t.parentView,t.container):t.rootDomNode:t.nodes[n.parentIdx].domNode}(e,t);t.attached=!1,n?n.removeChild(t.domNode):H(e,"Internal error - parent not found for: "+t.uid)}else if("#container"===t.kind){if("##block"===t.subKind){for(var i=t,r=i.views,o=r.length,s=void 0,a=0;o>a;a++)s=r[a].nodes[0],ie(r[a],s),r[a].attached=s.attached=!1,"#container"!==s.kind&&"#fragment"!==s.kind||(s.domNode=void 0);i.views=[],i.previousNbrOfViews=0,i.viewPool=r.concat(i.viewPool)}else if("##cpt"===t.subKind){var c=t.template;s=c.view.nodes[0];ie(c.view,s),c.view.attached=s.attached=!1,"#container"!==s.kind&&"#fragment"!==s.kind||(s.domNode=void 0)}}else if("#fragment"===t.kind){var l=t;if(l.attached=!1,l.contentView)ie(l.contentView,l.contentView.nodes[0]);else if(l.firstChild)for(var f=l.firstChild;f;)ie(e,f),f=f.nextSibling;l.domNode=void 0}else"#param"===t.kind?console.warn("TODO removeFromDom for param nodes"):console.warn("RemoveFromDom for "+t.kind)}var re,oe,se,ae,ce,le,fe,de,ue,he=function(e){var t=e.prototype;t[n]=!0,t[i]=0},ve=function(e,t){return e||(e=A,t=3),function(n,i){var s="ΔΔ"+i,a=n[r];a||(a=n[r]={}),a[i]=t?1===t?A:V:e,n[s]=void 0,function(e,t,n,i){i&&delete e[t]&&Object.defineProperty(e,t,i)}(n,i,0,{get:function(){return function(e,t,n,i,r){e.ΔComputeDependencies&&(e.ΔComputeDependencies[n]=!0);!l&&e[c]&&y(e,e[c]);var o=e[t];(void 0===o||l&&null===o)&&(o=e[t]=!l&&r?r>1?void 0:null:i(),I(e,o));return o}(this,s,i,e,t)},set:function(t){!function(e,t,n,i,r,s){var a=g(i),c=r===D;if(e.ΔComputeDependencies)return void console.error("[Trax] @computed properties must not mutate the Data object when calculated");i&&!a&&r.ΔCreateProxy&&(i=r.ΔCreateProxy(i)||i,a=g(i));var l=!1,f=s[n];b(e)?l=f!==i:f!==i&&(!function e(t){if(!g(t))return;var n=!0;b(t)?n=!1:t.ΔChangeVersion+=1;if(F.register(t),n){var i=t.ΔMd;i&&i.parents&&u(i.parents,(function(t){e(t)}))}}(e),l=!0);l&&(a&&void 0===i&&(i=null),(a||f&&g(f))&&function(e,t,n,i){(function(e,t){if(t){var n=t.ΔMd;n&&n.parents&&(n.parents=h(n.parents,e))}})(e,t),i||I(e,n)}(e,f,i,c),s[n]=i,function(e,t,n,i,r){var s=e?e.ΔMd:void 0;if(s&&s.trackers){var a=e[o]||e;u(s.trackers,(function(e){e(a,t,n,i,r)}))}}(e,"set",t,f,i))}(this,i,s,t,e,this)},enumerable:!0,configurable:!0})}},pe=x;function me(e,t){return!0===e.prototype[t]}function ge(e,t,n){t.appendChild(e)}(le={},fe=["class","hello"],de=[" Hello ","","! "],ue=function(){function n(){}return e([ve(pe),t("design:type",String)],n.prototype,"name",void 0),n=e([he],n)}(),re="hello",oe="hello/hello.ts",se=le,ae=function(e,t,n){var i,r,o,s=n.name,a=(r=2,(o=(i=e).cm)?(i.nodes=new Array(r),i.cmAppends||(i.cmAppends=[],i.anchorNode&&(i.cmAppends[0]=function(e,t){var n,r;e.domNode?(n=e.domNode,r=i.anchorNode,i.rootDomNode.insertBefore(n,r)):e.domNode=i.rootDomNode}))):i.cmAppends=null,o);ee(e,a,0,0,"div",1,0,fe),function(e,t,n,i,r,o,s,a){for(var c,l=[],f=8;f<arguments.length;f++)l[f-8]=arguments[f];if(a){var d=void 0,u=void 0,h=!1;d=t?s.slice(0):(c=e.nodes[i]).pieces;for(var v=0;a>v;v++)(u=ne(e,n,l[v]))!==X&&(h=!0,d[1+2*v]=null==u?"":u);if(!t)return h&&(c.domNode.textContent=d.join("")),void U(e,c.domNode,o);c=p(e.doc.createTextNode(d.join("")),d),U(e,c.domNode,o)}else{if(!t)return void(o&&U(e,e.nodes[i].domNode,o));c=p(e.doc.createTextNode(s),void 0),U(e,c.domNode,o)}function p(e,t){return{kind:"#text",uid:"txt"+ ++S,domNode:e,attached:!0,idx:i,parentIdx:-1,pieces:t,nextSibling:void 0}}e.nodes[i]=c,e.cmAppends[r](c,!1)}(e,a,0,1,1,0,de,1,te(e,0,s)),function(e,t,n){if(n)for(var i=n.length,r=0;i>r;r++)Z(e,n[r],e.cm);e.cm&&(e.cm=!1,e.cmAppends=null)}(e)},ce=ue,function(){return new B(re,oe,se,ae,ce)})().attach(document.body).render({name:"World"})}();
