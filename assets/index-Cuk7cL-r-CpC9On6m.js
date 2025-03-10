import{h as p,b as B,u as $,d as C,g,o as x,i as h,p as O,q as L}from"./functions-Bsik6ikd-CD340WZ-.js";import{h as P,l as E,M,T as S}from"./MilkdownEditor-B0vj-XZn.js";import"./index-DgSFE_8T.js";import"./mutex-yV3mxE7x.js";var w=Object.defineProperty,k=Object.getOwnPropertySymbols,T=Object.prototype.hasOwnProperty,F=Object.prototype.propertyIsEnumerable,y=(n,e,t)=>e in n?w(n,e,{enumerable:!0,configurable:!0,writable:!0,value:t}):n[e]=t,j=(n,e)=>{for(var t in e||(e={}))T.call(e,t)&&y(n,t,e[t]);if(k)for(var t of k(e))F.call(e,t)&&y(n,t,e[t]);return n};function I(n,e){return Object.assign(n,{meta:j({package:"@milkdown/components"},e)}),n}function A(n,e){const t=customElements.get(n);if(t==null){customElements.define(n,e);return}t!==e&&console.warn(`Custom element ${n} has been defined before.`)}const v=({selected:n,label:e="",listType:t="",checked:r,onMount:s,setAttr:o,config:u,readonly:d})=>{const a=$(),l=C();g(()=>{const f=l.current;if(!f)return;const b=a.current.querySelector("[data-content-dom]");b&&(f.appendChild(b),s==null||s())},[]);const i=()=>{r!=null&&(o==null||o("checked",!r))},c={label:e,listType:t,checked:r,readonly:d};return p`<host class=${n&&"ProseMirror-selectednode"}>
    <li class="list-item">
      <div
        class="label-wrapper"
        onclick=${i}
        contenteditable="false"
      >
        ${u==null?void 0:u.renderLabel(c)}
      </div>
      <div class="children" ref=${l}></div>
    </li>
  </host>`};v.props={label:String,checked:Boolean,readonly:Boolean,listType:String,config:Object,selected:Boolean,setAttr:Function,onMount:Function};const q=B(v),V={renderLabel:({label:n,listType:e,checked:t,readonly:r})=>t==null?p`<span class="label"
        >${e==="bullet"?"⦿":n}</span
      >`:p`<input
      disabled=${r}
      class="label"
      type="checkbox"
      checked=${t}
    />`},m=P(V,"listItemBlockConfigCtx");I(m,{displayName:"Config<list-item-block>",group:"ListItemBlock"});A("milkdown-list-item-block",q);const _=E(M.node,n=>(e,t,r)=>{const s=document.createElement("milkdown-list-item-block"),o=document.createElement("div");o.setAttribute("data-content-dom","true"),o.classList.add("content-dom");const u=n.get(m.key),d=l=>{s.listType=l.attrs.listType,s.label=l.attrs.label,s.checked=l.attrs.checked,s.readonly=!t.editable};d(e),s.appendChild(o),s.selected=!1,s.setAttr=(l,i)=>{const c=r();c!=null&&t.dispatch(t.state.tr.setNodeAttribute(c,l,i))},s.onMount=()=>{const{anchor:l,head:i}=t.state.selection;t.hasFocus()&&setTimeout(()=>{const c=t.state.doc.resolve(l),f=t.state.doc.resolve(i);t.dispatch(t.state.tr.setSelection(new S(c,f)))})};let a=e;return s.config=u,{dom:s,contentDOM:o,update:l=>l.type!==e.type?!1:(l.sameMarkup(a)&&l.content.eq(a.content)||(a=l,d(l)),!0),ignoreMutation:l=>!s||!o?!0:l.type==="selection"?!1:o===l.target&&l.type==="attributes"?!0:!o.contains(l.target),selectNode:()=>{s.selected=!0},deselectNode:()=>{s.selected=!1},destroy:()=>{s.remove(),o.remove()}}});I(_,{displayName:"NodeView<list-item-block>",group:"ListItemBlock"});const D=[m,_];function R(n,e){n.set(m.key,{renderLabel:({label:t,listType:r,checked:s,readonly:o})=>{var u,d,a,l,i,c;return s==null?r==="bullet"?p`<span class="label"
            >${(d=(u=e==null?void 0:e.bulletIcon)==null?void 0:u.call(e))!=null?d:x}</span
          >`:p`<span class="label">${t}</span>`:s?p`<span
          class=${h("label checkbox",o&&"readonly")}
          >${(l=(a=e==null?void 0:e.checkBoxCheckedIcon)==null?void 0:a.call(e))!=null?l:O}</span
        >`:p`<span class=${h("label checkbox",o&&"readonly")}
        >${(c=(i=e==null?void 0:e.checkBoxUncheckedIcon)==null?void 0:i.call(e))!=null?c:L}</span
      >`}})}const G=(n,e)=>{n.config(t=>R(t,e)).use(D)};export{G as defineFeature};
