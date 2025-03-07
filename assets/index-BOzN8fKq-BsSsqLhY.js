import{h as v,b as R,d as T,i as I,r as S,w as $,x as j}from"./todo-list-B78GeGtK-DUrs_5bZ.js";import{h as F,l as N,O as V}from"./MilkdownEditor-xOZn_ihy.js";import{u as h}from"./hooks-B2u-J907.js";import{i as H,a as M}from"./index.es-B1kO_GwN.js";import"./index-rNUcxsG_.js";import"./mutex-yV3mxE7x.js";var A=Object.defineProperty,b=Object.getOwnPropertySymbols,K=Object.prototype.hasOwnProperty,W=Object.prototype.propertyIsEnumerable,P=(n,e,o)=>e in n?A(n,e,{enumerable:!0,configurable:!0,writable:!0,value:o}):n[e]=o,q=(n,e)=>{for(var o in e||(e={}))K.call(e,o)&&P(n,o,e[o]);if(b)for(var o of b(e))W.call(e,o)&&P(n,o,e[o]);return n};function g(n,e){return Object.assign(n,{meta:q({package:"@milkdown/components"},e)}),n}const z={imageIcon:()=>"🌌",uploadButton:()=>v`Upload`,confirmButton:()=>v`⏎`,uploadPlaceholderText:"/Paste",onUpload:n=>Promise.resolve(URL.createObjectURL(n))},y=F(z,"inlineImageConfigCtx");g(y,{displayName:"Config<image-inline>",group:"ImageInline"});function G(n,e){const o=customElements.get(n);if(o==null){customElements.define(n,e);return}o!==e&&console.warn(`Custom element ${n} has been defined before.`)}var J=(n,e,o)=>new Promise((s,l)=>{var a=t=>{try{i(o.next(t))}catch(r){l(r)}},d=t=>{try{i(o.throw(t))}catch(r){l(r)}},i=t=>t.done?s(t.value):Promise.resolve(t.value).then(a,d);i((o=o.apply(n,e)).next())});const x=({src:n="",selected:e=!1,alt:o,title:s,setAttr:l,config:a})=>{const d=T(),[i]=h(crypto.randomUUID()),[t,r]=h(!1),[p,m]=h(n.length!==0),[_,w]=h(n),L=u=>{const f=u.target.value;m(f.length!==0),w(f)},B=u=>J(void 0,null,function*(){var c;const f=(c=u.target.files)==null?void 0:c[0];if(!f)return;const U=yield a==null?void 0:a.onUpload(f);U&&(l==null||l("src",U),m(!0))}),k=()=>{var u,c;l==null||l("src",(c=(u=d.current)==null?void 0:u.value)!=null?c:"")},O=u=>{u.key==="Enter"&&k()},E=u=>{u.preventDefault(),u.stopPropagation()},D=u=>{u.stopPropagation(),u.preventDefault()};return v`<host class=${I(e&&"selected",!n&&"empty")}>
    ${n?v`<img class="image-inline" src=${n} alt=${o} title=${s} />`:v`<div class="empty-image-inline">
          <div class="image-icon">${a==null?void 0:a.imageIcon()}</div>
          <div class=${I("link-importer",t&&"focus")}>
            <input
              draggable="true"
              ref=${d}
              ondragstart=${E}
              class="link-input-area"
              value=${_}
              oninput=${L}
              onkeydown=${O}
              onfocus=${()=>r(!0)}
              onblur=${()=>r(!1)}
            />
            <div class=${I("placeholder",p&&"hidden")}>
              <input
                class="hidden"
                id=${i}
                type="file"
                accept="image/*"
                onchange=${B}
              />
              <label
                onpointerdown=${D}
                class="uploader"
                for=${i}
              >
                ${a==null?void 0:a.uploadButton()}
              </label>
              <span class="text" onclick=${()=>{var u;return(u=d.current)==null?void 0:u.focus()}}>
                ${a==null?void 0:a.uploadPlaceholderText}
              </span>
            </div>
          </div>
          <div
            class=${I("confirm",_.length===0&&"hidden")}
            onclick=${()=>k()}
          >
            ${a==null?void 0:a.confirmButton()}
          </div>
        </div>`}
  </host>`};x.props={src:String,alt:String,title:String,selected:Boolean,setAttr:Function,config:Object};const Q=R(x);G("milkdown-image-inline",Q);const C=N(V.node,n=>(e,o,s)=>{const l=document.createElement("milkdown-image-inline"),a=n.get(y.key),d=a.proxyDomURL,i=t=>{if(!d)l.src=t.attrs.src;else{const r=d(t.attrs.src);typeof r=="string"?l.src=r:r.then(p=>{l.src=p})}l.alt=t.attrs.alt,l.title=t.attrs.title};return i(e),l.selected=!1,l.setAttr=(t,r)=>{const p=s();p!=null&&o.dispatch(o.state.tr.setNodeAttribute(p,t,r))},l.config=a,{dom:l,update:t=>t.type!==e.type?!1:(i(t),!0),stopEvent:t=>!!(l.selected&&t.target instanceof HTMLInputElement),selectNode:()=>{l.selected=!0},deselectNode:()=>{l.selected=!1},destroy:()=>{l.remove()}}});g(C,{displayName:"NodeView<image-inline>",group:"ImageInline"});const X=[y,C],oe=(n,e)=>{n.config(o=>{o.update(y.key,s=>{var l,a,d,i,t,r;return{uploadButton:(l=e==null?void 0:e.inlineUploadButton)!=null?l:()=>"Upload",imageIcon:(a=e==null?void 0:e.inlineImageIcon)!=null?a:()=>$,confirmButton:(d=e==null?void 0:e.inlineConfirmButton)!=null?d:()=>S,uploadPlaceholderText:(i=e==null?void 0:e.inlineUploadPlaceholderText)!=null?i:"or paste link",onUpload:(r=(t=e==null?void 0:e.inlineOnUpload)!=null?t:e==null?void 0:e.onUpload)!=null?r:s.onUpload,proxyDomURL:e==null?void 0:e.proxyDomURL}}),o.update(H.key,s=>{var l,a,d,i,t,r,p,m;return{uploadButton:(l=e==null?void 0:e.blockUploadButton)!=null?l:()=>"Upload file",imageIcon:(a=e==null?void 0:e.blockImageIcon)!=null?a:()=>$,captionIcon:(d=e==null?void 0:e.blockCaptionIcon)!=null?d:()=>j,confirmButton:(i=e==null?void 0:e.blockConfirmButton)!=null?i:()=>"Confirm",captionPlaceholderText:(t=e==null?void 0:e.blockCaptionPlaceholderText)!=null?t:"Write Image Caption",uploadPlaceholderText:(r=e==null?void 0:e.blockUploadPlaceholderText)!=null?r:"or paste link",onUpload:(m=(p=e==null?void 0:e.blockOnUpload)!=null?p:e==null?void 0:e.onUpload)!=null?m:s.onUpload,proxyDomURL:e==null?void 0:e.proxyDomURL}})}).use(M).use(X)};export{oe as defineFeature};
