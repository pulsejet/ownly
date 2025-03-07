import{h as f,b as $,u as C,d as g,g as x,o as O,i as h,p as L,q as P}from"./todo-list-B78GeGtK-DUrs_5bZ.js";import{h as v,l as E,M,T as S}from"./MilkdownEditor-xOZn_ihy.js";import"./index-rNUcxsG_.js";import"./mutex-yV3mxE7x.js";var w=Object.defineProperty,k=Object.getOwnPropertySymbols,T=Object.prototype.hasOwnProperty,F=Object.prototype.propertyIsEnumerable,y=(n,e,t)=>e in n?w(n,e,{enumerable:!0,configurable:!0,writable:!0,value:t}):n[e]=t,j=(n,e)=>{for(var t in e||(e={}))T.call(e,t)&&y(n,t,e[t]);if(k)for(var t of k(e))F.call(e,t)&&y(n,t,e[t]);return n};function I(n,e){return Object.assign(n,{meta:j({package:"@milkdown/components"},e)}),n}function A(n,e){const t=customElements.get(n);if(t==null){customElements.define(n,e);return}t!==e&&console.warn(`Custom element ${n} has been defined before.`)}const _=({selected:n,label:e="",listType:t="",checked:o,onMount:s,setAttr:r,config:i,readonly:d})=>{const a=C(),l=g();x(()=>{const p=l.current;if(!p)return;const b=a.current.querySelector("[data-content-dom]");b&&(p.appendChild(b),s==null||s())},[]);const u=()=>{o!=null&&(r==null||r("checked",!o))},c={label:e,listType:t,checked:o,readonly:d};return f`<host class=${n&&"ProseMirror-selectednode"}>
    <li class="list-item">
      <div
        class="label-wrapper"
        onclick=${u}
        contenteditable="false"
      >
        ${i==null?void 0:i.renderLabel(c)}
      </div>
      <div class="children" ref=${l}></div>
    </li>
  </host>`};_.props={label:String,checked:Boolean,readonly:Boolean,listType:String,config:Object,selected:Boolean,setAttr:Function,onMount:Function};const q=$(_),V={renderLabel:({label:n,listType:e,checked:t,readonly:o})=>t==null?f`<span class="label"
        >${e==="bullet"?"⦿":n}</span
      >`:f`<input
      disabled=${o}
      class="label"
      type="checkbox"
      checked=${t}
    />`},m=v(V,"listItemBlockConfigCtx");I(m,{displayName:"Config<list-item-block>",group:"ListItemBlock"});A("milkdown-list-item-block",q);const B=E(M.node,n=>(e,t,o)=>{const s=document.createElement("milkdown-list-item-block"),r=document.createElement("div");r.setAttribute("data-content-dom","true"),r.classList.add("content-dom");const i=n.get(m.key),d=l=>{s.listType=l.attrs.listType,s.label=l.attrs.label,s.checked=l.attrs.checked,s.readonly=!t.editable};d(e),s.appendChild(r),s.selected=!1,s.setAttr=(l,u)=>{const c=o();c!=null&&t.dispatch(t.state.tr.setNodeAttribute(c,l,u))},s.onMount=()=>{const{anchor:l,head:u}=t.state.selection;t.hasFocus()&&setTimeout(()=>{const c=t.state.doc.resolve(l),p=t.state.doc.resolve(u);t.dispatch(t.state.tr.setSelection(new S(c,p)))})};let a=e;return s.config=i,{dom:s,contentDOM:r,update:l=>l.type!==e.type?!1:(l.sameMarkup(a)&&l.content.eq(a.content)||(a=l,d(l)),!0),ignoreMutation:l=>!s||!r?!0:l.type==="selection"?!1:r===l.target&&l.type==="attributes"?!0:!r.contains(l.target),selectNode:()=>{s.selected=!0},deselectNode:()=>{s.selected=!1},destroy:()=>{s.remove(),r.remove()}}});I(B,{displayName:"NodeView<list-item-block>",group:"ListItemBlock"});const D=[m,B];function R(n,e){n.set(m.key,{renderLabel:({label:t,listType:o,checked:s,readonly:r})=>{var i,d,a,l,u,c;return s==null?o==="bullet"?f`<span class="label"
            >${(d=(i=e==null?void 0:e.bulletIcon)==null?void 0:i.call(e))!=null?d:O}</span
          >`:f`<span class="label">${t}</span>`:s?f`<span
          class=${h("label checkbox",r&&"readonly")}
          >${(l=(a=e==null?void 0:e.checkBoxCheckedIcon)==null?void 0:a.call(e))!=null?l:L}</span
        >`:f`<span class=${h("label checkbox",r&&"readonly")}
        >${(c=(u=e==null?void 0:e.checkBoxUncheckedIcon)==null?void 0:u.call(e))!=null?c:P}</span
      >`}})}const G=(n,e)=>{n.config(t=>R(t,e)).use(D)};export{G as defineFeature};
