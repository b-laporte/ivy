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
    ***************************************************************************** */function e(e,t,n,i){var o,r=arguments.length,a=r<3?t:null===i?i=Object.getOwnPropertyDescriptor(t,n):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(e,t,n,i);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(r<3?o(a):r>3?o(t,n,a):o(t,n))||a);return r>3&&a&&Object.defineProperty(t,n,a),a}function t(e,t){if("object"==typeof Reflect&&"function"==typeof Reflect.metadata)return Reflect.metadata(e,t)}var n="ΔTrackable",i="ΔChangeVersion",o="ΔDefFactories",r="ΔΔProxy",a="ΔIsProxy",s="ΔDefault",d=!1;function c(e){return e&&e.ΔTrackable?e.ΔMd?e.ΔMd:e.ΔMd={parents:void 0,refreshCtxt:void 0,watchers:void 0}:null}var l=Array.isArray;function f(e,t){e&&(l(e)&&!e[a]?e.forEach(t):t(e))}function u(e,t){if(e&&t){if(e===t)return;if(l(e)){var n=e;if(1===n.length){if(n[0]===t)return}else{var i=n.indexOf(t);if(i>-1)return n.splice(i,1),1===n.length?n[0]:n}}}return e}function p(e,t){return e?l(e)&&!e[a]?(e.push(t),e):[e,t]:t}function v(e){return e&&!0===e[n]?e[i]:0}function h(e,t){return!(!e||"object"!=typeof e)&&"ΔΔ"+t in e}function m(e){return!(!e||!0!==e[n])}function g(e){return v(e)%2==1}function w(e,t){var n=c(e);return n&&t?(n.watchers=p(n.watchers,t),g(e)&&I.register(e),t):null}function b(e,t){var n=e?e.ΔMd:void 0;n&&t&&(n.watchers=u(n.watchers,t))}function N(e,t){if(e&&t){var n=e[s];if(n){var i=n(t);if(i!==x)return e[t]=i}var r=e[o],a=r?r[t]:null;if(a)return e[t]=a()}}var x={};function C(){return 0}C["ΔIsFactory"]=!0;var y=C;function k(){return null}function A(){}function V(e,t){if(t){var n=c(t);n&&(n.parents=p(n.parents,e))}}k["ΔIsFactory"]=!0,A["ΔIsFactory"]=!0;var D=0,O=function(){function e(){this.id=++D}return e.prototype.register=function(e){var t=this,n=c(e);n&&!n.refreshCtxt&&(this.objects?this.objects.push(e):(this.objects=[e],Promise.resolve().then((function(){t.refresh()}))),n.refreshCtxt=this)},e.prototype.refresh=function(e){void 0===e&&(e=!0);var t=this.objects,n=t?t.length:0;if(n){P();for(var i,o,r=[],a=0;n>a;a++)(o=(i=t[a]).ΔMd).refreshCtxt&&(i.ΔChangeVersion%2&&(i.ΔChangeVersion+=1),o.refreshCtxt&&o.watchers&&r.push({dataNode:i,watchers:o.watchers})),o.refreshCtxt=void 0;this.objects=void 0,r.length&&(e?R(r):Promise.resolve().then((function(){R(r)})))}},e}();function R(e){for(var t=function(e){f(e.watchers,(function(t){t(e.dataNode)}))},n=0,i=e;n<i.length;n++){t(i[n])}}var I=new O;function P(){I.objects&&(I=new O)}var j=0,$={log:function(e){for(var t=[],n=1;n<arguments.length;n++)t[n-1]=arguments[n];console.log.apply(console,arguments)},error:function(e){for(var t=[],n=1;n<arguments.length;n++)t[n-1]=arguments[n];console.error.apply(console,arguments)}};function E(e,t){for(var n=e,i=[];n;){if(n.template){var o=n.template;i.push('\n>> Template: "'+o.templateName+'" - File: "'+o.filePath+'"')}n=n.parentView}$.error("IVY: "+t+i.join(""))}var T=void 0,S=11,F="$api",H=/^ΔΔ(\w+)Emitter$/,X=/^ΔΔ(.+)$/,K="ΔIsAPI",M="ΔIsController",L=0,W=function(){function e(e,t,n,i,o){this.templateName=e,this.filePath=t,this.staticCache=n,this.renderFn=i,this.$Class=o,this._uid=++L,this.tplApi=void 0,this.tplCtl=void 0,this.forceRefresh=!1,this.activeWatch=!1,this.lastRefreshVersion=0,this.processing=!1,this.rendering=!1,this.initialized=!1,this.labels=void 0,this.hasCtlClass=!1,this.view=U(null,null,1,this);var r=this;this.watchCb=function(){r.notifyChange()},this.watchCb.$templateId=this._uid,this.$Class!==T&&(De(this.$Class,M)?this.hasCtlClass=!0:De(this.$Class,K)||m(this.$Class.prototype)||E(this.view,"Type of $ argument must be either a @Controller, an @API or a @Data class"))}return e.prototype.dispose=function(e){void 0===e&&(e=!1);var t=this.view;this.disconnectObserver(),B(t,this.tplCtl,"$dispose",this.templateName),e&&t&&t.nodes&&t.nodes.length&&Ce(t,t.nodes[0])},Object.defineProperty(e.prototype,"uid",{get:function(){return this._uid},enumerable:!0,configurable:!0}),Object.defineProperty(e.prototype,"document",{get:function(){return this.view.doc},set:function(e){this.view.doc=e},enumerable:!0,configurable:!0}),Object.defineProperty(e.prototype,"api",{get:function(){if(!this.tplApi)if(this.hasCtlClass){var e=this.controller;e&&e.$api&&(this.tplApi=e.$api)}else this.$Class&&(this.tplApi=new this.$Class,z(this.view,this.tplApi,this.staticCache));return this.tplApi},enumerable:!0,configurable:!0}),Object.defineProperty(e.prototype,"controller",{get:function(){if(!this.tplCtl&&this.hasCtlClass){var e=this.tplCtl=new this.$Class;if(h(e,"$template")&&(e.$template=this),h(e,"$logger")){var t=this.view;e.$logger={log:$.log,error:function(e){for(var n=[],i=1;i<arguments.length;i++)n[i-1]=arguments[i];E(t,e+(n.length?" "+n.join(" "):""))}}}e[F]&&z(this.view,e[F],this.staticCache)}return this.tplCtl},enumerable:!0,configurable:!0}),e.prototype.attach=function(e){if(this.view.rootDomNode)E(this.view,"Template host cannot be changed once set");else{var t=this.view;if(!t.doc)throw new Error("[iv] Template.document must be defined before calling Template.attach()");t.rootDomNode=e,t.anchorNode=t.doc.createComment("template anchor"),Oe(t.anchorNode,e)}return this},e.prototype.registerLabel=function(e,t){this.labels||(this.labels={});var n=this.labels[e];n?n.push(t):n=this.labels[e]=[t]},e.prototype.query=function(e,t){if(void 0===t&&(t=!1),this.rendering)return null;if(e&&"#"!==e.charAt(0))return E(this.view,"[$template.query()] Invalid label argument: '"+e+"' (labels must start with #)"),null;var n=this.labels&&this.labels[e]||null;return n&&n.length?t?n:n[0]:null},e.prototype.notifyChange=function(){this.render()},e.prototype.disconnectObserver=function(){this.activeWatch&&(b(this.api,this.watchCb),b(this.controller,this.watchCb),this.activeWatch=!1)},e.prototype.render=function(e){if(this.processing)return this;this.processing=!0;var t=this.api,n=this.controller,i=this.view;if(n&&!m(n)&&(E(i,"Template controller must be a @Controller Object - please check: "+this.$Class.name),this.tplCtl=this.$Class=void 0),t&&e)for(var o in g(t)||P(),this.disconnectObserver(),e)e.hasOwnProperty(o)&&(t[o]=e[o]);var r=!this.forceRefresh,a=i.nodes;if(a&&a[0]&&a[0].attached||(r=!1),r&&v(t)+v(n)>this.lastRefreshVersion&&(r=!1),!r){n&&(this.initialized||(B(i,n,"$init","controller"),this.initialized=!0),B(i,n,"$beforeRender","controller")),this.rendering=!0,this.labels=void 0,i.lastRefresh++,i.instructions=void 0;try{this.renderFn(i,this.hasCtlClass?n:t,t,this)}catch(e){E(i,"Template execution error\n"+(e.message||e))}this.rendering=!1,n&&B(i,n,"$afterRender","controller"),function(e,t){if(void 0===t&&(t=!1),e){var n=e.ΔMd;n&&n.refreshCtxt?n.refreshCtxt.refresh(!0):t&&P()}}(t),this.forceRefresh=!1,this.lastRefreshVersion=v(t)+v(n)}return this.activeWatch||(w(t,this.watchCb),n&&w(n,this.watchCb),this.activeWatch=!0),this.processing=!1,this},e}();function z(e,t,n){var i=n.events;if(void 0===i){var o=void 0;for(var r in t)if(r.match(H)){var a=RegExp.$1;o||(o=[]),"function"!=typeof t[a+"Emitter"].init?E(e,"Invalid EventEmitter: "+a+"Emitter"):(o.push(a+"Emitter"),o.push(a),t[a+"Emitter"].init(a,t))}n.events=o||null}else if(null!==i)for(var s=i.length,d=0;s>d;d+=2)t[i[d]].init(i[d+1],t)}function B(e,t,n,i){if(t&&"function"==typeof t[n])try{t[n]()}catch(t){E(e,i+" "+n+" hook execution error\n"+(t.message||t))}}function _(e,t){return(t=t||this.namespace)?this.doc.createElementNS(t,e):this.doc.createElement(e)}function q(){return function(e){if(e!==T&&null!==e){var t=!0;return Ie(e,!1,(function(e){if(!t)return!1;var n=e.kind;if("#view"===n){var i=e;if(i.cm){var o=i.doc.createDocumentFragment();i.domNode=o,i.cmAppends=[function(e){e.domNode?Oe(e.domNode,o):e.domNode=o}]}ie(i)}else if("#element"===n||"#text"===n)return t=!1;return!0})),t}return!0}(this)}function U(e,t,n,i){var o={kind:"#view",uid:"view"+ ++j,nodes:null,namespace:void 0,namespaces:void 0,doc:null,parentView:e,cm:!0,cmAppends:null,lastRefresh:0,container:null,projectionHost:null,template:i,rootDomNode:null,anchorNode:null,expressions:void 0,oExpressions:void 0,instructions:void 0,paramNode:void 0,createElement:_,isEmpty:q};return e?G(o,e,t):o.doc="undefined"!=typeof document?document:null,o}function Y(e,t,n){if(n){var i=function(e){var t=e;for(;t&&!t.template;)t=t.parentView;return t}(e);if(i!==T&&null!==i)for(var o=i.template,r=n.length,a=0;r>a;a++)o.registerLabel(n[a],t)}}function G(e,t,n){if(e.parentView=t,e.doc=t.doc,e.container=n,e.rootDomNode=t.rootDomNode,t.namespace){var i=t.namespace;e.namespace=i,e.namespaces=[i]}}function J(e,t,n,i,o){return function(){return new W(e,t,n,i,o)}}var Q=[];function Z(e,t,n){var i=e.cm;return i?(e.nodes=new Array(n),e.cmAppends||(e.cmAppends=[],e.anchorNode&&(e.cmAppends[0]=function(t,n){t.domNode?Re(t.domNode,e.anchorNode,e.rootDomNode):t.domNode=e.rootDomNode}))):e.cmAppends=null,i}function ee(e,t,n,i,o,r){var a=r||function(e,t,n,i,o){var r,a=e.nodes[n];if(a&&a.attached||E(e,"Invalid ζview call: container must be attached ("+(a?a.uid:"XX")+") - pview: "+e.uid+" containerIdx: "+n),"#container"===a.kind)if("##block"===a.subKind){var s=(d=a).views;1===o&&(d.insertFn=null),1===o&&d.views.length>1?(d.previousNbrOfViews=s.length,r=s.shift(),d.viewPool.length?d.viewPool=s.concat(d.viewPool):d.viewPool=s,d.views=[r]):(r=d.views[o-1])||(d.viewPool.length>0?(d.insertFn||(d.insertFn=oe(e,d)),ae((r=s[o-1]=d.viewPool.shift()).nodes[0],d.insertFn)):((r=s[o-1]=U(e,d)).nodes=new Array(i),e.cm&&d.cmAppend?r.cmAppends=[d.cmAppend]:e.cm||(r.cmAppends=[oe(e,d)]))),d.lastRefresh=r.lastRefresh=e.lastRefresh}else{var d;(r=(d=a).contentView)||((r=d.contentView=U(e,d)).nodes=new Array(i)),r.lastRefresh=e.lastRefresh}else if("#param"===a.kind){var c=a;(r=c.contentView)||(r=c.contentView=U(e,null),c.viewPool&&(c.viewPool[c.viewInstanceIdx]=r),r.nodes=new Array(i),r.paramNode=c),r.lastRefresh=e.lastRefresh}return r}(e,0,n,i,o);if(1===t)a.instructions=[];else{for(var s=a,d=t-1;d>0;)s=s.parentView,d--;s.instructions||(s.instructions=[]),a.instructions=s.instructions}return a.cm&&!a.cmAppends&&ne(a,te,[a,e,n]),a}function te(e,t,n){var i=t.nodes[n];"#container"===i.kind&&!e.cmAppends&&i.cmAppend&&(e.cmAppends=[i.cmAppend])}function ne(e,t,n){e.instructions.push(t),e.instructions.push(n)}function ie(e){if(e.instructions){var t=e.instructions.slice(0),n=t.length;if(e.instructions.splice(0,n),e.instructions=void 0,n)for(var i=0;n>i;i+=2)t[i].apply(null,t[i+1])}}function oe(e,t){var n=function e(t,n){for(;;){if(n||E(t,"Internal error - findNextSiblingDomNd: nd cannot be undefined"),0===n.idx){if(!n.attached)return{position:"defer",parentDomNd:void 0};if(n.domNode.nodeType===S)return{position:"lastChild",parentDomNd:n.domNode};var i=t.parentView;if(i){if(t.projectionHost){var o=t.projectionHost.hostNode;return"#element"===o.kind?{position:"lastChild",parentDomNd:o.domNode}:e(t.projectionHost.view,o)}if(t.container&&"##block"===t.container.subKind){var r=t.container,a=r.views.indexOf(t);if(a>-1)for(var s=void 0,d=void 0,c=a+1;c<r.views.length;c++)if((s=r.views[c]).nodes&&s.nodes.length&&(d=m(s,s.nodes[0],r.domNode)))return d;for(var l=r.viewPool,f=void 0,u=0,p=l;u<p.length;u++){if((s=p[u]).nodes&&s.nodes.length&&s.nodes[0].attached&&(f=m(s,s.nodes[0],r.domNode)))return f}}return e(i,t.container)}return{position:"lastOnRoot",parentDomNd:t.rootDomNode,nextDomNd:t.anchorNode}}if(!n.nextSibling){var v=t.nodes[n.parentIdx];return"#element"===v.kind?{position:"lastChild",parentDomNd:xe(t,n)}:e(t,v)}var h=m(t,n.nextSibling,xe(t,n));if(h)return h;n=n.nextSibling}function m(e,t,n){if(!t)return null;if("#element"===t.kind||"#text"===t.kind)return{position:"beforeChild",nextDomNd:t.domNode,parentDomNd:n};if("#fragment"===t.kind){for(var i=void 0,o=t.firstChild;o;){if(i=m(e,o,n))return i;o=o.nextSibling}if(t.contentView){var r=t.contentView;if(r.nodes)return m(r,r.nodes[0],n)}return null}if("#container"===t.kind){var a=t;i=null;if("##block"===a.subKind)for(var s=a.views,d=s.length,c=0;d>c&&!(i=m(s[c],s[c].nodes[0],n));c++);else if("##cpt"===a.subKind){var l=a.template.view;i=m(l,l.nodes[0],n)}return i||null}throw new Error("TODO findFirstDomNd: "+t.kind)}}(e,t),i=n.position,o=n.nextDomNd,r=n.parentDomNd;return"beforeChild"===i||"lastOnRoot"===i?function(e,t){e.domNode?Re(e.domNode,o,r):e.domNode=r}:"lastChild"===i?function(e,t){e.domNode?Oe(e.domNode,r):e.domNode=r}:function(){console.warn("TODO: VALIDATE VIEW APPEND: ",i),function(e,t,n){void 0===t&&(t="");n&&e.uid!==n||(console.log(""),console.log(Pe),t&&console.log(t+":"),function e(t,n){void 0===n&&(n="");if(!t.nodes)return void console.log(""+n+t.uid+" - no nodes");var i=t.parentView?t.parentView.uid:"XX",o=t.projectionHost,r=o?" >>> projection host: "+o.hostNode.uid+" in "+o.view.uid:"";console.log(n+"*"+t.uid+"* cm:"+t.cm+" isTemplate:"+(void 0!==t.template)+" parentView:"+i+r);for(var a,s=t.nodes.length,d="",c=0;s>c;c++)if(a=t.nodes[c])if(d=a.uid.length<5?["     ","    ","   ","  "," "][a.uid.length]:"","#container"===a.kind){var l=a,f=l.domNode?l.domNode.uid:"XX";if(console.log(n+"["+c+"] "+a.uid+d+" "+f+" attached:"+(a.attached?1:0)+" parent:"+y(a.parentIdx)+" nextSibling:"+(a.nextSibling?a.nextSibling.uid:"X")),"##block"===l.subKind){var u=l,p=u.views.length;if(p)for(var v=0;p>v;v++)if(u.views[v]){var h=u.views[v];f=h.rootDomNode?h.rootDomNode.$uid:"XX",console.log(n+"  - view #"+v),e(u.views[v],"    "+n)}else console.log(n+"  - view #"+v+" UNDEFINED");else console.log(n+"  - no child views")}else if("##cpt"===l.subKind){var m=l,g=m.template,w=m.contentView;w?(console.log(n+"  - light DOM:"),e(w,"    "+n)):console.log(n+"  - light DOM: none"),g?(console.log(n+"  - shadow DOM:"),e(g.view,"    "+n)):console.log(n+"  - no template")}else console.log(n+"  - "+l.subKind+" container")}else{f=a.domNode?a.domNode.uid:"XX";var b="";if(a.domNode&&"#text"===a.kind)b=" text=#"+a.domNode._textContent+"#";else if("#fragment"===a.kind||"#element"===a.kind){for(var N=[],x=a.firstChild;x;)N.push(x.uid),x=x.nextSibling;b=" children:["+N.join(", ")+"]";var C=a.contentView;C&&(b+=" >>> content view: "+C.uid)}console.log(n+"["+a.idx+"] "+a.uid+d+" "+f+" attached:"+(a.attached?1:0)+" parent:"+y(a.parentIdx)+" nextSibling:"+(a.nextSibling?a.nextSibling.uid:"X")+b)}else console.log(n+"["+c+"] XX");function y(e){return e<0?"X":e}}(e))}(e,"getViewInsertFunction for "+t.uid)}}function re(e,t,n){var i=e.nodes[t];if(i&&"##block"===i.subKind){var o=i,r=o.lastRefresh;if(n||r===e.lastRefresh){var a=o.views.length;if(!n){if(a!==o.previousNbrOfViews)for(var s=o.viewPool,d=s.length,c=void 0,l=0;d>l;l++)Ce(c=s[l],c.nodes[0]);o.previousNbrOfViews=a}}else Ce(e,o)}}function ae(e,t,n){if(!e.attached){if(t(e,!0),e.attached=!0,"#fragment"===e.kind)for(var i=e.firstChild;i;)ae(i,t),i=i.nextSibling;else if("#container"===e.kind){var o=e.subKind;if("##cpt"===o){var r=e.template,a=r?r.view.nodes[0]:null;r&&(r.forceRefresh=!0),a&&ae(a,t)}else if("##block"===o)for(var s=e.views,d=0;s.length>d;d++)ae(s[d].nodes[0],t)}if("#fragment"===e.kind||"#element"===e.kind){var c=e.contentView;c&&ae(c.nodes[0],t)}}}function se(e,t,n){if(n)for(var i=n.length,o=0;i>o;o++)re(e,n[o],e.cm);e.cm&&(e.cm=!1,e.cmAppends=null)}function de(e,t,n,i,o,r,a,s,d){if(t){var c=e.createElement(o);if(s)for(var l=s.length,f=0;l>f;f+=2)c.setAttribute(s[f],s[f+1]);if(d){l=d.length;for(var u=0;l>u;u+=2)c[d[u]]=d[u+1]}var p={kind:"#element",uid:"elt"+ ++j,idx:n,parentIdx:-1,ns:"",domNode:c,attached:!0,nextSibling:void 0,firstChild:void 0,lastChild:void 0,contentView:null};e.nodes[n]=p,Y(e,c,a),e.cmAppends[i](p,!1),r&&(e.cmAppends[i+1]=function(e,t){e.domNode?Oe(e.domNode,c):e.domNode=c,t||ce(p,e)})}else a&&Y(e,e.nodes[n].domNode,a)}function ce(e,t){e.firstChild?(e.lastChild.nextSibling=t,e.lastChild=t):(e.firstChild=e.lastChild=t,t.nextSibling=void 0),t.parentIdx=e.idx}function le(e,t,n,i,o,r,a,s){for(var d,c=[],l=8;l<arguments.length;l++)c[l-8]=arguments[l];if(s){var f=void 0,u=void 0,p=!1;f=t?a.slice(0):(d=e.nodes[i]).pieces;for(var v=0;s>v;v++)(u=pe(e,n,c[v]))!==Q&&(p=!0,f[1+2*v]=null==u?"":u);if(!t)return p&&(d.domNode.textContent=f.join("")),void Y(e,d.domNode,r);d=h(e.doc.createTextNode(f.join("")),f),Y(e,d.domNode,r)}else{if(!t)return void(r&&Y(e,e.nodes[i].domNode,r));d=h(e.doc.createTextNode(a),void 0),Y(e,d.domNode,r)}function h(e,t){return{kind:"#text",uid:"txt"+ ++j,domNode:e,attached:!0,idx:i,parentIdx:-1,pieces:t,nextSibling:void 0}}e.nodes[i]=d,e.cmAppends[o](d,!1)}function fe(e,t,n,i,o,r,a,s){for(var d=[],c=8;c<arguments.length;c++)d[c-8]=arguments[c];for(var l=[e,t,n,i,o,r,a,s],f=0;s>f;f++)l.push(d[f]);ne(e,le,l)}function ue(e,t,n){if(e.expressions){var i=e.expressions;if(i.length>t&&i[t]===n)return Q;i[t]=n}else e.expressions=[],e.expressions[t]=n;return n}function pe(e,t,n){if(t){if(n[2]){var i=e.oExpressions;return i[2*n[0]]?Q:(i[2*n[0]]=1,n[1])}return ue(e,n[0],n[1])}return n}function ve(e,t,n,i){if(t){var o={kind:"#fragment",uid:"fra"+ ++j,idx:n,parentIdx:-1,ns:"",domNode:void 0,attached:!0,nextSibling:void 0,firstChild:void 0,lastChild:void 0,contentView:null};e.nodes[n]=o;var r=e.cmAppends[i];r(o,!1),e.cmAppends[i+1]=function(e,t){r(e,!0),t||ce(o,e)}}}function he(e,t,n,i,o){if(t){var r=function(e,t,n){var i;if(1===n)i={kind:"#container",subKind:"##block",uid:"cnb"+ ++j,idx:e,parentIdx:-1,ns:"",domNode:void 0,attached:!0,nextSibling:void 0,views:[],viewPool:[],cmAppend:t,lastRefresh:0,previousNbrOfViews:0,insertFn:null};else{if(2!==n)return console.warn("TODO: new cnt type"),null;i={kind:"#container",subKind:"##cpt",uid:"cnc"+ ++j,idx:e,parentIdx:-1,ns:"",domNode:void 0,attached:!0,nextSibling:void 0,cmAppend:t,cptRef:null,template:null,data:null,contentView:null,dynamicParams:void 0}}return i}(n,null,o);return e.nodes[n]=r,function(e,t,n){if(e.cmAppends){var i=e.cmAppends[n];i?(t.cmAppend=function(e,t){i(e,!0)},i(t,!1)):console.log("ERROR?",i===T)}}(e,r,i),r}}function me(e,t,n,i,o,r,a,s,d,c){var l;n=n||0,t?l=e.nodes[i]||he(e,t,i,o,2):(l=e.nodes[i]).lists&&(l.lists.sizes={});var f=pe(e,n,r);if(l.template){if(f!==Q&&l.cptRef!==f){var u=l.data;l.template.dispose(!0),g();var p=l.data;for(var v in u)if(u.hasOwnProperty(v)&&v.match(X)){var m=RegExp.$1;h(p,m)&&(p[m]=u[m])}}}else{if(f===Q)return void E(e,"Invalid component ref");g()}function g(){var t=l.template=f();l.cptRef=f,G(t.view,e,l),t.disconnectObserver(),l.data=t.api,function(t){if(d){var n=d.length;if(!t&&n)E(e,"Invalid parameter: "+d[0]);else for(var i=0;n>i;i+=2)h(t,d[i])?t[d[i]]=d[i+1]:E(e,"Invalid parameter: "+d[i])}}(t.api)}c&&(l.dynamicParams={}),0===n&&a&&ge(e,i,l,s,c)}function ge(e,t,n,i,o){var r=(n=n||e.nodes[t])?n.template:void 0;if(void 0!==r){if(r.view.lastRefresh=e.lastRefresh-1,function(e){if(e.lists)for(var t=e.lists,n=t.listNames,i=void 0,o=void 0,r=void 0,a=void 0,s=0;n.length>s;s++)i=n[s],o=t.sizes[i]||0,r=e.data[i],a=r.length,o<a&&r.splice(o,a-o)}(n),n.contentView){r.api.$content=n.contentView;var a=n.contentView.instructions;a&&a.length&&(r.forceRefresh=!0)}if(r.view.cm)r.view.cmAppends=[n.cmAppend];else{if(o)for(var s=o.length,d=(n?n.dynamicParams:{})||{},c=r.api,l=0;s>l;l++)d[o[l]]||N(c,o[l]);var f=r.view.nodes[0];if(!f.attached)r.forceRefresh=!0,ae(f,oe(e,n))}i&&Y(e,r.api,i),r.render()}}function we(e,t,n,i,o,r){if(r!==Q){var a=pe(e,n,r);if(a!==Q){var s=e.nodes[i],d=s.kind;if("#container"===d){var c=s.data;(function(e,t,n,i,o){if(i&&(!e.cm||h(i,o)))return!0;var r="";n.template&&(r=" on <*"+n.template.templateName+"/>");return E(e,"Invalid parameter '"+o+"'"+r),!1})(e,0,s,c,o)&&(c[o]=a)}else if("#param"===d)!function(e,t,n,i,o){if(0===o){if(n.dataHolder)return n.dataHolder[n.dataName]=i,n.dataHolder}else{if(n.data)return t&&!h(n.data,o)&&E(e,"Invalid param node parameter: "+o),n.data[o]=i,n.data;E(e,"Invalid param node parameter: "+o)}}(e,t,s,a,o);else if("#decorator"===d){var l=s;t&&!function(e,t,n){if(!h(t.api,n))return E(e,"Invalid decorator parameter '"+n+"' on "+t.refName),!1;return!0}(e,l,o)||(l.api[o]=a)}}}}function be(e,t,n,i,o,r,a,s){if(t){var d=e.nodes[i];if("#element"===d.kind){var c=d.domNode;if(!c)return void E(e,"Cannot set "+o+" event listener: undefined DOM node");var l=p(c);a&&!1!==(s=s||{}).passive&&(s.passive=!0),c.addEventListener(o,(function(e){l.callback&&l.callback(e)}),s)}else if("#container"===d.kind){var f=d.template;f?u(f.api,!1):E(e,"Cannot set "+o+" event listener: undefined component template")}else"#param"===d.kind?u(d.data,!0):"#decorator"===d.kind&&u(d.api,!0)}else e.nodes[n].callback=r;function u(t,n){if(t&&h(t,o+"Emitter")){var i=t[o+"Emitter"];if(i.addListener&&"function"==typeof i.addListener){var r=p(null);i.addListener((function(e){r.callback&&r.callback(e)})),n&&"function"==typeof i.init&&i.init(o,t)}else E(e,"Invalid event emitter for: "+o)}else E(e,"Unsupported event: "+o)}function p(t){var o={kind:"#listener",uid:"evt"+ ++j,idx:n,parentIdx:i,nextSibling:void 0,domNode:t,attached:!0,callback:r};return e.nodes[n]=o,o}}function Ne(e,t,n,i,o){var r,a=e.nodes[n];if(1===o)if(i[M]){if(h(i,F)){var s=i[F];s!==T&&(r=s.$content)}}else h(i,"$content")&&(r=i.$content);else r=pe(e,t,i);if(r!==Q&&void 0!==i||(r=a.contentView),r){var d=r.projectionHost;if(d&&d.hostNode!==a&&Ce(r,r.nodes[0]),a.contentView&&a.contentView!==r&&Ce(a.contentView,a.contentView.nodes[0]),a.contentView=r,r.projectionHost={view:e,hostNode:a},r.cm)if("#element"===a.kind){var c=a.domNode;r.cmAppends=[function(e){e.domNode?Oe(e.domNode,a.domNode):e.domNode=c}]}else r.cmAppends=[oe(e,a)];else{var l=void 0,f=!1;if(r.domNode!==T&&null!==r.nodes&&r.domNode.nodeType===S&&(Oe(r.nodes[0].domNode,a.domNode),function(e,t,n){if(!e||e.cm||!e.nodes||!e.nodes.length)return;n===T&&(n=e.domNode);if(n===T||t===n)return;Ie(e,!0,(function(e){return"#view"!==e.kind&&"#fragment"!==e.kind&&"#container"!==e.kind||e.domNode===n&&(e.domNode=t),!0}))}(r,a.domNode),f=!0),!f){if("#element"===a.kind){var u=a.domNode;l=function(e,t){e.domNode?Oe(e.domNode,u):e.domNode=u}}else l=oe(e,a);ae(r.nodes[0],l)}}r.container=a,ie(r)}}function xe(e,t){if(0===t.idx&&e.projectionHost){if(!t.attached)return null;var n=e.projectionHost.hostNode;return"#element"===n.kind?n.domNode:xe(e.projectionHost.view,n)}return 0===t.idx?e.parentView?xe(e.parentView,e.container):e.rootDomNode:e.nodes[t.parentIdx].domNode}function Ce(e,t){if(t&&t.attached)if("#text"===t.kind||"#element"===t.kind){var n=xe(e,t);t.attached=!1,n?n.removeChild(t.domNode):E(e,"Internal error - parent not found for: "+t.uid)}else if("#container"===t.kind){if("##block"===t.subKind){for(var i=t,o=i.views,r=o.length,a=void 0,s=0;r>s;s++)a=o[s].nodes[0],Ce(o[s],a),a.attached=!1,"#container"!==a.kind&&"#fragment"!==a.kind||(a.domNode=void 0);i.views=[],i.previousNbrOfViews=0,i.viewPool=o.concat(i.viewPool)}else if("##cpt"===t.subKind){var d=t.template;a=d.view.nodes[0];Ce(d.view,a),a.attached=!1,"#container"!==a.kind&&"#fragment"!==a.kind||(a.domNode=void 0)}}else if("#fragment"===t.kind){var c=t;if(c.attached=!1,c.contentView)Ce(c.contentView,c.contentView.nodes[0]);else if(c.firstChild)for(var l=c.firstChild;l;)Ce(e,l),l=l.nextSibling;c.domNode=void 0}else"#param"===t.kind?console.warn("TODO removeFromDom for param nodes"):console.warn("RemoveFromDom for "+t.kind)}var ye=function(e){var t=e.prototype;t[n]=!0,t[i]=0},ke=function(e,t){return e||(e=k,t=3),function(n,i){var a="ΔΔ"+i,s=n[o];s||(s=n[o]={}),s[i]=t?1===t?k:A:e,n[a]=void 0,function(e,t,n,i){i&&delete e[t]&&Object.defineProperty(e,t,i)}(n,i,0,{get:function(){return function(e,t,n,i,o){e.ΔComputeDependencies&&(e.ΔComputeDependencies[n]=!0);var r=e[t];(void 0===r||d&&null===r)&&(r=e[t]=!d&&o?o>1?void 0:null:i(),V(e,r));return r}(this,a,i,e,t)},set:function(t){!function(e,t,n,i,o,a){var s=m(i);if(e.ΔComputeDependencies)return void console.error("[Trax] @computed properties must not mutate the Data object when calculated");i&&!s&&o.ΔCreateProxy&&(i=o.ΔCreateProxy(i)||i,s=m(i));var d=!1,c=a[n];g(e)?d=c!==i:c!==i&&(!function e(t){if(!m(t))return;var n=!0;g(t)?n=!1:t.ΔChangeVersion+=1;if(I.register(t),n){var i=t.ΔMd;i&&i.parents&&f(i.parents,(function(t){e(t)}))}}(e),d=!0);d&&(s&&void 0===i&&(i=null),(s||c&&m(c))&&function(e,t,n){(function(e,t){if(t){var n=t.ΔMd;n&&n.parents&&(n.parents=u(n.parents,e))}})(e,t),V(e,n)}(e,c,i),a[n]=i,function(e,t,n,i,o){var a=e?e.ΔMd:void 0;if(a&&a.trackers){var s=e[r]||e;f(a.trackers,(function(e){e(s,t,n,i,o)}))}}(e,"set",t,c,i))}(this,i,a,t,e,this)},enumerable:!0,configurable:!0})}},Ae=y,Ve=x;function De(e,t){return!0===e.prototype[t]}function Oe(e,t,n){t.appendChild(e)}function Re(e,t,n,i){n.insertBefore(e,t)}function Ie(e,t,n){if(e!==T&&null!==e){if(!n(e))return!1;if(null!==e.nodes&&e.nodes.length)for(var i=0,o=e.nodes;i<o.length;i++){if(!r(o[i]))return!1}}return!0;function r(e){var i=e.kind;if("#fragment"===i)return!!n(e)&&Ie(e.contentView,t,n);if("#container"!==i)return n(e);if(!n(e))return!1;var o=e,r=o.subKind;if("##block"===r){var a=o.views;if(null!==a)for(var s=0,d=a;s<d.length;s++){if(!Ie(d[s],t,n))return!1}if(t&&o.viewPool)for(var c=0,l=o.viewPool;c<l.length;c++){if(!Ie(l[c],t,n))return!1}}else if("##cpt"===r){var f=o.template;if(null!==f)return Ie(f.view,t,n)}else"##async"===r&&console.log("TODO: support scanNode for @async block");return!0}}var Pe="-------------------------------------------------------------------------------";var je,$e,Ee,Te=(je={},$e=[" This is page A / count=",""," "],Ee=function(){function n(){}return e([ke(Ae),t("design:type",Number)],n.prototype,"count",void 0),e([ke(),t("design:type",Object)],n.prototype,"$content",void 0),n=e([ye],n)}(),J("pageA","pages/pages.ts",je,(function(e,t,n){var i=n.count,o=(n.$content,Z(e,0,4));ve(e,o,0,0),le(e,o,0,1,1,0,$e,1,ue(e,0,i)),de(e,o,2,1,"br",0),ve(e,o,3,1),Ne(e,0,3,t,1),se(e)}),Ee)),Se=function(){var n={},i=["class","blue"],o=[" This is page B (count=","",") "],r=["class","container"],a=function(){function n(){}return e([ke(Ae),t("design:type",Number)],n.prototype,"count",void 0),e([ke(),t("design:type",Object)],n.prototype,"$content",void 0),n=e([ye],n)}();return J("pageB","pages/pages.ts",n,(function(e,t,n){var a=n.count,s=(n.$content,Z(e,0,3));de(e,s,0,0,"div",1,0,i),le(e,s,0,1,1,0,o,1,ue(e,0,a)),de(e,s,2,1,"div",0,0,r),Ne(e,0,2,t,1),se(e)}),a)}();(function(){var n={},i=["class","page container"],o=[" (main counter=","",") "],r=function(){function n(){this.ΔΔcounter=1}return n.prototype.ΔDefault=function(e){switch(e){case"counter":return 1}return Ve},e([ke(),t("design:type",Object)],n.prototype,"page",void 0),e([ke(),t("design:type",Object)],n.prototype,"counter",void 0),n=e([ye],n)}();return J("main","pages/pages.ts",n,(function(e,t,n){var r,a,s,d=n.page,c=n.counter,l=Z(e,0,12);ve(e,l,0,0),d||(d=t.page=Te),de(e,l,1,1,"button",1),be(e,l,2,1,"click",(function(){return t.page=Te}),1),le(e,l,0,3,2,0," page A ",0),de(e,l,4,1,"button",1),be(e,l,5,4,"click",(function(){return t.page=Se}),1),le(e,l,0,6,2,0," page B ",0),de(e,l,7,1,"button",1),be(e,l,8,7,"click",(function(){return t.counter++}),1),le(e,l,0,9,2,0," + ",0),de(e,l,10,1,"div",1,0,i),me(e,l,0,11,2,ue(e,0,d),0),we(e,l,0,11,"count",ue(e,1,c+1)),a=(r=ee(e,1,11,4,0)).cm,ne(s=r,ve,[s,a,0,0]),function(e,t,n,i,o,r,a,s,d){t&&ne(e,de,[e,t,n,i,o,r,a,s,d])}(r,a,1,1,"b",1),fe(r,a,1,2,2,0," Page content ",0),fe(r,a,1,3,1,0,o,1,[0,c]),function(e,t,n){if(e.paramNode){var i=e.paramNode;i.dataHolder?(ne(e,se,[e,t,n]),i.data&&"#view"!==i.data.kind?i.data?i.data.$content=e:console.warn("TODO: ζendD no data"):i.dataHolder[i.dataName]=e):E(e,"ζendD dataHoler should be defined")}else ne(e,se,[e,t,n])}(r,a),ge(e,11),se(e)}),r)})()().attach(document.body).render()}();