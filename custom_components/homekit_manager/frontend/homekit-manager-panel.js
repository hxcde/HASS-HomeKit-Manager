const q=globalThis,Se=q.ShadowRoot&&(q.ShadyCSS===void 0||q.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,Ve=Symbol(),Te=new WeakMap;let lt=class{constructor(e,t,i){if(this._$cssResult$=!0,i!==Ve)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=e,this.t=t}get styleSheet(){let e=this.o;const t=this.t;if(Se&&e===void 0){const i=t!==void 0&&t.length===1;i&&(e=Te.get(t)),e===void 0&&((this.o=e=new CSSStyleSheet).replaceSync(this.cssText),i&&Te.set(t,e))}return e}toString(){return this.cssText}};const At=r=>new lt(typeof r=="string"?r:r+"",void 0,Ve),$=(r,...e)=>{const t=r.length===1?r[0]:e.reduce((i,s,n)=>i+(a=>{if(a._$cssResult$===!0)return a.cssText;if(typeof a=="number")return a;throw Error("Value passed to 'css' function must be a 'css' function result: "+a+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(s)+r[n+1],r[0]);return new lt(t,r,Ve)},Ct=(r,e)=>{if(Se)r.adoptedStyleSheets=e.map(t=>t instanceof CSSStyleSheet?t:t.styleSheet);else for(const t of e){const i=document.createElement("style"),s=q.litNonce;s!==void 0&&i.setAttribute("nonce",s),i.textContent=t.cssText,r.appendChild(i)}},Pe=Se?r=>r:r=>r instanceof CSSStyleSheet?(e=>{let t="";for(const i of e.cssRules)t+=i.cssText;return At(t)})(r):r;const{is:Ht,defineProperty:Lt,getOwnPropertyDescriptor:St,getOwnPropertyNames:Vt,getOwnPropertySymbols:Mt,getPrototypeOf:Et}=Object,oe=globalThis,Re=oe.trustedTypes,zt=Re?Re.emptyScript:"",Bt=oe.reactiveElementPolyfillSupport,R=(r,e)=>r,ge={toAttribute(r,e){switch(e){case Boolean:r=r?zt:null;break;case Object:case Array:r=r==null?r:JSON.stringify(r)}return r},fromAttribute(r,e){let t=r;switch(e){case Boolean:t=r!==null;break;case Number:t=r===null?null:Number(r);break;case Object:case Array:try{t=JSON.parse(r)}catch{t=null}}return t}},dt=(r,e)=>!Ht(r,e),De={attribute:!0,type:String,converter:ge,reflect:!1,useDefault:!1,hasChanged:dt};Symbol.metadata??=Symbol("metadata"),oe.litPropertyMetadata??=new WeakMap;let E=class extends HTMLElement{static addInitializer(e){this._$Ei(),(this.l??=[]).push(e)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(e,t=De){if(t.state&&(t.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(e)&&((t=Object.create(t)).wrapped=!0),this.elementProperties.set(e,t),!t.noAccessor){const i=Symbol(),s=this.getPropertyDescriptor(e,i,t);s!==void 0&&Lt(this.prototype,e,s)}}static getPropertyDescriptor(e,t,i){const{get:s,set:n}=St(this.prototype,e)??{get(){return this[t]},set(a){this[t]=a}};return{get:s,set(a){const l=s?.call(this);n?.call(this,a),this.requestUpdate(e,l,i)},configurable:!0,enumerable:!0}}static getPropertyOptions(e){return this.elementProperties.get(e)??De}static _$Ei(){if(this.hasOwnProperty(R("elementProperties")))return;const e=Et(this);e.finalize(),e.l!==void 0&&(this.l=[...e.l]),this.elementProperties=new Map(e.elementProperties)}static finalize(){if(this.hasOwnProperty(R("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(R("properties"))){const t=this.properties,i=[...Vt(t),...Mt(t)];for(const s of i)this.createProperty(s,t[s])}const e=this[Symbol.metadata];if(e!==null){const t=litPropertyMetadata.get(e);if(t!==void 0)for(const[i,s]of t)this.elementProperties.set(i,s)}this._$Eh=new Map;for(const[t,i]of this.elementProperties){const s=this._$Eu(t,i);s!==void 0&&this._$Eh.set(s,t)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(e){const t=[];if(Array.isArray(e)){const i=new Set(e.flat(1/0).reverse());for(const s of i)t.unshift(Pe(s))}else e!==void 0&&t.push(Pe(e));return t}static _$Eu(e,t){const i=t.attribute;return i===!1?void 0:typeof i=="string"?i:typeof e=="string"?e.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(e=>this.enableUpdating=e),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(e=>e(this))}addController(e){(this._$EO??=new Set).add(e),this.renderRoot!==void 0&&this.isConnected&&e.hostConnected?.()}removeController(e){this._$EO?.delete(e)}_$E_(){const e=new Map,t=this.constructor.elementProperties;for(const i of t.keys())this.hasOwnProperty(i)&&(e.set(i,this[i]),delete this[i]);e.size>0&&(this._$Ep=e)}createRenderRoot(){const e=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return Ct(e,this.constructor.elementStyles),e}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(e=>e.hostConnected?.())}enableUpdating(e){}disconnectedCallback(){this._$EO?.forEach(e=>e.hostDisconnected?.())}attributeChangedCallback(e,t,i){this._$AK(e,i)}_$ET(e,t){const i=this.constructor.elementProperties.get(e),s=this.constructor._$Eu(e,i);if(s!==void 0&&i.reflect===!0){const n=(i.converter?.toAttribute!==void 0?i.converter:ge).toAttribute(t,i.type);this._$Em=e,n==null?this.removeAttribute(s):this.setAttribute(s,n),this._$Em=null}}_$AK(e,t){const i=this.constructor,s=i._$Eh.get(e);if(s!==void 0&&this._$Em!==s){const n=i.getPropertyOptions(s),a=typeof n.converter=="function"?{fromAttribute:n.converter}:n.converter?.fromAttribute!==void 0?n.converter:ge;this._$Em=s;const l=a.fromAttribute(t,n.type);this[s]=l??this._$Ej?.get(s)??l,this._$Em=null}}requestUpdate(e,t,i,s=!1,n){if(e!==void 0){const a=this.constructor;if(s===!1&&(n=this[e]),i??=a.getPropertyOptions(e),!((i.hasChanged??dt)(n,t)||i.useDefault&&i.reflect&&n===this._$Ej?.get(e)&&!this.hasAttribute(a._$Eu(e,i))))return;this.C(e,t,i)}this.isUpdatePending===!1&&(this._$ES=this._$EP())}C(e,t,{useDefault:i,reflect:s,wrapped:n},a){i&&!(this._$Ej??=new Map).has(e)&&(this._$Ej.set(e,a??t??this[e]),n!==!0||a!==void 0)||(this._$AL.has(e)||(this.hasUpdated||i||(t=void 0),this._$AL.set(e,t)),s===!0&&this._$Em!==e&&(this._$Eq??=new Set).add(e))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(t){Promise.reject(t)}const e=this.scheduleUpdate();return e!=null&&await e,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(const[s,n]of this._$Ep)this[s]=n;this._$Ep=void 0}const i=this.constructor.elementProperties;if(i.size>0)for(const[s,n]of i){const{wrapped:a}=n,l=this[s];a!==!0||this._$AL.has(s)||l===void 0||this.C(s,void 0,n,l)}}let e=!1;const t=this._$AL;try{e=this.shouldUpdate(t),e?(this.willUpdate(t),this._$EO?.forEach(i=>i.hostUpdate?.()),this.update(t)):this._$EM()}catch(i){throw e=!1,this._$EM(),i}e&&this._$AE(t)}willUpdate(e){}_$AE(e){this._$EO?.forEach(t=>t.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(e)),this.updated(e)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(e){return!0}update(e){this._$Eq&&=this._$Eq.forEach(t=>this._$ET(t,this[t])),this._$EM()}updated(e){}firstUpdated(e){}};E.elementStyles=[],E.shadowRootOptions={mode:"open"},E[R("elementProperties")]=new Map,E[R("finalized")]=new Map,Bt?.({ReactiveElement:E}),(oe.reactiveElementVersions??=[]).push("2.1.2");const Me=globalThis,Ne=r=>r,Q=Me.trustedTypes,Ie=Q?Q.createPolicy("lit-html",{createHTML:r=>r}):void 0,ct="$lit$",k=`lit$${Math.random().toFixed(9).slice(2)}$`,ht="?"+k,Ot=`<${ht}>`,V=document,N=()=>V.createComment(""),I=r=>r===null||typeof r!="object"&&typeof r!="function",Ee=Array.isArray,Tt=r=>Ee(r)||typeof r?.[Symbol.iterator]=="function",ce=`[ 	
\f\r]`,P=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,Fe=/-->/g,Ke=/>/g,L=RegExp(`>|${ce}(?:([^\\s"'>=/]+)(${ce}*=${ce}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`,"g"),Ue=/'/g,Ze=/"/g,pt=/^(?:script|style|textarea|title)$/i,ut=r=>(e,...t)=>({_$litType$:r,strings:e,values:t}),o=ut(1),Pt=ut(2),B=Symbol.for("lit-noChange"),c=Symbol.for("lit-nothing"),je=new WeakMap,S=V.createTreeWalker(V,129);function gt(r,e){if(!Ee(r)||!r.hasOwnProperty("raw"))throw Error("invalid template strings array");return Ie!==void 0?Ie.createHTML(e):e}const Rt=(r,e)=>{const t=r.length-1,i=[];let s,n=e===2?"<svg>":e===3?"<math>":"",a=P;for(let l=0;l<t;l++){const p=r[l];let d,g,u=-1,_=0;for(;_<p.length&&(a.lastIndex=_,g=a.exec(p),g!==null);)_=a.lastIndex,a===P?g[1]==="!--"?a=Fe:g[1]!==void 0?a=Ke:g[2]!==void 0?(pt.test(g[2])&&(s=RegExp("</"+g[2],"g")),a=L):g[3]!==void 0&&(a=L):a===L?g[0]===">"?(a=s??P,u=-1):g[1]===void 0?u=-2:(u=a.lastIndex-g[2].length,d=g[1],a=g[3]===void 0?L:g[3]==='"'?Ze:Ue):a===Ze||a===Ue?a=L:a===Fe||a===Ke?a=P:(a=L,s=void 0);const f=a===L&&r[l+1].startsWith("/>")?" ":"";n+=a===P?p+Ot:u>=0?(i.push(d),p.slice(0,u)+ct+p.slice(u)+k+f):p+k+(u===-2?l:f)}return[gt(r,n+(r[t]||"<?>")+(e===2?"</svg>":e===3?"</math>":"")),i]};class F{constructor({strings:e,_$litType$:t},i){let s;this.parts=[];let n=0,a=0;const l=e.length-1,p=this.parts,[d,g]=Rt(e,t);if(this.el=F.createElement(d,i),S.currentNode=this.el.content,t===2||t===3){const u=this.el.content.firstChild;u.replaceWith(...u.childNodes)}for(;(s=S.nextNode())!==null&&p.length<l;){if(s.nodeType===1){if(s.hasAttributes())for(const u of s.getAttributeNames())if(u.endsWith(ct)){const _=g[a++],f=s.getAttribute(u).split(k),H=/([.?@])?(.*)/.exec(_);p.push({type:1,index:n,name:H[2],strings:f,ctor:H[1]==="."?Nt:H[1]==="?"?It:H[1]==="@"?Ft:le}),s.removeAttribute(u)}else u.startsWith(k)&&(p.push({type:6,index:n}),s.removeAttribute(u));if(pt.test(s.tagName)){const u=s.textContent.split(k),_=u.length-1;if(_>0){s.textContent=Q?Q.emptyScript:"";for(let f=0;f<_;f++)s.append(u[f],N()),S.nextNode(),p.push({type:2,index:++n});s.append(u[_],N())}}}else if(s.nodeType===8)if(s.data===ht)p.push({type:2,index:n});else{let u=-1;for(;(u=s.data.indexOf(k,u+1))!==-1;)p.push({type:7,index:n}),u+=k.length-1}n++}}static createElement(e,t){const i=V.createElement("template");return i.innerHTML=e,i}}function O(r,e,t=r,i){if(e===B)return e;let s=i!==void 0?t._$Co?.[i]:t._$Cl;const n=I(e)?void 0:e._$litDirective$;return s?.constructor!==n&&(s?._$AO?.(!1),n===void 0?s=void 0:(s=new n(r),s._$AT(r,t,i)),i!==void 0?(t._$Co??=[])[i]=s:t._$Cl=s),s!==void 0&&(e=O(r,s._$AS(r,e.values),s,i)),e}class Dt{constructor(e,t){this._$AV=[],this._$AN=void 0,this._$AD=e,this._$AM=t}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(e){const{el:{content:t},parts:i}=this._$AD,s=(e?.creationScope??V).importNode(t,!0);S.currentNode=s;let n=S.nextNode(),a=0,l=0,p=i[0];for(;p!==void 0;){if(a===p.index){let d;p.type===2?d=new U(n,n.nextSibling,this,e):p.type===1?d=new p.ctor(n,p.name,p.strings,this,e):p.type===6&&(d=new Kt(n,this,e)),this._$AV.push(d),p=i[++l]}a!==p?.index&&(n=S.nextNode(),a++)}return S.currentNode=V,s}p(e){let t=0;for(const i of this._$AV)i!==void 0&&(i.strings!==void 0?(i._$AI(e,i,t),t+=i.strings.length-2):i._$AI(e[t])),t++}}class U{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(e,t,i,s){this.type=2,this._$AH=c,this._$AN=void 0,this._$AA=e,this._$AB=t,this._$AM=i,this.options=s,this._$Cv=s?.isConnected??!0}get parentNode(){let e=this._$AA.parentNode;const t=this._$AM;return t!==void 0&&e?.nodeType===11&&(e=t.parentNode),e}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(e,t=this){e=O(this,e,t),I(e)?e===c||e==null||e===""?(this._$AH!==c&&this._$AR(),this._$AH=c):e!==this._$AH&&e!==B&&this._(e):e._$litType$!==void 0?this.$(e):e.nodeType!==void 0?this.T(e):Tt(e)?this.k(e):this._(e)}O(e){return this._$AA.parentNode.insertBefore(e,this._$AB)}T(e){this._$AH!==e&&(this._$AR(),this._$AH=this.O(e))}_(e){this._$AH!==c&&I(this._$AH)?this._$AA.nextSibling.data=e:this.T(V.createTextNode(e)),this._$AH=e}$(e){const{values:t,_$litType$:i}=e,s=typeof i=="number"?this._$AC(e):(i.el===void 0&&(i.el=F.createElement(gt(i.h,i.h[0]),this.options)),i);if(this._$AH?._$AD===s)this._$AH.p(t);else{const n=new Dt(s,this),a=n.u(this.options);n.p(t),this.T(a),this._$AH=n}}_$AC(e){let t=je.get(e.strings);return t===void 0&&je.set(e.strings,t=new F(e)),t}k(e){Ee(this._$AH)||(this._$AH=[],this._$AR());const t=this._$AH;let i,s=0;for(const n of e)s===t.length?t.push(i=new U(this.O(N()),this.O(N()),this,this.options)):i=t[s],i._$AI(n),s++;s<t.length&&(this._$AR(i&&i._$AB.nextSibling,s),t.length=s)}_$AR(e=this._$AA.nextSibling,t){for(this._$AP?.(!1,!0,t);e!==this._$AB;){const i=Ne(e).nextSibling;Ne(e).remove(),e=i}}setConnected(e){this._$AM===void 0&&(this._$Cv=e,this._$AP?.(e))}}class le{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(e,t,i,s,n){this.type=1,this._$AH=c,this._$AN=void 0,this.element=e,this.name=t,this._$AM=s,this.options=n,i.length>2||i[0]!==""||i[1]!==""?(this._$AH=Array(i.length-1).fill(new String),this.strings=i):this._$AH=c}_$AI(e,t=this,i,s){const n=this.strings;let a=!1;if(n===void 0)e=O(this,e,t,0),a=!I(e)||e!==this._$AH&&e!==B,a&&(this._$AH=e);else{const l=e;let p,d;for(e=n[0],p=0;p<n.length-1;p++)d=O(this,l[i+p],t,p),d===B&&(d=this._$AH[p]),a||=!I(d)||d!==this._$AH[p],d===c?e=c:e!==c&&(e+=(d??"")+n[p+1]),this._$AH[p]=d}a&&!s&&this.j(e)}j(e){e===c?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,e??"")}}class Nt extends le{constructor(){super(...arguments),this.type=3}j(e){this.element[this.name]=e===c?void 0:e}}class It extends le{constructor(){super(...arguments),this.type=4}j(e){this.element.toggleAttribute(this.name,!!e&&e!==c)}}class Ft extends le{constructor(e,t,i,s,n){super(e,t,i,s,n),this.type=5}_$AI(e,t=this){if((e=O(this,e,t,0)??c)===B)return;const i=this._$AH,s=e===c&&i!==c||e.capture!==i.capture||e.once!==i.once||e.passive!==i.passive,n=e!==c&&(i===c||s);s&&this.element.removeEventListener(this.name,this,i),n&&this.element.addEventListener(this.name,this,e),this._$AH=e}handleEvent(e){typeof this._$AH=="function"?this._$AH.call(this.options?.host??this.element,e):this._$AH.handleEvent(e)}}class Kt{constructor(e,t,i){this.element=e,this.type=6,this._$AN=void 0,this._$AM=t,this.options=i}get _$AU(){return this._$AM._$AU}_$AI(e){O(this,e)}}const Ut=Me.litHtmlPolyfillSupport;Ut?.(F,U),(Me.litHtmlVersions??=[]).push("3.3.3");const Zt=(r,e,t)=>{const i=t?.renderBefore??e;let s=i._$litPart$;if(s===void 0){const n=t?.renderBefore??null;i._$litPart$=s=new U(e.insertBefore(N(),n),n,void 0,t??{})}return s._$AI(r),s};const ze=globalThis;class b extends E{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){const e=super.createRenderRoot();return this.renderOptions.renderBefore??=e.firstChild,e}update(e){const t=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(e),this._$Do=Zt(t,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return B}}b._$litElement$=!0,b.finalized=!0,ze.litElementHydrateSupport?.({LitElement:b});const jt=ze.litElementPolyfillSupport;jt?.({LitElement:b});(ze.litElementVersions??=[]).push("4.2.2");var Gt="M16 17V19H2V17S2 13 9 13 16 17 16 17M12.5 7.5A3.5 3.5 0 1 0 9 11A3.5 3.5 0 0 0 12.5 7.5M15.94 13A5.32 5.32 0 0 1 18 17V19H22V17S22 13.37 15.94 13M15 4A3.39 3.39 0 0 0 13.07 4.59A5 5 0 0 1 13.07 10.41A3.39 3.39 0 0 0 15 11A3.5 3.5 0 0 0 15 4Z",Wt="M19,18.31V20A2,2 0 0,1 17,22H7A2,2 0 0,1 5,20V16.3C4.54,16.12 3.95,16 3,16A1,1 0 0,1 2,15A1,1 0 0,1 3,14C3.82,14 4.47,14.08 5,14.21V12.3C4.54,12.12 3.95,12 3,12A1,1 0 0,1 2,11A1,1 0 0,1 3,10C3.82,10 4.47,10.08 5,10.21V8.3C4.54,8.12 3.95,8 3,8A1,1 0 0,1 2,7A1,1 0 0,1 3,6C3.82,6 4.47,6.08 5,6.21V4A2,2 0 0,1 7,2H17A2,2 0 0,1 19,4V6.16C20.78,6.47 21.54,7.13 21.71,7.29C22.1,7.68 22.1,8.32 21.71,8.71C21.32,9.1 20.8,9.09 20.29,8.71V8.71C20.29,8.71 19.25,8 17,8C15.74,8 14.91,8.41 13.95,8.9C12.91,9.41 11.74,10 10,10C9.64,10 9.31,10 9,9.96V7.95C9.3,8 9.63,8 10,8C11.26,8 12.09,7.59 13.05,7.11C14.09,6.59 15.27,6 17,6V4H7V20H17V18C18.5,18 18.97,18.29 19,18.31M17,10C15.27,10 14.09,10.59 13.05,11.11C12.09,11.59 11.26,12 10,12C9.63,12 9.3,12 9,11.95V13.96C9.31,14 9.64,14 10,14C11.74,14 12.91,13.41 13.95,12.9C14.91,12.42 15.74,12 17,12C19.25,12 20.29,12.71 20.29,12.71V12.71C20.8,13.1 21.32,13.1 21.71,12.71C22.1,12.32 22.1,11.69 21.71,11.29C21.5,11.08 20.25,10 17,10M17,14C15.27,14 14.09,14.59 13.05,15.11C12.09,15.59 11.26,16 10,16C9.63,16 9.3,16 9,15.95V17.96C9.31,18 9.64,18 10,18C11.74,18 12.91,17.41 13.95,16.9C14.91,16.42 15.74,16 17,16C19.25,16 20.29,16.71 20.29,16.71V16.71C20.8,17.1 21.32,17.1 21.71,16.71C22.1,16.32 22.1,15.69 21.71,15.29C21.5,15.08 20.25,14 17,14Z",qt="M6,6.9L3.87,4.78L5.28,3.37L7.4,5.5L6,6.9M13,1V4H11V1H13M20.13,4.78L18,6.9L16.6,5.5L18.72,3.37L20.13,4.78M4.5,10.5V12.5H1.5V10.5H4.5M19.5,10.5H22.5V12.5H19.5V10.5M6,20H18A2,2 0 0,1 20,22H4A2,2 0 0,1 6,20M12,5A6,6 0 0,1 18,11V19H6V11A6,6 0 0,1 12,5Z",Yt="M11,15H13V17H11V15M11,7H13V13H11V7M12,2C6.47,2 2,6.5 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20Z",_e="M12,2L1,21H23M12,6L19.53,19H4.47M11,10V14H13V10M11,16V18H13V16",Jt="M20,11V13H8L13.5,18.5L12.08,19.92L4.16,12L12.08,4.08L13.5,5.5L8,11H20Z",me="M7.5,5.6L5,7L6.4,4.5L5,2L7.5,3.4L10,2L8.6,4.5L10,7L7.5,5.6M19.5,15.4L22,14L20.6,16.5L22,19L19.5,17.6L17,19L18.4,16.5L17,14L19.5,15.4M22,2L20.6,4.5L22,7L19.5,5.6L17,7L18.4,4.5L17,2L19.5,3.4L22,2M13.34,12.78L15.78,10.34L13.66,8.22L11.22,10.66L13.34,12.78M14.37,7.29L16.71,9.63C17.1,10 17.1,10.65 16.71,11.04L5.04,22.71C4.65,23.1 4,23.1 3.63,22.71L1.29,20.37C0.9,20 0.9,19.35 1.29,18.96L12.96,7.29C13.35,6.9 14,6.9 14.37,7.29Z",Qt="M16 20H8V6H16M16.67 4H15V2H9V4H7.33C6.6 4 6 4.6 6 5.33V20.67C6 21.4 6.6 22 7.33 22H16.67C17.41 22 18 21.41 18 20.67V5.33C18 4.6 17.4 4 16.67 4M15 16H9V19H15V16M15 7H9V10H15V7M15 11.5H9V14.5H15V11.5Z",_t="M20 19V3H4V19H2V21H22V19H20M16 9H18V11H16V9M14 11H6V9H14V11M18 7H16V5H18V7M14 5V7H6V5H14M6 19V13H14V14.82C13.55 15.14 13.25 15.66 13.25 16.25C13.25 17.22 14.03 18 15 18S16.75 17.22 16.75 16.25C16.75 15.66 16.45 15.13 16 14.82V13H18V19H6Z",Xt="M6.03 12.03L8.03 15.5L5.5 18.68L2 12.62L6.03 12.03M17 18V15.29C17.88 14.9 18.5 14.03 18.5 13C18.5 12.43 18.3 11.9 17.97 11.5L19.94 10.35C20.95 9.76 21.3 8.47 20.71 7.46L19.33 5.06C18.74 4.05 17.45 3.7 16.44 4.28L8.31 9C7.36 9.53 7.03 10.75 7.58 11.71L9.08 14.31C9.63 15.26 10.86 15.59 11.81 15.04L13.69 13.96C13.94 14.55 14.41 15.03 15 15.29V18C15 19.1 15.9 20 17 20H22V18H17Z",ei="M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z",ti="M12 2C6.5 2 2 6.5 2 12S6.5 22 12 22 22 17.5 22 12 17.5 2 12 2M10 17L5 12L6.41 10.59L10 14.17L17.59 6.58L19 8L10 17Z",ii="M20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4C12.76,4 13.5,4.11 14.2,4.31L15.77,2.74C14.61,2.26 13.34,2 12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12M7.91,10.08L6.5,11.5L11,16L21,6L19.59,4.58L11,13.17L7.91,10.08Z",si="M7.41,8.58L12,13.17L16.59,8.58L18,10L12,16L6,10L7.41,8.58Z",Ge="M8.59,16.58L13.17,12L8.59,7.41L10,6L16,12L10,18L8.59,16.58Z",Y="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z",j="M12,15.5A3.5,3.5 0 0,1 8.5,12A3.5,3.5 0 0,1 12,8.5A3.5,3.5 0 0,1 15.5,12A3.5,3.5 0 0,1 12,15.5M19.43,12.97C19.47,12.65 19.5,12.33 19.5,12C19.5,11.67 19.47,11.34 19.43,11L21.54,9.37C21.73,9.22 21.78,8.95 21.66,8.73L19.66,5.27C19.54,5.05 19.27,4.96 19.05,5.05L16.56,6.05C16.04,5.66 15.5,5.32 14.87,5.07L14.5,2.42C14.46,2.18 14.25,2 14,2H10C9.75,2 9.54,2.18 9.5,2.42L9.13,5.07C8.5,5.32 7.96,5.66 7.44,6.05L4.95,5.05C4.73,4.96 4.46,5.05 4.34,5.27L2.34,8.73C2.21,8.95 2.27,9.22 2.46,9.37L4.57,11C4.53,11.34 4.5,11.67 4.5,12C4.5,12.33 4.53,12.65 4.57,12.97L2.46,14.63C2.27,14.78 2.21,15.05 2.34,15.27L4.34,18.73C4.46,18.95 4.73,19.03 4.95,18.95L7.44,17.94C7.96,18.34 8.5,18.68 9.13,18.93L9.5,21.58C9.54,21.82 9.75,22 10,22H14C14.25,22 14.46,21.82 14.5,21.58L14.87,18.93C15.5,18.67 16.04,18.34 16.56,17.94L19.05,18.95C19.27,19.03 19.54,18.95 19.66,18.73L21.66,15.27C21.78,15.05 21.73,14.78 21.54,14.63L19.43,12.97Z",We="M19,21H8V7H19M19,5H8A2,2 0 0,0 6,7V21A2,2 0 0,0 8,23H19A2,2 0 0,0 21,21V7A2,2 0 0,0 19,5M16,1H4A2,2 0 0,0 2,3V17H4V3H16V1Z",qe="M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19M8,9H16V19H8V9M15.5,4L14.5,3H9.5L8.5,4H5V6H19V4H15.5Z",ni="M16,12A2,2 0 0,1 18,10A2,2 0 0,1 20,12A2,2 0 0,1 18,14A2,2 0 0,1 16,12M10,12A2,2 0 0,1 12,10A2,2 0 0,1 14,12A2,2 0 0,1 12,14A2,2 0 0,1 10,12M4,12A2,2 0 0,1 6,10A2,2 0 0,1 8,12A2,2 0 0,1 6,14A2,2 0 0,1 4,12Z",ri="M12,11A1,1 0 0,0 11,12A1,1 0 0,0 12,13A1,1 0 0,0 13,12A1,1 0 0,0 12,11M12.5,2C17,2 17.11,5.57 14.75,6.75C13.76,7.24 13.32,8.29 13.13,9.22C13.61,9.42 14.03,9.73 14.35,10.13C18.05,8.13 22.03,8.92 22.03,12.5C22.03,17 18.46,17.1 17.28,14.73C16.78,13.74 15.72,13.3 14.79,13.11C14.59,13.59 14.28,14 13.88,14.34C15.87,18.03 15.08,22 11.5,22C7,22 6.91,18.42 9.27,17.24C10.25,16.75 10.69,15.71 10.89,14.79C10.4,14.59 9.97,14.27 9.65,13.87C5.96,15.85 2,15.07 2,11.5C2,7 5.56,6.89 6.74,9.26C7.24,10.25 8.29,10.68 9.22,10.87C9.41,10.39 9.73,9.97 10.14,9.65C8.15,5.96 8.94,2 12.5,2Z",ai="M7,5H21V7H7V5M7,13V11H21V13H7M4,4.5A1.5,1.5 0 0,1 5.5,6A1.5,1.5 0 0,1 4,7.5A1.5,1.5 0 0,1 2.5,6A1.5,1.5 0 0,1 4,4.5M4,10.5A1.5,1.5 0 0,1 5.5,12A1.5,1.5 0 0,1 4,13.5A1.5,1.5 0 0,1 2.5,12A1.5,1.5 0 0,1 4,10.5M7,19V17H21V19H7M4,16.5A1.5,1.5 0 0,1 5.5,18A1.5,1.5 0 0,1 4,19.5A1.5,1.5 0 0,1 2.5,18A1.5,1.5 0 0,1 4,16.5Z",mt="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,4A8,8 0 0,1 20,12C20,14.4 19,16.5 17.3,18C15.9,16.7 14,16 12,16C10,16 8.2,16.7 6.7,18C5,16.5 4,14.4 4,12A8,8 0 0,1 12,4M14,5.89C13.62,5.9 13.26,6.15 13.1,6.54L11.81,9.77L11.71,10C11,10.13 10.41,10.6 10.14,11.26C9.73,12.29 10.23,13.45 11.26,13.86C12.29,14.27 13.45,13.77 13.86,12.74C14.12,12.08 14,11.32 13.57,10.76L13.67,10.5L14.96,7.29L14.97,7.26C15.17,6.75 14.92,6.17 14.41,5.96C14.28,5.91 14.15,5.89 14,5.89M10,6A1,1 0 0,0 9,7A1,1 0 0,0 10,8A1,1 0 0,0 11,7A1,1 0 0,0 10,6M7,9A1,1 0 0,0 6,10A1,1 0 0,0 7,11A1,1 0 0,0 8,10A1,1 0 0,0 7,9M17,9A1,1 0 0,0 16,10A1,1 0 0,0 17,11A1,1 0 0,0 18,10A1,1 0 0,0 17,9Z",fe="M12,3L2,12H5V20H19V12H22L12,3M12,8.5C14.34,8.5 16.46,9.43 18,10.94L16.8,12.12C15.58,10.91 13.88,10.17 12,10.17C10.12,10.17 8.42,10.91 7.2,12.12L6,10.94C7.54,9.43 9.66,8.5 12,8.5M12,11.83C13.4,11.83 14.67,12.39 15.6,13.3L14.4,14.47C13.79,13.87 12.94,13.5 12,13.5C11.06,13.5 10.21,13.87 9.6,14.47L8.4,13.3C9.33,12.39 10.6,11.83 12,11.83M12,15.17C12.94,15.17 13.7,15.91 13.7,16.83C13.7,17.75 12.94,18.5 12,18.5C11.06,18.5 10.3,17.75 10.3,16.83C10.3,15.91 11.06,15.17 12,15.17Z",D="M11,9H13V7H11M12,20C7.59,20 4,16.41 4,12C4,7.59 7.59,4 12,4C16.41,4 20,7.59 20,12C20,16.41 16.41,20 12,20M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M11,17H13V11H11V17Z",oi="M16,17H5V7H16L19.55,12M17.63,5.84C17.27,5.33 16.67,5 16,5H5A2,2 0 0,0 3,7V17A2,2 0 0,0 5,19H16C16.67,19 17.27,18.66 17.63,18.15L22,12L17.63,5.84Z",ft="M12,2A7,7 0 0,0 5,9C5,11.38 6.19,13.47 8,14.74V17A1,1 0 0,0 9,18H15A1,1 0 0,0 16,17V14.74C17.81,13.47 19,11.38 19,9A7,7 0 0,0 12,2M9,21A1,1 0 0,0 10,22H14A1,1 0 0,0 15,21V20H9V21Z",Ye="M2,5.27L3.28,4L20,20.72L18.73,22L13.9,17.17L11.29,19.78C9.34,21.73 6.17,21.73 4.22,19.78C2.27,17.83 2.27,14.66 4.22,12.71L5.71,11.22C5.7,12.04 5.83,12.86 6.11,13.65L5.64,14.12C4.46,15.29 4.46,17.19 5.64,18.36C6.81,19.54 8.71,19.54 9.88,18.36L12.5,15.76L10.88,14.15C10.87,14.39 10.77,14.64 10.59,14.83C10.2,15.22 9.56,15.22 9.17,14.83C8.12,13.77 7.63,12.37 7.72,11L2,5.27M12.71,4.22C14.66,2.27 17.83,2.27 19.78,4.22C21.73,6.17 21.73,9.34 19.78,11.29L18.29,12.78C18.3,11.96 18.17,11.14 17.89,10.36L18.36,9.88C19.54,8.71 19.54,6.81 18.36,5.64C17.19,4.46 15.29,4.46 14.12,5.64L10.79,8.97L9.38,7.55L12.71,4.22M13.41,9.17C13.8,8.78 14.44,8.78 14.83,9.17C16.2,10.54 16.61,12.5 16.06,14.23L14.28,12.46C14.23,11.78 13.94,11.11 13.41,10.59C13,10.2 13,9.56 13.41,9.17Z",bt="M12,17A2,2 0 0,0 14,15C14,13.89 13.1,13 12,13A2,2 0 0,0 10,15A2,2 0 0,0 12,17M18,8A2,2 0 0,1 20,10V20A2,2 0 0,1 18,22H6A2,2 0 0,1 4,20V10C4,8.89 4.9,8 6,8H7V6A5,5 0 0,1 12,1A5,5 0 0,1 17,6V8H18M12,3A3,3 0 0,0 9,6V8H15V6A3,3 0 0,0 12,3Z",be="M9.5,3A6.5,6.5 0 0,1 16,9.5C16,11.11 15.41,12.59 14.44,13.73L14.71,14H15.5L20.5,19L19,20.5L14,15.5V14.71L13.73,14.44C12.59,15.41 11.11,16 9.5,16A6.5,6.5 0 0,1 3,9.5A6.5,6.5 0 0,1 9.5,3M9.5,5C7,5 5,7 5,9.5C5,12 7,14 9.5,14C12,14 14,12 14,9.5C14,7 12,5 9.5,5Z",li="M14,3V5H17.59L7.76,14.83L9.17,16.24L19,6.41V10H21V3M19,19H5V5H12V3H5C3.89,3 3,3.9 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V12H19V19Z",di="M12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2C17.5,2 22,6 22,11A6,6 0 0,1 16,17H14.2C13.9,17 13.7,17.2 13.7,17.5C13.7,17.6 13.8,17.7 13.8,17.8C14.2,18.3 14.4,18.9 14.4,19.5C14.5,20.9 13.4,22 12,22M12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20C12.3,20 12.5,19.8 12.5,19.5C12.5,19.3 12.4,19.2 12.4,19.1C12,18.6 11.8,18.1 11.8,17.5C11.8,16.1 12.9,15 14.3,15H16A4,4 0 0,0 20,11C20,7.1 16.4,4 12,4M6.5,10C7.3,10 8,10.7 8,11.5C8,12.3 7.3,13 6.5,13C5.7,13 5,12.3 5,11.5C5,10.7 5.7,10 6.5,10M9.5,6C10.3,6 11,6.7 11,7.5C11,8.3 10.3,9 9.5,9C8.7,9 8,8.3 8,7.5C8,6.7 8.7,6 9.5,6M14.5,6C15.3,6 16,6.7 16,7.5C16,8.3 15.3,9 14.5,9C13.7,9 13,8.3 13,7.5C13,6.7 13.7,6 14.5,6M17.5,10C18.3,10 19,10.7 19,11.5C19,12.3 18.3,13 17.5,13C16.7,13 16,12.3 16,11.5C16,10.7 16.7,10 17.5,10Z",G="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z",ci="M4,4H10V10H4V4M20,4V10H14V4H20M14,15H16V13H14V11H16V13H18V11H20V13H18V15H20V18H18V20H16V18H13V20H11V16H14V15M16,15V18H18V15H16M4,20V14H10V20H4M6,6V8H8V6H6M16,6V8H18V6H16M6,16V18H8V16H6M4,11H6V13H4V11M9,11H13V15H11V13H9V11M11,6H13V10H11V6M2,2V6H0V2A2,2 0 0,1 2,0H6V2H2M22,0A2,2 0 0,1 24,2V6H22V2H18V0H22M2,18V22H6V24H2A2,2 0 0,1 0,22V18H2M22,22V18H24V22A2,2 0 0,1 22,24H18V22H22Z",hi="M17.65,6.35C16.2,4.9 14.21,4 12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20C15.73,20 18.84,17.45 19.73,14H17.65C16.83,16.33 14.61,18 12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6C13.66,6 15.14,6.69 16.22,7.78L13,11H20V4L17.65,6.35Z",pi="M9,2C7.89,2 7,2.89 7,4V20C7,21.11 7.89,22 9,22H15C16.11,22 17,21.11 17,20V4C17,2.89 16.11,2 15,2H13V4H11V2H9M11,6H13V8H15V10H13V12H11V10H9V8H11V6M9,14H11V16H9V14M13,14H15V16H13V14M9,18H11V20H9V18M13,18H15V20H13V18Z",Je="M12,4C14.1,4 16.1,4.8 17.6,6.3C20.7,9.4 20.7,14.5 17.6,17.6C15.8,19.5 13.3,20.2 10.9,19.9L11.4,17.9C13.1,18.1 14.9,17.5 16.2,16.2C18.5,13.9 18.5,10.1 16.2,7.7C15.1,6.6 13.5,6 12,6V10.6L7,5.6L12,0.6V4M6.3,17.6C3.7,15 3.3,11 5.1,7.9L6.6,9.4C5.5,11.6 5.9,14.4 7.8,16.2C8.3,16.7 8.9,17.1 9.6,17.4L9,19.4C8,19 7.1,18.4 6.3,17.6Z",vt="M12,2C14.65,2 17.19,3.06 19.07,4.93L17.65,6.35C16.15,4.85 14.12,4 12,4C9.88,4 7.84,4.84 6.35,6.35L4.93,4.93C6.81,3.06 9.35,2 12,2M3.66,6.5L5.11,7.94C4.39,9.17 4,10.57 4,12A8,8 0 0,0 12,20A8,8 0 0,0 20,12C20,10.57 19.61,9.17 18.88,7.94L20.34,6.5C21.42,8.12 22,10.04 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12C2,10.04 2.58,8.12 3.66,6.5M12,6A6,6 0 0,1 18,12C18,13.59 17.37,15.12 16.24,16.24L14.83,14.83C14.08,15.58 13.06,16 12,16C10.94,16 9.92,15.58 9.17,14.83L7.76,16.24C6.63,15.12 6,13.59 6,12A6,6 0 0,1 12,6M12,8A1,1 0 0,0 11,9A1,1 0 0,0 12,10A1,1 0 0,0 13,9A1,1 0 0,0 12,8Z",Qe="M21,11C21,16.55 17.16,21.74 12,23C6.84,21.74 3,16.55 3,11V5L12,1L21,5V11M12,21C15.75,20 19,15.54 19,11.22V6.3L12,3.18L5,6.3V11.22C5,15.54 8.25,20 12,21M10,17L6,13L7.41,11.59L10,14.17L16.59,7.58L18,9",ui="M12,15.39L8.24,17.66L9.23,13.38L5.91,10.5L10.29,10.13L12,6.09L13.71,10.13L18.09,10.5L14.77,13.38L15.76,17.66M22,9.24L14.81,8.63L12,2L9.19,8.63L2,9.24L7.45,13.97L5.82,21L12,17.27L18.18,21L16.54,13.97L22,9.24Z",v="M21,17H3V5H21M21,3H3A2,2 0 0,0 1,5V17A2,2 0 0,0 3,19H8V21H16V19H21A2,2 0 0,0 23,17V5A2,2 0 0,0 21,3Z",yt="M15 13V5A3 3 0 0 0 9 5V13A5 5 0 1 0 15 13M12 4A1 1 0 0 1 13 5V8H11V5A1 1 0 0 1 12 4Z",W="M12 2C6.5 2 2 6.5 2 12S6.5 22 12 22C12.4 22 12.7 22 13.1 21.9L15.4 15.3L14.8 14.7C15.5 14 16 13 16 11.9C16 11.2 15.8 10.5 15.4 9.9L17.6 7.7C18.5 9 19 10.4 19 12H20C20.3 12 20.6 12.1 20.8 12.2C20.8 12.2 20.9 12.2 20.9 12.3C21.3 12.5 21.7 12.9 21.9 13.4C22 12.9 22 12.5 22 12C22 6.5 17.5 2 12 2M14 8.6C13.4 8.2 12.7 8 12 8C9.8 8 8 9.8 8 12C8 13.1 8.4 14.1 9.2 14.8L7.1 16.9C5.8 15.7 5 13.9 5 12C5 8.1 8.1 5 12 5C13.6 5 15 5.5 16.2 6.4L14 8.6M20 14H18L14.8 23H16.7L17.4 21H20.6L21.3 23H23.2L20 14M17.8 19.7L19 16L20.2 19.7H17.8Z",ve="M17 6H7C3.69 6 1 8.69 1 12S3.69 18 7 18H17C20.31 18 23 15.31 23 12S20.31 6 17 6M17 16H7C4.79 16 3 14.21 3 12S4.79 8 7 8H17C19.21 8 21 9.79 21 12S19.21 16 17 16M17 9C15.34 9 14 10.34 14 12S15.34 15 17 15 20 13.66 20 12 18.66 9 17 9Z",he="M8 13C6.14 13 4.59 14.28 4.14 16H2V18H4.14C4.59 19.72 6.14 21 8 21S11.41 19.72 11.86 18H22V16H11.86C11.41 14.28 9.86 13 8 13M8 19C6.9 19 6 18.1 6 17C6 15.9 6.9 15 8 15S10 15.9 10 17C10 18.1 9.1 19 8 19M19.86 6C19.41 4.28 17.86 3 16 3S12.59 4.28 12.14 6H2V8H12.14C12.59 9.72 14.14 11 16 11S19.41 9.72 19.86 8H22V6H19.86M16 9C14.9 9 14 8.1 14 7C14 5.9 14.9 5 16 5S18 5.9 18 7C18 8.1 17.1 9 16 9Z",Xe="M19,14.5C19,14.5 21,16.67 21,18A2,2 0 0,1 19,20A2,2 0 0,1 17,18C17,16.67 19,14.5 19,14.5M5,18V9A2,2 0 0,1 3,7A2,2 0 0,1 5,5V4A2,2 0 0,1 7,2H9A2,2 0 0,1 11,4V5H19A2,2 0 0,1 21,7V9L21,11A1,1 0 0,1 22,12A1,1 0 0,1 21,13H17A1,1 0 0,1 16,12A1,1 0 0,1 17,11V9H11V18H12A2,2 0 0,1 14,20V22H2V20A2,2 0 0,1 4,18H5Z";const y="homekit_manager/",pe=r=>r.callWS({type:y+"bridges"}).then(e=>e.bridges),et=r=>r.callWS({type:y+"entities"}),gi=(r,e)=>r.callWS({type:y+"pairing",entry_id:e}),_i=(r,e)=>r.callWS({type:y+"bridge/create",name:e}).then(t=>t.bridge),mi=(r,e,t,i)=>r.callWS({type:y+"accessory/create",entity_id:e,name:t,remove_from_bridges:i}).then(s=>s.bridge),fi=(r,e,t)=>r.callWS({type:y+"bridge/settings",entry_id:e,...t}).then(i=>i.bridge),bi=(r,e,t,i)=>r.callWS({type:y+"bridge/assign",entry_id:e,entities:t,entity_config:i}).then(s=>s.bridge),vi=(r,e,t,i=!1)=>r.callWS({type:y+"rules/set",entry_id:e,reset_exclusions:i,...t}).then(s=>s.bridge),yi=(r,e,t)=>r.callWS({type:y+"rules/preview",entry_id:e,...t}).then(i=>i.entities),xi=(r,e,t,i)=>r.callWS({type:y+"entity/options",entry_id:e,entity_id:t,options:i}).then(s=>s.bridge),de=r=>(e,t)=>e.callWS({type:y+r,entry_id:t}).then(i=>i.bridge),$i=de("bridge/adopt"),wi=de("bridge/restart"),ki=de("bridge/unpair"),Ai=de("bridge/delete"),ue=r=>{if(r&&typeof r=="object"){const e=r;return e.message||e.error?.message||e.code||String(r)}return String(r)},z=[{id:"light",label:"cat_light",icon:ft,domains:["light"]},{id:"switch",label:"cat_switch",icon:ve,domains:["switch","input_boolean"]},{id:"climate",label:"cat_climate",icon:yt,domains:["climate","fan","humidifier","water_heater"]},{id:"cover",label:"cat_cover",icon:_t,domains:["cover","valve"]},{id:"sensor",label:"cat_sensor",icon:mt,domains:["sensor","binary_sensor"]},{id:"security",label:"cat_security",icon:bt,domains:["alarm_control_panel","lock","camera"]},{id:"media",label:"cat_media",icon:v,domains:["media_player","remote"]},{id:"scene",label:"cat_scene",icon:di,domains:["scene","script","automation","button","input_button"]},{id:"select",label:"cat_select",icon:ai,domains:["select","input_select"]},{id:"appliance",label:"cat_appliance",icon:vt,domains:["vacuum","lawn_mower"]},{id:"presence",label:"cat_presence",icon:Gt,domains:["person","device_tracker"]}],Ci={id:"other",label:"cat_other",icon:ni,domains:[]},xt=new Map;for(const r of z)for(const e of r.domains)xt.set(e,r);const J=r=>xt.get(r)??Ci,Hi={light:ft,switch:ve,input_boolean:ve,climate:yt,fan:ri,humidifier:Wt,water_heater:Xe,cover:_t,valve:Xe,sensor:mt,binary_sensor:ii,alarm_control_panel:qt,lock:bt,camera:Xt,media_player:v,remote:pi,vacuum:vt},Be=r=>Hi[r]??J(r).icon,Li={SecuritySystem:{de:"Alarmanlage",en:"Security system"},BinarySensor:{de:"Sensor",en:"Sensor"},Thermostat:{de:"Thermostat",en:"Thermostat"},HeaterCooler:{de:"Heiz-/Kühlgerät",en:"Heater/cooler"},OzoneSensor:{de:"Luftqualität (O₃)",en:"Air quality (O₃)"},SulphurDioxideSensor:{de:"Luftqualität (SO₂)",en:"Air quality (SO₂)"},GarageDoorOpener:{de:"Garagentor",en:"Garage door"},Window:{de:"Fenster",en:"Window"},Door:{de:"Tür",en:"Door"},WindowCovering:{de:"Rollladen",en:"Window covering"},WindowCoveringBasic:{de:"Rollladen",en:"Window covering"},Fan:{de:"Ventilator",en:"Fan"},AirPurifier:{de:"Luftreiniger",en:"Air purifier"},HumidifierDehumidifier:{de:"Luftbefeuchter",en:"Humidifier"},Light:{de:"Licht",en:"Light"},Lock:{de:"Schloss",en:"Lock"},ReceiverMediaPlayer:{de:"Receiver",en:"Receiver"},TelevisionMediaPlayer:{de:"Fernseher",en:"Television"},MediaPlayer:{de:"Mediaplayer",en:"Media player"},TemperatureSensor:{de:"Temperatur",en:"Temperature"},HumiditySensor:{de:"Luftfeuchtigkeit",en:"Humidity"},PM10Sensor:{de:"Luftqualität (PM10)",en:"Air quality (PM10)"},PM25Sensor:{de:"Luftqualität (PM2.5)",en:"Air quality (PM2.5)"},NitrogenDioxideSensor:{de:"Luftqualität (NO₂)",en:"Air quality (NO₂)"},VolatileOrganicCompoundsSensor:{de:"Luftqualität (VOC)",en:"Air quality (VOC)"},AirQualitySensor:{de:"Luftqualität",en:"Air quality"},CarbonMonoxideSensor:{de:"Kohlenmonoxid",en:"Carbon monoxide"},CarbonDioxideSensor:{de:"CO₂",en:"CO₂"},LightSensor:{de:"Helligkeit",en:"Light level"},Switch:{de:"Schalter",en:"Switch"},Outlet:{de:"Steckdose",en:"Outlet"},ValveSwitch:{de:"Ventil",en:"Valve"},Valve:{de:"Ventil",en:"Valve"},Vacuum:{de:"Saugroboter",en:"Vacuum"},LawnMower:{de:"Mähroboter",en:"Lawn mower"},ActivityRemote:{de:"Fernbedienung",en:"Remote"},SelectSwitch:{de:"Auswahlschalter",en:"Select switch"},WaterHeater:{de:"Warmwasser",en:"Water heater"},Camera:{de:"Kamera",en:"Camera"}},tt={motion:{de:"Bewegungsmelder",en:"Motion sensor"},occupancy:{de:"Präsenzmelder",en:"Occupancy sensor"},presence:{de:"Präsenzmelder",en:"Occupancy sensor"},door:{de:"Kontaktsensor",en:"Contact sensor"},garage_door:{de:"Kontaktsensor",en:"Contact sensor"},opening:{de:"Kontaktsensor",en:"Contact sensor"},window:{de:"Kontaktsensor",en:"Contact sensor"},smoke:{de:"Rauchmelder",en:"Smoke detector"},moisture:{de:"Wassersensor",en:"Leak sensor"},carbon_monoxide:{de:"CO-Melder",en:"CO detector"},gas:{de:"CO-Melder",en:"CO detector"}},Si={switch:{de:"Schalter",en:"Switch"},outlet:{de:"Steckdose",en:"Outlet"},valve:{de:"Ventil",en:"Valve"},faucet:{de:"Wasserhahn",en:"Faucet"},shower:{de:"Dusche",en:"Shower"},sprinkler:{de:"Bewässerung",en:"Sprinkler"},fan:{de:"Ventilator",en:"Fan"},air_purifier:{de:"Luftreiniger",en:"Air purifier"},thermostat:{de:"Thermostat",en:"Thermostat"},heater_cooler:{de:"Heiz-/Kühlgerät (Klimaanlage)",en:"Heater/cooler (AC)"}},K=(r,e,t)=>r?e?r.de:r.en:t,Vi=(r,e)=>K(Si[r],e,r),T=(r,e,t,i)=>{if(!r)return null;if(r==="BinarySensor"){if(e==="person"||e==="device_tracker")return i?"Anwesenheit":"Presence";if(t&&tt[t])return K(tt[t],i,r)}return K(Li[r],i,r)},$t=(r,e)=>e?r==="switch"?e==="outlet"?"Outlet":e==="switch"?"Switch":"ValveSwitch":r==="fan"?e==="air_purifier"?"AirPurifier":"Fan":r==="climate"?e==="heater_cooler"?"HeaterCooler":"Thermostat":null:null,Mi={linked_battery_sensor:{de:"Batteriesensor",en:"Battery sensor"},linked_battery_charging_sensor:{de:"Ladezustand (lädt)",en:"Battery charging"},linked_motion_sensor:{de:"Bewegungsmelder",en:"Motion sensor"},linked_doorbell_sensor:{de:"Türklingel",en:"Doorbell"},linked_humidity_sensor:{de:"Luftfeuchtigkeit",en:"Humidity sensor"},linked_pm25_sensor:{de:"Feinstaub (PM2.5)",en:"PM2.5 sensor"},linked_temperature_sensor:{de:"Temperatur",en:"Temperature sensor"},linked_filter_change_indication_binary_sensor:{de:"Filterwechsel nötig",en:"Filter change indicator"},linked_filter_life_level_sensor:{de:"Filter-Restlaufzeit",en:"Filter life level"},linked_obstruction_sensor:{de:"Hinderniserkennung",en:"Obstruction sensor"}},Ei={on_off:{de:"Ein/Aus",en:"On/off"},play_pause:{de:"Wiedergabe/Pause",en:"Play/pause"},play_stop:{de:"Wiedergabe/Stopp",en:"Play/stop"},toggle_mute:{de:"Stummschalten",en:"Mute"}},zi=(r,e)=>K(Mi[r],e,r),Bi=(r,e)=>K(Ei[r],e,r),it=r=>r==="linked_battery_sensor"||r==="linked_battery_charging_sensor",A=$`
  :host {
    --hkm-primary: var(--primary-color, #03a9f4);
    --hkm-on-primary: var(--text-primary-color, #fff);
    --hkm-bg: var(--primary-background-color, #f6f7f9);
    --hkm-card: var(--card-background-color, var(--ha-card-background, #fff));
    --hkm-text: var(--primary-text-color, #1c1c1e);
    --hkm-text-2: var(--secondary-text-color, #6b7280);
    --hkm-divider: var(--divider-color, rgba(0, 0, 0, 0.12));
    --hkm-success: var(--success-color, #2e9d5b);
    --hkm-warning: var(--warning-color, #e8a317);
    --hkm-error: var(--error-color, #db4437);
    --hkm-radius: var(--ha-card-border-radius, 16px);
    --hkm-radius-s: 10px;
    --hkm-shadow: var(
      --ha-card-box-shadow,
      0 1px 2px rgba(0, 0, 0, 0.06),
      0 2px 8px rgba(0, 0, 0, 0.04)
    );
    --hkm-tint: color-mix(in srgb, var(--hkm-primary) 12%, transparent);
    --hkm-tint-strong: color-mix(in srgb, var(--hkm-primary) 22%, transparent);
    --hkm-surface-2: color-mix(in srgb, var(--hkm-text) 4%, var(--hkm-card));
    --hkm-surface-3: color-mix(in srgb, var(--hkm-text) 8%, var(--hkm-card));
  }
`,C=$`
  button {
    font: inherit;
    color: inherit;
  }
  .btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    height: 40px;
    padding: 0 18px;
    border-radius: 999px;
    border: 1px solid transparent;
    background: transparent;
    color: var(--hkm-primary);
    font-weight: 500;
    font-size: 14px;
    letter-spacing: 0.01em;
    cursor: pointer;
    white-space: nowrap;
    transition: background-color 0.15s ease, box-shadow 0.15s ease, opacity 0.15s ease;
  }
  .btn svg {
    width: 18px;
    height: 18px;
    fill: currentColor;
    flex: none;
  }
  .btn:hover {
    background: var(--hkm-tint);
  }
  .btn:focus-visible {
    outline: 2px solid var(--hkm-primary);
    outline-offset: 2px;
  }
  .btn[disabled] {
    opacity: 0.45;
    pointer-events: none;
  }
  .btn.filled {
    background: var(--hkm-primary);
    color: var(--hkm-on-primary);
    box-shadow: 0 1px 3px color-mix(in srgb, var(--hkm-primary) 40%, transparent);
  }
  .btn.filled:hover {
    background: color-mix(in srgb, var(--hkm-primary) 88%, black);
  }
  .btn.tonal {
    background: var(--hkm-tint);
  }
  .btn.tonal:hover {
    background: var(--hkm-tint-strong);
  }
  .btn.outlined {
    border-color: var(--hkm-divider);
    color: var(--hkm-text);
  }
  .btn.outlined:hover {
    background: var(--hkm-surface-2);
  }
  .btn.danger {
    color: var(--hkm-error);
  }
  .btn.danger:hover {
    background: color-mix(in srgb, var(--hkm-error) 10%, transparent);
  }
  .btn.filled.danger {
    background: var(--hkm-error);
    color: #fff;
  }
  .btn.small {
    height: 32px;
    padding: 0 12px;
    font-size: 13px;
  }
  .icon-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    border: none;
    background: transparent;
    color: inherit;
    cursor: pointer;
  }
  .icon-btn:hover {
    background: var(--hkm-surface-3);
  }
  .icon-btn svg {
    width: 22px;
    height: 22px;
    fill: currentColor;
  }

  /* Toggle switch */
  .switch {
    position: relative;
    flex: none;
    width: 46px;
    height: 28px;
    border-radius: 999px;
    border: none;
    padding: 0;
    background: var(--hkm-surface-3);
    box-shadow: inset 0 0 0 1px var(--hkm-divider);
    cursor: pointer;
    transition: background-color 0.2s ease;
  }
  .switch::after {
    content: "";
    position: absolute;
    top: 3px;
    left: 3px;
    width: 22px;
    height: 22px;
    border-radius: 50%;
    background: #fff;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
    transition: transform 0.2s cubic-bezier(0.3, 0.7, 0.4, 1.2);
  }
  .switch[aria-checked="true"] {
    background: var(--hkm-primary);
    box-shadow: none;
  }
  .switch[aria-checked="true"]::after {
    transform: translateX(18px);
  }
  .switch:focus-visible {
    outline: 2px solid var(--hkm-primary);
    outline-offset: 2px;
  }
  .switch[disabled] {
    opacity: 0.4;
    cursor: default;
  }

  /* Text fields */
  .field {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  .field label {
    font-size: 13px;
    font-weight: 500;
    color: var(--hkm-text-2);
  }
  .field input,
  .field select {
    font: inherit;
    font-size: 15px;
    height: 44px;
    padding: 0 14px;
    border-radius: var(--hkm-radius-s);
    border: 1px solid var(--hkm-divider);
    background: var(--hkm-surface-2);
    color: var(--hkm-text);
    outline: none;
    transition: border-color 0.15s ease, box-shadow 0.15s ease;
  }
  .field input:focus,
  .field select:focus {
    border-color: var(--hkm-primary);
    box-shadow: 0 0 0 3px var(--hkm-tint);
  }
  .field .helper {
    font-size: 12px;
    color: var(--hkm-text-2);
  }

  .chip {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    height: 32px;
    padding: 0 12px;
    border-radius: 999px;
    border: 1px solid var(--hkm-divider);
    background: var(--hkm-card);
    color: var(--hkm-text);
    font-size: 13px;
    cursor: pointer;
    white-space: nowrap;
    transition: background-color 0.15s ease, border-color 0.15s ease;
  }
  .chip svg {
    width: 16px;
    height: 16px;
    fill: currentColor;
  }
  .chip:hover {
    background: var(--hkm-surface-2);
  }
  .chip[aria-pressed="true"] {
    background: var(--hkm-tint);
    border-color: transparent;
    color: var(--hkm-primary);
    font-weight: 500;
  }
  .chip .count {
    font-variant-numeric: tabular-nums;
    color: var(--hkm-text-2);
    font-size: 12px;
  }
  .chip[aria-pressed="true"] .count {
    color: inherit;
  }

  .badge {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    height: 20px;
    padding: 0 8px;
    border-radius: 999px;
    font-size: 11px;
    font-weight: 500;
    line-height: 1;
    white-space: nowrap;
    background: var(--hkm-surface-3);
    color: var(--hkm-text-2);
  }
  .badge svg {
    width: 13px;
    height: 13px;
    fill: currentColor;
  }
  .badge.primary {
    background: var(--hkm-tint);
    color: var(--hkm-primary);
  }
  .badge.success {
    background: color-mix(in srgb, var(--hkm-success) 14%, transparent);
    color: var(--hkm-success);
  }
  .badge.warning {
    background: color-mix(in srgb, var(--hkm-warning) 18%, transparent);
    color: color-mix(in srgb, var(--hkm-warning) 70%, var(--hkm-text));
  }
  .badge.error {
    background: color-mix(in srgb, var(--hkm-error) 12%, transparent);
    color: var(--hkm-error);
  }

  .spinner {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    border: 2.5px solid var(--hkm-tint-strong);
    border-top-color: var(--hkm-primary);
    animation: hkm-spin 0.8s linear infinite;
    flex: none;
  }
  @keyframes hkm-spin {
    to {
      transform: rotate(360deg);
    }
  }
`,h=(r,e="")=>o`<svg class=${e} viewBox="0 0 24 24" aria-hidden="true">${Pt`<path d=${r}></path>`}</svg>`,x=(r,e,t)=>r.dispatchEvent(new CustomEvent(e,{detail:t,bubbles:!0,composed:!0})),X=class X extends b{firstUpdated(){const e=this.renderRoot.querySelector("dialog");e.showModal(),e.addEventListener("close",()=>x(this,"closed")),e.addEventListener("click",t=>{t.target===e&&e.close()})}close(){this.renderRoot.querySelector("dialog")?.close()}render(){return o`
      <dialog class=${this.wide?"wide":""} aria-label=${this.heading}>
        <div class="surface">
          <header>
            <slot name="icon"></slot>
            <h2>${this.heading}</h2>
            <button class="icon-btn" @click=${this.close} aria-label="close">
              ${h(Y)}
            </button>
          </header>
          <div class="content"><slot></slot></div>
          <footer><slot name="actions"></slot></footer>
        </div>
      </dialog>
    `}};X.properties={heading:{type:String},wide:{type:Boolean}},X.styles=[A,C,$`
      dialog {
        padding: 0;
        border: none;
        background: transparent;
        max-width: min(480px, calc(100vw - 24px));
        width: 100%;
        max-height: calc(100vh - 32px);
        overflow: visible;
        color: var(--hkm-text);
      }
      dialog.wide {
        max-width: min(560px, calc(100vw - 24px));
      }
      dialog::backdrop {
        background: rgba(10, 12, 16, 0.45);
        backdrop-filter: blur(3px);
      }
      dialog[open] .surface {
        animation: pop 0.18s cubic-bezier(0.2, 0.9, 0.3, 1.1);
      }
      @keyframes pop {
        from {
          opacity: 0;
          transform: translateY(8px) scale(0.98);
        }
      }
      .surface {
        display: flex;
        flex-direction: column;
        max-height: calc(100vh - 32px);
        background: var(--hkm-card);
        border-radius: 24px;
        box-shadow: 0 24px 64px rgba(0, 0, 0, 0.28);
        overflow: hidden;
      }
      header {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 20px 12px 8px 24px;
      }
      h2 {
        flex: 1;
        margin: 0;
        font-size: 20px;
        font-weight: 600;
        line-height: 1.3;
        overflow-wrap: anywhere;
      }
      .content {
        padding: 8px 24px 8px;
        overflow-y: auto;
      }
      footer {
        display: flex;
        justify-content: flex-end;
        flex-wrap: wrap;
        gap: 8px;
        padding: 16px 24px 20px;
      }
    `];let ye=X;const ee=class ee extends b{_confirm(){x(this,"confirm"),this.renderRoot.querySelector("hkm-dialog")?.close()}_secondary(){this.altLabel&&x(this,"alt"),this.renderRoot.querySelector("hkm-dialog")?.close()}render(){return o`
      <hkm-dialog .heading=${this.heading}>
        <p>${this.text}</p>
        <button slot="actions" class="btn outlined" @click=${this._secondary}>
          ${this.altLabel||this.cancelLabel}
        </button>
        <button
          slot="actions"
          class="btn filled ${this.danger?"danger":""}"
          @click=${this._confirm}
        >
          ${this.confirmLabel}
        </button>
      </hkm-dialog>
    `}};ee.properties={heading:{type:String},text:{type:String},confirmLabel:{type:String},cancelLabel:{type:String},altLabel:{type:String},danger:{type:Boolean}},ee.styles=[A,C,$`
      p {
        margin: 0;
        line-height: 1.55;
        color: var(--hkm-text-2);
      }
    `];let xe=ee;const te=class te extends b{constructor(){super(),this._error=null}_submit(e){e.preventDefault();const t=this.renderRoot.querySelector("form"),i=new FormData(t),s=String(i.get("name")||"").trim();if(s.length<3||s.length>25){this._error=this.t("bridge_name_helper");return}const n={name:s};if(this.mode==="settings"){const a=Number(i.get("port"));if(!Number.isInteger(a)||a<1024||a>65535){this._error="Port 1024–65535";return}n.port=a}x(this,"submit-form",n),this.renderRoot.querySelector("hkm-dialog")?.close()}render(){const e=this.t;return o`
      <hkm-dialog .heading=${e(this.mode==="create"?"create_title":"settings_title")}>
        <form @submit=${this._submit}>
          ${this.mode==="create"?o`<p class="intro">${e("create_text")}</p>`:c}
          <div class="field">
            <label for="name">${e("bridge_name")}</label>
            <input
              id="name"
              name="name"
              .value=${this.name??""}
              minlength="3"
              maxlength="25"
              required
              autocomplete="off"
              autofocus
            />
            <span class="helper">${e("bridge_name_helper")}</span>
          </div>
          ${this.mode==="settings"?o`<div class="field">
                <label for="port">${e("bridge_port")}</label>
                <input
                  id="port"
                  name="port"
                  type="number"
                  min="1024"
                  max="65535"
                  .value=${String(this.port??"")}
                  required
                />
                <span class="helper">${e("bridge_port_helper")}</span>
              </div>`:c}
          ${this._error?o`<div class="error">${this._error}</div>`:c}
          <button type="submit" hidden></button>
        </form>
        <button
          slot="actions"
          class="btn outlined"
          @click=${()=>this.renderRoot.querySelector("hkm-dialog")?.close()}
        >
          ${e("cancel")}
        </button>
        <button slot="actions" class="btn filled" @click=${this._submit}>
          ${e(this.mode==="create"?"create":"save")}
        </button>
      </hkm-dialog>
    `}};te.properties={t:{attribute:!1},mode:{type:String},name:{type:String},port:{type:Number},_error:{state:!0}},te.styles=[A,C,$`
      form {
        display: flex;
        flex-direction: column;
        gap: 18px;
      }
      .intro {
        margin: 0;
        color: var(--hkm-text-2);
        line-height: 1.5;
      }
      .error {
        color: var(--hkm-error);
        font-size: 13px;
      }
    `];let $e=te;const ie=class ie extends b{_choose(e){x(this,"choose",e),this.renderRoot.querySelector("hkm-dialog")?.close()}render(){const e=this.t;return o`
      <hkm-dialog .heading=${e("new_title")} wide>
        <div class="options">
          <button class="option" @click=${()=>this._choose("bridge")}>
            <span class="option-icon bridge">${h(fe)}</span>
            <span class="option-text">
              <span class="option-title">${e("new_bridge_title")}</span>
              <span class="option-desc">${e("new_bridge_text")}</span>
            </span>
            ${h(Ge,"chev")}
          </button>
          <button class="option" @click=${()=>this._choose("accessory")}>
            <span class="option-icon accessory">${h(v)}</span>
            <span class="option-text">
              <span class="option-title">${e("new_accessory_title")}</span>
              <span class="option-desc">${e("new_accessory_text")}</span>
            </span>
            ${h(Ge,"chev")}
          </button>
        </div>
      </hkm-dialog>
    `}};ie.properties={t:{attribute:!1}},ie.styles=[A,C,$`
      .options {
        display: flex;
        flex-direction: column;
        gap: 12px;
        padding-bottom: 8px;
      }
      .option {
        display: flex;
        align-items: center;
        gap: 16px;
        width: 100%;
        padding: 16px;
        border-radius: 18px;
        border: 1px solid var(--hkm-divider);
        background: var(--hkm-card);
        text-align: left;
        cursor: pointer;
        transition: background-color 0.15s ease, border-color 0.15s ease;
      }
      .option:hover {
        background: var(--hkm-surface-2);
        border-color: var(--hkm-primary);
      }
      .option-icon {
        display: grid;
        place-items: center;
        flex: none;
        width: 52px;
        height: 52px;
        border-radius: 16px;
        color: #fff;
      }
      .option-icon svg {
        width: 28px;
        height: 28px;
        fill: currentColor;
      }
      .option-icon.bridge {
        background: linear-gradient(135deg, #29b6f6, #5b3fd9);
      }
      .option-icon.accessory {
        background: linear-gradient(135deg, #ff8a65, #d81b60);
      }
      .option-text {
        flex: 1;
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 4px;
      }
      .option-title {
        font-weight: 600;
        font-size: 16px;
      }
      .option-desc {
        font-size: 13px;
        line-height: 1.45;
        color: var(--hkm-text-2);
      }
      .chev {
        width: 22px;
        height: 22px;
        fill: var(--hkm-text-2);
        flex: none;
      }
    `];let we=ie;const se=class se extends b{constructor(){super(),this._search="",this._selected=null,this._name="",this._remove=!0,this._error=null}willUpdate(e){if(e.has("preselected")&&this.preselected){const t=this.entities?.find(i=>i.entity_id===this.preselected);t&&this._pick(t)}}_pick(e){this._selected=e,this._name=e?e.name.slice(0,25):"",this._remove=!0,this._error=null}_bridgesOf(e){return e.bridges.map(t=>this.bridgeNames[t]).filter(Boolean)}_create(){const e=this._selected;if(!e)return;const t=this._name.trim();if(t.length<3||t.length>25){this._error=this.t("bridge_name_helper");return}x(this,"create-accessory",{entityId:e.entity_id,name:t,removeFromBridges:this._remove}),this.renderRoot.querySelector("hkm-dialog")?.close()}_icon(e){const t=this.hass.states[e.entity_id];return t&&customElements.get("ha-state-icon")?o`<ha-state-icon .hass=${this.hass} .stateObj=${t}></ha-state-icon>`:h(Be(e.domain))}_item(e){const t=T(e.accessory_type,e.domain,e.device_class,this.german),i=this._bridgesOf(e);return o`<button class="item" @click=${()=>this._pick(e)}>
      <span class="item-icon">${this._icon(e)}</span>
      <span class="item-text">
        <span class="item-name">${e.name}</span>
        <span class="item-sub">${e.area?`${e.area} · `:""}${e.entity_id}</span>
      </span>
      <span class="item-badges">
        ${t?o`<span class="badge">${t}</span>`:c}
        ${i.length?o`<span class="badge">${this.t("badge_other_bridge",{name:i[0]})}</span>`:c}
      </span>
    </button>`}_renderList(){const e=this.t,t=this._search.toLowerCase().split(/\s+/).filter(Boolean),i=l=>{const p=`${l.name} ${l.entity_id} ${l.area??""} ${l.device??""}`.toLowerCase();return t.every(d=>p.includes(d))},s=this.entities.filter(i),n=s.filter(l=>l.needs_accessory_mode),a=s.filter(l=>!l.needs_accessory_mode);return o`
      <p class="intro">${e("picker_text")}</p>
      <div class="search">
        ${h(be)}
        <input
          type="search"
          placeholder=${e("search")}
          .value=${this._search}
          @input=${l=>this._search=l.target.value}
          autofocus
        />
      </div>
      <div class="list">
        ${n.length?o`<div class="section">${h(ui)} ${e("picker_recommended")}</div>
              ${n.map(l=>this._item(l))}`:c}
        ${a.length?o`<div class="section">${e("picker_others")}</div>
              ${a.map(l=>this._item(l))}`:c}
        ${s.length?c:o`<div class="none">${e("no_results")}</div>`}
      </div>
    `}_renderForm(e){const t=this.t,i=this._bridgesOf(e),s=T(e.accessory_type,e.domain,e.device_class,this.german);return o`
      <button class="item selected" @click=${()=>this._pick(null)}>
        <span class="item-icon">${this._icon(e)}</span>
        <span class="item-text">
          <span class="item-name">${e.name}</span>
          <span class="item-sub">${e.entity_id}</span>
        </span>
        <span class="change">${h(Jt)} ${t("picker_change")}</span>
      </button>
      <div class="form">
        <div class="field">
          <label for="acc-name">${t("bridge_name")}</label>
          <input
            id="acc-name"
            .value=${this._name}
            maxlength="25"
            autocomplete="off"
            @input=${n=>this._name=n.target.value}
          />
          <span class="helper">${t("accessory_name_helper")}</span>
        </div>
        ${i.length?o`<label class="check" @click=${()=>this._remove=!this._remove}>
              <button
                class="switch"
                role="switch"
                aria-checked=${String(this._remove)}
                aria-label=${t("picker_remove")}
              ></button>
              <span>${t("picker_remove_named",{names:i.join(", ")})}</span>
            </label>`:c}
        ${e.needs_accessory_mode?c:o`<div class="note">${h(D)}<span>${t("picker_not_needed",{type:s??""})}</span></div>`}
        ${this._error?o`<div class="error">${this._error}</div>`:c}
      </div>
    `}render(){const e=this.t,t=this._selected;return o`
      <hkm-dialog .heading=${e("picker_title")} wide>
        ${t?this._renderForm(t):this._renderList()}
        <button
          slot="actions"
          class="btn outlined"
          @click=${()=>this.renderRoot.querySelector("hkm-dialog")?.close()}
        >
          ${e("cancel")}
        </button>
        <button slot="actions" class="btn filled" ?disabled=${!t} @click=${this._create}>
          ${e("create")}
        </button>
      </hkm-dialog>
    `}};se.properties={hass:{attribute:!1},t:{attribute:!1},german:{type:Boolean},entities:{attribute:!1},bridgeNames:{attribute:!1},preselected:{attribute:!1},_search:{state:!0},_selected:{state:!0},_name:{state:!0},_remove:{state:!0},_error:{state:!0}},se.styles=[A,C,$`
      .intro {
        margin: 0 0 14px;
        color: var(--hkm-text-2);
        line-height: 1.5;
        font-size: 14px;
      }
      .search {
        display: flex;
        align-items: center;
        gap: 10px;
        height: 44px;
        padding: 0 14px;
        border-radius: 999px;
        border: 1px solid var(--hkm-divider);
        background: var(--hkm-surface-2);
      }
      .search:focus-within {
        border-color: var(--hkm-primary);
      }
      .search svg {
        width: 20px;
        height: 20px;
        fill: var(--hkm-text-2);
      }
      .search input {
        flex: 1;
        border: none;
        outline: none;
        background: transparent;
        color: var(--hkm-text);
        font: inherit;
        font-size: 15px;
      }
      .list {
        display: flex;
        flex-direction: column;
        gap: 2px;
        margin-top: 12px;
        max-height: min(46vh, 420px);
        overflow-y: auto;
      }
      .section {
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 12px 4px 6px;
        font-size: 12px;
        font-weight: 600;
        letter-spacing: 0.04em;
        text-transform: uppercase;
        color: var(--hkm-text-2);
      }
      .section svg {
        width: 16px;
        height: 16px;
        fill: currentColor;
      }
      .item {
        display: flex;
        align-items: center;
        gap: 12px;
        width: 100%;
        padding: 10px;
        border: none;
        border-radius: 12px;
        background: transparent;
        text-align: left;
        cursor: pointer;
      }
      .item:hover {
        background: var(--hkm-surface-2);
      }
      .item.selected {
        background: var(--hkm-tint);
        margin-bottom: 18px;
      }
      .item-icon {
        display: grid;
        place-items: center;
        flex: none;
        width: 38px;
        height: 38px;
        border-radius: 12px;
        background: var(--hkm-surface-3);
        color: var(--hkm-text-2);
        --mdc-icon-size: 22px;
      }
      .item-icon svg {
        width: 22px;
        height: 22px;
        fill: currentColor;
      }
      .item.selected .item-icon {
        background: var(--hkm-card);
        color: var(--hkm-primary);
      }
      .item-text {
        flex: 1;
        min-width: 0;
        display: flex;
        flex-direction: column;
      }
      .item-name {
        font-weight: 500;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .item-sub {
        font-size: 12px;
        color: var(--hkm-text-2);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .item-badges {
        display: flex;
        flex-wrap: wrap;
        justify-content: flex-end;
        gap: 4px;
        max-width: 45%;
      }
      .change {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        font-size: 13px;
        color: var(--hkm-primary);
        font-weight: 500;
        white-space: nowrap;
      }
      .change svg {
        width: 16px;
        height: 16px;
        fill: currentColor;
      }
      .none {
        padding: 24px;
        text-align: center;
        color: var(--hkm-text-2);
      }
      .form {
        display: flex;
        flex-direction: column;
        gap: 16px;
      }
      .check {
        display: flex;
        align-items: center;
        gap: 12px;
        font-size: 14px;
        cursor: pointer;
      }
      .note {
        display: flex;
        gap: 10px;
        padding: 12px 14px;
        border-radius: 12px;
        background: var(--hkm-surface-2);
        font-size: 13px;
        line-height: 1.5;
      }
      .note svg {
        width: 18px;
        height: 18px;
        flex: none;
        fill: var(--hkm-text-2);
      }
      .error {
        color: var(--hkm-error);
        font-size: 13px;
      }
      @media (max-width: 520px) {
        .item-badges {
          display: none;
        }
      }
    `];let ke=se;const Z=(r,e)=>{customElements.get(r)||customElements.define(r,e)};Z("hkm-dialog",ye);Z("hkm-confirm",xe);Z("hkm-bridge-form",$e);Z("hkm-new-dialog",we);Z("hkm-accessory-picker",ke);const st=r=>r==null||r===""?null:Array.isArray(r)?r.length?JSON.stringify([...r].sort()):null:String(r),Ae=(r,e)=>e?Object.keys(e).some(t=>t==="has_code"?!1:t==="code"?e.code===void 0?!1:e.code!==null||!!r?.has_code:st(e[t])!==st(r?.[t])):!1,wt=(r,e)=>{const t={};for(const i of Object.keys(e))Ae(r,{[i]:e[i]})&&(t[i]=e[i]);return t},Oi=(r,e)=>{const t={...r??{}};for(const[i,s]of Object.entries(e??{})){if(i==="code"){s===null?delete t.has_code:s&&(t.has_code=!0);continue}s==null?delete t[i]:t[i]=s}return t},Ti=(r,e)=>({...r??{},...e}),Pi=["alarm_control_panel","lock"],nt=["linked_battery_sensor","linked_battery_charging_sensor"],ne=class ne extends b{constructor(){super(...arguments),this._makeAccessory=()=>{x(this,"make-accessory",{entityId:this.entity.entity_id}),this._close()}}willUpdate(){if(this.entity&&this._draftFor!==this.entity.entity_id){this._draftFor=this.entity.entity_id,this._assigned=this.assigned;const{has_code:e,...t}=this.options??{};this._values=t,this._code="",this._clearCode=!1,this._battery=this._batteryDetected()||this._batteryConfigured()}}_close(){this.renderRoot.querySelector("hkm-dialog")?.close()}_set(e,t){this._values={...this._values,[e]:t===""?null:t}}_save(){const e={},t=new Set([...Object.keys(this._values),...Object.keys(this.options??{})]);t.delete("has_code"),t.delete("code");for(const i of t)e[i]=this._values[i]??null;if(typeof e.name=="string"&&(e.name=e.name.trim()||null),!this._battery)for(const i of[...nt,"low_battery_threshold"])e[i]=null;this._clearCode?e.code=null:this._code&&(e.code=this._code),x(this,"save-entity",{entityId:this.entity.entity_id,assigned:this._assigned,patch:wt(this.options,e)}),this._close()}_moreInfo(){const e=this.entity.entity_id;this._close(),x(this,"hass-more-info",{entityId:e})}_stateIcon(e){return e&&customElements.get("ha-state-icon")?o`<ha-state-icon .hass=${this.hass} .stateObj=${e}></ha-state-icon>`:h(Be(this.entity.domain))}_links(){const e=this.entity.domain,t=this._values.type??null;return Object.entries(this.linkFields??{}).filter(([,i])=>!(i.applies_to&&!i.applies_to.includes(e)||i.requires_type&&i.requires_type!==t))}_candidates(e){const t=this.entity.device_id,i=s=>(t&&s.device_id===t?0:2)+(s.device_class&&e.device_classes.includes(s.device_class)?0:1);return(this.linkCandidates??[]).filter(s=>e.domains.includes(s.domain)&&s.entity_id!==this.entity.entity_id).sort((s,n)=>i(s)-i(n)||s.name.localeCompare(n.name))}_linkSelect(e,t){const i=this.t,s=this._values[e]??"",n=this.entity.device_id;return o`<div class="field">
      <label for=${e}>${zi(e,this.german)}</label>
      <select id=${e} @change=${a=>this._set(e,a.target.value)}>
        <option value="" ?selected=${!s}>${i("link_auto")}</option>
        ${this._candidates(t).map(a=>o`<option value=${a.entity_id} ?selected=${a.entity_id===s}>
            ${a.name}${n&&a.device_id===n?` · ${i("link_same_device")}`:""}
          </option>`)}
      </select>
    </div>`}_renderGeneral(e){const t=this.t,i=this.entity,s=this._values.type??"",n=(this.options?.type??"")!==s&&this.assigned;return o`
      <div class="field">
        <label for="hk-name">${t("homekit_name")}</label>
        <input
          id="hk-name"
          .value=${this._values.name??""}
          placeholder=${i.name}
          maxlength="64"
          autocomplete="off"
          @input=${a=>this._set("name",a.target.value)}
        />
        <span class="helper">${t("homekit_name_helper")}</span>
      </div>
      ${this.typeOptions?.length?o`<div class="field">
            <label for="hk-type">${t("accessory_type")}</label>
            <select
              id="hk-type"
              @change=${a=>this._set("type",a.target.value)}
            >
              <option value="" ?selected=${!s}>
                ${t("accessory_type_auto",{type:e??"—"})}
              </option>
              ${this.typeOptions.map(a=>o`<option value=${a} ?selected=${s===a}>
                    ${Vi(a,this.german)}
                  </option>`)}
            </select>
            ${n?o`<span class="helper warn">${t("warn_type_reset")}</span>`:c}
          </div>`:c}
    `}_renderCode(){const e=this.t;if(!Pi.includes(this.entity.domain))return c;const t=!!this.options?.has_code&&!this._clearCode;return o`<section>
      <h3>${e("code_title")}</h3>
      <div class="field">
        <label for="hk-code">${e("code_label")}</label>
        <input
          id="hk-code"
          type="password"
          autocomplete="new-password"
          inputmode="numeric"
          maxlength="64"
          .value=${this._code}
          placeholder=${t?e("code_stored"):""}
          @input=${i=>{this._code=i.target.value,this._code&&(this._clearCode=!1)}}
        />
        <span class="helper">${e("code_helper")}</span>
      </div>
      ${t?o`<button class="btn small danger" @click=${()=>{this._clearCode=!0,this._code=""}}>${e("code_remove")}</button>`:c}
    </section>`}_renderMedia(){const e=this.t,t=this.entity;if(t.domain!=="media_player"||t.accessory_type!=="MediaPlayer"||!t.media_features?.length)return c;const i=new Set(this._values.feature_list??[]),s=n=>{const a=new Set(i);a.has(n)?a.delete(n):a.add(n),this._set("feature_list",a.size?[...a]:null)};return o`<section>
      <h3>${e("media_title")}</h3>
      <div class="checks">
        ${t.media_features.map(n=>o`<label class="check">
            <input
              type="checkbox"
              .checked=${i.has(n)}
              @change=${()=>s(n)}
            />
            ${Bi(n,this.german)}
          </label>`)}
      </div>
      <span class="helper">${e("media_helper")}</span>
    </section>`}_batteryDetected(){const e=this.entity?.device_id;return e?(this.linkCandidates??[]).some(t=>t.device_id===e&&(t.device_class==="battery"||t.device_class==="battery_charging")):!1}_batteryConfigured(){const e=this.options??{};return nt.some(t=>e[t])||!!e.low_battery_threshold}_renderBattery(e){const t=this.t,i=this._batteryDetected();return o`<section class="battery">
      <label class="toggle-row" @click=${()=>this._battery=!this._battery}>
        <span class="toggle-icon">${h(Qt)}</span>
        <span class="toggle-text">
          <span class="toggle-title">${t("battery_toggle")}</span>
          <span class="toggle-sub">${t(i?"battery_detected":"battery_hint")}</span>
        </span>
        <button
          class="switch"
          role="switch"
          aria-checked=${String(this._battery)}
          aria-label=${t("battery_toggle")}
        ></button>
      </label>
      ${this._battery?o`<div class="grid">
            ${e.map(([s,n])=>this._linkSelect(s,n))}
            <div class="field">
              <label for="hk-threshold">${t("battery_threshold")}</label>
              <input
                id="hk-threshold"
                type="number"
                min="1"
                max="99"
                placeholder="20"
                .value=${String(this._values.low_battery_threshold??"")}
                @input=${s=>{const n=s.target.value;this._set("low_battery_threshold",n?Number(n):null)}}
              />
            </div>
          </div>`:c}
    </section>`}_renderLinks(){const e=this.t,t=this._links(),i=t.filter(([n])=>!it(n)),s=t.filter(([n])=>it(n));return o`
      ${i.length?o`<section>
            <h3>${e("links_title")}</h3>
            <p class="section-hint">${e("links_helper")}</p>
            <div class="grid">${i.map(([n,a])=>this._linkSelect(n,a))}</div>
          </section>`:c}
      ${s.length?this._renderBattery(s):c}
    `}render(){const e=this.t,t=this.entity,i=this.hass.states[t.entity_id],s=this._values.type??null,n=$t(t.domain,s)??t.accessory_type,a=T(n,t.domain,t.device_class,this.german),l=T(t.accessory_type,t.domain,t.device_class,this.german),p=i?this.hass.formatEntityState?.(i)??i.state:"—";return o`
      <hkm-dialog .heading=${t.name} wide>
        <div slot="icon" class="hero-icon ${this._assigned?"on":""}">${this._stateIcon(i)}</div>

        ${this.standalone?o`<div class="assign static">
              ${h(v)}
              <div>
                <div class="assign-title">${e("standalone_title")}</div>
                <div class="mono">${t.entity_id}</div>
              </div>
            </div>`:o`<div class="assign" @click=${()=>this._assigned=!this._assigned}>
              <div>
                <div class="assign-title">${e("entity_in_bridge")}</div>
                <div class="mono">${t.entity_id}</div>
              </div>
              <button
                class="switch"
                role="switch"
                aria-checked=${String(this._assigned)}
                aria-label=${e("entity_in_bridge")}
              ></button>
            </div>`}

        ${t.supported?c:o`<div class="note warning">${h(_e)}<span>${e("warn_unsupported")}</span></div>`}
        ${t.needs_accessory_mode&&!this.standalone?o`<div class="note info">
              ${h(D)}
              <div>
                <span>${e("warn_accessory_mode")}</span>
                ${this.canBeAccessory?o`<button class="btn small tonal note-action" @click=${this._makeAccessory}>
                      ${h(v)} ${e("make_accessory")}
                    </button>`:c}
              </div>
            </div>`:c}

        <div class="form">
          ${this._renderGeneral(l)} ${this._renderCode()} ${this._renderMedia()}
          ${this._renderLinks()}
        </div>

        <dl class="facts">
          <div><dt>${e("info_type")}</dt><dd>${a??"—"}</dd></div>
          <div><dt>${e("info_state")}</dt><dd>${p}</dd></div>
          <div><dt>${e("info_area")}</dt><dd>${t.area??"—"}</dd></div>
          <div><dt>${e("info_device")}</dt><dd>${t.device??"—"}</dd></div>
          <div><dt>${e("info_integration")}</dt><dd>${t.platform??"—"}</dd></div>
        </dl>
        ${this.otherBridges?.length?o`<div class="others">
              ${this.otherBridges.map(d=>o`<span class="badge">${e("badge_other_bridge",{name:d})}</span>`)}
            </div>`:c}

        <button slot="actions" class="btn" @click=${this._moreInfo}>
          ${h(li)} ${e("open_more_info")}
        </button>
        <span slot="actions" class="spacer"></span>
        <button slot="actions" class="btn outlined" @click=${this._close}>${e("cancel")}</button>
        <button slot="actions" class="btn filled" @click=${this._save}>
          ${e(this.standalone?"save":"done")}
        </button>
      </hkm-dialog>
    `}};ne.properties={hass:{attribute:!1},t:{attribute:!1},german:{type:Boolean},entity:{attribute:!1},assigned:{type:Boolean},options:{attribute:!1},typeOptions:{attribute:!1},otherBridges:{attribute:!1},canBeAccessory:{type:Boolean},standalone:{type:Boolean},linkFields:{attribute:!1},linkCandidates:{attribute:!1},_assigned:{state:!0},_values:{state:!0},_code:{state:!0},_clearCode:{state:!0},_battery:{state:!0}},ne.styles=[A,C,$`
      .hero-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 44px;
        height: 44px;
        border-radius: 14px;
        background: var(--hkm-surface-3);
        color: var(--hkm-text-2);
        flex: none;
        --mdc-icon-size: 24px;
      }
      .hero-icon svg {
        width: 24px;
        height: 24px;
        fill: currentColor;
      }
      .hero-icon.on {
        background: var(--hkm-tint);
        color: var(--hkm-primary);
      }
      .assign {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
        padding: 14px 16px;
        border-radius: 14px;
        background: var(--hkm-surface-2);
        cursor: pointer;
        margin-bottom: 16px;
      }
      .assign.static {
        justify-content: flex-start;
        cursor: default;
      }
      .assign.static > svg {
        width: 22px;
        height: 22px;
        fill: var(--hkm-primary);
        flex: none;
      }
      .assign-title {
        font-weight: 500;
      }
      .mono {
        font-family: var(--code-font-family, ui-monospace, SFMono-Regular, Menlo, monospace);
        font-size: 12px;
        color: var(--hkm-text-2);
        overflow-wrap: anywhere;
        margin-top: 2px;
      }
      .note {
        display: flex;
        gap: 10px;
        align-items: flex-start;
        padding: 12px 14px;
        border-radius: 12px;
        font-size: 13px;
        line-height: 1.5;
        margin-bottom: 12px;
      }
      .note > svg {
        width: 18px;
        height: 18px;
        flex: none;
        fill: currentColor;
        margin-top: 1px;
      }
      .note > div {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
      }
      .note.warning {
        background: color-mix(in srgb, var(--hkm-warning) 14%, transparent);
      }
      .note.info {
        background: var(--hkm-tint);
      }
      .note-action {
        margin-top: 10px;
      }
      .form {
        display: flex;
        flex-direction: column;
        gap: 16px;
      }
      section {
        display: flex;
        flex-direction: column;
        gap: 12px;
        padding-top: 16px;
        border-top: 1px solid var(--hkm-divider);
      }
      section > .btn {
        align-self: flex-start;
      }
      h3 {
        margin: 0;
        font-size: 15px;
        font-weight: 600;
      }
      .section-hint {
        margin: -4px 0 0;
        font-size: 12px;
        color: var(--hkm-text-2);
        line-height: 1.45;
      }
      .grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
        gap: 12px 16px;
      }
      .toggle-row {
        display: flex;
        align-items: center;
        gap: 12px;
        cursor: pointer;
      }
      .toggle-icon {
        display: grid;
        place-items: center;
        flex: none;
        width: 32px;
        height: 32px;
        border-radius: 10px;
        background: var(--hkm-surface-3);
      }
      .toggle-icon svg {
        width: 18px;
        height: 18px;
        fill: var(--hkm-text-2);
      }
      .toggle-text {
        flex: 1;
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 2px;
      }
      .toggle-title {
        font-weight: 600;
        font-size: 15px;
      }
      .toggle-sub {
        font-size: 12px;
        color: var(--hkm-text-2);
        line-height: 1.4;
      }
      .helper {
        font-size: 12px;
        color: var(--hkm-text-2);
      }
      .checks {
        display: flex;
        flex-wrap: wrap;
        gap: 8px 20px;
      }
      .check {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        font-size: 14px;
        cursor: pointer;
      }
      .check input {
        width: 18px;
        height: 18px;
        accent-color: var(--hkm-primary);
      }
      .helper.warn {
        color: color-mix(in srgb, var(--hkm-warning) 70%, var(--hkm-text));
      }
      .facts {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
        gap: 12px 20px;
        margin: 20px 0 4px;
        padding: 16px 0 0;
        border-top: 1px solid var(--hkm-divider);
      }
      .facts div {
        min-width: 0;
      }
      dt {
        font-size: 12px;
        color: var(--hkm-text-2);
        margin-bottom: 2px;
      }
      dd {
        margin: 0;
        font-size: 14px;
        overflow-wrap: anywhere;
      }
      .others {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
        margin-top: 14px;
      }
      .spacer {
        flex: 1;
      }
    `];let Ce=ne;customElements.get("hkm-entity-dialog")||customElements.define("hkm-entity-dialog",Ce);const re=class re extends b{constructor(){super(...arguments),this._initialized=!1}willUpdate(){if(!this._initialized){this._initialized=!0;const e=this.rule;this._enabled=e?e.enabled:!0,this._labels=new Set(e?.labels??[]),this._floors=new Set(e?.floors??[]),this._areas=new Set(e?.areas??[]);const t=new Set(e?.domains??[]);this._categories=new Set(z.filter(i=>i.domains.some(s=>t.has(s))).map(i=>i.id)),this._reset=!1,this._schedulePreview()}}disconnectedCallback(){super.disconnectedCallback(),window.clearTimeout(this._timer)}get _domains(){return z.filter(e=>this._categories.has(e.id)).flatMap(e=>e.domains)}_schedulePreview(){window.clearTimeout(this._timer),this._timer=window.setTimeout(async()=>{try{this._preview=await yi(this.hass,this.entryId,{labels:[...this._labels],areas:[...this._areas],floors:[...this._floors],domains:this._domains})}catch{this._preview=null}},250)}_toggle(e,t){const i=new Set(this[e]);i.has(t)?i.delete(t):i.add(t),this[e]=i,this._schedulePreview()}_save(){x(this,"save-rule",{rule:{enabled:this._enabled,labels:[...this._labels],areas:[...this._areas],floors:[...this._floors],domains:this._domains},reset:this._reset}),this.renderRoot.querySelector("hkm-dialog")?.close()}_chips(e,t,i){return o`<div class="chips">
      ${e.map(([s,n])=>{const a=i?.(s);return o`<button
          class="chip"
          aria-pressed=${String(this[t].has(s))}
          @click=${()=>this._toggle(t,s)}
        >
          ${a?o`<span class="swatch" style="background:${a}"></span>`:c}${n}
        </button>`})}
    </div>`}render(){const e=this.t,t=this.data,i=Object.entries(t.labels??{}),s=Object.entries(t.floors??{}),n=Object.entries(t.areas??{}),a=new Map(t.entities.map(u=>[u.entity_id,u.name])),l=this._preview,p=this._labels.size+this._floors.size+this._areas.size+this._categories.size>0,d=this.rule?.exclude.length??0,g=u=>{const _=t.labels[u]?.color;return _?_.startsWith("#")?_:`var(--${_}-color, ${_})`:null};return o`
      <hkm-dialog .heading=${e("rules_title")} wide>
        <div slot="icon" class="hero-icon">${h(me)}</div>
        <p class="intro">${e("rules_text")}</p>

        <label class="enable" @click=${()=>this._enabled=!this._enabled}>
          <span>
            <span class="enable-title">${e("rules_enabled")}</span>
            <span class="enable-sub">${e("rules_enabled_helper")}</span>
          </span>
          <button class="switch" role="switch" aria-checked=${String(this._enabled)}></button>
        </label>

        <section>
          <h3>${h(oi)} ${e("rules_labels")}</h3>
          ${i.length?this._chips(i.map(([u,_])=>[u,_.name]),"_labels",g):o`<p class="hint">${e("rules_no_labels")}</p>`}
        </section>
        ${s.length?o`<section>
              <h3>${e("rules_floors")}</h3>
              ${this._chips(s,"_floors")}
            </section>`:c}
        ${n.length?o`<section>
              <h3>${e("rules_areas")}</h3>
              ${this._chips(n,"_areas")}
            </section>`:c}
        <section>
          <h3>${e("rules_types")}</h3>
          <p class="hint">${e("rules_types_helper")}</p>
          ${this._chips(z.map(u=>[u.id,e(u.label)]),"_categories")}
        </section>

        <div class="preview ${p?"":"empty"}">
          ${p?l===null?o`<span class="spinner"></span>`:o`<strong>${e("rules_preview",{count:l.length})}</strong>
                  ${l.length?o`<div class="names">
                        ${l.slice(0,12).map(u=>a.get(u)??u).join(", ")}${l.length>12?" …":""}
                      </div>`:c}`:e("rules_none")}
        </div>

        ${d?o`<label class="enable small" @click=${()=>this._reset=!this._reset}>
              <span class="enable-sub">${e("rules_excluded",{count:d})}</span>
              <button class="switch" role="switch" aria-checked=${String(this._reset)}></button>
            </label>`:c}

        <button
          slot="actions"
          class="btn outlined"
          @click=${()=>this.renderRoot.querySelector("hkm-dialog")?.close()}
        >
          ${e("cancel")}
        </button>
        <button slot="actions" class="btn filled" @click=${this._save}>${e("save")}</button>
      </hkm-dialog>
    `}};re.properties={hass:{attribute:!1},t:{attribute:!1},entryId:{type:String},rule:{attribute:!1},data:{attribute:!1},_enabled:{state:!0},_labels:{state:!0},_floors:{state:!0},_areas:{state:!0},_categories:{state:!0},_reset:{state:!0},_preview:{state:!0}},re.styles=[A,C,$`
      .hero-icon {
        display: grid;
        place-items: center;
        width: 44px;
        height: 44px;
        border-radius: 14px;
        background: var(--hkm-tint);
        flex: none;
      }
      .hero-icon svg {
        width: 24px;
        height: 24px;
        fill: var(--hkm-primary);
      }
      .intro {
        margin: 0 0 16px;
        color: var(--hkm-text-2);
        line-height: 1.5;
        font-size: 14px;
      }
      .enable {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
        padding: 14px 16px;
        border-radius: 14px;
        background: var(--hkm-surface-2);
        cursor: pointer;
      }
      .enable.small {
        margin-top: 14px;
        padding: 10px 14px;
      }
      .enable > span {
        display: flex;
        flex-direction: column;
        gap: 2px;
      }
      .enable-title {
        font-weight: 500;
      }
      .enable-sub {
        font-size: 12px;
        color: var(--hkm-text-2);
      }
      section {
        margin-top: 18px;
      }
      h3 {
        display: flex;
        align-items: center;
        gap: 6px;
        margin: 0 0 10px;
        font-size: 14px;
        font-weight: 600;
      }
      h3 svg {
        width: 18px;
        height: 18px;
        fill: var(--hkm-text-2);
      }
      .hint {
        margin: -4px 0 10px;
        font-size: 12px;
        color: var(--hkm-text-2);
      }
      .chips {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
      }
      .swatch {
        width: 10px;
        height: 10px;
        border-radius: 50%;
      }
      .preview {
        margin-top: 20px;
        padding: 14px 16px;
        border-radius: 14px;
        background: var(--hkm-tint);
        font-size: 14px;
        line-height: 1.5;
        min-height: 22px;
      }
      .preview.empty {
        background: var(--hkm-surface-2);
        color: var(--hkm-text-2);
      }
      .names {
        margin-top: 4px;
        font-size: 13px;
        color: var(--hkm-text-2);
      }
    `];let He=re;customElements.get("hkm-rules-dialog")||customElements.define("hkm-rules-dialog",He);const rt={title:"HomeKit Manager",loading:"Loading…",refresh:"Refresh",new_bridge:"New bridge",empty_title:"No HomeKit bridge yet",empty_text:"Create a bridge, pick your devices and add it to the Home app on your iPhone. No YAML required.",empty_action:"Create bridge",status_running_paired:"Paired with Apple Home",status_running_unpaired:"Ready to pair",status_starting:"Starting…",status_stopped:"Stopped",status_not_loaded:"Not loaded",status_retry:"Retrying…",status_error:"Error",status_disabled:"Disabled",status_unknown:"Unknown",port:"Port {port}",accessories_active:"{count} accessories active",capacity:"{count} of {max} slots used",pair_title:"Add to Apple Home",pair_steps:"Open the Home app, tap + → Add Accessory and scan the code. Or enter the setup code manually.",setup_code:"Setup code",paired_title:"Connected",paired_text:"This bridge is paired with {count} Apple device(s). New entities appear in the Home app automatically.",pairing_unavailable:"Pairing information is available once the bridge is running.",copy:"Copy",copied:"Setup code copied",action_settings:"Settings",action_restart:"Restart",action_unpair:"Reset pairing",action_delete:"Delete",unmanaged_title:"This bridge uses domain filters",unmanaged_text:"It was set up with the built-in HomeKit dialog and exposes entities by domain ({filter}). Adopt it to pick entities one by one. The {count} entities exposed right now stay on the bridge; new entities will no longer be added automatically.",adopt:"Adopt bridge",yaml_title:"Configured in YAML",yaml_text:"This bridge is defined in configuration.yaml. Its entities can only be changed there.",search:"Search entities, areas, devices…",view_all:"All",view_assigned:"In HomeKit",view_unassigned:"Not in HomeKit",group_by:"Group by",group_area:"Area",group_domain:"Type",group_none:"None",show_more:"More filters",show_hidden:"Show hidden & diagnostic entities",show_unsupported:"Show entities HomeKit does not support",showing:"Showing {shown} of {total} entities",no_results:"No entities match your filters.",reset_filters:"Reset filters",no_area:"No area",add_all:"Add all",remove_all:"Remove all",in_group:"{count} of {total} in HomeKit",badge_new:"will be added",badge_removed:"will be removed",badge_hidden:"hidden",badge_diagnostic:"diagnostic",badge_unsupported:"not supported",badge_accessory_mode:"own accessory recommended",badge_other_bridge:"also on {name}",badge_custom_name:"as “{name}”",pending_add:"{count} to add",pending_remove:"{count} to remove",pending_config:"{count} settings changed",discard:"Discard",apply:"Apply",applying:"Applying… the bridge restarts for a moment.",applied:"HomeKit bridge updated",apply_hint:"The bridge restarts briefly when you apply changes.",too_many:"A bridge can hold at most {max} accessories. Remove some entities or create a second bridge.",entity_in_bridge:"Expose on this bridge",homekit_name:"Name in HomeKit",homekit_name_helper:"Leave empty to use the Home Assistant name.",accessory_type:"Accessory type",accessory_type_auto:"Automatic ({type})",info_type:"HomeKit type",info_area:"Area",info_device:"Device",info_integration:"Integration",info_state:"State",info_entity_id:"Entity ID",open_more_info:"Open in Home Assistant",warn_unsupported:"HomeKit has no matching accessory for this entity (for sensors only temperature, humidity, air quality, CO, CO₂ and light are supported). It will not show up in the Home app.",warn_accessory_mode:"Apple recommends pairing cameras, locks, TVs and activity remotes as separate accessories. On a bridge they work, but some features may be limited.",warn_type_reset:"Changing the type recreates the accessory in the Home app (room and scenes need to be set again).",done:"Done",cancel:"Cancel",close:"Close",save:"Save",create:"Create",settings_title:"Settings",create_title:"New HomeKit bridge",create_text:"The bridge starts empty. You can add entities right after creating it.",bridge_name:"Name",bridge_name_helper:"Shown in the Home app (3–25 characters, A–Z, digits, spaces).",bridge_port:"Port",bridge_port_helper:"TCP port of the HomeKit server. Only change it if you know you need to.",creating:"Creating bridge…",created:"Bridge “{name}” created",saving:"Saving… the bridge restarts for a moment.",saved:"Settings saved",confirm_delete_title:"Delete “{name}”?",confirm_delete_text:"The bridge and all its accessories are removed from Home Assistant and from Apple Home. Rooms, scenes and automations in the Home app that use them are lost.",confirm_unpair_title:"Reset pairing?",confirm_unpair_text:"All Apple devices are disconnected from this bridge. Afterwards you can add it to the Home app again with the setup code.",confirm_adopt_title:"Adopt “{name}”?",confirm_adopt_text:"The domain filter is converted into a fixed list of the {count} entities exposed right now. Pairing stays intact.",confirm_discard_title:"Discard changes?",confirm_discard_text:"You have changes that were not applied yet.",deleted:"Bridge deleted",unpaired:"Pairing reset. You can pair the bridge again now.",restarted:"Bridge restarted",adopted:"Bridge adopted",error:"Error: {message}",new_instance:"Add",new_title:"What do you want to add?",new_bridge_title:"HomeKit bridge",new_bridge_text:"Many devices with one pairing. Ideal for lights, switches, sensors, climate and covers (up to 149 devices).",new_accessory_title:"Standalone accessory",new_accessory_text:"One device with its own pairing. Needed for TVs, receivers, projectors, cameras, locks and activity remotes.",accessories_tab:"Accessories",accessories_hint:"Devices paired on their own (TVs, cameras, locks …)",accessories_title:"Standalone accessories",accessories_text:"Apple Home only shows TVs, receivers and projectors with inputs and remote, cameras with live video and locks reliably when they are paired as their own accessory. Every device gets its own setup code.",accessories_empty:"No standalone accessories yet.",add_accessory:"Add device",empty_action_accessory:"Add TV or camera",empty_hint_accessory:"TVs, cameras and locks are added as standalone accessories with their own setup code.",badge_is_accessory:"standalone accessory",make_accessory:"Pair as standalone accessory",creating_accessory:"Creating accessory…",created_accessory:"“{name}” created. Pair it with its setup code.",confirm_delete_accessory_text:"The accessory is removed from Apple Home. Rooms, scenes and automations in the Home app that use it are lost.",picker_title:"Add standalone accessory",picker_text:"Pick the device. Recommended are devices that Apple Home only fully supports as standalone accessory.",picker_recommended:"Recommended",picker_others:"All other devices",picker_change:"Change",picker_remove:"Remove from bridges",picker_remove_named:"Remove from {names} (otherwise it shows up twice in the Home app)",picker_not_needed:"This device ({type}) also works on a bridge. A standalone accessory needs its own pairing.",accessory_name_helper:"Shown in the Home app. A–Z, digits and spaces; umlauts are rewritten.",link_auto:"Automatic",link_same_device:"same device",code_title:"Code",code_label:"Code for HomeKit",code_stored:"Stored – leave empty to keep",code_helper:"Apple Home sends this code to Home Assistant when arming or unlocking. It is stored in Home Assistant only and never shown again.",code_remove:"Remove code",media_title:"Functions in HomeKit",media_helper:"Without a selection all supported functions become switches.",links_title:"Linked sensors",links_helper:"Shown inside the same HomeKit accessory. “Automatic” uses matching sensors of the same device.",battery_title:"Battery",battery_threshold:"Low battery warning (%)",battery_toggle:"Device has a battery",battery_detected:"Battery sensor found on this device – linked automatically.",battery_hint:"Turn on to show the battery level in the Home app.",standalone_title:"Standalone accessory with its own pairing",action_options:"Device options",rules_button:"Automatic",rules_active:"on",rules_dirty:"Apply or discard your changes first",rules_title:"Assign automatically",rules_text:"Pick labels, floors or areas. Matching entities join this bridge automatically, new ones too. If you remove one by hand, it stays excluded.",rules_enabled:"Assign automatically",rules_enabled_helper:"Checks after changes in Home Assistant and restarts the bridge briefly when needed.",rules_labels:"Labels",rules_no_labels:"No labels yet. Create them in Home Assistant under Settings → Areas, labels & zones.",rules_floors:"Floors",rules_areas:"Areas",rules_types:"Only these types",rules_types_helper:"Optional. Without a selection all types count; with only types selected, all entities of these types match.",rules_none:"Pick at least one label, floor, area or type.",rules_preview:"Currently matches {count} entities",rules_excluded:"{count} entities you removed stay excluded – reset",rules_saved:"Automatic assignment saved",rules_disabled:"Automatic assignment turned off",badge_auto:"automatic",missing_title:"Deleted entities on this bridge: {count}",missing_text:"They were deleted in Home Assistant. Remove them so the bridge stays clean.",missing_remove:"Remove from bridge",unavailable_title:"Not available right now",unavailable_text:"Assigned, but currently unavailable (integration not loaded or entity disabled):",controlled_badge:"regulated by {integration}",controlled_via_badge:"exposed via {integration}",controlled_title:"Use {integration}?",controlled_text:"“{name}” is regulated by {integration} (“{controller}”). If you expose the thermostat itself, Apple Home bypasses that regulation and shows the temperature of its built-in sensor.",controlled_use:"Expose {integration}",controlled_original:"Expose original",controlled_duplicate_title:"Already in HomeKit via {integration}",controlled_duplicate_text:"“{name}” is already exposed through {integration} (“{controller}”). Exposing it as well adds a second thermostat to Apple Home that bypasses the regulation.",controlled_duplicate_confirm:"Expose anyway",controlled_replaced:"Thermostats exposed via {integration}: {count}",health_controlled_title:"Original thermostats exposed: {count}",health_controlled_text:"They are regulated by {integration}. Apple Home bypasses that regulation and shows the temperature of the built-in sensor.",health_controlled_replace:"Replace with {integration}",cat_light:"Lights",cat_switch:"Switches",cat_climate:"Climate",cat_cover:"Covers & valves",cat_sensor:"Sensors",cat_security:"Security",cat_media:"Media",cat_scene:"Scenes & scripts",cat_select:"Selects",cat_appliance:"Appliances",cat_presence:"Presence",cat_other:"Other"},Ri={title:"HomeKit Manager",loading:"Wird geladen…",refresh:"Aktualisieren",new_bridge:"Neue Bridge",empty_title:"Noch keine HomeKit Bridge",empty_text:"Lege eine Bridge an, wähle deine Geräte aus und füge sie in der Home-App auf dem iPhone hinzu. Ganz ohne YAML.",empty_action:"Bridge anlegen",status_running_paired:"Mit Apple Home gekoppelt",status_running_unpaired:"Bereit zum Koppeln",status_starting:"Startet…",status_stopped:"Gestoppt",status_not_loaded:"Nicht geladen",status_retry:"Neuer Versuch…",status_error:"Fehler",status_disabled:"Deaktiviert",status_unknown:"Unbekannt",port:"Port {port}",accessories_active:"{count} Geräte aktiv",capacity:"{count} von {max} Plätzen belegt",pair_title:"Zu Apple Home hinzufügen",pair_steps:"Öffne die Home-App, tippe auf + → Gerät hinzufügen und scanne den Code. Alternativ den Setup-Code manuell eingeben.",setup_code:"Setup-Code",paired_title:"Verbunden",paired_text:"Die Bridge ist mit {count} Apple-Gerät(en) gekoppelt. Neue Entitäten erscheinen automatisch in der Home-App.",pairing_unavailable:"Kopplungsdaten sind verfügbar, sobald die Bridge läuft.",copy:"Kopieren",copied:"Setup-Code kopiert",action_settings:"Einstellungen",action_restart:"Neu starten",action_unpair:"Kopplung zurücksetzen",action_delete:"Löschen",unmanaged_title:"Diese Bridge nutzt Domain-Filter",unmanaged_text:"Sie wurde mit dem eingebauten HomeKit-Dialog eingerichtet und gibt Entitäten nach Domain frei ({filter}). Übernimm sie, um Entitäten einzeln auszuwählen. Die {count} aktuell freigegebenen Entitäten bleiben erhalten, neue Entitäten werden danach nicht mehr automatisch hinzugefügt.",adopt:"Bridge übernehmen",yaml_title:"Per YAML konfiguriert",yaml_text:"Diese Bridge ist in der configuration.yaml definiert. Ihre Entitäten lassen sich nur dort ändern.",search:"Entitäten, Bereiche, Geräte suchen…",view_all:"Alle",view_assigned:"In HomeKit",view_unassigned:"Nicht in HomeKit",group_by:"Gruppieren",group_area:"Bereich",group_domain:"Typ",group_none:"Keine",show_more:"Weitere Filter",show_hidden:"Versteckte & Diagnose-Entitäten anzeigen",show_unsupported:"Von HomeKit nicht unterstützte Entitäten anzeigen",showing:"{shown} von {total} Entitäten",no_results:"Keine Entitäten passen zu deinen Filtern.",reset_filters:"Filter zurücksetzen",no_area:"Ohne Bereich",add_all:"Alle hinzufügen",remove_all:"Alle entfernen",in_group:"{count} von {total} in HomeKit",badge_new:"wird hinzugefügt",badge_removed:"wird entfernt",badge_hidden:"versteckt",badge_diagnostic:"Diagnose",badge_unsupported:"nicht unterstützt",badge_accessory_mode:"eigenes Zubehör empfohlen",badge_other_bridge:"auch in {name}",badge_custom_name:"als „{name}“",pending_add:"{count} hinzufügen",pending_remove:"{count} entfernen",pending_config:"{count} Einstellungen geändert",discard:"Verwerfen",apply:"Übernehmen",applying:"Wird übernommen… die Bridge startet kurz neu.",applied:"HomeKit Bridge aktualisiert",apply_hint:"Beim Übernehmen startet die Bridge kurz neu.",too_many:"Eine Bridge kann höchstens {max} Geräte enthalten. Entferne Entitäten oder lege eine zweite Bridge an.",entity_in_bridge:"In dieser Bridge freigeben",homekit_name:"Name in HomeKit",homekit_name_helper:"Leer lassen, um den Namen aus Home Assistant zu verwenden.",accessory_type:"Gerätetyp",accessory_type_auto:"Automatisch ({type})",info_type:"HomeKit-Typ",info_area:"Bereich",info_device:"Gerät",info_integration:"Integration",info_state:"Zustand",info_entity_id:"Entitäts-ID",open_more_info:"In Home Assistant öffnen",warn_unsupported:"HomeKit hat für diese Entität keinen passenden Gerätetyp (bei Sensoren nur Temperatur, Luftfeuchtigkeit, Luftqualität, CO, CO₂ und Helligkeit). Sie erscheint nicht in der Home-App.",warn_accessory_mode:"Apple empfiehlt, Kameras, Schlösser, Fernseher und Aktivitäts-Fernbedienungen als eigenständiges Zubehör zu koppeln. In einer Bridge funktionieren sie, aber teils eingeschränkt.",warn_type_reset:"Ein Typwechsel legt das Gerät in der Home-App neu an (Raum und Szenen müssen neu zugewiesen werden).",done:"Fertig",cancel:"Abbrechen",close:"Schließen",save:"Speichern",create:"Anlegen",settings_title:"Einstellungen",create_title:"Neue HomeKit Bridge",create_text:"Die Bridge startet leer. Entitäten fügst du direkt danach hinzu.",bridge_name:"Name",bridge_name_helper:"Wird in der Home-App angezeigt (3–25 Zeichen, A–Z, Ziffern, Leerzeichen).",bridge_port:"Port",bridge_port_helper:"TCP-Port des HomeKit-Servers. Nur ändern, wenn nötig.",creating:"Bridge wird angelegt…",created:"Bridge „{name}“ angelegt",saving:"Wird gespeichert… die Bridge startet kurz neu.",saved:"Einstellungen gespeichert",confirm_delete_title:"„{name}“ löschen?",confirm_delete_text:"Die Bridge und alle ihre Geräte werden aus Home Assistant und aus Apple Home entfernt. Räume, Szenen und Automationen der Home-App, die sie nutzen, gehen verloren.",confirm_unpair_title:"Kopplung zurücksetzen?",confirm_unpair_text:"Alle Apple-Geräte werden von dieser Bridge getrennt. Danach kannst du sie mit dem Setup-Code erneut zur Home-App hinzufügen.",confirm_adopt_title:"„{name}“ übernehmen?",confirm_adopt_text:"Der Domain-Filter wird in eine feste Liste der {count} aktuell freigegebenen Entitäten umgewandelt. Die Kopplung bleibt erhalten.",confirm_discard_title:"Änderungen verwerfen?",confirm_discard_text:"Es gibt Änderungen, die noch nicht übernommen wurden.",deleted:"Bridge gelöscht",unpaired:"Kopplung zurückgesetzt. Die Bridge kann jetzt neu gekoppelt werden.",restarted:"Bridge neu gestartet",adopted:"Bridge übernommen",error:"Fehler: {message}",new_instance:"Hinzufügen",new_title:"Was möchtest du hinzufügen?",new_bridge_title:"HomeKit Bridge",new_bridge_text:"Viele Geräte mit einer Kopplung. Ideal für Licht, Schalter, Sensoren, Klima und Rollläden (bis 149 Geräte).",new_accessory_title:"Einzelgerät",new_accessory_text:"Ein Gerät mit eigener Kopplung. Nötig für Fernseher, Receiver, Projektoren, Kameras, Schlösser und Aktivitäts-Fernbedienungen.",accessories_tab:"Einzelgeräte",accessories_hint:"Eigenständig gekoppelte Geräte (Fernseher, Kameras, Schlösser …)",accessories_title:"Einzelgeräte",accessories_text:"Fernseher, Receiver und Projektoren mit Eingängen und Fernbedienung, Kameras mit Livebild und Schlösser zeigt Apple Home nur zuverlässig an, wenn sie als eigenes Zubehör gekoppelt sind. Jedes Gerät bekommt einen eigenen Setup-Code.",accessories_empty:"Noch keine Einzelgeräte.",add_accessory:"Gerät hinzufügen",empty_action_accessory:"Fernseher oder Kamera hinzufügen",empty_hint_accessory:"Fernseher, Kameras und Schlösser werden als Einzelgerät mit eigenem Setup-Code hinzugefügt.",badge_is_accessory:"Einzelgerät",make_accessory:"Als Einzelgerät koppeln",creating_accessory:"Einzelgerät wird angelegt…",created_accessory:"„{name}“ angelegt. Jetzt mit dem Setup-Code koppeln.",confirm_delete_accessory_text:"Das Gerät wird aus Apple Home entfernt. Räume, Szenen und Automationen der Home-App, die es nutzen, gehen verloren.",picker_title:"Einzelgerät hinzufügen",picker_text:"Wähle das Gerät. Empfohlen sind Geräte, die Apple Home nur als Einzelgerät voll unterstützt.",picker_recommended:"Empfohlen",picker_others:"Alle weiteren Geräte",picker_change:"Ändern",picker_remove:"Aus Bridges entfernen",picker_remove_named:"Aus {names} entfernen (sonst erscheint es doppelt in der Home-App)",picker_not_needed:"Dieses Gerät ({type}) funktioniert auch in einer Bridge. Als Einzelgerät braucht es eine eigene Kopplung.",accessory_name_helper:"Wird in der Home-App angezeigt. A–Z, Ziffern und Leerzeichen; Umlaute werden umgeschrieben.",link_auto:"Automatisch",link_same_device:"gleiches Gerät",code_title:"Code",code_label:"Code für HomeKit",code_stored:"Gespeichert – leer lassen zum Beibehalten",code_helper:"Apple Home schickt diesen Code beim Scharfschalten bzw. Aufschließen an Home Assistant. Er wird nur in Home Assistant gespeichert und nie wieder angezeigt.",code_remove:"Code entfernen",media_title:"Funktionen in HomeKit",media_helper:"Ohne Auswahl werden alle unterstützten Funktionen als Schalter angelegt.",links_title:"Verknüpfte Sensoren",links_helper:"Werden im selben HomeKit-Gerät angezeigt. „Automatisch“ nimmt passende Sensoren vom selben Gerät.",battery_title:"Batterie",battery_threshold:"Warnung bei niedrigem Akku (%)",battery_toggle:"Gerät hat eine Batterie",battery_detected:"Batteriesensor am Gerät erkannt – wird automatisch verknüpft.",battery_hint:"Einschalten, um den Akkustand in der Home-App anzuzeigen.",standalone_title:"Einzelgerät mit eigener Kopplung",action_options:"Geräteoptionen",rules_button:"Automatisch",rules_active:"an",rules_dirty:"Erst Änderungen übernehmen oder verwerfen",rules_title:"Automatisch zuweisen",rules_text:"Wähle Labels, Etagen oder Bereiche. Passende Entitäten kommen automatisch in diese Bridge – auch neue. Entfernst du eine davon von Hand, bleibt sie ausgeschlossen.",rules_enabled:"Automatisch zuweisen",rules_enabled_helper:"Prüft nach Änderungen in Home Assistant und startet die Bridge bei Bedarf kurz neu.",rules_labels:"Labels",rules_no_labels:"Noch keine Labels. Lege sie in Home Assistant unter Einstellungen → Bereiche, Labels & Zonen an.",rules_floors:"Etagen",rules_areas:"Bereiche",rules_types:"Nur diese Typen",rules_types_helper:"Optional. Ohne Auswahl zählen alle Typen; sind nur Typen gewählt, passen alle Entitäten dieser Typen.",rules_none:"Wähle mindestens ein Label, eine Etage, einen Bereich oder einen Typ.",rules_preview:"Passt aktuell auf {count} Entitäten",rules_excluded:"{count} von dir entfernte Entitäten bleiben ausgeschlossen – zurücksetzen",rules_saved:"Automatische Zuweisung gespeichert",rules_disabled:"Automatische Zuweisung ausgeschaltet",badge_auto:"automatisch",missing_title:"Gelöschte Entitäten in dieser Bridge: {count}",missing_text:"Sie wurden in Home Assistant gelöscht. Entferne sie, damit die Bridge sauber bleibt.",missing_remove:"Aus der Bridge entfernen",unavailable_title:"Gerade nicht verfügbar",unavailable_text:"Zugewiesen, aber aktuell nicht verfügbar (Integration nicht geladen oder Entität deaktiviert):",controlled_badge:"geregelt von {integration}",controlled_via_badge:"über {integration} freigegeben",controlled_title:"{integration} verwenden?",controlled_text:"„{name}“ wird von {integration} („{controller}“) geregelt. Gibst du das Thermostat selbst frei, umgeht Apple Home diese Regelung und zeigt die Temperatur des eingebauten Fühlers.",controlled_use:"{integration} freigeben",controlled_original:"Original freigeben",controlled_duplicate_title:"Schon über {integration} in HomeKit",controlled_duplicate_text:"„{name}“ ist bereits über {integration} („{controller}“) freigegeben. Zusätzlich freigegeben erscheint ein zweites Thermostat in Apple Home, das die Regelung umgeht.",controlled_duplicate_confirm:"Trotzdem freigeben",controlled_replaced:"Über {integration} freigegebene Thermostate: {count}",health_controlled_title:"Original-Thermostate freigegeben: {count}",health_controlled_text:"Sie werden von {integration} geregelt. Apple Home umgeht so die Regelung und zeigt die Temperatur des eingebauten Fühlers.",health_controlled_replace:"Durch {integration} ersetzen",cat_light:"Licht",cat_switch:"Schalter",cat_climate:"Klima",cat_cover:"Rollläden & Ventile",cat_sensor:"Sensoren",cat_security:"Sicherheit",cat_media:"Medien",cat_scene:"Szenen & Skripte",cat_select:"Auswahl",cat_appliance:"Haushalt",cat_presence:"Anwesenheit",cat_other:"Sonstiges"},at=r=>{const e=r?.toLowerCase().startsWith("de")?Ri:rt;return(t,i)=>{let s=e[t]??rt[t]??t;if(i)for(const[n,a]of Object.entries(i))s=s.split(`{${n}}`).join(String(a));return s}},Di=r=>!!r?.toLowerCase().startsWith("de"),Ni=5e3,w="__accessories__",ot="homekit_manager.",M={get(r){try{return window.localStorage.getItem(ot+r)}catch{return null}},set(r,e){try{window.localStorage.setItem(ot+r,e)}catch{}}},ae=class ae extends b{constructor(){super(),this._nextDialog=null,this._t=at("en"),this._german=!1,this._loaded=!1,this._resetFilters=()=>{this._search="",this._view="all",this._categories=new Set,this._showHidden=!1,this._showUnsupported=!1},this._bridges=null,this._instances=[],this._accessories=[],this._selected=M.get("selected"),this._entities=null,this._pairing={},this._draft=new Set,this._draftConfig={},this._search="",this._view="all",this._groupBy=M.get("group_by")||"area",this._categories=new Set,this._showHidden=!1,this._showUnsupported=!1,this._showFilters=!1,this._collapsed=new Set,this._busy=null,this._dialog=null,this._loadError=null}get hass(){return this._hass}set hass(e){const t=this._hass;this._hass=e;const i=e.locale?.language||e.language;if(!t||(t.locale?.language||t.language)!==i){this._t=at(i),this._german=Di(i),this.requestUpdate("hass",t),!t&&this.isConnected&&this._start();return}this._hassTimer===void 0&&(this._hassTimer=window.setTimeout(()=>{this._hassTimer=void 0,this.requestUpdate("hass")},1e3))}connectedCallback(){super.connectedCallback(),this._hass&&this._start()}disconnectedCallback(){super.disconnectedCallback(),window.clearInterval(this._pollTimer),window.clearTimeout(this._hassTimer),this._pollTimer=void 0,this._hassTimer=void 0}_start(){this._loaded||(this._loaded=!0,this._loadAll()),this._pollTimer===void 0&&(this._pollTimer=window.setInterval(()=>this._poll(),Ni))}get _bridge(){return this._bridges?.find(e=>e.entry_id===this._selected)}_instance(e){return this._instances.find(t=>t.entry_id===e)}_setInstances(e){this._instances=e,this._bridges=e.filter(i=>i.mode==="bridge"),this._accessories=e.filter(i=>i.mode==="accessory"),this._selected===w||this._bridges.some(i=>i.entry_id===this._selected)||(this._selected=this._bridges[0]?.entry_id??(this._accessories.length?w:null))}_visibleInstances(){if(this._selected===w)return this._accessories;const e=this._bridge;return e?[e]:[]}async _loadAll(){try{const[e,t]=await Promise.all([pe(this.hass),et(this.hass)]);this._entities=t,this._setInstances(e),this._resetDraft(),this._loadError=null,this._loadPairing()}catch(e){this._loadError=ue(e)}}async _reloadEntities(){try{this._entities=await et(this.hass)}catch(e){this._toast(this._t("error",{message:ue(e)}))}}async _poll(){if(!(!this._hass||this._busy||document.hidden))try{const e=new Map(this._instances.map(n=>[n.entry_id,n])),t=this._bridge,i=this._isDirty;this._setInstances(await pe(this.hass));const s=this._bridge;s&&!i&&(!t||t.entities.join()!==s.entities.join()||t.entry_id!==s.entry_id)&&this._resetDraft();for(const n of this._visibleInstances()){const a=e.get(n.entry_id),l=this._pairing[n.entry_id];(!a||a.status!==n.status||a.paired!==n.paired||!l?.available||n.pin&&l.pin!==n.pin)&&this._loadPairingFor(n.entry_id)}}catch{}}_loadPairing(){for(const e of this._visibleInstances())this._loadPairingFor(e.entry_id)}async _loadPairingFor(e){try{const t=await gi(this.hass,e);this._pairing={...this._pairing,[e]:t}}catch{}}_resetDraft(){const e=this._bridge;this._draft=new Set(e?.entities??[]),this._draftConfig={}}_replaceBridge(e){this._setInstances(this._instances.map(t=>t.entry_id===e.entry_id?e:t))}_options(e){return Oi(this._bridge?.entity_config[e],this._draftConfig[e])}get _changes(){const e=this._bridge;if(!e)return{added:[],removed:[],config:[]};const t=new Set(e.entities),i=[...this._draft].filter(a=>!t.has(a)),s=e.entities.filter(a=>!this._draft.has(a)),n=Object.keys(this._draftConfig).filter(a=>Ae(e.entity_config[a],this._draftConfig[a]));return{added:i,removed:s,config:n}}get _isDirty(){const{added:e,removed:t,config:i}=this._changes;return e.length+t.length+i.length>0}_toast(e){this.dispatchEvent(new CustomEvent("hass-notification",{detail:{message:e},bubbles:!0,composed:!0}))}async _run(e,t,i){this._busy=e;try{const s=await t();return i&&this._toast(i),s}catch(s){this._toast(this._t("error",{message:ue(s)}));return}finally{this._busy=null}}_toggle(e,t){if(this._busy)return;const i=new Set(this._draft);t??!i.has(e)?i.add(e):i.delete(e),this._draft=i}_onSwitch(e){const t=this._draft.has(e.entity_id)?void 0:this._controllerOf(e);if(!t){this._toggle(e.entity_id);return}const i=this._t,s={name:e.name,controller:t.name,integration:this._controllerTitle(t.entity_id)};if(this._draft.has(t.entity_id)){this._confirm(i("controlled_duplicate_title",s),i("controlled_duplicate_text",s),i("controlled_duplicate_confirm"),()=>this._toggle(e.entity_id,!0));return}this._dialog={kind:"confirm",heading:i("controlled_title",s),text:i("controlled_text",s),confirmLabel:i("controlled_use",s),action:()=>this._toggle(t.entity_id,!0),altLabel:i("controlled_original"),alt:()=>this._toggle(e.entity_id,!0)}}_toggleGroup(e,t){const i=new Set(this._draft);let s=0,n="";for(const a of e){const l=this._controllerOf(a);t&&a.supported?l&&!i.has(a.entity_id)?i.has(l.entity_id)||(i.add(l.entity_id),s++,n=this._controllerTitle(l.entity_id)):i.add(a.entity_id):t||(i.delete(a.entity_id),l&&i.delete(l.entity_id))}this._draft=i,s&&this._toast(this._t("controlled_replaced",{count:s,integration:n}))}_replaceControlled(e){const t=new Set(this._draft);for(const i of e){const s=this._controllerOf(i);s&&(t.delete(i.entity_id),t.add(s.entity_id))}this._draft=t}_entity(e){const t=this._entities;if(t)return this._byId?.source!==t&&(this._byId={source:t,map:new Map(t.entities.map(i=>[i.entity_id,i]))}),this._byId.map.get(e)}_controllerOf(e){if(!e.controlled_by)return;const t=this._entity(e.controlled_by);return t?.supported?t:void 0}_controllerTitle(e){return this._entities?.controllers?.[e]?.title??e}_isCovered(e){return this._draft.has(e.entity_id)?!0:!!(e.controlled_by&&this._draft.has(e.controlled_by)&&this._controllerOf(e))}async _apply(){const e=this._bridge;if(!e)return;const{config:t}=this._changes,i={};for(const n of t)i[n]=wt(e.entity_config[n],this._draftConfig[n]);const s=await this._run(this._t("applying"),()=>bi(this.hass,e.entry_id,[...this._draft].sort(),i),this._t("applied"));s&&(this._replaceBridge(s),this._resetDraft(),this._reloadEntities(),this._loadPairing())}_select(e){if(e===this._selected)return;const t=()=>{this._selected=e,M.set("selected",e),this._resetDraft(),this._loadPairing()};this._isDirty?this._confirm(this._t("confirm_discard_title"),this._t("confirm_discard_text"),this._t("discard"),t,!0):t()}_confirm(e,t,i,s,n=!1){this._dialog={kind:"confirm",heading:e,text:t,confirmLabel:i,danger:n,action:s}}async _create(e){const t=await this._run(this._t("creating"),()=>_i(this.hass,e),this._t("created",{name:e}));t&&(this._setInstances([...this._instances,t]),this._selected=t.entry_id,M.set("selected",t.entry_id),this._resetDraft(),this._reloadEntities(),this._loadPairing())}async _createAccessory(e,t,i){const s=await this._run(this._t("creating_accessory"),()=>mi(this.hass,e,t,i),this._t("created_accessory",{name:t}));s&&(this._setInstances(await pe(this.hass).catch(()=>[...this._instances,s])),this._selected=w,M.set("selected",w),this._resetDraft(),this._reloadEntities(),this._loadPairing())}async _saveSettings(e,t,i){const s=await this._run(this._t("saving"),()=>fi(this.hass,e,{name:t,port:i}),this._t("saved"));s&&(this._replaceBridge(s),this._loadPairingFor(e))}async _saveAccessoryOptions(e,t,i){const s=await this._run(this._t("saving"),()=>xi(this.hass,e,t,i),this._t("saved"));s&&(this._replaceBridge(s),this._loadPairingFor(e))}async _saveRule(e,t){const i=this._bridge;if(!i)return;const s=await this._run(this._t("applying"),()=>vi(this.hass,i.entry_id,e,t),this._t(e.enabled?"rules_saved":"rules_disabled"));s&&(this._replaceBridge(s),this._resetDraft(),this._reloadEntities(),this._loadPairing())}_removeMissingFromDraft(e){const t=new Set(this._draft);for(const i of e)t.delete(i);this._draft=t}_askDelete(e){const t=this._instance(e);if(!t)return;const i=t.mode==="accessory";this._confirm(this._t("confirm_delete_title",{name:t.name}),this._t(i?"confirm_delete_accessory_text":"confirm_delete_text"),this._t("action_delete"),async()=>{await this._run(this._t("loading"),()=>Ai(this.hass,e).then(()=>!0),this._t("deleted"))&&(this._setInstances(this._instances.filter(n=>n.entry_id!==e)),this._resetDraft(),this._loadPairing(),this._reloadEntities())},!0)}_askUnpair(e){this._confirm(this._t("confirm_unpair_title"),this._t("confirm_unpair_text"),this._t("action_unpair"),async()=>{const t=await this._run(this._t("loading"),()=>ki(this.hass,e),this._t("unpaired"));t&&this._replaceBridge(t),this._loadPairingFor(e)},!0)}async _restart(e){const t=await this._run(this._t("status_starting"),()=>wi(this.hass,e),this._t("restarted"));t&&this._replaceBridge(t),this._loadPairingFor(e)}_askAdopt(){const e=this._bridge,t=e.accessory_entities?.length??this._implicitCount(e);this._confirm(this._t("confirm_adopt_title",{name:e.name}),this._t("confirm_adopt_text",{count:t}),this._t("adopt"),async()=>{const i=await this._run(this._t("loading"),()=>$i(this.hass,e.entry_id),this._t("adopted"));i&&(this._replaceBridge(i),this._resetDraft(),this._reloadEntities())})}_implicitCount(e){return this._entities?.entities.filter(t=>t.bridges.includes(e.entry_id)).length??0}async _copyPin(e){try{await navigator.clipboard.writeText(e.replace(/-/g,"")),this._toast(this._t("copied"))}catch{}}_accessoryFor(e){return this._accessories.find(t=>t.entity_id===e)}_baseEntities(){const e=this._bridge;if(!this._entities||!e)return[];const t=new Set(e.entities);return this._entities.entities.filter(i=>this._draft.has(i.entity_id)||t.has(i.entity_id)?!0:!(!this._showUnsupported&&!i.supported||!this._showHidden&&(i.hidden||i.entity_category)))}_matchesSearch(e,t){if(!t.length)return!0;const i=this._options(e.entity_id).name??"",s=`${e.name} ${e.entity_id} ${e.area??""} ${e.device??""} ${i}`.toLowerCase();return t.every(n=>s.includes(n))}_filtered(e){const t=this._search.toLowerCase().split(/\s+/).filter(Boolean);return e.filter(i=>{const s=this._draft.has(i.entity_id);return this._view==="assigned"&&!s||this._view==="unassigned"&&s||this._categories.size&&!this._categories.has(J(i.domain).id)?!1:this._matchesSearch(i,t)})}_groups(e){const t=this._t;if(this._groupBy==="none")return[{key:"all",label:t("view_all"),entities:e}];const i=new Map;for(const n of e){let a,l,p;if(this._groupBy==="area")a=n.area_id??"",l=n.area??t("no_area");else{const g=J(n.domain);a=g.id,l=t(g.label),p=g.icon}let d=i.get(a);d||(d={key:a,label:l,icon:p,entities:[]},i.set(a,d)),d.entities.push(n)}const s=[...i.values()];if(this._groupBy==="area")s.sort((n,a)=>n.key?a.key?n.label.localeCompare(a.label):-1:1);else{const n=[...z.map(a=>a.id),"other"];s.sort((a,l)=>n.indexOf(a.key)-n.indexOf(l.key))}return s}willUpdate(e){e.has("_groupBy")&&M.set("group_by",this._groupBy)}render(){const e=this._t;return o`
      <div class="toolbar">
        <ha-menu-button .hass=${this.hass} .narrow=${this.narrow}></ha-menu-button>
        <div class="toolbar-title">${e("title")}</div>
        <button
          class="icon-btn"
          title=${e("refresh")}
          aria-label=${e("refresh")}
          @click=${()=>this._loadAll()}
        >
          ${h(hi)}
        </button>
      </div>
      <div class="scroller">
        <div class="content">${this._renderBody()}</div>
      </div>
      ${this._renderDialog()}
    `}_renderBody(){const e=this._t;if(this._loadError)return o`<div class="card message error-card">
        ${h(Yt)}
        <div>${e("error",{message:this._loadError})}</div>
        <button class="btn tonal" @click=${()=>this._loadAll()}>${e("refresh")}</button>
      </div>`;if(!this._bridges||!this._entities)return o`<div class="loading"><div class="spinner"></div>${e("loading")}</div>`;if(!this._bridges.length&&!this._accessories.length&&this._selected!==w)return this._renderEmpty();if(this._selected===w||!this._bridge)return o`${this._renderTabs()} ${this._renderAccessories()}`;const t=this._bridge;return o`
      ${this._renderTabs()} ${this._renderHero(t)}
      ${t.yaml?this._renderNotice(D,e("yaml_title"),e("yaml_text")):t.manageable?this._renderEntities(t):this._renderUnmanaged(t)}
    `}_renderEmpty(){const e=this._t;return o`
      <div class="empty card">
        <div class="empty-art">
          <div class="empty-ring"></div>
          <div class="bridge-tile large">${h(fe)}</div>
        </div>
        <h2>${e("empty_title")}</h2>
        <p>${e("empty_text")}</p>
        <div class="empty-actions">
          <button
            class="btn filled"
            ?disabled=${!!this._busy}
            @click=${()=>this._dialog={kind:"create"}}
          >
            ${this._busy?o`<span class="spinner small"></span>`:h(G)}
            ${this._busy??e("empty_action")}
          </button>
          <button
            class="btn outlined"
            ?disabled=${!!this._busy}
            @click=${()=>this._dialog={kind:"add-accessory"}}
          >
            ${h(v)} ${e("empty_action_accessory")}
          </button>
        </div>
        <p class="empty-hint">${e("empty_hint_accessory")}</p>
      </div>
    `}_statusInfo(e){const t=this._t;switch(e.status){case"running":return e.paired?{cls:"ok",label:t("status_running_paired")}:{cls:"ready",label:t("status_running_unpaired")};case"starting":case"retry":return{cls:"busy",label:t(e.status==="retry"?"status_retry":"status_starting")};case"disabled":case"not_loaded":case"stopped":return{cls:"off",label:t(`status_${e.status}`)};case"error":return{cls:"bad",label:t("status_error")};default:return{cls:"off",label:t("status_unknown")}}}_renderTabs(){const e=this._t;return o`
      <nav class="tabs" aria-label="Bridges">
        ${this._bridges.map(t=>{const i=this._statusInfo(t);return o`<button
            class="tab"
            aria-selected=${String(t.entry_id===this._selected)}
            @click=${()=>this._select(t.entry_id)}
            title=${i.label}
          >
            <span class="dot ${i.cls}"></span>
            <span class="tab-name">${t.name}</span>
            ${t.manageable?o`<span class="tab-count">${t.entities.length}</span>`:c}
          </button>`})}
        <span class="tab-sep" aria-hidden="true"></span>
        <button
          class="tab"
          aria-selected=${String(this._selected===w)}
          @click=${()=>this._select(w)}
          title=${e("accessories_hint")}
        >
          ${h(v)}
          <span class="tab-name">${e("accessories_tab")}</span>
          <span class="tab-count">${this._accessories.length}</span>
        </button>
        <button
          class="tab add"
          ?disabled=${!!this._busy}
          @click=${()=>this._dialog={kind:"new"}}
        >
          ${h(G)} ${e("new_instance")}
        </button>
      </nav>
    `}_renderHero(e){const t=this._t,i=this._statusInfo(e),s=this._entities.max_accessories,n=e.manageable?this._draft.size:e.accessory_entities?.length??0,a=Math.min(100,Math.round(n/s*100)),l=!!this._busy;return o`
      <section class="card hero">
        <div class="hero-main">
          <div class="hero-head">
            <div class="bridge-tile">${h(fe)}</div>
            <div class="hero-titles">
              <h1>${e.name}</h1>
              <div class="hero-meta">
                <span class="status ${i.cls}"><span class="dot ${i.cls}"></span>${i.label}</span>
                ${e.port?o`<span>${t("port",{port:e.port})}</span>`:c}
                ${e.accessory_entities?o`<span>${t("accessories_active",{count:e.accessory_entities.length})}</span>`:c}
              </div>
            </div>
          </div>

          <div class="capacity">
            <div class="capacity-label">
              <span>${t("capacity",{count:n,max:s})}</span><span>${a}%</span>
            </div>
            <div class="meter ${n>s?"over":""}"><div style="width:${a}%"></div></div>
          </div>

          <div class="hero-actions">
            ${e.manageable&&!e.yaml?o`<button
                  class="btn small ${e.rule?.enabled?"tonal":"outlined"}"
                  ?disabled=${l||this._isDirty}
                  title=${this._isDirty?t("rules_dirty"):t("rules_title")}
                  @click=${()=>this._dialog={kind:"rules"}}
                >
                  ${h(me)} ${t("rules_button")}
                  ${e.rule?.enabled?o`<span class="pill">${t("rules_active")}</span>`:c}
                </button>`:c}
            ${e.yaml?c:o`<button class="btn outlined small" ?disabled=${l} @click=${()=>this._dialog={kind:"settings",entryId:e.entry_id}}>
                  ${h(j)} ${t("action_settings")}
                </button>`}
            <button class="btn outlined small" ?disabled=${l} @click=${()=>this._restart(e.entry_id)}>
              ${h(Je)} ${t("action_restart")}
            </button>
            ${e.paired?o`<button class="btn outlined small" ?disabled=${l} @click=${()=>this._askUnpair(e.entry_id)}>
                  ${h(Ye)} ${t("action_unpair")}
                </button>`:c}
            ${e.yaml?c:o`<button class="btn small danger" ?disabled=${l} @click=${()=>this._askDelete(e.entry_id)}>
                  ${h(qe)} ${t("action_delete")}
                </button>`}
          </div>
        </div>
        ${this._renderPairing(e)}
      </section>
    `}_renderPairing(e){const t=this._t,i=this._pairing[e.entry_id];return e.paired?o`<div class="pairing paired">
        <div class="paired-icon">${h(Qe)}</div>
        <div class="pairing-title">${t("paired_title")}</div>
        <p>${t("paired_text",{count:e.paired_clients||1})}</p>
      </div>`:!i?.available||!i.pin?o`<div class="pairing pending">
        <div class="spinner"></div>
        <p>${t("pairing_unavailable")}</p>
      </div>`:o`<div class="pairing">
      <div class="pairing-title">${h(ci)} ${t("pair_title")}</div>
      <div class="pairing-body">
        ${i.qr?o`<img class="qr" src=${i.qr} alt="HomeKit QR" />`:c}
        <div class="code-box">
          <div class="code-label">${t("setup_code")}</div>
          <button class="code" title=${t("copy")} @click=${()=>this._copyPin(i.pin)}>
            <span>${i.pin}</span>${h(We)}
          </button>
          <p>${t("pair_steps")}</p>
        </div>
      </div>
    </div>`}_renderNotice(e,t,i,s){return o`<section class="card notice">
      <div class="notice-icon">${h(e)}</div>
      <div class="notice-body">
        <h3>${t}</h3>
        <p>${i}</p>
        ${s??c}
      </div>
    </section>`}_renderAccessories(){const e=this._t,t=!!this._busy;return o`
      <section class="card notice accessories-intro">
        <div class="notice-icon">${h(v)}</div>
        <div class="notice-body">
          <h3>${e("accessories_title")}</h3>
          <p>${e("accessories_text")}</p>
          <button
            class="btn filled"
            ?disabled=${t}
            @click=${()=>this._dialog={kind:"add-accessory"}}
          >
            ${t?o`<span class="spinner small"></span>`:h(G)}
            ${this._busy??e("add_accessory")}
          </button>
        </div>
      </section>
      ${this._accessories.length?o`<div class="acc-grid">${this._accessories.map(i=>this._renderAccessoryCard(i))}</div>`:o`<div class="card message">${h(v)}<div>${e("accessories_empty")}</div></div>`}
    `}_renderAccessoryCard(e){const t=this._t,i=!!this._busy,s=this._statusInfo(e),n=this._entities?.entities.find(g=>g.entity_id===e.entity_id),a=e.entity_id?this.hass.states[e.entity_id]:void 0,l=n?T(n.accessory_type,n.domain,n.device_class,this._german):null,p=this._pairing[e.entry_id];let d;return e.paired?d=o`<div class="acc-paired">
        ${h(Qe)}<span>${t("status_running_paired")}</span>
      </div>`:p?.available&&p.pin?d=o`<div class="acc-pairing">
        ${p.qr?o`<img class="qr small" src=${p.qr} alt="HomeKit QR" />`:c}
        <div class="code-box">
          <div class="code-label">${t("setup_code")}</div>
          <button class="code" title=${t("copy")} @click=${()=>this._copyPin(p.pin)}>
            <span>${p.pin}</span>${h(We)}
          </button>
        </div>
      </div>`:d=o`<div class="acc-pairing pending">
        <div class="spinner"></div><span>${t("pairing_unavailable")}</span>
      </div>`,o`
      <section class="card acc-card">
        <div class="acc-head">
          <div class="row-icon on">
            ${n?this._stateIcon(n,a):h(v)}
          </div>
          <div class="acc-titles">
            <div class="acc-name">${e.name}</div>
            <div class="mono">${e.entity_id??"—"}</div>
          </div>
        </div>
        <div class="acc-meta">
          <span class="status"><span class="dot ${s.cls}"></span>${s.label}</span>
          ${l?o`<span class="badge primary">${l}</span>`:c}
          ${e.port?o`<span class="badge">${t("port",{port:e.port})}</span>`:c}
        </div>
        ${d}
        <div class="acc-actions">
          ${e.yaml?c:o`<button
                class="icon-btn"
                title=${t("action_settings")}
                aria-label=${t("action_settings")}
                ?disabled=${i}
                @click=${()=>this._dialog={kind:"settings",entryId:e.entry_id}}
              >
                ${h(j)}
              </button>`}
          ${n?o`<button
                class="icon-btn"
                title=${t("action_options")}
                aria-label=${t("action_options")}
                ?disabled=${i||e.yaml}
                @click=${()=>this._dialog={kind:"entity",entityId:n.entity_id,accessoryId:e.entry_id}}
              >
                ${h(he)}
              </button>`:c}
          <button
            class="icon-btn"
            title=${t("action_restart")}
            aria-label=${t("action_restart")}
            ?disabled=${i}
            @click=${()=>this._restart(e.entry_id)}
          >
            ${h(Je)}
          </button>
          ${e.paired?o`<button
                class="icon-btn"
                title=${t("action_unpair")}
                aria-label=${t("action_unpair")}
                ?disabled=${i}
                @click=${()=>this._askUnpair(e.entry_id)}
              >
                ${h(Ye)}
              </button>`:c}
          <span class="spacer"></span>
          ${e.yaml?c:o`<button
                class="btn small danger"
                ?disabled=${i}
                @click=${()=>this._askDelete(e.entry_id)}
              >
                ${h(qe)} ${t("action_delete")}
              </button>`}
        </div>
      </section>
    `}_renderUnmanaged(e){const t=this._t,i=e.filter??{},s=[...i.include_domains??[],...i.include_entity_globs??[]],n=[...i.exclude_domains??[],...i.exclude_entities??[]],a=(s.length?s.join(", "):this._german?"alle":"all")+(n.length?this._german?`, ohne ${n.length}`:`, minus ${n.length}`:""),l=e.accessory_entities?.length??this._implicitCount(e);return this._renderNotice(he,t("unmanaged_title"),t("unmanaged_text",{filter:a,count:l}),o`<button class="btn filled" ?disabled=${!!this._busy} @click=${()=>this._askAdopt()}>
        ${t("adopt")}
      </button>`)}_renderHealth(e){const t=this._t,i=e.missing.filter(l=>this._draft.has(l)),s=e.unavailable.filter(l=>!this.hass.states[l]),n=[...this._draft].map(l=>this._entity(l)).filter(l=>!!(l&&this._controllerOf(l)));if(!i.length&&!s.length&&!n.length)return c;const a=n.length?this._controllerTitle(n[0].controlled_by):"";return o`<section class="card health">
      ${n.length?o`<div class="health-row">
            <div class="health-icon">${h(W)}</div>
            <div class="health-body">
              <strong>${t("health_controlled_title",{count:n.length})}</strong>
              <p>${t("health_controlled_text",{integration:a})}</p>
              <div class="ids">${n.map(l=>o`<code>${l.name}</code>`)}</div>
            </div>
            <button class="btn small tonal" @click=${()=>this._replaceControlled(n)}>
              ${t("health_controlled_replace",{integration:a})}
            </button>
          </div>`:c}
      ${i.length?o`<div class="health-row">
            <div class="health-icon">${h(_e)}</div>
            <div class="health-body">
              <strong>${t("missing_title",{count:i.length})}</strong>
              <p>${t("missing_text")}</p>
              <div class="ids">${i.map(l=>o`<code>${l}</code>`)}</div>
            </div>
            <button class="btn small tonal" @click=${()=>this._removeMissingFromDraft(i)}>
              ${t("missing_remove")}
            </button>
          </div>`:c}
      ${s.length?o`<div class="health-row muted">
            <div class="health-icon">${h(D)}</div>
            <div class="health-body">
              <strong>${t("unavailable_title")}</strong>
              <p>${t("unavailable_text")}</p>
              <div class="ids">${s.map(l=>o`<code>${l}</code>`)}</div>
            </div>
          </div>`:c}
    </section>`}_renderEntities(e){const t=this._t,i=this._baseEntities(),s=this._filtered(i),n=this._groups(s),a=i.filter(d=>this._draft.has(d.entity_id)).length,l=new Map;for(const d of i){const g=J(d.domain).id;l.set(g,(l.get(g)??0)+1)}const p=this._search||this._view!=="all"||this._categories.size||this._showHidden||this._showUnsupported;return o`
      ${this._renderHealth(e)}
      <section class="filters">
        <div class="search">
          ${h(be)}
          <input
            type="search"
            .value=${this._search}
            placeholder=${t("search")}
            aria-label=${t("search")}
            @input=${d=>this._search=d.target.value}
          />
          ${this._search?o`<button class="icon-btn small" aria-label=${t("close")} @click=${()=>this._search=""}>
                ${h(Y)}
              </button>`:c}
        </div>
        <div class="filter-row">
          <div class="segmented" role="group">
            ${["all","assigned","unassigned"].map(d=>o`<button
                aria-pressed=${String(this._view===d)}
                @click=${()=>this._view=d}
              >
                ${t(`view_${d}`)}
                ${d==="assigned"?o`<span class="seg-count">${a}</span>`:c}
              </button>`)}
          </div>
          <div class="spacer"></div>
          <label class="select">
            <span>${t("group_by")}</span>
            <select
              @change=${d=>this._groupBy=d.target.value}
            >
              ${["area","domain","none"].map(d=>o`<option value=${d} ?selected=${this._groupBy===d}>${t(`group_${d}`)}</option>`)}
            </select>
          </label>
          <button
            class="icon-btn ${this._showFilters?"active":""}"
            title=${t("show_more")}
            aria-label=${t("show_more")}
            aria-expanded=${String(this._showFilters)}
            @click=${()=>this._showFilters=!this._showFilters}
          >
            ${h(he)}
          </button>
        </div>
        <div class="chips">
          ${[...z,{id:"other",label:"cat_other",icon:D,domains:[]}].filter(d=>l.get(d.id)).map(d=>o`<button
                class="chip"
                aria-pressed=${String(this._categories.has(d.id))}
                @click=${()=>{const g=new Set(this._categories);g.has(d.id)?g.delete(d.id):g.add(d.id),this._categories=g}}
              >
                ${h(d.icon)} ${t(d.label)} <span class="count">${l.get(d.id)}</span>
              </button>`)}
        </div>
        ${this._showFilters?o`<div class="more-filters">
              <label class="check">
                <button
                  class="switch"
                  role="switch"
                  aria-checked=${String(this._showHidden)}
                  @click=${()=>this._showHidden=!this._showHidden}
                ></button>
                ${t("show_hidden")}
              </label>
              <label class="check">
                <button
                  class="switch"
                  role="switch"
                  aria-checked=${String(this._showUnsupported)}
                  @click=${()=>this._showUnsupported=!this._showUnsupported}
                ></button>
                ${t("show_unsupported")}
              </label>
            </div>`:c}
      </section>

      <div class="list-meta">
        <span>${t("showing",{shown:s.length,total:i.length})}</span>
        ${p?o`<button class="btn small" @click=${this._resetFilters}>${t("reset_filters")}</button>`:c}
      </div>

      ${s.length?n.map(d=>this._renderGroup(d,e)):o`<div class="card message">${h(be)}<div>${t("no_results")}</div></div>`}
      ${this._renderApplyBar()}
    `}_renderGroup(e,t){const i=this._t,s=this._collapsed.has(e.key)&&!this._search,n=e.entities.filter(d=>this._isCovered(d)).length,a=e.entities.filter(d=>d.supported),l=a.length>0&&a.every(d=>this._isCovered(d)),p=()=>{const d=new Set(this._collapsed);d.has(e.key)?d.delete(e.key):d.add(e.key),this._collapsed=d};return o`
      <section class="card group">
        <header class="group-head">
          <button class="group-toggle" aria-expanded=${String(!s)} @click=${p}>
            <span class="chev ${s?"collapsed":""}">${h(si)}</span>
            ${e.icon?o`<span class="group-icon">${h(e.icon)}</span>`:c}
            <span class="group-title">${e.label}</span>
            <span class="group-count">${i("in_group",{count:n,total:e.entities.length})}</span>
          </button>
          <button
            class="btn small ${l?"":"tonal"}"
            ?disabled=${!!this._busy||!l&&!a.length}
            @click=${()=>this._toggleGroup(e.entities,!l)}
          >
            ${i(l?"remove_all":"add_all")}
          </button>
        </header>
        ${s?c:o`<div class="rows">${e.entities.map(d=>this._renderRow(d,t))}</div>`}
      </section>
    `}_stateIcon(e,t){return t&&customElements.get("ha-state-icon")?o`<ha-state-icon .hass=${this.hass} .stateObj=${t}></ha-state-icon>`:e.icon&&customElements.get("ha-icon")?o`<ha-icon .icon=${e.icon}></ha-icon>`:h(Be(e.domain))}_renderRow(e,t){const i=this._t,s=this._draft.has(e.entity_id),n=t.entities.includes(e.entity_id),a=s!==n?s?"adding":"removing":"",l=this._options(e.entity_id),p=Ae(t.entity_config[e.entity_id],this._draftConfig[e.entity_id]),d=this.hass.states[e.entity_id],g=T($t(e.domain,l.type)??e.accessory_type,e.domain,e.device_class,this._german),u=e.bridges.filter(m=>m!==t.entry_id).map(m=>this._instance(m)).filter(m=>!!m&&m.mode==="bridge").map(m=>m.name),_=this._accessoryFor(e.entity_id),f=this._controllerOf(e),H=this._entities?.controllers?.[e.entity_id],kt=d?this.hass.formatEntityState?.(d)??d.state:"",Oe=()=>this._dialog={kind:"entity",entityId:e.entity_id};return o`
      <div
        class="row ${s?"on":""} ${a}"
        role="button"
        tabindex="0"
        @click=${Oe}
        @keydown=${m=>{m.key==="Enter"&&Oe()}}
      >
        <div class="row-icon">${this._stateIcon(e,d)}</div>
        <div class="row-main">
          <div class="row-title">
            <span class="name">${l.name||e.name}</span>
            ${l.name?o`<span class="orig">${e.name}</span>`:c}
          </div>
          <div class="row-sub">
            ${this._groupBy!=="area"&&e.area?o`<span>${e.area}</span><span class="sep">·</span>`:c}
            <span class="mono">${e.entity_id}</span>
          </div>
          <div class="row-badges">
            ${g?o`<span class="badge ${s?"primary":""}">${g}</span>`:c}
            ${e.supported?c:o`<span class="badge error">${h(_e)}${i("badge_unsupported")}</span>`}
            ${_?o`<span class="badge primary">${h(v)}${i("badge_is_accessory")}</span>`:e.needs_accessory_mode?o`<span class="badge warning">${i("badge_accessory_mode")}</span>`:c}
            ${f?this._draft.has(f.entity_id)?o`<span class="badge primary">
                    ${h(W)}${i("controlled_via_badge",{integration:this._controllerTitle(f.entity_id)})}
                  </span>`:o`<span class="badge warning">
                    ${h(W)}${i("controlled_badge",{integration:this._controllerTitle(f.entity_id)})}
                  </span>`:c}
            ${H?o`<span class="badge">${h(W)}${H.title}</span>`:c}
            ${e.hidden?o`<span class="badge">${i("badge_hidden")}</span>`:c}
            ${e.entity_category?o`<span class="badge">${i("badge_diagnostic")}</span>`:c}
            ${t.rule?.enabled&&t.rule.members.includes(e.entity_id)?o`<span class="badge primary">${h(me)}${i("badge_auto")}</span>`:c}
            ${u.map(m=>o`<span class="badge">${i("badge_other_bridge",{name:m})}</span>`)}
            ${a?o`<span class="badge ${a==="adding"?"success":"error"}">
                  ${h(a==="adding"?ei:Y)}
                  ${i(a==="adding"?"badge_new":"badge_removed")}
                </span>`:c}
            ${p?o`<span class="badge success">${h(j)}${i("pending_config",{count:1})}</span>`:c}
          </div>
        </div>
        <div class="row-state">${kt}</div>
        <button
          class="switch"
          role="switch"
          aria-checked=${String(s)}
          aria-label=${e.name}
          ?disabled=${!!this._busy}
          @click=${m=>{m.stopPropagation(),this._onSwitch(e)}}
          @keydown=${m=>m.stopPropagation()}
        ></button>
      </div>
    `}_renderApplyBar(){const e=this._t,{added:t,removed:i,config:s}=this._changes;if(!(t.length+i.length+s.length>0)&&!this._busy)return c;const a=this._entities.max_accessories,l=this._draft.size>a&&t.length>0;return o`
      <div class="apply-bar ${this._busy?"busy":""}">
        ${this._busy?o`<div class="spinner"></div><div class="apply-text">${this._busy}</div>`:o`
              <div class="apply-text">
                <div class="apply-summary">
                  ${t.length?o`<span class="badge success">${h(G)}${e("pending_add",{count:t.length})}</span>`:c}
                  ${i.length?o`<span class="badge error">${h(Y)}${e("pending_remove",{count:i.length})}</span>`:c}
                  ${s.length?o`<span class="badge primary">${h(j)}${e("pending_config",{count:s.length})}</span>`:c}
                </div>
                <div class="apply-hint">${l?e("too_many",{max:a}):e("apply_hint")}</div>
              </div>
              <button class="btn outlined" @click=${()=>this._resetDraft()}>${e("discard")}</button>
              <button class="btn filled" ?disabled=${l} @click=${()=>this._apply()}>
                ${h(ti)} ${e("apply")}
              </button>
            `}
      </div>
    `}_renderDialog(){const e=this._dialog;if(!e)return c;const t=()=>{this._dialog=this._nextDialog,this._nextDialog=null},i=this._t;switch(e.kind){case"confirm":return o`<hkm-confirm
          .heading=${e.heading}
          .text=${e.text}
          .confirmLabel=${e.confirmLabel}
          .cancelLabel=${i("cancel")}
          .altLabel=${e.altLabel}
          ?danger=${e.danger}
          @confirm=${()=>e.action()}
          @alt=${()=>e.alt?.()}
          @closed=${t}
        ></hkm-confirm>`;case"new":return o`<hkm-new-dialog
          .t=${i}
          @choose=${s=>{this._nextDialog=s.detail==="accessory"?{kind:"add-accessory"}:{kind:"create"}}}
          @closed=${t}
        ></hkm-new-dialog>`;case"add-accessory":{const s=new Set(this._accessories.map(l=>l.entity_id)),n={};for(const l of this._bridges??[])n[l.entry_id]=l.name;const a=(this._entities?.entities??[]).filter(l=>l.supported&&!s.has(l.entity_id));return o`<hkm-accessory-picker
          .hass=${this.hass}
          .t=${i}
          ?german=${this._german}
          .entities=${a}
          .bridgeNames=${n}
          .preselected=${e.entityId??null}
          @create-accessory=${l=>this._createAccessory(l.detail.entityId,l.detail.name,l.detail.removeFromBridges)}
          @closed=${t}
        ></hkm-accessory-picker>`}case"create":return o`<hkm-bridge-form
          .t=${i}
          mode="create"
          .name=${this._bridges?.length?"":"HA Bridge"}
          @submit-form=${s=>this._create(s.detail.name)}
          @closed=${t}
        ></hkm-bridge-form>`;case"settings":{const s=this._instance(e.entryId);return s?o`<hkm-bridge-form
          .t=${i}
          mode="settings"
          .name=${s.name}
          .port=${s.port}
          @submit-form=${n=>this._saveSettings(s.entry_id,n.detail.name,n.detail.port!==s.port?n.detail.port:void 0)}
          @closed=${t}
        ></hkm-bridge-form>`:c}case"entity":{const s=e.accessoryId?this._instance(e.accessoryId):void 0,n=s??this._bridge,a=this._entities?.entities.find(d=>d.entity_id===e.entityId);if(!n||!a)return c;const l=a.bridges.filter(d=>d!==n.entry_id).map(d=>this._instance(d)?.name).filter(d=>!!d),p=!this._accessoryFor(a.entity_id)&&a.supported;return o`<hkm-entity-dialog
          .hass=${this.hass}
          .t=${i}
          ?german=${this._german}
          ?standalone=${!!s}
          .entity=${a}
          .assigned=${s?!0:this._draft.has(a.entity_id)}
          .options=${s?s.entity_config[a.entity_id]??{}:this._options(a.entity_id)}
          .typeOptions=${this._entities?.type_options[a.domain]}
          .linkFields=${this._entities?.link_fields??{}}
          .linkCandidates=${this._entities?.link_candidates??[]}
          .otherBridges=${l}
          ?canBeAccessory=${p}
          @make-accessory=${d=>{this._nextDialog={kind:"add-accessory",entityId:d.detail.entityId}}}
          @save-entity=${d=>{const{entityId:g,assigned:u,patch:_}=d.detail;if(s){Object.keys(_).length&&this._saveAccessoryOptions(s.entry_id,g,_);return}this._toggle(g,u),Object.keys(_).length&&(this._draftConfig={...this._draftConfig,[g]:Ti(this._draftConfig[g],_)})}}
          @closed=${t}
        ></hkm-entity-dialog>`}case"rules":{const s=this._bridge;return!s||!this._entities?c:o`<hkm-rules-dialog
          .hass=${this.hass}
          .t=${i}
          .entryId=${s.entry_id}
          .rule=${s.rule}
          .data=${this._entities}
          @save-rule=${n=>this._saveRule(n.detail.rule,n.detail.reset)}
          @closed=${t}
        ></hkm-rules-dialog>`}}return c}};ae.properties={narrow:{type:Boolean,reflect:!0},panel:{attribute:!1},_bridges:{state:!0},_instances:{state:!0},_accessories:{state:!0},_selected:{state:!0},_entities:{state:!0},_pairing:{state:!0},_draft:{state:!0},_draftConfig:{state:!0},_search:{state:!0},_view:{state:!0},_groupBy:{state:!0},_categories:{state:!0},_showHidden:{state:!0},_showUnsupported:{state:!0},_showFilters:{state:!0},_collapsed:{state:!0},_busy:{state:!0},_dialog:{state:!0},_loadError:{state:!0}},ae.styles=[A,C,$`
      :host {
        display: flex;
        flex-direction: column;
        /* Since HA 2026.x the panel wrapper has no fixed height; a panel always
           spans the full viewport height, so size against the viewport. */
        height: 100vh;
        height: 100dvh;
        background: var(--hkm-bg);
        color: var(--hkm-text);
        font-family: var(--ha-font-family-body, var(--paper-font-body1_-_font-family, Roboto, sans-serif));
        -webkit-font-smoothing: antialiased;
      }
      /* The panel is registered with handle_safe_area, so it extends behind
         the status bar / home indicator of the companion apps itself. */
      :host {
        --hkm-inset-top: var(--safe-area-inset-top, env(safe-area-inset-top, 0px));
        --hkm-inset-bottom: var(--safe-area-inset-bottom, env(safe-area-inset-bottom, 0px));
        --hkm-inset-left: 0px;
        --hkm-inset-right: var(
          --safe-area-content-inset-right,
          var(--safe-area-inset-right, env(safe-area-inset-right, 0px))
        );
      }
      :host([narrow]) {
        --hkm-inset-left: var(
          --safe-area-content-inset-left,
          var(--safe-area-inset-left, env(safe-area-inset-left, 0px))
        );
      }
      .toolbar {
        display: flex;
        align-items: center;
        gap: 4px;
        flex: none;
        height: calc(var(--header-height, 56px) + var(--hkm-inset-top));
        padding: var(--hkm-inset-top) calc(8px + var(--hkm-inset-right)) 0
          calc(4px + var(--hkm-inset-left));
        box-sizing: border-box;
        background: var(--app-header-background-color, var(--hkm-card));
        color: var(--app-header-text-color, var(--hkm-text));
        border-bottom: var(--app-header-border-bottom, 1px solid var(--hkm-divider));
      }
      .toolbar-title {
        flex: 1;
        margin-left: 12px;
        font-size: 20px;
        font-weight: 400;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .scroller {
        flex: 1;
        overflow-y: auto;
        overscroll-behavior: contain;
        padding: 0 var(--hkm-inset-right) 0 var(--hkm-inset-left);
      }
      .content {
        max-width: 1080px;
        margin: 0 auto;
        padding: 20px 16px calc(32px + var(--hkm-inset-bottom));
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
        gap: 16px;
      }
      .card {
        background: var(--hkm-card);
        border-radius: var(--hkm-radius);
        box-shadow: var(--hkm-shadow);
        border: var(--ha-card-border-width, 1px) solid var(--ha-card-border-color, var(--hkm-divider));
      }
      .loading,
      .message {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 12px;
        padding: 48px 16px;
        color: var(--hkm-text-2);
      }
      .message svg {
        width: 22px;
        height: 22px;
        fill: currentColor;
      }
      .error-card {
        color: var(--hkm-error);
        flex-wrap: wrap;
      }
      .spacer {
        flex: 1;
      }

      /* Empty state */
      .empty {
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        padding: 56px 24px 48px;
        margin-top: 24px;
      }
      .empty h2 {
        margin: 28px 0 8px;
        font-size: 24px;
        font-weight: 600;
      }
      .empty p {
        margin: 0 0 28px;
        max-width: 440px;
        color: var(--hkm-text-2);
        line-height: 1.55;
      }
      .empty-art {
        position: relative;
        display: grid;
        place-items: center;
        width: 160px;
        height: 160px;
      }
      .empty-ring {
        position: absolute;
        inset: 0;
        border-radius: 50%;
        background: radial-gradient(circle, var(--hkm-tint-strong) 0%, var(--hkm-tint) 45%, transparent 70%);
      }

      .bridge-tile {
        display: grid;
        place-items: center;
        flex: none;
        width: 56px;
        height: 56px;
        border-radius: 16px;
        color: #fff;
        background: linear-gradient(
          135deg,
          color-mix(in srgb, var(--hkm-primary) 85%, white),
          color-mix(in srgb, var(--hkm-primary) 70%, #6d28d9)
        );
        box-shadow: 0 6px 16px color-mix(in srgb, var(--hkm-primary) 35%, transparent);
      }
      .bridge-tile svg {
        width: 30px;
        height: 30px;
        fill: currentColor;
      }
      .bridge-tile.large {
        position: relative;
        width: 88px;
        height: 88px;
        border-radius: 26px;
      }
      .bridge-tile.large svg {
        width: 48px;
        height: 48px;
      }

      /* Tabs */
      .tabs {
        display: flex;
        gap: 8px;
        overflow-x: auto;
        padding: 2px;
        scrollbar-width: none;
      }
      .tabs::-webkit-scrollbar {
        display: none;
      }
      .tab {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        height: 38px;
        padding: 0 14px;
        border-radius: 999px;
        border: 1px solid var(--hkm-divider);
        background: var(--hkm-card);
        cursor: pointer;
        font-size: 14px;
        white-space: nowrap;
        transition: background-color 0.15s ease;
      }
      .tab:hover {
        background: var(--hkm-surface-2);
      }
      .tab[aria-selected="true"] {
        background: var(--hkm-text);
        color: var(--hkm-card);
        border-color: transparent;
      }
      .tab-count {
        font-size: 12px;
        opacity: 0.7;
        font-variant-numeric: tabular-nums;
      }
      .tab.add {
        color: var(--hkm-primary);
        border-style: dashed;
      }
      .tab.add svg {
        width: 18px;
        height: 18px;
        fill: currentColor;
      }
      .dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        flex: none;
        background: var(--hkm-text-2);
      }
      .dot.ok {
        background: var(--hkm-success);
      }
      .dot.ready {
        background: var(--hkm-warning);
        box-shadow: 0 0 0 0 color-mix(in srgb, var(--hkm-warning) 60%, transparent);
        animation: pulse 2s infinite;
      }
      .dot.busy {
        background: var(--hkm-primary);
        animation: pulse 1.2s infinite;
      }
      .dot.bad {
        background: var(--hkm-error);
      }
      @keyframes pulse {
        0% {
          box-shadow: 0 0 0 0 color-mix(in srgb, currentColor 0%, transparent);
          opacity: 1;
        }
        50% {
          opacity: 0.55;
        }
        100% {
          opacity: 1;
        }
      }

      /* Hero */
      .hero {
        display: grid;
        grid-template-columns: minmax(0, 1fr) minmax(280px, 380px);
        overflow: hidden;
      }
      .hero-main {
        display: flex;
        flex-direction: column;
        gap: 20px;
        padding: 24px;
        min-width: 0;
      }
      .hero-head {
        display: flex;
        align-items: center;
        gap: 16px;
        min-width: 0;
      }
      .hero-titles {
        min-width: 0;
      }
      h1 {
        margin: 0 0 6px;
        font-size: 26px;
        font-weight: 650;
        letter-spacing: -0.01em;
        line-height: 1.15;
        overflow-wrap: anywhere;
      }
      .hero-meta {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 6px 14px;
        font-size: 13px;
        color: var(--hkm-text-2);
      }
      .status {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        font-weight: 500;
        color: var(--hkm-text);
      }
      .capacity-label {
        display: flex;
        justify-content: space-between;
        font-size: 13px;
        color: var(--hkm-text-2);
        margin-bottom: 8px;
        font-variant-numeric: tabular-nums;
      }
      .meter {
        height: 8px;
        border-radius: 999px;
        background: var(--hkm-surface-3);
        overflow: hidden;
      }
      .meter > div {
        height: 100%;
        border-radius: inherit;
        background: linear-gradient(90deg, var(--hkm-primary), color-mix(in srgb, var(--hkm-primary) 60%, #6d28d9));
        transition: width 0.35s ease;
      }
      .meter.over > div {
        background: var(--hkm-error);
      }
      .hero-actions {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        margin-top: auto;
      }

      /* Pairing */
      .pairing {
        display: flex;
        flex-direction: column;
        gap: 14px;
        padding: 24px;
        background: var(--hkm-surface-2);
        border-left: 1px solid var(--hkm-divider);
      }
      .pairing-title {
        display: flex;
        align-items: center;
        gap: 8px;
        font-weight: 600;
        font-size: 15px;
      }
      .pairing-title svg {
        width: 20px;
        height: 20px;
        fill: var(--hkm-primary);
      }
      .pairing-body {
        display: flex;
        gap: 16px;
        align-items: flex-start;
      }
      .qr {
        width: 112px;
        height: 112px;
        flex: none;
        padding: 6px;
        border-radius: 14px;
        background: #fff;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.12);
        image-rendering: pixelated;
      }
      .code-box {
        min-width: 0;
      }
      .code-label {
        font-size: 12px;
        color: var(--hkm-text-2);
        text-transform: uppercase;
        letter-spacing: 0.06em;
      }
      .code {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        margin: 4px 0 8px;
        padding: 4px 10px 4px 0;
        border: none;
        background: none;
        cursor: pointer;
        font-family: var(--code-font-family, ui-monospace, SFMono-Regular, Menlo, monospace);
        font-size: 22px;
        font-weight: 600;
        letter-spacing: 0.04em;
        white-space: nowrap;
        color: var(--hkm-text);
        border-radius: 8px;
      }
      .code svg {
        width: 16px;
        height: 16px;
        fill: var(--hkm-text-2);
      }
      .code:hover svg {
        fill: var(--hkm-primary);
      }
      .pairing p {
        margin: 0;
        font-size: 13px;
        line-height: 1.5;
        color: var(--hkm-text-2);
      }
      .pairing.paired,
      .pairing.pending {
        align-items: center;
        justify-content: center;
        text-align: center;
      }
      .paired-icon {
        display: grid;
        place-items: center;
        width: 56px;
        height: 56px;
        border-radius: 50%;
        background: color-mix(in srgb, var(--hkm-success) 15%, transparent);
      }
      .paired-icon svg {
        width: 30px;
        height: 30px;
        fill: var(--hkm-success);
      }

      /* Notices */
      .notice {
        display: flex;
        gap: 16px;
        padding: 24px;
      }
      .notice-icon {
        display: grid;
        place-items: center;
        flex: none;
        width: 44px;
        height: 44px;
        border-radius: 14px;
        background: var(--hkm-tint);
      }
      .notice-icon svg {
        width: 24px;
        height: 24px;
        fill: var(--hkm-primary);
      }
      .notice h3 {
        margin: 0 0 6px;
        font-size: 17px;
      }
      .notice p {
        margin: 0 0 16px;
        line-height: 1.55;
        color: var(--hkm-text-2);
      }

      /* Filters */
      .filters {
        display: flex;
        flex-direction: column;
        gap: 12px;
        margin-top: 8px;
      }
      .search {
        display: flex;
        align-items: center;
        gap: 10px;
        height: 48px;
        padding: 0 8px 0 16px;
        border-radius: 999px;
        background: var(--hkm-card);
        border: 1px solid var(--hkm-divider);
        box-shadow: var(--hkm-shadow);
        transition: border-color 0.15s ease, box-shadow 0.15s ease;
      }
      .search:focus-within {
        border-color: var(--hkm-primary);
        box-shadow: 0 0 0 3px var(--hkm-tint);
      }
      .search > svg {
        width: 22px;
        height: 22px;
        fill: var(--hkm-text-2);
        flex: none;
      }
      .search input {
        flex: 1;
        min-width: 0;
        height: 100%;
        border: none;
        outline: none;
        background: transparent;
        color: var(--hkm-text);
        font: inherit;
        font-size: 15px;
      }
      .search input::-webkit-search-cancel-button {
        display: none;
      }
      .icon-btn.small {
        width: 32px;
        height: 32px;
      }
      .icon-btn.small svg {
        width: 18px;
        height: 18px;
      }
      .icon-btn.active {
        background: var(--hkm-tint);
        color: var(--hkm-primary);
      }
      .filter-row {
        display: flex;
        align-items: center;
        gap: 8px;
        flex-wrap: wrap;
      }
      .segmented {
        display: inline-flex;
        padding: 3px;
        border-radius: 999px;
        background: var(--hkm-surface-3);
      }
      .segmented button {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        height: 32px;
        padding: 0 14px;
        border: none;
        border-radius: 999px;
        background: transparent;
        font-size: 13px;
        font-weight: 500;
        color: var(--hkm-text-2);
        cursor: pointer;
        white-space: nowrap;
      }
      .segmented button[aria-pressed="true"] {
        background: var(--hkm-card);
        color: var(--hkm-text);
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
      }
      .seg-count {
        min-width: 18px;
        height: 18px;
        padding: 0 5px;
        box-sizing: border-box;
        border-radius: 999px;
        background: var(--hkm-primary);
        color: var(--hkm-on-primary);
        font-size: 11px;
        line-height: 18px;
        text-align: center;
      }
      .select {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        font-size: 13px;
        color: var(--hkm-text-2);
      }
      .select select {
        font: inherit;
        font-size: 13px;
        height: 34px;
        padding: 0 10px;
        border-radius: 10px;
        border: 1px solid var(--hkm-divider);
        background: var(--hkm-card);
        color: var(--hkm-text);
      }
      .chips {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        overflow-x: auto;
        scrollbar-width: none;
        padding-bottom: 2px;
      }
      .chips::-webkit-scrollbar {
        display: none;
      }
      .more-filters {
        display: flex;
        flex-wrap: wrap;
        gap: 12px 28px;
        padding: 14px 16px;
        border-radius: 14px;
        background: var(--hkm-surface-2);
      }
      .check {
        display: inline-flex;
        align-items: center;
        gap: 12px;
        font-size: 14px;
        cursor: pointer;
      }
      .list-meta {
        display: flex;
        align-items: center;
        justify-content: space-between;
        min-height: 32px;
        padding: 0 4px;
        font-size: 13px;
        color: var(--hkm-text-2);
      }

      /* Groups & rows */
      .group {
        overflow: hidden;
      }
      .group-head {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 12px 8px 8px;
        border-bottom: 1px solid var(--hkm-divider);
      }
      .group-toggle {
        flex: 1;
        display: flex;
        align-items: center;
        gap: 8px;
        min-width: 0;
        height: 40px;
        padding: 0 8px;
        border: none;
        border-radius: 10px;
        background: none;
        cursor: pointer;
        text-align: left;
      }
      .group-toggle:hover {
        background: var(--hkm-surface-2);
      }
      .chev svg,
      .group-icon svg {
        width: 20px;
        height: 20px;
        fill: var(--hkm-text-2);
        display: block;
      }
      .chev {
        transition: transform 0.2s ease;
      }
      .chev.collapsed {
        transform: rotate(-90deg);
      }
      .group-title {
        font-weight: 600;
        font-size: 15px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .group-count {
        font-size: 12px;
        color: var(--hkm-text-2);
        white-space: nowrap;
        font-variant-numeric: tabular-nums;
      }
      .rows {
        display: flex;
        flex-direction: column;
      }
      .row {
        position: relative;
        display: flex;
        align-items: center;
        gap: 14px;
        padding: 12px 16px;
        cursor: pointer;
        content-visibility: auto;
        contain-intrinsic-size: auto 72px;
        transition: background-color 0.12s ease;
      }
      .row + .row {
        border-top: 1px solid color-mix(in srgb, var(--hkm-divider) 60%, transparent);
      }
      .row:hover {
        background: var(--hkm-surface-2);
      }
      .row:focus-visible {
        outline: 2px solid var(--hkm-primary);
        outline-offset: -2px;
      }
      .row::before {
        content: "";
        position: absolute;
        left: 0;
        top: 10px;
        bottom: 10px;
        width: 3px;
        border-radius: 0 3px 3px 0;
        background: transparent;
      }
      .row.adding::before {
        background: var(--hkm-success);
      }
      .row.removing::before {
        background: var(--hkm-error);
      }
      .row-icon {
        display: grid;
        place-items: center;
        flex: none;
        width: 40px;
        height: 40px;
        border-radius: 12px;
        background: var(--hkm-surface-3);
        color: var(--hkm-text-2);
        --mdc-icon-size: 22px;
        transition: background-color 0.2s ease, color 0.2s ease;
      }
      .row-icon svg {
        width: 22px;
        height: 22px;
        fill: currentColor;
      }
      .row-icon.on,
      .row.on .row-icon {
        background: var(--hkm-tint);
        color: var(--hkm-primary);
      }
      .row-main {
        flex: 1;
        min-width: 0;
      }
      .row-title {
        display: flex;
        align-items: baseline;
        gap: 8px;
        min-width: 0;
      }
      .name {
        font-weight: 500;
        font-size: 15px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .orig {
        font-size: 12px;
        color: var(--hkm-text-2);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .row-sub {
        display: flex;
        align-items: center;
        gap: 6px;
        margin-top: 2px;
        font-size: 12px;
        color: var(--hkm-text-2);
        min-width: 0;
        white-space: nowrap;
        overflow: hidden;
      }
      .row-sub .sep {
        opacity: 0.6;
      }
      .mono {
        font-family: var(--code-font-family, ui-monospace, SFMono-Regular, Menlo, monospace);
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .row-badges {
        display: flex;
        flex-wrap: wrap;
        gap: 4px;
        margin-top: 6px;
      }
      .row-badges:empty {
        display: none;
      }
      .row-state {
        flex: none;
        max-width: 140px;
        font-size: 13px;
        color: var(--hkm-text-2);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        text-align: right;
      }

      /* Apply bar */
      .apply-bar {
        position: sticky;
        bottom: calc(16px + var(--hkm-inset-bottom));
        z-index: 2;
        display: flex;
        align-items: center;
        gap: 12px;
        margin-top: 4px;
        padding: 12px 12px 12px 20px;
        border-radius: 20px;
        background: color-mix(in srgb, var(--hkm-card) 88%, transparent);
        backdrop-filter: blur(12px) saturate(1.4);
        -webkit-backdrop-filter: blur(12px) saturate(1.4);
        border: 1px solid var(--hkm-divider);
        box-shadow: 0 12px 40px rgba(0, 0, 0, 0.18);
        animation: slide-up 0.22s cubic-bezier(0.2, 0.9, 0.3, 1.1);
      }
      @keyframes slide-up {
        from {
          opacity: 0;
          transform: translateY(16px);
        }
      }
      .apply-text {
        flex: 1;
        min-width: 0;
      }
      .apply-summary {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
      }
      .apply-summary .badge {
        height: 24px;
        font-size: 12px;
      }
      .apply-hint {
        margin-top: 4px;
        font-size: 12px;
        color: var(--hkm-text-2);
      }
      .apply-bar.busy {
        padding: 18px 20px;
      }
      .apply-bar.busy .apply-text {
        font-weight: 500;
      }
      .spinner.small {
        width: 16px;
        height: 16px;
        border-width: 2px;
        border-color: rgba(255, 255, 255, 0.4);
        border-top-color: #fff;
      }

      .pill {
        margin-left: 2px;
        padding: 1px 7px;
        border-radius: 999px;
        background: var(--hkm-primary);
        color: var(--hkm-on-primary);
        font-size: 11px;
        font-weight: 600;
      }
      .health {
        display: flex;
        flex-direction: column;
        gap: 14px;
        padding: 18px 20px;
        border-color: color-mix(in srgb, var(--hkm-warning) 45%, var(--hkm-divider));
      }
      .health-row {
        display: flex;
        align-items: flex-start;
        gap: 14px;
      }
      .health-row + .health-row {
        padding-top: 14px;
        border-top: 1px solid var(--hkm-divider);
      }
      .health-icon {
        display: grid;
        place-items: center;
        flex: none;
        width: 36px;
        height: 36px;
        border-radius: 12px;
        background: color-mix(in srgb, var(--hkm-warning) 18%, transparent);
      }
      .health-icon svg {
        width: 20px;
        height: 20px;
        fill: color-mix(in srgb, var(--hkm-warning) 75%, var(--hkm-text));
      }
      .health-row.muted .health-icon {
        background: var(--hkm-surface-3);
      }
      .health-row.muted .health-icon svg {
        fill: var(--hkm-text-2);
      }
      .health-body {
        flex: 1;
        min-width: 0;
      }
      .health-body p {
        margin: 2px 0 8px;
        font-size: 13px;
        color: var(--hkm-text-2);
      }
      .ids {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
      }
      .ids code {
        padding: 2px 8px;
        border-radius: 6px;
        background: var(--hkm-surface-3);
        font-size: 12px;
      }

      /* Standalone accessories */
      .tab svg {
        width: 18px;
        height: 18px;
        fill: currentColor;
      }
      .tab-sep {
        flex: none;
        width: 1px;
        margin: 6px 2px;
        background: var(--hkm-divider);
      }
      .accessories-intro .notice-icon {
        background: color-mix(in srgb, #ff7043 16%, transparent);
      }
      .accessories-intro .notice-icon svg {
        fill: #f4511e;
      }
      .acc-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 16px;
      }
      .acc-card {
        display: flex;
        flex-direction: column;
        gap: 14px;
        padding: 18px;
      }
      .acc-head {
        display: flex;
        align-items: center;
        gap: 12px;
        min-width: 0;
      }
      .acc-titles {
        min-width: 0;
      }
      .acc-name {
        font-weight: 600;
        font-size: 16px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .acc-titles .mono {
        display: block;
        font-size: 12px;
        color: var(--hkm-text-2);
      }
      .acc-meta {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 8px;
        font-size: 13px;
      }
      .acc-pairing {
        display: flex;
        align-items: center;
        gap: 14px;
        padding: 12px;
        border-radius: 14px;
        background: var(--hkm-surface-2);
      }
      .acc-pairing.pending {
        font-size: 13px;
        color: var(--hkm-text-2);
      }
      .qr.small {
        width: 84px;
        height: 84px;
        padding: 4px;
        border-radius: 10px;
      }
      .acc-paired {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 12px 14px;
        border-radius: 14px;
        background: color-mix(in srgb, var(--hkm-success) 12%, transparent);
        font-weight: 500;
        font-size: 14px;
      }
      .acc-paired svg {
        width: 22px;
        height: 22px;
        fill: var(--hkm-success);
      }
      .acc-actions {
        display: flex;
        align-items: center;
        gap: 4px;
        margin-top: auto;
        color: var(--hkm-text-2);
      }
      .empty-actions {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        gap: 10px;
      }
      .empty-hint {
        margin: 18px 0 0 !important;
        font-size: 13px;
      }

      /* Narrow / mobile */
      @media (max-width: 760px) {
        .hero {
          grid-template-columns: 1fr;
        }
        .pairing {
          border-left: none;
          border-top: 1px solid var(--hkm-divider);
        }
        .row-state {
          display: none;
        }
      }
      @media (max-width: 520px) {
        .content {
          padding: 12px 10px calc(24px + var(--hkm-inset-bottom));
          gap: 12px;
        }
        .hero-main,
        .pairing,
        .notice {
          padding: 18px;
        }
        h1 {
          font-size: 22px;
        }
        .bridge-tile {
          width: 48px;
          height: 48px;
        }
        .row {
          padding: 12px;
          gap: 12px;
        }
        .apply-bar {
          flex-wrap: wrap;
          padding: 12px;
        }
        .apply-bar .apply-text {
          flex-basis: 100%;
        }
        .apply-bar .btn {
          flex: 1;
        }
        .select span {
          display: none;
        }
        .chips {
          flex-wrap: nowrap;
        }
        .health-row {
          flex-wrap: wrap;
        }
        .health-body {
          flex: 1 1 calc(100% - 50px);
        }
        .health-row > .btn {
          margin-left: 50px;
        }
        .pairing-body {
          flex-direction: column;
          align-items: center;
          text-align: center;
        }
        .group-count {
          display: none;
        }
      }
    `];let Le=ae;customElements.get("homekit-manager-panel")||customElements.define("homekit-manager-panel",Le);
