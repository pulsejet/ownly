import{h as f,b as D,d as T,i as h,r as j,w as b,x as S}from"./functions-Bsik6ikd-CD340WZ-.js";import{h as F,l as N,v as V}from"./MilkdownEditor-B2aQMMaN.js";import{u as I}from"./hooks-C5oewugr.js";import{j as A}from"./index-BPbFIKj9.js";import{i as H,a as M}from"./index.es-C2T6UE48.js";import"./mutex-yV3mxE7x.js";var K=Object.defineProperty,$=Object.getOwnPropertySymbols,W=Object.prototype.hasOwnProperty,q=Object.prototype.propertyIsEnumerable,P=(l,e,o)=>e in l?K(l,e,{enumerable:!0,configurable:!0,writable:!0,value:o}):l[e]=o,z=(l,e)=>{for(var o in e||(e={}))W.call(e,o)&&P(l,o,e[o]);if($)for(var o of $(e))q.call(e,o)&&P(l,o,e[o]);return l};function g(l,e){return Object.assign(l,{meta:z({package:"@milkdown/components"},e)}),l}const G={imageIcon:()=>"🌌",uploadButton:()=>f`Upload`,confirmButton:()=>f`⏎`,uploadPlaceholderText:"/Paste",onUpload:l=>Promise.resolve(URL.createObjectURL(l))},y=F(G,"inlineImageConfigCtx");g(y,{displayName:"Config<image-inline>",group:"ImageInline"});function J(l,e){const o=customElements.get(l);if(o==null){customElements.define(l,e);return}o!==e&&console.warn(`Custom element ${l} has been defined before.`)}var Q=(l,e,o)=>new Promise((d,n)=>{var a=t=>{try{s(o.next(t))}catch(r){n(r)}},u=t=>{try{s(o.throw(t))}catch(r){n(r)}},s=t=>t.done?d(t.value):Promise.resolve(t.value).then(a,u);s((o=o.apply(l,e)).next())});const X=A("abcdefg",8),x=({src:l="",selected:e=!1,alt:o,title:d,setAttr:n,config:a})=>{const u=T(),[s]=I(X()),[t,r]=I(!1),[p,m]=I(l.length!==0),[_,w]=I(l),L=i=>{const v=i.target.value;m(v.length!==0),w(v)},B=i=>Q(void 0,null,function*(){var c;const v=(c=i.target.files)==null?void 0:c[0];if(!v)return;const U=yield a==null?void 0:a.onUpload(v);U&&(n==null||n("src",U),m(!0))}),k=()=>{var i,c;n==null||n("src",(c=(i=u.current)==null?void 0:i.value)!=null?c:"")},O=i=>{i.key==="Enter"&&k()},E=i=>{i.preventDefault(),i.stopPropagation()},R=i=>{i.stopPropagation(),i.preventDefault()};return f`<host class=${h(e&&"selected",!l&&"empty")}>
    ${l?f`<img class="image-inline" src=${l} alt=${o} title=${d} />`:f`<div class="empty-image-inline">
          <div class="image-icon">${a==null?void 0:a.imageIcon()}</div>
          <div class=${h("link-importer",t&&"focus")}>
            <input
              draggable="true"
              ref=${u}
              ondragstart=${E}
              class="link-input-area"
              value=${_}
              oninput=${L}
              onkeydown=${O}
              onfocus=${()=>r(!0)}
              onblur=${()=>r(!1)}
            />
            <div class=${h("placeholder",p&&"hidden")}>
              <input
                class="hidden"
                id=${s}
                type="file"
                accept="image/*"
                onchange=${B}
              />
              <label
                onpointerdown=${R}
                class="uploader"
                for=${s}
              >
                ${a==null?void 0:a.uploadButton()}
              </label>
              <span class="text" onclick=${()=>{var i;return(i=u.current)==null?void 0:i.focus()}}>
                ${a==null?void 0:a.uploadPlaceholderText}
              </span>
            </div>
          </div>
          <div
            class=${h("confirm",_.length===0&&"hidden")}
            onclick=${()=>k()}
          >
            ${a==null?void 0:a.confirmButton()}
          </div>
        </div>`}
  </host>`};x.props={src:String,alt:String,title:String,selected:Boolean,setAttr:Function,config:Object};const Y=D(x);J("milkdown-image-inline",Y);const C=N(V.node,l=>(e,o,d)=>{const n=document.createElement("milkdown-image-inline"),a=l.get(y.key),u=a.proxyDomURL,s=t=>{if(!u)n.src=t.attrs.src;else{const r=u(t.attrs.src);typeof r=="string"?n.src=r:r.then(p=>{n.src=p})}n.alt=t.attrs.alt,n.title=t.attrs.title};return s(e),n.selected=!1,n.setAttr=(t,r)=>{const p=d();p!=null&&o.dispatch(o.state.tr.setNodeAttribute(p,t,r))},n.config=a,{dom:n,update:t=>t.type!==e.type?!1:(s(t),!0),stopEvent:t=>!!(n.selected&&t.target instanceof HTMLInputElement),selectNode:()=>{n.selected=!0},deselectNode:()=>{n.selected=!1},destroy:()=>{n.remove()}}});g(C,{displayName:"NodeView<image-inline>",group:"ImageInline"});const Z=[y,C],re=(l,e)=>{l.config(o=>{o.update(y.key,d=>{var n,a,u,s,t,r;return{uploadButton:(n=e==null?void 0:e.inlineUploadButton)!=null?n:()=>"Upload",imageIcon:(a=e==null?void 0:e.inlineImageIcon)!=null?a:()=>b,confirmButton:(u=e==null?void 0:e.inlineConfirmButton)!=null?u:()=>j,uploadPlaceholderText:(s=e==null?void 0:e.inlineUploadPlaceholderText)!=null?s:"or paste link",onUpload:(r=(t=e==null?void 0:e.inlineOnUpload)!=null?t:e==null?void 0:e.onUpload)!=null?r:d.onUpload,proxyDomURL:e==null?void 0:e.proxyDomURL}}),o.update(H.key,d=>{var n,a,u,s,t,r,p,m;return{uploadButton:(n=e==null?void 0:e.blockUploadButton)!=null?n:()=>"Upload file",imageIcon:(a=e==null?void 0:e.blockImageIcon)!=null?a:()=>b,captionIcon:(u=e==null?void 0:e.blockCaptionIcon)!=null?u:()=>S,confirmButton:(s=e==null?void 0:e.blockConfirmButton)!=null?s:()=>"Confirm",captionPlaceholderText:(t=e==null?void 0:e.blockCaptionPlaceholderText)!=null?t:"Write Image Caption",uploadPlaceholderText:(r=e==null?void 0:e.blockUploadPlaceholderText)!=null?r:"or paste link",onUpload:(m=(p=e==null?void 0:e.blockOnUpload)!=null?p:e==null?void 0:e.onUpload)!=null?m:d.onUpload,proxyDomURL:e==null?void 0:e.proxyDomURL}})}).use(M).use(Z)};export{re as defineFeature};
