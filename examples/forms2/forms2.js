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
    ***************************************************************************** */function e(e,t,n,i){var o,r=arguments.length,a=r<3?t:null===i?i=Object.getOwnPropertyDescriptor(t,n):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(e,t,n,i);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(r<3?o(a):r>3?o(t,n,a):o(t,n))||a);return r>3&&a&&Object.defineProperty(t,n,a),a}function t(e,t){if("object"==typeof Reflect&&"function"==typeof Reflect.metadata)return Reflect.metadata(e,t)}var n="ΔTrackable",i="ΔChangeVersion",o="ΔFactory",r="ΔDefFactories",a="ΔIsFactory",s="ΔΔProxy",d="ΔIsProxy",l="ΔDefault",c="ΔnewItem",u="Δjson",f=!1;function v(e){return e&&e.ΔTrackable?e.ΔMd?e.ΔMd:e.ΔMd={parents:void 0,refreshCtxt:void 0,watchers:void 0}:null}var p=Array.isArray;function h(e,t){e&&(p(e)&&!e[d]?e.forEach(t):t(e))}function m(e,t){if(e&&t){if(e===t)return;if(p(e)){var n=e;if(1===n.length){if(n[0]===t)return}else{var i=n.indexOf(t);if(i>-1)return n.splice(i,1),1===n.length?n[0]:n}}}return e}function g(e,t){return e?p(e)&&!e[d]?(e.push(t),e):[e,t]:t}function b(e){return e&&!0===e[n]?e[i]:0}function w(e,t){return!(!e||"object"!=typeof e)&&"ΔΔ"+t in e}function y(e){return!(!e||!0!==e[n])}function N(e){return b(e)%2==1}function x(e,t){var n=v(e);return n&&t?(n.watchers=g(n.watchers,t),N(e)&&L.register(e),t):null}function C(e,t){var n=e?e.ΔMd:void 0;n&&t&&(n.watchers=m(n.watchers,t))}function I(e,t){if(e&&t){var n=e[l];if(n){var i=n(t);if(i!==P)return e[t]=i}var o=e[r],a=o?o[t]:null;if(a)return e[t]=a()}}function k(e,t){var n,i;t&&function(e,t){if(y(e)){var n=e.constructor.prototype["ΔDefFactories"];for(var i in n)n.hasOwnProperty(i)&&t(i,e["ΔΔ"+i],n[i])}}(e,(function(o,r,a){var s=a===H;if(n=t[o],i="ΔΔ"+o,void 0===n)s&&(e[i]=void 0);else{var d=typeof n;if(null===n)(s||a===T)&&(e[i]=null);else if("object"===d){var l=function(e,t){if(e&&void 0!==t){if(e[c])return e[c](t);f=!0;var n=e[t];return f=!1,n}}(e,o);l?l[u]=n:s&&(e[i]=n)}else"string"===d?(s||a===A)&&(e[i]=n):"number"===d?(s||a===R)&&(e[i]=n):"boolean"===d?(s||a===j)&&(e[i]=n):s&&(e[i]=n)}}));e[u]=void 0}function D(e){var t=e.prototype;t[n]=!0,t[i]=0}function O(e,t){return e||(e=S,t=3),function(n,i){var o="ΔΔ"+i,a=n[r];a||(a=n[r]={}),a[i]=t?1===t?S:F:e,n[o]=void 0,function(e,t,n,i){i&&delete e[t]&&Object.defineProperty(e,t,i)}(n,i,0,{get:function(){return function(e,t,n,i,o){e.ΔComputeDependencies&&(e.ΔComputeDependencies[n]=!0);!f&&e[u]&&k(e,e[u]);var r=e[t];(void 0===r||f&&null===r)&&(r=e[t]=!f&&o?o>1?void 0:null:i(),K(e,r));return r}(this,o,i,e,t)},set:function(t){!function(e,t,n,i,o,r){var a=y(i),d=o===H;if(e.ΔComputeDependencies)return void console.error("[Trax] @computed properties must not mutate the Data object when calculated");i&&!a&&o.ΔCreateProxy&&(i=o.ΔCreateProxy(i)||i,a=y(i));var l=!1,c=r[n];N(e)?l=c!==i:c!==i&&(!function e(t){if(!y(t))return;var n=!0;N(t)?n=!1:t.ΔChangeVersion+=1;if(L.register(t),n){var i=t.ΔMd;i&&i.parents&&h(i.parents,(function(t){e(t)}))}}(e),l=!0);l&&(a&&void 0===i&&(i=null),(a||c&&y(c))&&function(e,t,n,i){(function(e,t){if(t){var n=t.ΔMd;n&&n.parents&&(n.parents=m(n.parents,e))}})(e,t),i||K(e,n)}(e,c,i,d),r[n]=i,function(e,t,n,i,o){var r=e?e.ΔMd:void 0;if(r&&r.trackers){var a=e[s]||e;h(r.trackers,(function(e){e(a,t,n,i,o)}))}}(e,"set",t,c,i))}(this,i,o,t,e,this)},enumerable:!0,configurable:!0})}}var P={};function $(){return""}$[a]=!0;var A=$;function E(){return 0}E[a]=!0;var R=E;function V(){return!1}V[a]=!0;var j=V;function S(){return null}S[a]=!0;var T=S;function F(){}F[a]=!0;var H=F;function K(e,t){if(t){var n=v(t);n&&(n.parents=g(n.parents,e))}}var M=0,X=function(){function e(){this.id=++M}return e.prototype.register=function(e){var t=this,n=v(e);n&&!n.refreshCtxt&&(this.objects?this.objects.push(e):(this.objects=[e],Promise.resolve().then((function(){t.refresh()}))),n.refreshCtxt=this)},e.prototype.refresh=function(e){void 0===e&&(e=!0);var t=this.objects,n=t?t.length:0;if(n){W();for(var i,o,r=[],a=0;n>a;a++)(o=(i=t[a]).ΔMd).refreshCtxt&&(i.ΔChangeVersion%2&&(i.ΔChangeVersion+=1),o.refreshCtxt&&o.watchers&&r.push({dataNode:i,watchers:o.watchers})),o.refreshCtxt=void 0;this.objects=void 0,r.length&&(e?B(r):Promise.resolve().then((function(){B(r)})))}},e}();function B(e){for(var t=function(e){h(e.watchers,(function(t){t(e.dataNode)}))},n=0,i=e;n<i.length;n++){t(i[n])}}var L=new X;function W(){L.objects&&(L=new X)}var Y=0,q={log:function(e){for(var t=[],n=1;n<arguments.length;n++)t[n-1]=arguments[n];console.log.apply(console,arguments)},error:function(e){for(var t=[],n=1;n<arguments.length;n++)t[n-1]=arguments[n];console.error.apply(console,arguments)}};function z(e,t){for(var n=e,i=[];n;){if(n.template){var o=n.template;i.push('\n>> Template: "'+o.templateName+'" - File: "'+o.filePath+'"')}n=n.parentView}q.error("IVY: "+t+i.join(""))}var U=void 0,_=11,G=/^ΔΔ(\w+)Emitter$/,J=/^ΔΔ/,Q=/^ΔΔ(.+)$/,Z=/([^ ]+)\s([^ ]+)/,ee="ΔIsAPI",te="ΔIsController",ne="ΔDefaultParam",ie="ΔIoParams",oe="ΔRequiredProps",re={$targetApi:"$1 cannot be used on DOM nodes",$targetElt:"$1 cannot be used on components that don't define #main elements"},ae=0,se=function(){function e(e,t,n,i,o){this.templateName=e,this.filePath=t,this.staticCache=n,this.renderFn=i,this.$Class=o,this._uid=++ae,this.tplApi=void 0,this.tplCtl=void 0,this.forceRefresh=!1,this.activeWatch=!1,this.lastRefreshVersion=0,this.processing=!1,this.rendering=!1,this.initialized=!1,this.labels=void 0,this.hasCtlClass=!1,this.view=fe(null,null,1,this);var r=this;this.watchCb=function(){r.notifyChange()},this.watchCb.$templateId=this._uid,this.$Class!==U&&(Ze(this.$Class,te)?this.hasCtlClass=!0:Ze(this.$Class,ee)||y(this.$Class.prototype)||z(this.view,"Type of $ argument must be either a @Controller, an @API or a @Data class"))}return e.prototype.dispose=function(e){void 0===e&&(e=!1);var t=this.view;this.disconnectObserver(),le(t,this.tplCtl,"$dispose",this.templateName),e&&t&&t.nodes&&t.nodes.length&&Le(t,t.nodes[0])},Object.defineProperty(e.prototype,"uid",{get:function(){return this._uid},enumerable:!0,configurable:!0}),Object.defineProperty(e.prototype,"document",{get:function(){return this.view.doc},set:function(e){this.view.doc=e},enumerable:!0,configurable:!0}),Object.defineProperty(e.prototype,"api",{get:function(){if(!this.tplApi)if(this.hasCtlClass){var e=this.controller;e&&e.$api&&(this.tplApi=e.$api)}else this.$Class&&(this.tplApi=new this.$Class,de(this.view,this.tplApi,this.staticCache));return this.tplApi},enumerable:!0,configurable:!0}),Object.defineProperty(e.prototype,"controller",{get:function(){if(!this.tplCtl&&this.hasCtlClass){var e=this.tplCtl=new this.$Class;if(w(e,"$template")&&(e.$template=this),w(e,"$logger")){var t=this.view;e.$logger={log:q.log,error:function(e){for(var n=[],i=1;i<arguments.length;i++)n[i-1]=arguments[i];z(t,e+(n.length?" "+n.join(" "):""))}}}e.$api&&de(this.view,e.$api,this.staticCache)}return this.tplCtl},enumerable:!0,configurable:!0}),e.prototype.attach=function(e){if(this.view.rootDomNode)z(this.view,"Template host cannot be changed once set");else{var t=this.view;if(!t.doc)throw new Error("[iv] Template.document must be defined before calling Template.attach()");t.rootDomNode=e,t.anchorNode=t.doc.createComment("template anchor"),ot(t.anchorNode,e)}return this},e.prototype.registerLabel=function(e,t){this.labels||(this.labels={});var n=this.labels[e];n?n.push(t):n=this.labels[e]=[t]},e.prototype.query=function(e,t){if(void 0===t&&(t=!1),this.rendering)return null;if(e&&"#"!==e.charAt(0))return z(this.view,"[$template.query()] Invalid label argument: '"+e+"' (labels must start with #)"),null;var n=this.labels&&this.labels[e]||null;return n&&n.length?t?n:n[0]:null},e.prototype.notifyChange=function(){this.render()},e.prototype.disconnectObserver=function(){this.activeWatch&&(C(this.api,this.watchCb),C(this.controller,this.watchCb),this.activeWatch=!1)},e.prototype.render=function(e){if(this.processing)return this;this.processing=!0;var t=this.api,n=this.controller,i=this.view;if(n&&!y(n)&&(z(i,"Template controller must be a @Controller Object - please check: "+this.$Class.name),this.tplCtl=this.$Class=void 0),t&&e)for(var o in N(t)||W(),this.disconnectObserver(),e)e.hasOwnProperty(o)&&(t[o]=e[o]);var r=!this.forceRefresh,a=i.nodes;if(a&&a[0]&&a[0].attached||(r=!1),r&&b(t)+b(n)>this.lastRefreshVersion&&(r=!1),!r){n&&(this.initialized||(le(i,n,"$init","controller"),this.initialized=!0),le(i,n,"$beforeRender","controller")),this.rendering=!0,this.labels=void 0,i.lastRefresh++,i.instructions=void 0;try{this.renderFn(i,this.hasCtlClass?n:t,t,this)}catch(e){z(i,"Template execution error\n"+(e.message||e))}this.rendering=!1,n&&le(i,n,"$afterRender","controller"),function(e,t){if(void 0===t&&(t=!1),e){var n=e.ΔMd;n&&n.refreshCtxt?n.refreshCtxt.refresh(!0):t&&W()}}(t),this.forceRefresh=!1,this.lastRefreshVersion=b(t)+b(n)}return this.activeWatch||(x(t,this.watchCb),n&&x(n,this.watchCb),this.activeWatch=!0),this.processing=!1,this},e}();function de(e,t,n){var i=n.events;if(void 0===i){var o=void 0;for(var r in t)if(r.match(G)){var a=RegExp.$1;o||(o=[]),"function"!=typeof t[a+"Emitter"].init?z(e,"Invalid EventEmitter: "+a+"Emitter"):(o.push(a+"Emitter"),o.push(a),t[a+"Emitter"].init(a,t))}n.events=o||null}else if(null!==i)for(var s=i.length,d=0;s>d;d+=2)t[i[d]].init(i[d+1],t)}function le(e,t,n,i){if(t&&"function"==typeof t[n])try{t[n]()}catch(t){z(e,i+" "+n+" hook execution error\n"+(t.message||t))}}function ce(e,t){return(t=t||this.namespace)?this.doc.createElementNS(t,e):this.doc.createElement(e)}function ue(){return function(e){if(e!==U&&null!==e){var t=!0;return function e(t,n,i){if(t!==U&&null!==t){if(!i(t))return!1;if(null!==t.nodes&&t.nodes.length)for(var o=0,r=t.nodes;o<r.length;o++){if(!a(r[o]))return!1}}return!0;function a(t){var o=t.kind;if("#fragment"===o)return!!i(t)&&e(t.contentView,n,i);if("#container"!==o)return i(t);if(!i(t))return!1;var r=t,a=r.subKind;if("##block"===a){var s=r.views;if(null!==s)for(var d=0,l=s;d<l.length;d++){var c=l[d];if(!e(c,n,i))return!1}if(n&&r.viewPool)for(var u=0,f=r.viewPool;u<f.length;u++){var v=f[u];if(!e(v,n,i))return!1}}else if("##cpt"===a){var p=r.template;if(null!==p)return e(p.view,n,i)}else"##async"===a&&console.log("TODO: support scanNode for @async block");return!0}}(e,!1,(function(e){if(!t)return!1;var n=e.kind;if("#view"===n){var i=e;if(i.cm){var o=i.doc.createDocumentFragment();i.domNode=o,i.cmAppends=[function(e){e.domNode?ot(e.domNode,o):e.domNode=o}]}!function(e){if(e.instructions){var t=e.instructions.slice(0),n=t.length;if(e.instructions.splice(0,n),e.instructions=void 0,n)for(var i=0;n>i;i+=2)t[i].apply(null,t[i+1])}}(i)}else if("#element"===n||"#text"===n)return t=!1;return!0})),t}return!0}(this)}function fe(e,t,n,i){var o={kind:"#view",uid:"view"+ ++Y,attached:!1,nodes:null,namespace:void 0,namespaces:void 0,doc:null,parentView:e,cm:!0,cmAppends:null,lastRefresh:0,container:null,projectionHost:null,template:i,rootDomNode:null,anchorNode:null,expressions:void 0,oExpressions:void 0,instructions:void 0,paramNode:void 0,createElement:ce,isEmpty:ue};return e?pe(o,e,t):o.doc="undefined"!=typeof document?document:null,o}function ve(e,t,n){if(n){var i=function(e){var t=e;for(;t&&!t.template;)t=t.parentView;return t}(e);if(i!==U&&null!==i)for(var o=i.template,r=n.length,a=0;r>a;a++)o.registerLabel(n[a],t)}}function pe(e,t,n){if(e.parentView=t,e.doc=t.doc,e.container=n,e.rootDomNode=t.rootDomNode,t.namespace){var i=t.namespace;e.namespace=i,e.namespaces=[i]}}function he(e,t,n,i,o){return function(){return new se(e,t,n,i,o)}}var me=[];function ge(e,t,n){var i=e.cm;return i?(e.nodes=new Array(n),e.cmAppends||(e.cmAppends=[],e.anchorNode&&(e.cmAppends[0]=function(t,n){t.domNode?rt(t.domNode,e.anchorNode,e.rootDomNode):t.domNode=e.rootDomNode}))):e.cmAppends=null,i}function be(e,t,n,i,o){var r,a=e.nodes[n];if(a&&a.attached||z(e,"Invalid ζview call: container must be attached ("+(a?a.uid:"XX")+") - pview: "+e.uid+" containerIdx: "+n),"#container"===a.kind)if("##block"===a.subKind){var s=(d=a).views;1===o&&(d.insertFn=null),1===o&&d.views.length>1?(d.previousNbrOfViews=s.length,r=s.shift(),d.viewPool.length?d.viewPool=s.concat(d.viewPool):d.viewPool=s,d.views=[r]):(r=d.views[o-1])||(d.viewPool.length>0?(d.insertFn||(d.insertFn=we(e,d)),Ne((r=s[o-1]=d.viewPool.shift()).nodes[0],d.insertFn),r.attached=!0):((r=s[o-1]=fe(e,d)).nodes=new Array(i),e.cm&&d.cmAppend?r.cmAppends=[d.cmAppend]:e.cm||(r.cmAppends=[we(e,d)]))),d.lastRefresh=r.lastRefresh=e.lastRefresh}else{var d;(r=(d=a).contentView)||((r=d.contentView=fe(e,d)).nodes=new Array(i)),r.lastRefresh=e.lastRefresh}else if("#param"===a.kind){var l=a;(r=l.contentView)||(r=l.contentView=fe(e,null),l.viewPool&&(l.viewPool[l.viewInstanceIdx]=r),r.nodes=new Array(i),r.paramNode=l),r.lastRefresh=e.lastRefresh}return r}function we(e,t){var n=function e(t,n){for(;;){if(n||z(t,"Internal error - findNextSiblingDomNd: nd cannot be undefined"),0===n.idx){if(!n.attached)return{position:"defer",parentDomNd:void 0};if(n.domNode.nodeType===_)return{position:"lastChild",parentDomNd:n.domNode};var i=t.parentView;if(i){if(t.projectionHost){var o=t.projectionHost.hostNode;return"#element"===o.kind?{position:"lastChild",parentDomNd:o.domNode}:e(t.projectionHost.view,o)}if(t.container&&"##block"===t.container.subKind){var r=t.container,a=r.views.indexOf(t);if(a>-1)for(var s=void 0,d=void 0,l=a+1;l<r.views.length;l++)if((s=r.views[l]).nodes&&s.nodes.length&&(d=m(s,s.nodes[0],r.domNode)))return d;for(var c=r.viewPool,u=void 0,f=0,v=c;f<v.length;f++){if((s=v[f]).nodes&&s.nodes.length&&s.attached&&(u=m(s,s.nodes[0],r.domNode)))return u}}return e(i,t.container)}return{position:"lastOnRoot",parentDomNd:t.rootDomNode,nextDomNd:t.anchorNode}}if(!n.nextSibling){var p=t.nodes[n.parentIdx];return"#element"===p.kind?{position:"lastChild",parentDomNd:Be(t,n)}:e(t,p)}var h=m(t,n.nextSibling,Be(t,n));if(h)return h;n=n.nextSibling}function m(e,t,n){if(!t)return null;if("#element"===t.kind||"#text"===t.kind)return{position:"beforeChild",nextDomNd:t.domNode,parentDomNd:n};if("#fragment"===t.kind){for(var i=void 0,o=t.firstChild;o;){if(i=m(e,o,n))return i;o=o.nextSibling}if(t.contentView){var r=t.contentView;if(r.nodes)return m(r,r.nodes[0],n)}return null}if("#container"===t.kind){var a=t;i=null;if("##block"===a.subKind)for(var s=a.views,d=s.length,l=0;d>l&&!(i=m(s[l],s[l].nodes[0],n));l++);else if("##cpt"===a.subKind){var c=a.template.view;i=m(c,c.nodes[0],n)}return i||null}throw new Error("TODO findFirstDomNd: "+t.kind)}}(e,t),i=n.position,o=n.nextDomNd,r=n.parentDomNd;return"beforeChild"===i||"lastOnRoot"===i?function(e,t){e.domNode?rt(e.domNode,o,r):e.domNode=r}:"lastChild"===i?function(e,t){e.domNode?ot(e.domNode,r):e.domNode=r}:function(){console.warn("TODO: VALIDATE VIEW APPEND: ",i),function(e,t,n){void 0===t&&(t="");n&&e.uid!==n||(console.log(""),console.log(at),t&&console.log(t+":"),function e(t,n){void 0===n&&(n="");if(!t.nodes)return void console.log(""+n+t.uid+" - no nodes");var i=t.parentView?t.parentView.uid:"XX",o=t.projectionHost,r=o?" >>> projection host: "+o.hostNode.uid+" in "+o.view.uid:"";console.log(n+"*"+t.uid+"* cm:"+t.cm+" isTemplate:"+(void 0!==t.template)+" parentView:"+i+r);for(var a,s=t.nodes.length,d="",l=0;s>l;l++)if(a=t.nodes[l])if(d=a.uid.length<5?["     ","    ","   ","  "," "][a.uid.length]:"","#container"===a.kind){var c=a,u=c.domNode?c.domNode.uid:"XX";if(console.log(n+"["+l+"] "+a.uid+d+" "+u+" attached:"+(a.attached?1:0)+" parent:"+C(a.parentIdx)+" nextSibling:"+(a.nextSibling?a.nextSibling.uid:"X")),"##block"===c.subKind){var f=c,v=f.views.length;if(v)for(var p=0;v>p;p++)if(f.views[p]){var h=f.views[p];u=h.rootDomNode?h.rootDomNode.$uid:"XX",console.log(n+"  - view #"+p),e(f.views[p],"    "+n)}else console.log(n+"  - view #"+p+" UNDEFINED");else console.log(n+"  - no child views")}else if("##cpt"===c.subKind){var m=c,g=m.template,b=m.contentView;b?(console.log(n+"  - light DOM:"),e(b,"    "+n)):console.log(n+"  - light DOM: none"),g?(console.log(n+"  - shadow DOM:"),e(g.view,"    "+n)):console.log(n+"  - no template")}else console.log(n+"  - "+c.subKind+" container")}else{u=a.domNode?a.domNode.uid:"XX";var w="";if(a.domNode&&"#text"===a.kind)w=" text=#"+a.domNode._textContent+"#";else if("#fragment"===a.kind||"#element"===a.kind){for(var y=[],N=a.firstChild;N;)y.push(N.uid),N=N.nextSibling;w=" children:["+y.join(", ")+"]";var x=a.contentView;x&&(w+=" >>> content view: "+x.uid)}console.log(n+"["+a.idx+"] "+a.uid+d+" "+u+" attached:"+(a.attached?1:0)+" parent:"+C(a.parentIdx)+" nextSibling:"+(a.nextSibling?a.nextSibling.uid:"X")+w)}else console.log(n+"["+l+"] XX");function C(e){return e<0?"X":e}}(e))}(e,"getViewInsertFunction for "+t.uid)}}function ye(e,t,n){var i=e.nodes[t];if(i&&"##block"===i.subKind){var o=i,r=o.lastRefresh;if(n||r===e.lastRefresh){var a=o.views.length;if(!n){if(a!==o.previousNbrOfViews)for(var s=o.viewPool,d=s.length,l=void 0,c=0;d>c;c++)Le(l=s[c],l.nodes[0]),l.attached=!1;o.previousNbrOfViews=a}}else Le(e,o)}}function Ne(e,t,n){if(!e.attached){if(t(e,!0),e.attached=!0,"#fragment"===e.kind)for(var i=e.firstChild;i;)Ne(i,t),i=i.nextSibling;else if("#container"===e.kind){var o=e.subKind;if("##cpt"===o){var r=e.template,a=r?r.view.nodes[0]:null;r&&(r.forceRefresh=!0),a&&(Ne(a,t),r.view.attached=!0)}else if("##block"===o)for(var s=e.views,d=0;s.length>d;d++)Ne(s[d].nodes[0],t),s[d].attached=!0}if("#fragment"===e.kind||"#element"===e.kind){var l=e.contentView;l&&(Ne(l.nodes[0],t),l.attached=!0)}}}function xe(e,t,n){if(n)for(var i=n.length,o=0;i>o;o++)ye(e,n[o],e.cm);e.cm&&(e.cm=!1,e.cmAppends=null)}function Ce(e,t,n,i,o,r,a,s,d){if(t){var l=e.createElement(o);if(s)for(var c=s.length,u=0;c>u;u+=2)l.setAttribute(s[u],s[u+1]);if(d){c=d.length;for(var f=0;c>f;f+=2)l[d[f]]=d[f+1]}var v={kind:"#element",uid:"elt"+ ++Y,idx:n,parentIdx:-1,ns:"",domNode:l,attached:!0,nextSibling:void 0,firstChild:void 0,lastChild:void 0,contentView:null};e.nodes[n]=v,ve(e,l,a),e.cmAppends[i](v,!1),r&&(e.cmAppends[i+1]=function(e,t){e.domNode?ot(e.domNode,l):e.domNode=l,t||Ie(v,e)})}else a&&ve(e,e.nodes[n].domNode,a)}function Ie(e,t){e.firstChild?(e.lastChild.nextSibling=t,e.lastChild=t):(e.firstChild=e.lastChild=t,t.nextSibling=void 0),t.parentIdx=e.idx}function ke(e,t,n,i,o,r,a,s){for(var d,l=[],c=8;c<arguments.length;c++)l[c-8]=arguments[c];if(s){var u=void 0,f=void 0,v=!1;u=t?a.slice(0):(d=e.nodes[i]).pieces;for(var p=0;s>p;p++)(f=Oe(e,n,l[p]))!==me&&(v=!0,u[1+2*p]=null==f?"":f);if(!t)return v&&(d.domNode.textContent=u.join("")),void ve(e,d.domNode,r);d=h(e.doc.createTextNode(u.join("")),u),ve(e,d.domNode,r)}else{if(!t)return void(r&&ve(e,e.nodes[i].domNode,r));d=h(e.doc.createTextNode(a),void 0),ve(e,d.domNode,r)}function h(e,t){return{kind:"#text",uid:"txt"+ ++Y,domNode:e,attached:!0,idx:i,parentIdx:-1,pieces:t,nextSibling:void 0}}e.nodes[i]=d,e.cmAppends[o](d,!1)}function De(e,t,n){if(e.expressions){var i=e.expressions;if(i.length>t&&i[t]===n)return me;i[t]=n}else e.expressions=[],e.expressions[t]=n;return n}function Oe(e,t,n){if(t){if(n[2]){var i=e.oExpressions;return i[2*n[0]]?me:(i[2*n[0]]=1,n[1])}return De(e,n[0],n[1])}return n}function Pe(e,t,n,i){var o=e.oExpressions;if(o||(o=e.oExpressions=[]),i){if(o[2*t])return o[1+2*t];var r=[t,n,1];return o[2*t]=0,o[1+2*t]=r,r}return o[2*t]?me:(o[2*t]=1,n)}function $e(e,t,n,i,o){if(t){var r=function(e,t,n){var i;if(1===n)i={kind:"#container",subKind:"##block",uid:"cnb"+ ++Y,idx:e,parentIdx:-1,ns:"",domNode:void 0,attached:!0,nextSibling:void 0,views:[],viewPool:[],cmAppend:t,lastRefresh:0,previousNbrOfViews:0,insertFn:null};else{if(2!==n)return console.warn("TODO: new cnt type"),null;i={kind:"#container",subKind:"##cpt",uid:"cnc"+ ++Y,idx:e,parentIdx:-1,ns:"",domNode:void 0,attached:!0,nextSibling:void 0,cmAppend:t,cptRef:null,template:null,data:null,contentView:null,dynamicParams:void 0}}return i}(n,null,o);return e.nodes[n]=r,function(e,t,n){if(e.cmAppends){var i=e.cmAppends[n];i?(t.cmAppend=function(e,t){i(e,!0)},i(t,!1)):console.log("ERROR?",i===U)}}(e,r,i),r}}function Ae(e,t,n,i,o,r,a,s,d,l){var c;n=n||0,t?c=e.nodes[i]||$e(e,t,i,o,2):(c=e.nodes[i]).lists&&(c.lists.sizes={});var u=Oe(e,n,r);if(c.template){if(u!==me&&c.cptRef!==u){var f=c.data;c.template.dispose(!0),m();var v=c.data;for(var p in f)if(f.hasOwnProperty(p)&&p.match(Q)){var h=RegExp.$1;w(v,h)&&(v[h]=f[h])}}}else{if(u===me)return void z(e,"Invalid component ref");m()}function m(){var t=c.template=u();c.cptRef=u,pe(t.view,e,c),t.disconnectObserver(),c.data=t.api,function(t){if(d){var n=d.length;if(!t&&n)z(e,"Invalid parameter: "+d[0]);else for(var i=0;n>i;i+=2)w(t,d[i])?t[d[i]]=d[i+1]:z(e,"Invalid parameter: "+d[i])}}(t.api)}l&&(c.dynamicParams={}),0===n&&a&&Ee(e,i,c,s,l)}function Ee(e,t,n,i,o){var r=(n=n||e.nodes[t])?n.template:void 0;if(void 0!==r){if(r.view.lastRefresh=e.lastRefresh-1,function(e){if(e.lists)for(var t=e.lists,n=t.listNames,i=void 0,o=void 0,r=void 0,a=void 0,s=0;n.length>s;s++)i=n[s],o=t.sizes[i]||0,r=e.data[i],a=r.length,o<a&&r.splice(o,a-o)}(n),n.contentView){r.api.$content=n.contentView;var a=n.contentView.instructions;a&&a.length&&(r.forceRefresh=!0)}if(r.view.cm)r.view.cmAppends=[n.cmAppend];else{if(o)for(var s=o.length,d=(n?n.dynamicParams:{})||{},l=r.api,c=0;s>c;c++)d[o[c]]||I(l,o[c]);var u=r.view.nodes[0];if(!u.attached)r.forceRefresh=!0,Ne(u,we(e,n))}i&&ve(e,r.api,i),r.render()}}function Re(e,t,n,i,o){if(o!==me){var r=Oe(e,t,o);if(r!==me){var a=e.nodes[n].domNode;void 0===r?a.removeAttribute(i):a.setAttribute(i,r)}}}function Ve(e,t,n,i,o,r){if(r!==me){var a=Oe(e,n,r);if(a!==me){var s=e.nodes[i],d=s.kind;if("#container"===d){var l=s.data;je(e,t,s,l,o)&&(l[o]=a)}else if("#param"===d)Se(e,t,s,a,o);else if("#decorator"===d){var c=s;t&&!He(e,c,o)||(c.api[o]=a)}}}}function je(e,t,n,i,o){if(i&&(!e.cm||w(i,o)))return!0;var r="";return n.template&&(r=" on <*"+n.template.templateName+"/>"),z(e,"Invalid parameter '"+o+"'"+r),!1}function Se(e,t,n,i,o){if(0===o){if(n.dataHolder)return n.dataHolder[n.dataName]=i,n.dataHolder}else{if(n.data)return t&&!w(n.data,o)&&z(e,"Invalid param node parameter: "+o),n.data[o]=i,n.data;z(e,"Invalid param node parameter: "+o)}return null}function Te(e,t,n,i,o,r,a,s){var d,l=e.nodes[i],c=l.kind,u=U;if(a!==U&&s!==U&&null!==a&&"object"==typeof a&&(t&&"string"==typeof s&&y(a)&&!w(a,s)&&z(e,"Invalid property: '"+s+"'"),u=a[s]),"#container"===c)je(e,0,l,d=l.data,r)&&(t&&it(e,d,r),d[r]=u);else if("#param"===c)if(0===r){var f=l;f.dataHolder&&(f.dataHolder[f.dataName]=u,d=f.dataHolder,r=f.dataName,t&&it(e,d,r,"."+r,!1,!0))}else d=Se(e,t,l,u,r),t&&it(e,d,r,"."+l.dataName);else if("#decorator"===c){var v=l;d=v.api,0===r?(r=Ke(e,v,u),t&&r&&it(e,d,r,v.refName,!0)):t&&!He(e,v,r)||(t&&it(e,d,r,v.refName),d[r]=u)}var p=l.bindings;if(p===U&&(p=l.bindings=[]),p[o]===U){if(d){var h={propertyHolder:a,propertyName:s,watchFn:x(d,(function(){var e=d[r],t=h.propertyHolder;if(t!==U&&null!==t&&h.propertyName!==U&&t[h.propertyName]!==e){var n=b(t);0===n||n%2==1?Promise.resolve().then((function(){t[h.propertyName]=e})):t[h.propertyName]=e}}))};p[o]=h}}else{var m=p[o];m.propertyHolder=a,m.propertyName=s}}function Fe(e,t,n,i,o,r,a,s,d,l,c){var u;if(t){var f=e.nodes;if(void 0===a)z(e,"Undefined decorator reference: @"+r);else if("function"!=typeof a&&!0!==a.$isDecorator)z(e,"Invalid decorator reference: @"+r);else{var v=new a.$apiClass,p=a(v);if(u={kind:"#decorator",uid:"deco"+ ++Y,idx:i,parentIdx:o,attached:!0,nextSibling:void 0,domNode:void 0,instance:p,api:v,refName:"@"+r,validProps:!0},f[i]=u,l)for(var h=l.length,m=0;h>m;m+=2)He(e,u,l[m]),v[l[m]]=l[m+1]}}else u=e.nodes[i];if(u!==U){v=u.api;1===s&&Ke(e,u,d),ve(e,v,c)}}function He(e,t,n){return!!w(t.api,n)||(z(e,"Invalid decorator parameter '"+n+"' on "+t.refName),!1)}function Ke(e,t,n){var i=t.api,o=i[ne];return o===U?(z(e,t.refName+" doesn't define any default parameter"),""):(i[o]=n,o)}function Me(e,t,n){if(t){var i=n.api,o=e.nodes[n.parentIdx],r=null,a=null;if(void 0===o.kind)r=o;else if("#element"===o.kind)r=o.domNode;else if("#container"===o.kind&&"##cpt"===o.subKind){var s=o.template;a=s.api,r=s.query("#main")}else z(e,"Invalid decorator target for "+n.refName);null!==r&&w(i,"$targetElt")&&(i.$targetElt=r),null!==a&&w(i,"$targetApi")&&(i.$targetApi=a),n.validProps=function(e,t,n,i){if(t[oe]!==U){var o=t[oe],r=void 0,a=!0;for(var s in o)if((r=t[o[s]])===U||null===r){var d=Qe(o[s]);i!==U&&i[d]!==U?z(e,(n+" "+d).replace(Z,i[d])):z(e,d+" property is required for "+n),a=!1}return a}return!0}(e,n.api,n.refName,re),n.validProps&&le(e,n.instance,"$init",n.refName)}n.validProps&&le(e,n.instance,"$render",n.refName)}function Xe(e,t,n,i){var o=e.nodes[i];o!==U&&Me(e,t,o)}function Be(e,t){if(0===t.idx&&e.projectionHost){if(!t.attached)return null;var n=e.projectionHost.hostNode;return"#element"===n.kind?n.domNode:Be(e.projectionHost.view,n)}return 0===t.idx?e.parentView?Be(e.parentView,e.container):e.rootDomNode:e.nodes[t.parentIdx].domNode}function Le(e,t){if(t&&t.attached)if("#text"===t.kind||"#element"===t.kind){var n=Be(e,t);t.attached=!1,n?n.removeChild(t.domNode):z(e,"Internal error - parent not found for: "+t.uid)}else if("#container"===t.kind){if("##block"===t.subKind){for(var i=t,o=i.views,r=o.length,a=void 0,s=0;r>s;s++)a=o[s].nodes[0],Le(o[s],a),o[s].attached=a.attached=!1,"#container"!==a.kind&&"#fragment"!==a.kind||(a.domNode=void 0);i.views=[],i.previousNbrOfViews=0,i.viewPool=o.concat(i.viewPool)}else if("##cpt"===t.subKind){var d=t.template;a=d.view.nodes[0];Le(d.view,a),d.view.attached=a.attached=!1,"#container"!==a.kind&&"#fragment"!==a.kind||(a.domNode=void 0)}}else if("#fragment"===t.kind){var l=t;if(l.attached=!1,l.contentView)Le(l.contentView,l.contentView.nodes[0]);else if(l.firstChild)for(var c=l.firstChild;c;)Le(e,c),c=c.nextSibling;l.domNode=void 0}else"#param"===t.kind?console.warn("TODO removeFromDom for param nodes"):console.warn("RemoveFromDom for "+t.kind)}var We=D,Ye=O,qe=function(e){var t=e.ΔFactory;if(t)return t;function n(){return new e}return n[a]=!0,e[o]=n,n},ze=A,Ue=j,_e=R,Ge=P;function Je(e){e.prototype[ee]=!0,D(e)}function Qe(e){return e.replace(J,"")}function Ze(e,t){return!0===e.prototype[t]}function et(e,t){e[ne]=Qe(t)}function tt(e,t){var n=e[ie];t="/"+Qe(t),e[ie]=n===U?t:n+t}function nt(e,t){var n=e[oe];n===U&&(n=e[oe]=[]),n.push(t)}function it(e,t,n,i,o,r){var a=t[ie];if(a!==U){var s="/"+n;if(a===s||a.indexOf(s)>-1)return!0}return z(e,i!==U?o?"Invalid I/O binding expression on "+i+" (@defaultParam is not an @io param)":r?"Invalid I/O binding expression on "+i+"@paramValue (not an @io param)":"Invalid I/O binding expression on "+i+"."+n+" (not an @io param)":"Invalid I/O binding expression on '"+n+"' (not an @io param)"),!1}function ot(e,t,n){t.appendChild(e)}function rt(e,t,n,i){n.insertBefore(e,t)}var at="-------------------------------------------------------------------------------";var st,dt="value",lt="checked",ct="data",ut=["text","radio","checkbox","number","range"],ft={passive:!0},vt=function(){function n(){this.ΔΔevents="input",this.ΔΔdebounce=0}return n.prototype.ΔDefault=function(e){switch(e){case"events":return"input";case"debounce":return 0}return Ge},e([nt,et,tt,t("design:type",Object)],n.prototype,"ΔΔdata",void 0),e([Ye(),t("design:type",Object)],n.prototype,"data",void 0),e([nt,t("design:type",Object)],n.prototype,"ΔΔ$targetElt",void 0),e([Ye(),t("design:type",Object)],n.prototype,"$targetElt",void 0),e([Ye(ze),t("design:type",String)],n.prototype,"events",void 0),e([Ye(0,2),t("design:type",Object)],n.prototype,"input2data",void 0),e([Ye(0,2),t("design:type",Object)],n.prototype,"data2input",void 0),e([Ye(_e),t("design:type",Number)],n.prototype,"debounce",void 0),n=e([Je],n)}(),pt=((st=function(e){var t,n,i="",o="",r="",a={};function s(t){if("number"===i&&"input"===t.type){var o=t[ct];if("e"===o||"E"===o||"-"===o||"+"===o)return}e.debounce<=0?d():(n||(n=new ht("@value error")),n.duration=e.debounce,n.process(d))}function d(){var n;if("text"===i||"number"===i)n=t[dt];else if("range"===i){var o=t[dt];if(""===o)n=0;else if(n=parseInt(o),isNaN(n))throw"Invalid input value '"+o+"': value of input type range shall be an integer"}else if("checkbox"===i)n=t[lt];else if("radio"===i){if(!t[lt])return;n=t[dt]}e.data=e.input2data(n)}return{$init:function(){if("INPUT"!==(t=e.$targetElt).tagName&&"TEXTAREA"!==t.tagName&&"SELECT"!==t.tagName)throw"@value can only be used on input, textarea and select elements";if(i="text","INPUT"===t.tagName&&(i=t.getAttribute("type"),-1===ut.indexOf(i)))throw"Invalid input type '"+i+"': @value can only be used on types '"+ut.join("', '")+"'";t.addEventListener("change",s,ft)},$render:function(){if(void 0===e.input2data&&(e.input2data=function(e){if("number"===i){if(""===e)return 0;try{e=parseFloat(e)}catch(e){return console.log("@value conversion error: ",e),0}}return e}),void 0===e.data2input&&(e.data2input=gt),o!==e.data){o=e.data;var n=e.data2input(o);if("text"===i||"number"===i)t[dt]=n;else if("range"===i){if(!Number.isInteger(n))throw"Invalid input value '"+n+"': value of input type range shall be an integer";t[dt]=""+n}else"checkbox"===i?t[lt]=!!n:"radio"===i&&(t[lt]=n===t[dt])}if(r!==e.events){for(var d=e.events.split(";"),l=0,c=r.split(";");l<c.length;l++)"change"!==(v=c[l])&&d.indexOf(v)<0&&a[v]&&(t.removeEventListener(v,s,ft),a[v]=!1);for(var u=0,f=d;u<f.length;u++){var v;"change"!==(v=f[u])&&(a[v]||(t.addEventListener(v,s,ft),a[v]=!0))}r=e.events}},$dispose:function(){if(t){if(t.removeEventListener("change",s),""!==r)for(var e=0,i=r.split(";");e<i.length;e++){var o=i[e];"change"!==o&&t.removeEventListener(o,s,ft)}r="",n=void 0}}}}).$apiClass=vt,st.$isDecorator=!0,st),ht=function(){function e(e){void 0===e&&(e="Error in callback"),this.errContext=e,this.timeoutId=null,this.duration=100}return e.prototype.process=function(e){var t=this;this.duration<=0?mt(e,this.errContext):(null!==this.timeoutId&&clearTimeout(this.timeoutId),this.timeoutId=setTimeout((function(){t.timeoutId=null,mt(e,t.errContext)}),this.duration))},e}();function mt(e,t){try{e()}catch(e){throw"Debounce - "+t+"\n"+(e.message?e.message:e)}}function gt(e){return e}var bt,wt,yt,Nt,xt,Ct,It,kt,Dt,Ot,Pt,$t=function(){function n(){}return e([O(A),t("design:type",String)],n.prototype,"name",void 0),e([O(R),t("design:type",Number)],n.prototype,"modelYear",void 0),e([O(j),t("design:type",Boolean)],n.prototype,"electric",void 0),e([O(A),t("design:type",String)],n.prototype,"color",void 0),n=e([D],n)}(),At=["WH","BK","RD","BL"],Et={WH:"white",BK:"black",RD:"red",BL:"blue"},Rt=function(){function n(){this.ΔΔdebounce=0,this.ΔΔevents="input"}return n.prototype.ΔDefault=function(e){switch(e){case"debounce":return 0;case"events":return"input"}return P},e([O(R),t("design:type",Number)],n.prototype,"debounce",void 0),e([O(A),t("design:type",String)],n.prototype,"events",void 0),n=e([D],n)}(),Vt=(bt={},wt=["class","option editor"],yt=["class","lbl"],Nt=["type","number"],xt=["class","lbl"],Ct=["type","checkbox"],It=["type","checkbox"],kt=["type","checkbox"],Dt=["class","lbl"],Ot=[' "',"",'" '],Pt=function(){function n(){this.ΔΔevtInput=!0}return n.prototype.ΔDefault=function(e){switch(e){case"evtInput":return!0}return Ge},e([Ye(qe(Rt)),t("design:type",Rt)],n.prototype,"o",void 0),e([Ye(Ue),t("design:type",Boolean)],n.prototype,"evtInput",void 0),e([Ye(Ue),t("design:type",Boolean)],n.prototype,"evtFocus",void 0),e([Ye(Ue),t("design:type",Boolean)],n.prototype,"evtBlur",void 0),n=e([We],n)}(),he("optionEditor","forms2/forms2.ts",bt,(function(e,t,n){var i=n.o,o=n.evtInput,r=n.evtFocus,a=n.evtBlur,s=ge(e,0,25),d=[];o&&d.push("input"),r&&d.push("focus"),a&&d.push("blur"),i.events=d.join(";"),Ce(e,s,0,0,"div",1,0,wt),Ce(e,s,1,1,"div",1),Ce(e,s,2,2,"div",1,0,yt),ke(e,s,0,3,3,0," Debounce (ms): ",0),Ce(e,s,4,2,"input",0,0,Nt),Fe(e,s,0,5,4,"value",pt,2),Te(e,s,0,5,0,0,i,"debounce"),Xe(e,s,0,5),Ce(e,s,6,1,"div",1),Ce(e,s,7,2,"div",1,0,xt),ke(e,s,0,8,3,0," Extra events: ",0),Ce(e,s,9,2,"label",1),Ce(e,s,10,3,"input",0,0,Ct),Fe(e,s,0,11,10,"value",pt,2),Te(e,s,0,11,0,0,t,"evtInput"),Xe(e,s,0,11),ke(e,s,0,12,3,0," input ",0),Ce(e,s,13,2,"label",1),Ce(e,s,14,3,"input",0,0,It),Fe(e,s,0,15,14,"value",pt,2),Te(e,s,0,15,0,0,t,"evtFocus"),Xe(e,s,0,15),ke(e,s,0,16,3,0," focus ",0),Ce(e,s,17,2,"label",1),Ce(e,s,18,3,"input",0,0,kt),Fe(e,s,0,19,18,"value",pt,2),Te(e,s,0,19,0,0,t,"evtBlur"),Xe(e,s,0,19),ke(e,s,0,20,3,0," blur ",0),Ce(e,s,21,1,"div",1),Ce(e,s,22,2,"div",1,0,Dt),ke(e,s,0,23,3,0," Events value: ",0),ke(e,s,0,24,2,0,Ot,1,De(e,0,i.events)),xe(e)}),Pt)),jt=function(){var n={},i=["class","car editor"],o=["class","lbl"],r=["type","text"],a=["class","lbl"],s=["type","number"],d=["class","color"],l=["type","radio"],c=[" ",""," "],u=["type","checkbox"],f=[14],v=function(){function n(){}return e([Ye(qe($t)),t("design:type",$t)],n.prototype,"data",void 0),e([Ye(qe(Rt)),t("design:type",Rt)],n.prototype,"o",void 0),n=e([We],n)}();return he("carEditor","forms2/forms2.ts",n,(function(e,t,n,v){var p,h,m=n.data,g=n.o,b=0,w=ge(e,0,20);Ce(e,w,0,0,"div",1,0,i),Ce(e,w,1,1,"div",1),Ce(e,w,2,2,"div",1,0,o),ke(e,w,0,3,3,0," Name: ",0),Ce(e,w,4,2,"input",0,0,r),Fe(e,w,0,5,4,"value",pt,2),Te(e,w,0,5,0,"data",m,"name"),Ve(e,w,0,5,"debounce",De(e,0,g.debounce)),Ve(e,w,0,5,"events",De(e,1,g.events)),Xe(e,w,0,5),Ce(e,w,6,1,"div",1),Ce(e,w,7,2,"div",1,0,a),ke(e,w,0,8,3,0," Model Year: ",0),Ce(e,w,9,2,"input",0,0,s),Fe(e,w,0,10,9,"value",pt,2),Te(e,w,0,10,0,"data",m,"modelYear"),Ve(e,w,0,10,"debounce",De(e,2,g.debounce)),Ve(e,w,0,10,"events",De(e,3,g.events)),Xe(e,w,0,10),Ce(e,w,11,1,"div",1),Ce(e,w,12,2,"div",1,0,d),ke(e,w,0,13,3,0," Color: ",0),$e(e,w,14,2,1);for(var y=0,N=At;y<N.length;y++){var x=N[y];Ce(p=be(e,0,14,4,++b),h=p.cm,0,0,"label",1),Ce(p,h,1,1,"input",0,0,l),Re(p,0,1,"name",De(p,0,"color"+v.uid)),Re(p,0,1,"value",De(p,1,x)),Fe(p,h,0,2,1,"value",pt,2),Te(p,h,0,2,0,"data",m,"color"),Ve(p,h,0,2,"debounce",De(p,2,g.debounce)),Ve(p,h,0,2,"events",De(p,3,g.events)),Xe(p,h,0,2),ke(p,h,0,3,1,0,c,1,Pe(p,0,h?Et[x]:me)),xe(p)}Ce(e,w,15,1,"div",1),Ce(e,w,16,2,"label",1),Ce(e,w,17,3,"input",0,0,u),Fe(e,w,0,18,17,"value",pt,2),Te(e,w,0,18,0,"data",m,"electric"),Ve(e,w,0,18,"debounce",De(e,4,g.debounce)),Ve(e,w,0,18,"events",De(e,5,g.events)),Xe(e,w,0,18),ke(e,w,0,19,3,0," electric ",0),xe(e,0,f)}),v)}(),St=function(){var n={},i=["class","summary"],o=["class","title"],r=[" Car name: ",""," "],a=[" Model year: ",""," "],s=[" Color code: ",""," "],d=[" Electric: ",""," "],l=function(){function n(){}return e([Ye(qe($t)),t("design:type",$t)],n.prototype,"data",void 0),e([Ye(qe(Rt)),t("design:type",Rt)],n.prototype,"o",void 0),n=e([We],n)}();return he("main","forms2/forms2.ts",n,(function(e,t,n){var l=n.data,c=n.o,u=ge(e,0,15);!function(e,t,n,i){if(t){var o={kind:"#fragment",uid:"fra"+ ++Y,idx:n,parentIdx:-1,ns:"",domNode:void 0,attached:!0,nextSibling:void 0,firstChild:void 0,lastChild:void 0,contentView:null};e.nodes[n]=o;var r=e.cmAppends[i];r(o,!1),e.cmAppends[i+1]=function(e,t){r(e,!0),t||Ie(o,e)}}}(e,u,0,0),Ce(e,u,1,1,"div",1,0,i),Ce(e,u,2,2,"div",1,0,o),ke(e,u,0,3,3,0," Summary ",0),Ce(e,u,4,2,"div",1),ke(e,u,0,5,3,0,r,1,De(e,0,l.name)),Ce(e,u,6,2,"div",1),ke(e,u,0,7,3,0,a,1,De(e,1,l.modelYear)),Ce(e,u,8,2,"div",1),ke(e,u,0,9,3,0,s,1,De(e,2,l.color)),Ce(e,u,10,2,"div",1),ke(e,u,0,11,3,0,d,1,De(e,3,l.electric)),Ae(e,u,0,12,1,De(e,4,Vt),0),Ve(e,u,0,12,"o",De(e,5,c)),Ee(e,12),Ae(e,u,0,13,1,De(e,6,jt),0),Ve(e,u,0,13,"data",De(e,7,l)),Ve(e,u,0,13,"o",De(e,8,c)),Ee(e,13),Ae(e,u,0,14,1,De(e,9,jt),0),Ve(e,u,0,14,"data",De(e,10,l)),Ve(e,u,0,14,"o",De(e,11,c)),Ee(e,14),xe(e)}),l)}(),Tt=new $t;Tt.name="Ford Model T",Tt.modelYear=1908,Tt.electric=!1,Tt.color="BK";var Ft=new Rt;St().attach(document.body).render({data:Tt,o:Ft})}();
